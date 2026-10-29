import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { formatDate, formatDateTime } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import type { NotificationItem } from '../types'

const FILTERS = [
  'All Notifications',
  'Unread',
  'Upcoming Deadlines',
  'Overdue Cases',
  'EVC Scheduling',
  'Compliance',
  'Document Expiry',
  'Escalated Items',
] as const

function relatedPath(n: NotificationItem): string {
  if (n.relatedType === 'application') return `/applications/${n.relatedId}`
  if (n.relatedType === 'undertaking') return `/compliance/${n.relatedId}`
  if (n.relatedType === 'document') return `/documents/${n.relatedId}`
  return '/evc'
}

export function NotificationsPage() {
  const { state, dispatch } = useDemo()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All Notifications')
  const [open, setOpen] = useState<NotificationItem | null>(null)

  const rows = useMemo(() => {
    return state.notifications.filter((n) => {
      if (filter === 'All Notifications') return true
      if (filter === 'Unread') return !n.read
      if (filter === 'Escalated Items') return n.category === 'Escalated Items' || Boolean(n.escalation)
      return n.category === filter
    })
  }, [filter, state.notifications])

  return (
    <div>
      <PageHeader
        title="Notifications & Escalations"
        subtitle="Simulated inbox only. No email, SMS or external notification has been sent."
        actions={<Button variant="secondary" onClick={() => dispatch.markAllRead()}>Mark all read</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${filter === f ? 'border-royal bg-royal-soft text-royal' : 'border-line text-muted'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <Card padded={false}>
        <ul>
          {rows.map((n) => (
            <li key={n.id} className={`border-b border-line ${n.read ? 'bg-white' : 'bg-navy-50/60'}`}>
              <button type="button" className="flex w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-start sm:justify-between" onClick={() => { dispatch.markRead(n.id); setOpen(n) }}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <StatusBadge label={n.priority} tone={applicationTone(n.priority)} />
                    {!n.read ? <StatusBadge label="Unread" tone="info" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-faint">
                    {n.category} · {n.relatedLabel} · {n.recipientRole} · {n.deliveryStatus}
                  </p>
                </div>
                <p className="text-xs text-muted">{formatDateTime(n.createdAt)}</p>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-950/40" aria-label="Close" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-lg rounded-lg border border-line bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold">{open.title}</h2>
            <p className="mt-2 text-sm text-muted">{open.body}</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div><span className="text-xs text-muted">Trigger · </span>{open.trigger}</div>
              <div><span className="text-xs text-muted">Due · </span>{formatDate(open.dueDate)}</div>
              <div><span className="text-xs text-muted">Delivery · </span>{open.deliveryStatus}</div>
            </dl>
            {open.escalation ? (
              <div className="mt-4 rounded-md border border-amber-line bg-amber-bg p-3">
                <SectionTitle title="Escalation (demo)" />
                <p className="text-sm">{open.escalation.rule}</p>
                <p className="mt-1 text-xs text-muted">To {open.escalation.toRole} at {formatDateTime(open.escalation.at)}</p>
                <p className="mt-1 text-xs">Resolution: {open.escalation.resolution}</p>
                {open.escalation.resolution === 'Open' ? (
                  <Button className="mt-3" size="sm" onClick={() => { dispatch.acknowledgeEscalation(open.id); setOpen(null) }}>
                    Acknowledge
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate(relatedPath(open))}>Open related record</Button>
              <Button variant="secondary" onClick={() => setOpen(null)}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
