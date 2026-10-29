import { DEFAULT_AS_OF, STAGE_SEQUENCE } from '../lib/constants'
import { addDays, daysBetween, isoStamp } from '../lib/dates'
import type {
  Application,
  ApplicationType,
  AuditEvent,
  ChecklistItem,
  DemoState,
  EvcVisit,
  InstitutionDocument,
  NotificationItem,
  Observation,
  Undertaking,
  WorkflowStage,
  WorkflowStageName,
} from '../types'
import { INSTITUTIONS, OFFICERS } from './reference'

type AppSeed = {
  seq: number
  inst: number
  type: ApplicationType
  stageIndex: number
  officer: number
  submitted: number
  due: number
  evc: boolean
  sac: boolean
  returned?: boolean
  returnReason?: string
}

const APP_SEEDS: AppSeed[] = [
  { seq: 1001, inst: 0, type: 'Extension of Approval', stageIndex: 1, officer: 1, submitted: -18, due: 6, evc: false, sac: false },
  { seq: 1002, inst: 1, type: 'Increase in Intake', stageIndex: 2, officer: 7, submitted: -32, due: -4, evc: true, sac: true },
  { seq: 1003, inst: 2, type: 'New Programme', stageIndex: 3, officer: 3, submitted: -40, due: 11, evc: true, sac: true },
  { seq: 1004, inst: 3, type: 'Extension of Approval', stageIndex: 5, officer: 4, submitted: -72, due: -2, evc: false, sac: false },
  { seq: 1005, inst: 4, type: 'New Institution', stageIndex: 2, officer: 2, submitted: -21, due: 3, evc: true, sac: true },
  { seq: 1006, inst: 5, type: 'Change of Site', stageIndex: 1, officer: 6, submitted: -12, due: 9, evc: true, sac: false },
  { seq: 1007, inst: 6, type: 'Extension of Approval', stageIndex: 4, officer: 5, submitted: -48, due: 2, evc: false, sac: true },
  { seq: 1008, inst: 7, type: 'Increase in Intake', stageIndex: 0, officer: 8, submitted: -3, due: 18, evc: false, sac: false },
  { seq: 1009, inst: 8, type: 'New Programme', stageIndex: 1, officer: 9, submitted: -24, due: -8, evc: true, sac: true, returned: true, returnReason: 'Faculty cadre ratio statement incomplete for the proposed intake.' },
  { seq: 1010, inst: 9, type: 'Extension of Approval', stageIndex: 2, officer: 5, submitted: -29, due: 5, evc: true, sac: false },
  { seq: 1011, inst: 10, type: 'Closure of Programme', stageIndex: 4, officer: 0, submitted: -55, due: 1, evc: false, sac: true },
  { seq: 1012, inst: 11, type: 'New Institution', stageIndex: 2, officer: 6, submitted: -36, due: -6, evc: true, sac: true },
  { seq: 1013, inst: 12, type: 'Extension of Approval', stageIndex: 1, officer: 1, submitted: -9, due: 12, evc: false, sac: false },
  { seq: 1014, inst: 13, type: 'Increase in Intake', stageIndex: 3, officer: 8, submitted: -44, due: 8, evc: true, sac: true },
  { seq: 1015, inst: 14, type: 'New Programme', stageIndex: 0, officer: 4, submitted: -2, due: 21, evc: true, sac: true },
  { seq: 1016, inst: 15, type: 'Extension of Approval', stageIndex: 5, officer: 5, submitted: -80, due: -10, evc: false, sac: false },
  { seq: 1017, inst: 16, type: 'Change of Site', stageIndex: 2, officer: 6, submitted: -27, due: 4, evc: true, sac: true },
  { seq: 1018, inst: 17, type: 'New Institution', stageIndex: 1, officer: 9, submitted: -16, due: -1, evc: true, sac: true },
  { seq: 1019, inst: 18, type: 'Extension of Approval', stageIndex: 4, officer: 6, submitted: -51, due: 7, evc: false, sac: true },
  { seq: 1020, inst: 19, type: 'Increase in Intake', stageIndex: 2, officer: 5, submitted: -22, due: 10, evc: true, sac: false },
  { seq: 1021, inst: 0, type: 'New Programme', stageIndex: 3, officer: 0, submitted: -38, due: -3, evc: true, sac: true },
  { seq: 1022, inst: 3, type: 'Extension of Approval', stageIndex: 1, officer: 4, submitted: -11, due: 14, evc: false, sac: false },
  { seq: 1023, inst: 6, type: 'New Institution', stageIndex: 2, officer: 5, submitted: -33, due: 0, evc: true, sac: true },
  { seq: 1024, inst: 8, type: 'Closure of Programme', stageIndex: 0, officer: 9, submitted: -4, due: 16, evc: false, sac: false },
  { seq: 1025, inst: 2, type: 'Extension of Approval', stageIndex: 5, officer: 3, submitted: -90, due: -12, evc: false, sac: false },
  { seq: 1026, inst: 11, type: 'Increase in Intake', stageIndex: 1, officer: 6, submitted: -14, due: 8, evc: false, sac: true },
  { seq: 1027, inst: 4, type: 'New Programme', stageIndex: 4, officer: 2, submitted: -46, due: -5, evc: true, sac: true },
  { seq: 1028, inst: 13, type: 'Extension of Approval', stageIndex: 2, officer: 8, submitted: -25, due: 6, evc: true, sac: false },
  { seq: 1029, inst: 1, type: 'Change of Site', stageIndex: 1, officer: 7, submitted: -19, due: 3, evc: true, sac: true, returned: true, returnReason: 'Land continuity documents do not cover the proposed additional plot.' },
  { seq: 1030, inst: 17, type: 'New Institution', stageIndex: 3, officer: 9, submitted: -42, due: 9, evc: true, sac: true },
  { seq: 1031, inst: 9, type: 'Extension of Approval', stageIndex: 0, officer: 5, submitted: -1, due: 22, evc: false, sac: false },
  { seq: 1032, inst: 14, type: 'Increase in Intake', stageIndex: 2, officer: 4, submitted: -28, due: -7, evc: true, sac: true },
  { seq: 1033, inst: 5, type: 'New Programme', stageIndex: 1, officer: 6, submitted: -8, due: 13, evc: true, sac: false },
  { seq: 1034, inst: 18, type: 'Extension of Approval', stageIndex: 4, officer: 6, submitted: -60, due: 4, evc: false, sac: true },
  { seq: 1035, inst: 7, type: 'New Institution', stageIndex: 2, officer: 8, submitted: -31, due: 2, evc: true, sac: true },
  { seq: 1036, inst: 12, type: 'Closure of Programme', stageIndex: 1, officer: 1, submitted: -10, due: 11, evc: false, sac: false },
  { seq: 1037, inst: 16, type: 'Extension of Approval', stageIndex: 5, officer: 6, submitted: -78, due: -9, evc: false, sac: false },
  { seq: 1038, inst: 10, type: 'Increase in Intake', stageIndex: 3, officer: 0, submitted: -41, due: 5, evc: true, sac: true },
  { seq: 1039, inst: 19, type: 'New Programme', stageIndex: 1, officer: 5, submitted: -15, due: -2, evc: true, sac: true },
  { seq: 1040, inst: 15, type: 'Extension of Approval', stageIndex: 2, officer: 5, submitted: -26, due: 7, evc: true, sac: false },
  { seq: 1041, inst: 2, type: 'Change of Site', stageIndex: 0, officer: 3, submitted: -5, due: 17, evc: true, sac: true },
  { seq: 1042, inst: 8, type: 'New Institution', stageIndex: 4, officer: 9, submitted: -53, due: 1, evc: true, sac: true },
]

