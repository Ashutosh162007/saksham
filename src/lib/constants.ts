import type { DemoRole, WorkflowStageName } from '../types'

export const PRODUCT_NAME = 'SAKSHAM'
export const PRODUCT_SUBTITLE = 'Approval & Compliance Intelligence'
export const STORAGE_KEY = 'aicte-saksham-demo-v1'
export const DEFAULT_AS_OF = '2026-10-30'
export const APPROACHING_WINDOW_DAYS = 14
export const DEMO_BANNER =
  'Demonstration environment — all records are fictional sample data. This is not an operational AICTE system.'

export const STAGE_SEQUENCE: WorkflowStageName[] = [
  'Application Submitted',
  'Preliminary Scrutiny',
  'EVC',
  'SAC/SHC',
  'Subsequent Processing',
  'Competent Authority Decision',
]

export const REGIONS = [
  'Northern',
  'Western',
  'Southern',
  'Eastern',
  'Central',
  'South-Western',
  'North-Western',
] as const

export const APPLICATION_TYPES = [
  'Extension of Approval',
  'New Institution',
  'Increase in Intake',
  'New Programme',
  'Closure of Programme',
  'Change of Site',
] as const

export const DEMO_ROLES: DemoRole[] = [
  'Regional Officer',
  'EVC Coordinator',
  'Compliance Officer',
  'Read-only Auditor',
]

export const SIGNED_IN = {
  name: 'Meera Krishnan',
  office: 'Western Regional Office (demo)',
  initials: 'MK',
} as const
