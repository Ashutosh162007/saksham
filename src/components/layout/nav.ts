import {
  Bell,
  Building2,
  CalendarClock,
  FileCheck2,
  FileClock,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Workflow,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Building2 },
  { to: '/workflow', label: 'Workflow Tracker', icon: Workflow },
  { to: '/evc', label: 'EVC Scheduling', icon: CalendarClock },
  { to: '/compliance', label: 'Undertakings & Compliance', icon: FileCheck2 },
  { to: '/documents', label: 'Document Validity', icon: FileClock },
  { to: '/notifications', label: 'Notifications & Escalations', icon: Bell },
  { to: '/audit', label: 'Audit Trail', icon: ScrollText },
  { to: '/settings', label: 'Administration and Settings', icon: Settings, section: 'admin' as const },
]

export const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/applications': 'Applications',
  '/workflow': 'Workflow Tracker',
  '/evc': 'EVC Scheduling',
  '/compliance': 'Undertakings & Compliance',
  '/documents': 'Document Validity',
  '/notifications': 'Notifications & Escalations',
  '/audit': 'Audit Trail',
  '/settings': 'Administration and Settings',
}

export { ShieldCheck }