function appId(seq: number): string {
  return `APP-2026-${seq}`
}

function buildStages(seed: AppSeed, submittedOn: string, asOf: string, officerName: string): WorkflowStage[] {
  return STAGE_SEQUENCE.map((name, index) => {
    const applicable =
      (name !== 'EVC' || seed.evc) && (name !== 'SAC/SHC' || seed.sac)
    if (!applicable) {
      return { name, state: 'not-applicable' as const, remarks: 'Not applicable for this application type in the demo workflow.' }
    }
    if (seed.returned && index === seed.stageIndex) {
      return {
        name,
        state: 'returned',
        startedAt: addDays(submittedOn, Math.max(1, index * 6)),
        assignee: officerName,
        returnReason: seed.returnReason,
      }
    }
    if (index < seed.stageIndex) {
      const startedAt = addDays(submittedOn, index * 5)
      const completedAt = addDays(submittedOn, index * 5 + 4)
      return {
        name,
        state: 'completed',
        startedAt,
        completedAt,
        assignee: officerName,
        remarks: index === 0 ? 'Intake recorded in the demonstration queue.' : 'Stage completed in the sample workflow.',
      }
    }
    if (index === seed.stageIndex) {
      const startedAt = addDays(submittedOn, Math.max(1, index * 5))
      const overdue = daysBetween(asOf, addDays(submittedOn, 28 + index * 3)) < 0 && seed.due < 0
      return {
        name,
        state: overdue ? 'overdue' : 'active',
        startedAt,
        assignee: officerName,
      }
    }
    return { name, state: 'pending' }
  })
}

