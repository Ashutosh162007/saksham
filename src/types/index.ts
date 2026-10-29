export type Region =
  | 'Northern'
  | 'Western'
  | 'Southern'
  | 'Eastern'
  | 'Central'
  | 'South-Western'
  | 'North-Western'

export type ApplicationType =
  | 'Extension of Approval'
  | 'New Institution'
  | 'Increase in Intake'
  | 'New Programme'
  | 'Closure of Programme'
  | 'Change of Site'

export type WorkflowStageName =
  | 'Application Submitted'
  | 'Preliminary Scrutiny'
  | 'EVC'
  | 'SAC/SHC'
  | 'Subsequent Processing'
  | 'Competent Authority Decision'

export type StageState =
  | 'completed'
  | 'active'
  | 'pending'
  | 'returned'
  | 'overdue'
  | 'not-applicable'

export type ApplicationStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Returned'

export type DemoRole =
  | 'Regional Officer'
  | 'EVC Coordinator'
  | 'Compliance Officer'
  | 'Read-only Auditor'

export type DocumentKind =
  | 'Land Lease'
  | 'Building Occupancy'
  | 'Fire NOC'
  | 'Society Registration'
  | 'Affiliation Letter'
  | 'Trust Deed'

export interface Officer {
  id: string
  name: string
  role: DemoRole | 'Scrutiny Officer' | 'Deputy Director' | 'SAC Secretariat'
  region?: Region
}

export interface Institution {
  id: string
  name: string
  city: string
  region: Region
  code: string
}

export interface ChecklistItem {
  id: string
  label: string
  status: 'Received' | 'Pending' | 'Returned' | 'Verified'
}

export interface WorkflowStage {
  name: WorkflowStageName
  state: StageState
  startedAt?: string
  completedAt?: string
  assignee?: string
  remarks?: string
  returnReason?: string
}

export interface Observation {
  id: string
  at: string
  author: string
  role: string
  stage: WorkflowStageName
  body: string
  kind: 'note' | 'deficiency'
}

export interface Application {
  id: string
  institutionId: string
  institutionName: string
  city: string
  region: Region
  type: ApplicationType
  currentStage: WorkflowStageName
  assignedOfficerId: string
  assignedOfficerName: string
  submittedOn: string
  dueDate: string
  summary: string
  requiresEvc: boolean
  requiresSac: boolean
  stages: WorkflowStage[]
  checklist: ChecklistItem[]
  observations: Observation[]
}

export interface EvcVisit {
  id: string
  applicationId: string
  institutionName: string
  region: Region
  prerequisiteMet: boolean
  prerequisiteNote: string
  schedulingDeadline: string
  coordinatorId: string
  coordinatorName: string
  plannedDate?: string
  completedDate?: string
  status: 'Awaiting Scheduling' | 'Scheduled' | 'Upcoming' | 'Completed' | 'Delayed'
  notes?: string
}

export interface Undertaking {
  id: string
  applicationId: string
  institutionName: string
  region: Region
  description: string
  issuedOn: string
  dueDate: string
  requiredEvidence: string
  submissionStatus: 'Pending Submission' | 'Submitted' | 'Overdue'
  verificationStatus: 'Not Submitted' | 'Awaiting Verification' | 'Verified' | 'Rejected for Correction'
  verifierRole: string
  evidenceFileName?: string
  submittedAt?: string
  submittedBy?: string
  observations?: string
  verifiedAt?: string
  verifiedBy?: string
}

export interface InstitutionDocument {
  id: string
  institutionId: string
  institutionName: string
  region: Region
  type: DocumentKind
  issueDate: string
  expiryDate: string
  renewalStatus: 'None' | 'Submitted' | 'Not Required'
  verificationStatus: 'Currently Valid' | 'Awaiting Verification' | 'Expired — Action Required' | 'Verified Renewal'
  reminderIntervalsDays: number[]
  renewalFileName?: string
  renewalSubmittedAt?: string
}

export interface EscalationRecord {
  rule: string
  at: string
  toRole: string
  resolution: 'Open' | 'Acknowledged' | 'Resolved (demo)'
}

export interface NotificationItem {
  id: string
  category:
    | 'Upcoming Deadlines'
    | 'Overdue Cases'
    | 'EVC Scheduling'
    | 'Compliance'
    | 'Document Expiry'
    | 'Escalated Items'
    | 'Workflow'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  title: string
  body: string
  relatedType: 'application' | 'evc' | 'undertaking' | 'document'
  relatedId: string
  relatedLabel: string
  recipientRole: string
  trigger: string
  dueDate?: string
  createdAt: string
  read: boolean
  deliveryStatus: 'Logged in demo inbox'
  escalation?: EscalationRecord
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorRole: string
  entityType: 'Application' | 'EVC' | 'Undertaking' | 'Document' | 'Notification' | 'System'
  entityRef: string
  action: string
  previousStatus?: string
  updatedStatus?: string
  remarks?: string
  origin: 'seed' | 'demo-user'
}

export interface DemoUser {
  name: string
  role: DemoRole
  office: string
  initials: string
}

export interface DemoState {
  version: number
  asOfDate: string
  currentRole: DemoRole
  applications: Application[]
  visits: EvcVisit[]
  undertakings: Undertaking[]
  documents: InstitutionDocument[]
  notifications: NotificationItem[]
  audit: AuditEvent[]
  nextApplicationSeq: number
}
