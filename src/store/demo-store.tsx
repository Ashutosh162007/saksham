import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createSeedState, nextApplicableStage } from '../data/seed'
import { OFFICERS } from '../data/reference'
import { STORAGE_KEY } from '../lib/constants'
import { addDays, isoStamp } from '../lib/dates'
import { deriveUndertakingSubmission } from '../lib/status'
import type {
  Application,
  AuditEvent,
  DemoRole,
  DemoState,
  DemoUser,
  NotificationItem,
} from '../types'
import { SIGNED_IN } from '../lib/constants'

type Action =
  | { type: 'hydrate'; state: DemoState }
  | { type: 'reset' }
  | { type: 'set-as-of'; date: string }
  | { type: 'set-role'; role: DemoRole }
  | { type: 'complete-stage'; applicationId: string; remarks?: string }
  | { type: 'return-application'; applicationId: string; reason: string }
  | { type: 'assign-officer'; applicationId: string; officerId: string }
  | { type: 'create-sample' }
  | { type: 'schedule-evc'; visitId: string; plannedDate: string }
  | { type: 'update-evc-status'; visitId: string; status: DemoState['visits'][number]['status'] }
  | { type: 'submit-undertaking'; id: string; fileName: string }
  | { type: 'verify-undertaking'; id: string; observations: string; accept: boolean }
  | { type: 'submit-renewal'; id: string; fileName: string }
  | { type: 'verify-document'; id: string; accept: boolean }
  | { type: 'mark-read'; id: string }
  | { type: 'mark-all-read' }
  | { type: 'acknowledge-escalation'; id: string }

function audit(
  state: DemoState,
  partial: Omit<AuditEvent, 'id' | 'timestamp' | 'origin' | 'actor' | 'actorRole'> & {
    actor?: string
    actorRole?: string
  },
): AuditEvent {
  return {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: isoStamp(state.asOfDate, 15, 10),
    actor: partial.actor ?? SIGNED_IN.name,
    actorRole: partial.actorRole ?? state.currentRole,
    origin: 'demo-user',
    ...partial,
  }
}