function checklist(stageIndex: number): ChecklistItem[] {
  const items = [
    'Application form (signed)',
    'Affiliation / university letter',
    'Faculty details',
    'Infrastructure declaration',
    'Fee receipt',
    'Land / building documents',
  ]
  return items.map((label, i) => ({
    id: `chk-${i + 1}`,
    label,
    status: i < Math.min(5, stageIndex + 2) ? (i === 2 && stageIndex < 2 ? 'Pending' : 'Verified') : 'Pending',
  }))
}

function observations(id: string, seed: AppSeed, submittedOn: string, officerName: string): Observation[] {
  const notes: Observation[] = [
    {
      id: `${id}-obs-1`,
      at: isoStamp(addDays(submittedOn, 1), 11, 10),
      author: officerName,
      role: 'Assigned officer',
      stage: 'Application Submitted',
      body: 'Application registered in the demonstration queue. Institution particulars match the sample master record.',
      kind: 'note',
    },
  ]
  if (seed.stageIndex >= 1) {
    notes.push({
      id: `${id}-obs-2`,
      at: isoStamp(addDays(submittedOn, 7), 16, 40),
      author: officerName,
      role: 'Scrutiny',
      stage: 'Preliminary Scrutiny',
      body: seed.returned
        ? seed.returnReason ?? 'Returned for correction.'
        : 'Preliminary checks completed on the sample file. No statutory finding is implied.',
      kind: seed.returned ? 'deficiency' : 'note',
    })
  }
  return notes
}

function buildApplications(asOf: string): Application[] {
  return APP_SEEDS.map((seed) => {
    const institution = INSTITUTIONS[seed.inst]
    const officer = OFFICERS[seed.officer]
    const submittedOn = addDays(asOf, seed.submitted)
    const dueDate = addDays(asOf, seed.due)
    const id = appId(seed.seq)
    const currentStage = STAGE_SEQUENCE[seed.stageIndex]
    return {
      id,
      institutionId: institution.id,
      institutionName: institution.name,
      city: institution.city,
      region: institution.region,
      type: seed.type,
      currentStage,
      assignedOfficerId: officer.id,
      assignedOfficerName: officer.name,
      submittedOn,
      dueDate,
      summary: `${seed.type} for ${institution.name}, ${institution.city}. Illustrative demonstration file only.`,
      requiresEvc: seed.evc,
      requiresSac: seed.sac,
      stages: buildStages(seed, submittedOn, asOf, officer.name),
      checklist: checklist(seed.stageIndex),
      observations: observations(id, seed, submittedOn, officer.name),
    }
  })
}

