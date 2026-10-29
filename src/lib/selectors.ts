import type { Application, DemoState } from '../types'
import { deriveApplicationStatus, isApproachingDeadline, isTerminal, ageingDays } from './status'

export function withStatus(apps: Application[], asOf: string) {
  return apps.map((app) => ({
    ...app,
    status: deriveApplicationStatus(app, asOf),
    ageing: ageingDays(app, asOf),
  }))
}

export function kpis(state: DemoState) {
  const apps = withStatus(state.applications, state.asOfDate)
  const total = apps.length
  const overdue = apps.filter((a) => a.status === 'Overdue').length
  const pending = apps.filter((a) => a.status === 'Pending' || a.status === 'In Progress' || a.status === 'Returned').length
  const approaching = apps.filter((a) => isApproachingDeadline(a, state.asOfDate)).length
  const completed = apps.filter((a) => a.status === 'Completed').length
  return { total, overdue, pending, approaching, completed }
}

export function pipeline(state: DemoState) {
  const counts = new Map<string, number>()
  for (const app of state.applications) {
    if (isTerminal(app)) {
      counts.set('Decision complete', (counts.get('Decision complete') ?? 0) + 1)
    } else {
      counts.set(app.currentStage, (counts.get(app.currentStage) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([name, value]) => ({ name, value }))
}

export function statusMix(state: DemoState) {
  const apps = withStatus(state.applications, state.asOfDate)
  const keys = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Returned'] as const
  return keys.map((name) => ({ name, value: apps.filter((a) => a.status === name).length }))
}

export function regionLoad(state: DemoState) {
  const map = new Map<string, number>()
  for (const app of state.applications) {
    if (!isTerminal(app)) map.set(app.region, (map.get(app.region) ?? 0) + 1)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

export function ageingBuckets(state: DemoState) {
  const apps = withStatus(state.applications, state.asOfDate).filter((a) => a.status !== 'Completed')
  const buckets = [
    { name: '0–7 days', value: 0 },
    { name: '8–15 days', value: 0 },
    { name: '16–30 days', value: 0 },
    { name: '31+ days', value: 0 },
  ]
  for (const app of apps) {
    if (app.ageing <= 7) buckets[0].value += 1
    else if (app.ageing <= 15) buckets[1].value += 1
    else if (app.ageing <= 30) buckets[2].value += 1
    else buckets[3].value += 1
  }
  return buckets
}

export type AttentionItem = {
  id: string
  ref: string
  institution: string
  issue: string
  due: string
  role: string
  urgency: number
  tone: 'danger' | 'warning' | 'info'
  to: string
}

export function attentionItems(state: DemoState): AttentionItem[] {
  const apps = withStatus(state.applications, state.asOfDate)
  const items: AttentionItem[] = []
  for (const app of apps) {
    if (app.status === 'Overdue') {
      items.push({
        id: `od-${app.id}`,
        ref: app.id,
        institution: app.institutionName,
        issue: 'Case overdue and awaiting authorised action',
        due: app.dueDate,
        role: app.assignedOfficerName,
        urgency: 100,
        tone: 'danger',
        to: `/applications/${app.id}`,
      })
    } else if (isApproachingDeadline(app, state.asOfDate)) {
      items.push({
        id: `ap-${app.id}`,
        ref: app.id,
        institution: app.institutionName,
        issue: 'Application approaching processing deadline',
        due: app.dueDate,
        role: app.assignedOfficerName,
        urgency: 70,
        tone: 'warning',
        to: `/applications/${app.id}`,
      })
    }
  }
  for (const v of state.visits) {
    if (v.status === 'Awaiting Scheduling' || v.status === 'Delayed') {
      items.push({
        id: `evc-${v.id}`,
        ref: v.applicationId,
        institution: v.institutionName,
        issue: v.status === 'Delayed' ? 'EVC scheduling delayed' : 'EVC awaiting scheduling',
        due: v.schedulingDeadline,
        role: v.coordinatorName,
        urgency: v.status === 'Delayed' ? 90 : 60,
        tone: v.status === 'Delayed' ? 'danger' : 'warning',
        to: '/evc',
      })
    }
  }
  for (const u of state.undertakings) {
    if (u.verificationStatus === 'Awaiting Verification' || u.submissionStatus === 'Overdue') {
      items.push({
        id: `utk-${u.id}`,
        ref: u.id,
        institution: u.institutionName,
        issue: u.submissionStatus === 'Overdue' ? 'Compliance evidence overdue' : 'Compliance evidence awaiting verification',
        due: u.dueDate,
        role: u.verifierRole,
        urgency: u.submissionStatus === 'Overdue' ? 85 : 55,
        tone: u.submissionStatus === 'Overdue' ? 'danger' : 'warning',
        to: `/compliance/${u.id}`,
      })
    }
  }
  for (const d of state.documents) {
    if (d.verificationStatus === 'Expired — Action Required' || d.verificationStatus === 'Awaiting Verification') {
      items.push({
        id: `doc-${d.id}`,
        ref: d.id,
        institution: d.institutionName,
        issue: d.verificationStatus === 'Expired — Action Required' ? 'Document expired' : 'Document nearing expiry / renewal in verification',
        due: d.expiryDate,
        role: 'Document cell',
        urgency: d.verificationStatus.startsWith('Expired') ? 95 : 50,
        tone: d.verificationStatus.startsWith('Expired') ? 'danger' : 'warning',
        to: `/documents/${d.id}`,
      })
    }
  }
  return items.sort((a, b) => b.urgency - a.urgency || a.due.localeCompare(b.due)).slice(0, 12)
}