function notify(
  state: DemoState,
  partial: Omit<NotificationItem, 'id' | 'read' | 'deliveryStatus' | 'createdAt'> & { createdAt?: string },
): NotificationItem {
  return {
    id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    deliveryStatus: 'Logged in demo inbox',
    createdAt: partial.createdAt ?? isoStamp(state.asOfDate, 15, 12),
    ...partial,
  }
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'reset':
      return createSeedState(state.asOfDate)
    case 'set-as-of':
      return { ...state, asOfDate: action.date }
    case 'set-role':
      return { ...state, currentRole: action.role }
    case 'complete-stage': {
      const app = state.applications.find((a) => a.id === action.applicationId)
      if (!app) return state
      const idx = app.stages.findIndex((s) => s.state === 'active' || s.state === 'overdue' || s.state === 'returned')
      if (idx < 0) return state
      const current = app.stages[idx]
      const nextName = nextApplicableStage(app, idx)
      const stages = app.stages.map((s, i) => {
        if (i === idx) {
          return {
            ...s,
            state: 'completed' as const,
            completedAt: state.asOfDate,
            remarks: action.remarks || 'Stage marked complete in the demonstration workflow. This is not a statutory approval.',
          }
        }
        if (nextName && s.name === nextName) {
          return { ...s, state: 'active' as const, startedAt: state.asOfDate, assignee: app.assignedOfficerName }
        }
        return s
      })
      const updated: Application = {
        ...app,
        stages,
        currentStage: nextName ?? current.name,
      }
      return {
        ...state,
        applications: state.applications.map((a) => (a.id === app.id ? updated : a)),
        audit: [
          audit(state, {
            entityType: 'Application',
            entityRef: app.id,
            action: `Completed stage: ${current.name}`,
            previousStatus: current.state,
            updatedStatus: nextName ?? 'Decision recorded (demo)',
            remarks: action.remarks || 'Simulated transition only.',
          }),
          ...state.audit,
        ],
        notifications: [
          notify(state, {
            category: 'Workflow',
            priority: 'Low',
            title: `${current.name} completed — ${app.id}`,
            body: nextName
              ? `Next demo stage: ${nextName}.`
              : 'Sample workflow reached the competent-authority stage. No statutory effect.',
            relatedType: 'application',
            relatedId: app.id,
            relatedLabel: app.id,
            recipientRole: state.currentRole,
            trigger: 'User completed a permitted demo transition.',
          }),
          ...state.notifications,
        ],
      }
    }
    case 'return-application': {
      const app = state.applications.find((a) => a.id === action.applicationId)
      if (!app) return state
      const stages = app.stages.map((s) =>
        s.state === 'active' || s.state === 'overdue'
          ? { ...s, state: 'returned' as const, returnReason: action.reason }
          : s,
      )
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === app.id
            ? {
                ...a,
                stages,
                observations: [
                  {
                    id: `obs-${Date.now()}`,
                    at: isoStamp(state.asOfDate, 16, 5),
                    author: SIGNED_IN.name,
                    role: state.currentRole,
                    stage: a.currentStage,
                    body: action.reason,
                    kind: 'deficiency',
                  },
                  ...a.observations,
                ],
              }
            : a,
        ),
        audit: [
          audit(state, {
            entityType: 'Application',
            entityRef: app.id,
            action: 'Returned with deficiency',
            previousStatus: 'In Progress',
            updatedStatus: 'Returned',
            remarks: action.reason,
          }),
          ...state.audit,
        ],
      }
    }
    case 'assign-officer': {
      const officer = OFFICERS.find((o) => o.id === action.officerId)
      if (!officer) return state
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.applicationId
            ? { ...a, assignedOfficerId: officer.id, assignedOfficerName: officer.name }
            : a,
        ),
        audit: [
          audit(state, {
            entityType: 'Application',
            entityRef: action.applicationId,
            action: 'Officer assigned',
            updatedStatus: officer.name,
          }),
          ...state.audit,
        ],
      }
    }
    case 'create-sample': {
      const seq = state.nextApplicationSeq
      const template = state.applications[0]
      if (!template) return state
      const id = `APP-2026-${seq}`
      const created: Application = {
        ...template,
        id,
        type: 'Extension of Approval',
        currentStage: 'Application Submitted',
        submittedOn: state.asOfDate,
        dueDate: addDays(state.asOfDate, 21),
        summary: `Sample application created in the demonstration workspace for ${template.institutionName}.`,
        requiresEvc: false,
        requiresSac: false,
        stages: template.stages.map((s, i) => {
          if (s.name === 'EVC' || s.name === 'SAC/SHC') return { name: s.name, state: 'not-applicable' }
          if (i === 0) return { ...s, state: 'active', startedAt: state.asOfDate, completedAt: undefined, returnReason: undefined }
          if (s.state === 'not-applicable') return s
          return { name: s.name, state: 'pending', startedAt: undefined, completedAt: undefined }
        }),
        observations: [
          {
            id: `${id}-obs-1`,
            at: isoStamp(state.asOfDate, 11, 0),
            author: SIGNED_IN.name,
            role: state.currentRole,
            stage: 'Application Submitted',
            body: 'Sample file created from the demonstration console.',
            kind: 'note',
          },
        ],
      }
      return {
        ...state,
        nextApplicationSeq: seq + 1,
        applications: [created, ...state.applications],
        audit: [
          audit(state, {
            entityType: 'Application',
            entityRef: id,
            action: 'Sample application created',
            updatedStatus: 'Pending',
          }),
          ...state.audit,
        ],
      }
    }
    case 'schedule-evc': {
      return {
        ...state,
        visits: state.visits.map((v) =>
          v.id === action.visitId
            ? { ...v, plannedDate: action.plannedDate, status: 'Scheduled', notes: 'Fictional visit date recorded for demonstration.' }
            : v,
        ),
        audit: [
          audit(state, {
            entityType: 'EVC',
            entityRef: action.visitId,
            action: 'Visit scheduled (demo)',
            updatedStatus: action.plannedDate,
            remarks: 'No actual inspection has been booked.',
          }),
          ...state.audit,
        ],
      }
    }
    case 'update-evc-status': {
      return {
        ...state,
        visits: state.visits.map((v) =>
          v.id === action.visitId
            ? {
                ...v,
                status: action.status,
                completedDate: action.status === 'Completed' ? state.asOfDate : v.completedDate,
              }
            : v,
        ),
        audit: [
          audit(state, {
            entityType: 'EVC',
            entityRef: action.visitId,
            action: 'EVC status updated (demo)',
            updatedStatus: action.status,
          }),
          ...state.audit,
        ],
      }
    }
    case 'submit-undertaking': {
      return {
        ...state,
        undertakings: state.undertakings.map((u) =>
          u.id === action.id
            ? {
                ...u,
                submissionStatus: 'Submitted',
                verificationStatus: 'Awaiting Verification',
                evidenceFileName: action.fileName,
                submittedAt: isoStamp(state.asOfDate, 14, 22),
                submittedBy: 'Institution desk (demo)',
              }
            : u,
        ),
        audit: [
          audit(state, {
            entityType: 'Undertaking',
            entityRef: action.id,
            action: 'Evidence uploaded (demo)',
            previousStatus: 'Pending Submission',
            updatedStatus: 'Awaiting Verification',
            remarks: action.fileName,
          }),
          ...state.audit,
        ],
      }
    }
    case 'verify-undertaking': {
      return {
        ...state,
        undertakings: state.undertakings.map((u) =>
          u.id === action.id
            ? {
                ...u,
                verificationStatus: action.accept ? 'Verified' : 'Rejected for Correction',
                observations: action.observations,
                verifiedAt: isoStamp(state.asOfDate, 16, 40),
                verifiedBy: SIGNED_IN.name,
              }
            : u,
        ),
        audit: [
          audit(state, {
            entityType: 'Undertaking',
            entityRef: action.id,
            action: action.accept ? 'Evidence verified (demo)' : 'Evidence returned for correction (demo)',
            updatedStatus: action.accept ? 'Verified' : 'Rejected for Correction',
            remarks: action.observations,
          }),
          ...state.audit,
        ],
      }
    }
    case 'submit-renewal': {
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.id
            ? {
                ...d,
                renewalStatus: 'Submitted',
                verificationStatus: 'Awaiting Verification',
                renewalFileName: action.fileName,
                renewalSubmittedAt: isoStamp(state.asOfDate, 11, 5),
              }
            : d,
        ),
        audit: [
          audit(state, {
            entityType: 'Document',
            entityRef: action.id,
            action: 'Renewal uploaded (demo)',
            updatedStatus: 'Awaiting Verification',
            remarks: 'Uploaded renewal is not treated as valid until verified.',
          }),
          ...state.audit,
        ],
      }
    }
    case 'verify-document': {
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.id
            ? {
                ...d,
                verificationStatus: action.accept ? 'Verified Renewal' : 'Expired — Action Required',
                expiryDate: action.accept ? addDays(state.asOfDate, 365) : d.expiryDate,
              }
            : d,
        ),
        audit: [
          audit(state, {
            entityType: 'Document',
            entityRef: action.id,
            action: action.accept ? 'Renewal verified (demo)' : 'Renewal rejected (demo)',
            updatedStatus: action.accept ? 'Verified Renewal' : 'Expired — Action Required',
          }),
          ...state.audit,
        ],
      }
    }
    case 'mark-read':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      }
    case 'mark-all-read':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'acknowledge-escalation':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id && n.escalation
            ? { ...n, escalation: { ...n.escalation, resolution: 'Acknowledged' }, read: true }
            : n,
        ),
        audit: [
          audit(state, {
            entityType: 'Notification',
            entityRef: action.id,
            action: 'Escalation acknowledged (demo)',
            updatedStatus: 'Acknowledged',
          }),
          ...state.audit,
        ],
      }
    default:
      return state
  }
}