function buildVisits(apps: Application[], asOf: string): EvcVisit[] {
  const evcApps = apps.filter((a) => a.requiresEvc)
  return evcApps.map((app, i) => {
    const coordinator = OFFICERS[i % 2 === 0 ? 2 : 8]
    const deadline = addDays(app.submittedOn, 21)
    const stage = app.stages.find((s) => s.name === 'EVC')
    let status: EvcVisit['status'] = 'Awaiting Scheduling'
    let plannedDate: string | undefined
    let completedDate: string | undefined
    if (stage?.state === 'completed') {
      status = 'Completed'
      plannedDate = addDays(app.submittedOn, 18)
      completedDate = addDays(app.submittedOn, 19)
    } else if (stage?.state === 'active' || stage?.state === 'overdue') {
      if (i % 4 === 0) {
        status = daysBetween(asOf, deadline) < 0 ? 'Delayed' : 'Awaiting Scheduling'
      } else if (i % 4 === 1) {
        plannedDate = addDays(asOf, 4 + (i % 3))
        status = 'Upcoming'
      } else if (i % 4 === 2) {
        plannedDate = addDays(asOf, 12)
        status = 'Scheduled'
      } else {
        status = daysBetween(asOf, deadline) < 0 ? 'Delayed' : 'Awaiting Scheduling'
      }
    } else if (stage?.state === 'pending') {
      status = 'Awaiting Scheduling'
    }
    return {
      id: `EVC-${app.id.slice(-4)}`,
      applicationId: app.id,
      institutionName: app.institutionName,
      region: app.region,
      prerequisiteMet: stage?.state !== 'pending',
      prerequisiteNote: stage?.state === 'pending' ? 'Scrutiny is still open in the demo workflow.' : 'Sample prerequisites marked complete.',
      schedulingDeadline: deadline,
      coordinatorId: coordinator.id,
      coordinatorName: coordinator.name,
      plannedDate,
      completedDate,
      status,
      notes: 'Fictional EVC slot for demonstration. No inspection has been booked.',
    }
  })
}

function buildUndertakings(apps: Application[], asOf: string): Undertaking[] {
  const picked = [apps[0], apps[2], apps[4], apps[6], apps[9], apps[11], apps[16], apps[20], apps[27], apps[33], apps[37], apps[41]]
  const descriptions = [
    'Submit updated faculty appointment letters for the additional intake requested.',
    'Provide a time-bound plan for laboratory equipment listed in the deficiency note.',
    'Furnish occupancy certificate for the academic block cited in the application.',
    'Confirm hostel capacity against the proposed student strength.',
    'File a revised land-use sketch for the additional workshop bay.',
    'Submit proof of corpus deposit as recorded in the sample condition.',
    'Provide fire NOC covering the newly declared built-up area.',
    'Clarify closure pathway and student migration plan for the listed programme.',
    'Upload audited statements corresponding to the last completed financial year (sample).',
    'Submit a rectification plan for the computer-centre seating shortfall.',
    'Provide affiliation continuation letter for the proposed programme.',
    'Record barrier-free access measures for the additional floor.',
  ]
  return picked.filter(Boolean).map((app, i) => {
    const issuedOn = addDays(app.submittedOn, 8)
    const dueDate = addDays(asOf, [9, -3, 4, 12, -11, 2, 18, -1, 6, -6, 3, 8][i] ?? 7)
    const submitted = i % 3 === 1 || i % 5 === 0
    const verified = i === 0 || i === 6
    const rejected = i === 4
    const overdue = !submitted && daysBetween(asOf, dueDate) < 0
    return {
      id: `UTK-2026-${1201 + i}`,
      applicationId: app.id,
      institutionName: app.institutionName,
      region: app.region,
      description: descriptions[i],
      issuedOn,
      dueDate,
      requiredEvidence: 'PDF or scanned supporting file (demo upload only).',
      submissionStatus: submitted ? 'Submitted' : overdue ? 'Overdue' : 'Pending Submission',
      verificationStatus: verified
        ? 'Verified'
        : rejected
          ? 'Rejected for Correction'
          : submitted
            ? 'Awaiting Verification'
            : 'Not Submitted',
      verifierRole: 'Compliance Officer',
      evidenceFileName: submitted ? `undertaking-${1201 + i}.pdf` : undefined,
      submittedAt: submitted ? isoStamp(addDays(dueDate, -2), 14, 5) : undefined,
      submittedBy: submitted ? 'Institution desk (demo)' : undefined,
      observations: verified
        ? 'Sample evidence accepted for demonstration. Not a statutory verification.'
        : rejected
          ? 'Returned in the demo workflow: page 3 of the occupancy extract is unreadable.'
          : undefined,
      verifiedAt: verified ? isoStamp(addDays(asOf, -1), 12, 18) : undefined,
      verifiedBy: verified ? 'Naveen Pillai' : undefined,
    }
  })
}

