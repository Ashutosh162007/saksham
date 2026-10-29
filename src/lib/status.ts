import { APPROACHING_WINDOW_DAYS } from './constants'
import { daysBetween } from './dates'
import type { Application, ApplicationStatus, InstitutionDocument, Undertaking } from '../types'

export function isTerminal(app: Application): boolean {
  const decision = app.stages.find((s) => s.name === 'Competent Authority Decision')
  return decision?.state === 'completed'
}

export function isReturned(app: Application): boolean {
  return app.stages.some((s) => s.state === 'returned')
}

export function deriveApplicationStatus(app: Application, asOf: string): ApplicationStatus {
  if (isTerminal(app)) return 'Completed'
  if (isReturned(app)) return 'Returned'
  if (daysBetween(asOf, app.dueDate) < 0) return 'Overdue'
  if (app.currentStage === 'Application Submitted') return 'Pending'
  return 'In Progress'
}

export function isApproachingDeadline(app: Application, asOf: string): boolean {
  if (isTerminal(app)) return false
  const remaining = daysBetween(asOf, app.dueDate)
  return remaining >= 0 && remaining <= APPROACHING_WINDOW_DAYS
}

export function ageingDays(app: Application, asOf: string): number {
  if (isTerminal(app)) {
    const done = app.stages.find((s) => s.name === 'Competent Authority Decision')?.completedAt
    return Math.max(0, daysBetween(app.submittedOn, done ?? asOf))
  }
  return Math.max(0, daysBetween(app.submittedOn, asOf))
}

export function deriveUndertakingSubmission(
  item: Undertaking,
  asOf: string,
): Undertaking['submissionStatus'] {
  if (item.verificationStatus === 'Verified') return 'Submitted'
  if (item.submittedAt) return 'Submitted'
  if (daysBetween(asOf, item.dueDate) < 0) return 'Overdue'
  return 'Pending Submission'
}

export function documentDaysRemaining(doc: InstitutionDocument, asOf: string): number {
  return daysBetween(asOf, doc.expiryDate)
}

export function documentValidityLabel(
  doc: InstitutionDocument,
  asOf: string,
): 'Valid' | 'Expiring soon' | 'Expired' | 'Renewal in verification' {
  if (doc.verificationStatus === 'Awaiting Verification') return 'Renewal in verification'
  const remaining = documentDaysRemaining(doc, asOf)
  if (remaining < 0) return 'Expired'
  if (remaining <= 45) return 'Expiring soon'
  return 'Valid'
}

export function statusTone(status: ApplicationStatus): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'Completed') return 'success'
  if (status === 'Overdue') return 'danger'
  if (status === 'Returned') return 'warning'
  if (status === 'In Progress') return 'info'
  return 'neutral'
}