interface StoreValue {
  state: DemoState
  user: DemoUser
  canMutateWorkflow: boolean
  canScheduleEvc: boolean
  canVerifyCompliance: boolean
  dispatch: {
    reset: () => void
    setAsOf: (date: string) => void
    setRole: (role: DemoRole) => void
    completeStage: (applicationId: string, remarks?: string) => void
    returnApplication: (applicationId: string, reason: string) => void
    assignOfficer: (applicationId: string, officerId: string) => void
    createSample: () => string
    scheduleEvc: (visitId: string, plannedDate: string) => void
    updateEvcStatus: (visitId: string, status: DemoState['visits'][number]['status']) => void
    submitUndertaking: (id: string, fileName: string) => void
    verifyUndertaking: (id: string, observations: string, accept: boolean) => void
    submitRenewal: (id: string, fileName: string) => void
    verifyDocument: (id: string, accept: boolean) => void
    markRead: (id: string) => void
    markAllRead: () => void
    acknowledgeEscalation: (id: string) => void
  }
}

const DemoContext = createContext<StoreValue | null>(null)

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedState()
    const parsed = JSON.parse(raw) as DemoState
    if (parsed.version !== 1 || !parsed.applications?.length) return createSeedState()
    return parsed
  } catch {
    return createSeedState()
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const refreshed = useMemo(() => {
    const undertakings = state.undertakings.map((u) => ({
      ...u,
      submissionStatus: deriveUndertakingSubmission(u, state.asOfDate),
    }))
    return { ...state, undertakings }
  }, [state])

  const createSample = useCallback(() => {
    const id = `APP-2026-${state.nextApplicationSeq}`
    dispatch({ type: 'create-sample' })
    return id
  }, [state.nextApplicationSeq])

  const value = useMemo<StoreValue>(() => {
    const role = refreshed.currentRole
    return {
      state: refreshed,
      user: { ...SIGNED_IN, role },
      canMutateWorkflow: role === 'Regional Officer',
      canScheduleEvc: role === 'Regional Officer' || role === 'EVC Coordinator',
      canVerifyCompliance: role === 'Regional Officer' || role === 'Compliance Officer',
      dispatch: {
        reset: () => dispatch({ type: 'reset' }),
        setAsOf: (date) => dispatch({ type: 'set-as-of', date }),
        setRole: (roleValue) => dispatch({ type: 'set-role', role: roleValue }),
        completeStage: (applicationId, remarks) => dispatch({ type: 'complete-stage', applicationId, remarks }),
        returnApplication: (applicationId, reason) => dispatch({ type: 'return-application', applicationId, reason }),
        assignOfficer: (applicationId, officerId) => dispatch({ type: 'assign-officer', applicationId, officerId }),
        createSample,
        scheduleEvc: (visitId, plannedDate) => dispatch({ type: 'schedule-evc', visitId, plannedDate }),
        updateEvcStatus: (visitId, status) => dispatch({ type: 'update-evc-status', visitId, status }),
        submitUndertaking: (id, fileName) => dispatch({ type: 'submit-undertaking', id, fileName }),
        verifyUndertaking: (id, observations, accept) =>
          dispatch({ type: 'verify-undertaking', id, observations, accept }),
        submitRenewal: (id, fileName) => dispatch({ type: 'submit-renewal', id, fileName }),
        verifyDocument: (id, accept) => dispatch({ type: 'verify-document', id, accept }),
        markRead: (id) => dispatch({ type: 'mark-read', id }),
        markAllRead: () => dispatch({ type: 'mark-all-read' }),
        acknowledgeEscalation: (id) => dispatch({ type: 'acknowledge-escalation', id }),
      },
    }
  }, [createSample, refreshed])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