function buildDocuments(asOf: string): InstitutionDocument[] {
  const types: InstitutionDocument['type'][] = [
    'Land Lease',
    'Building Occupancy',
    'Fire NOC',
    'Society Registration',
    'Affiliation Letter',
    'Trust Deed',
  ]
  return INSTITUTIONS.flatMap((inst, i) => {
    const type = types[i % types.length]
    const expiryOffset = [220, 28, -12, 80, 14, 400, 40, -4, 18, 120, 6, -20, 55, 32, 90, -8, 11, 200, 24, 3][i]
    const expiryDate = addDays(asOf, expiryOffset)
    const issueDate = addDays(expiryDate, -365)
    const expired = expiryOffset < 0
    const expiring = expiryOffset >= 0 && expiryOffset <= 45
    const renewalSubmitted = expired || (expiring && i % 2 === 0)
    return [
      {
        id: `DOC-${inst.code}-${String(i + 1).padStart(2, '0')}`,
        institutionId: inst.id,
        institutionName: inst.name,
        region: inst.region,
        type,
        issueDate,
        expiryDate,
        renewalStatus: renewalSubmitted ? 'Submitted' : expired ? 'None' : 'Not Required',
        verificationStatus: expired && !renewalSubmitted
          ? 'Expired — Action Required'
          : renewalSubmitted && !expired && i % 3 === 0
            ? 'Verified Renewal'
            : renewalSubmitted
              ? 'Awaiting Verification'
              : 'Currently Valid',
        reminderIntervalsDays: [45, 30, 15, 7],
        renewalFileName: renewalSubmitted ? `${inst.code}-renewal.pdf` : undefined,
        renewalSubmittedAt: renewalSubmitted ? isoStamp(addDays(asOf, -3), 9, 42) : undefined,
      },
    ]
  })
}

function buildNotifications(
  apps: Application[],
  visits: EvcVisit[],
  undertakings: Undertaking[],
  documents: InstitutionDocument[],
  asOf: string,
): NotificationItem[] {
  const items: NotificationItem[] = []
  apps.filter((a) => daysBetween(asOf, a.dueDate) < 0 && a.stages.at(-1)?.state !== 'completed').forEach((app, i) => {
    items.push({
      id: `NTF-OD-${app.id.slice(-4)}`,
      category: 'Overdue Cases',
      priority: 'Critical',
      title: `Processing deadline exceeded — ${app.id}`,
      body: `${app.institutionName} remains open after the demonstration due date.`,
      relatedType: 'application',
      relatedId: app.id,
      relatedLabel: app.id,
      recipientRole: 'Regional Officer',
      trigger: 'Due date passed while the file was still open.',
      dueDate: app.dueDate,
      createdAt: isoStamp(addDays(app.dueDate, 1), 8, 15),
      read: i > 3,
      deliveryStatus: 'Logged in demo inbox',
      escalation: i < 4
        ? {
            rule: 'Escalate to Deputy Director if open 3 days after due date (demo rule).',
            at: isoStamp(addDays(app.dueDate, 3), 9, 0),
            toRole: 'Deputy Director',
            resolution: i === 0 ? 'Acknowledged' : 'Open',
          }
        : undefined,
    })
  })
  apps.filter((a) => {
    const d = daysBetween(asOf, a.dueDate)
    return d >= 0 && d <= 14 && a.stages.at(-1)?.state !== 'completed'
  }).slice(0, 8).forEach((app, i) => {
    items.push({
      id: `NTF-UP-${app.id.slice(-4)}`,
      category: 'Upcoming Deadlines',
      priority: dPriority(daysBetween(asOf, app.dueDate)),
      title: `Deadline approaching — ${app.id}`,
      body: `${app.institutionName} is due on the demonstration calendar in ${daysBetween(asOf, app.dueDate)} day(s).`,
      relatedType: 'application',
      relatedId: app.id,
      relatedLabel: app.id,
      recipientRole: 'Assigned officer',
      trigger: 'Configured 14-day reminder window.',
      dueDate: app.dueDate,
      createdAt: isoStamp(addDays(asOf, -1), 7, 30 + i),
      read: i > 4,
      deliveryStatus: 'Logged in demo inbox',
    })
  })
  visits.filter((v) => v.status === 'Delayed' || v.status === 'Awaiting Scheduling').slice(0, 6).forEach((v, i) => {
    items.push({
      id: `NTF-EVC-${v.id.slice(-4)}`,
      category: 'EVC Scheduling',
      priority: v.status === 'Delayed' ? 'High' : 'Medium',
      title: `${v.status}: ${v.applicationId}`,
      body: `Sample EVC coordination item for ${v.institutionName}.`,
      relatedType: 'evc',
      relatedId: v.id,
      relatedLabel: v.applicationId,
      recipientRole: 'EVC Coordinator',
      trigger: 'Scheduling deadline monitor (demo).',
      dueDate: v.schedulingDeadline,
      createdAt: isoStamp(addDays(asOf, -2), 10, 5 + i),
      read: i > 2,
      deliveryStatus: 'Logged in demo inbox',
    })
  })
  undertakings.filter((u) => u.submissionStatus === 'Overdue' || u.verificationStatus === 'Awaiting Verification').forEach((u, i) => {
    items.push({
      id: `NTF-UTK-${u.id.slice(-4)}`,
      category: 'Compliance',
      priority: u.submissionStatus === 'Overdue' ? 'High' : 'Medium',
      title: `Undertaking ${u.id}`,
      body: u.description,
      relatedType: 'undertaking',
      relatedId: u.id,
      relatedLabel: u.id,
      recipientRole: 'Compliance Officer',
      trigger: 'Compliance register monitor (demo).',
      dueDate: u.dueDate,
      createdAt: isoStamp(addDays(asOf, -1), 13, 12 + i),
      read: i > 3,
      deliveryStatus: 'Logged in demo inbox',
    })
  })
  documents.filter((d) => d.verificationStatus !== 'Currently Valid' && d.verificationStatus !== 'Verified Renewal').forEach((d, i) => {
    items.push({
      id: `NTF-DOC-${d.id.slice(-6)}`,
      category: 'Document Expiry',
      priority: d.verificationStatus.startsWith('Expired') ? 'Critical' : 'High',
      title: `${d.type} — ${d.institutionName}`,
      body: `Validity status in the demonstration register: ${d.verificationStatus}.`,
      relatedType: 'document',
      relatedId: d.id,
      relatedLabel: d.id,
      recipientRole: 'Compliance Officer',
      trigger: 'Configured reminder intervals (45/30/15/7 days).',
      dueDate: d.expiryDate,
      createdAt: isoStamp(addDays(asOf, -2), 11, 8 + i),
      read: i > 5,
      deliveryStatus: 'Logged in demo inbox',
    })
  })
  items.filter((n) => n.escalation).forEach((n) => {
    items.push({
      ...n,
      id: `${n.id}-ESC`,
      category: 'Escalated Items',
      title: `Escalated: ${n.title}`,
      createdAt: n.escalation?.at ?? n.createdAt,
      read: false,
    })
  })
  return items
}

function dPriority(days: number): NotificationItem['priority'] {
  if (days <= 3) return 'High'
  if (days <= 7) return 'Medium'
  return 'Low'
}

function buildAudit(apps: Application[], asOf: string): AuditEvent[] {
  const events: AuditEvent[] = [
    {
      id: 'AUD-0001',
      timestamp: isoStamp(addDays(asOf, -20), 9, 0),
      actor: 'System (demo seed)',
      actorRole: 'System',
      entityType: 'System',
      entityRef: 'SAKSHAM-DEMO',
      action: 'Demonstration dataset initialised',
      remarks: 'Append-only sample history for the prototype. Not a production audit store.',
      origin: 'seed',
    },
  ]
  apps.forEach((app, i) => {
    events.push({
      id: `AUD-SUB-${app.id.slice(-4)}`,
      timestamp: isoStamp(app.submittedOn, 10, 15),
      actor: 'Institution desk (demo)',
      actorRole: 'Applicant (simulated)',
      entityType: 'Application',
      entityRef: app.id,
      action: 'Application recorded',
      updatedStatus: 'Pending',
      remarks: `${app.type} submitted for ${app.institutionName}.`,
      origin: 'seed',
    })
    app.stages.filter((s) => s.state === 'completed').forEach((s, si) => {
      events.push({
        id: `AUD-ST-${app.id.slice(-4)}-${si}`,
        timestamp: isoStamp(s.completedAt ?? app.submittedOn, 15, 20),
        actor: app.assignedOfficerName,
        actorRole: 'Assigned officer',
        entityType: 'Application',
        entityRef: app.id,
        action: `Completed stage: ${s.name}`,
        previousStatus: 'In Progress',
        updatedStatus: s.name,
        remarks: 'Simulated stage completion. Not a statutory approval.',
        origin: 'seed',
      })
    })
    if (i % 11 === 0) {
      events.push({
        id: `AUD-ASG-${app.id.slice(-4)}`,
        timestamp: isoStamp(addDays(app.submittedOn, 2), 12, 0),
        actor: 'Meera Krishnan',
        actorRole: 'Regional Officer',
        entityType: 'Application',
        entityRef: app.id,
        action: 'Officer assigned',
        updatedStatus: app.assignedOfficerName,
        origin: 'seed',
      })
    }
  })
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function createSeedState(asOf = DEFAULT_AS_OF): DemoState {
  const applications = buildApplications(asOf)
  const visits = buildVisits(applications, asOf)
  const undertakings = buildUndertakings(applications, asOf)
  const documents = buildDocuments(asOf)
  const notifications = buildNotifications(applications, visits, undertakings, documents, asOf)
  const audit = buildAudit(applications, asOf)
  return {
    version: 1,
    asOfDate: asOf,
    currentRole: 'Regional Officer',
    applications,
    visits,
    undertakings,
    documents,
    notifications,
    audit,
    nextApplicationSeq: 1043,
  }
}

export function nextApplicableStage(
  app: Application,
  fromIndex: number,
): WorkflowStageName | null {
  for (let i = fromIndex + 1; i < app.stages.length; i += 1) {
    if (app.stages[i].state !== 'not-applicable') return app.stages[i].name
  }
  return null
}
