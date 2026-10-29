import { useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable, type Column } from '../components/ui/DataTable'
import { SelectField, TextField } from '../components/ui/Field'
import { formatDateTime } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import type { AuditEvent } from '../types'

export function AuditPage() {
  const { state } = useDemo()
  const [q, setQ] = useState('')
  const [actor, setActor] = useState('all')
  const [entity, setEntity] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [open, setOpen] = useState<AuditEvent | null>(null)

  const actors = [...new Set(state.audit.map((e) => e.actor))]
  const rows = useMemo(() => {
    return state.audit.filter((e) => {
      const query = q.trim().toLowerCase()
      if (query && !e.entityRef.toLowerCase().includes(query) && !e.action.toLowerCase().includes(query) && !e.actor.toLowerCase().includes(query)) return false
      if (actor !== 'all' && e.actor !== actor) return false
      if (entity !== 'all' && e.entityType !== entity) return false
      if (from && e.timestamp.slice(0, 10) < from) return false
      if (to && e.timestamp.slice(0, 10) > to) return false
      return true
    })
  }, [actor, entity, from, q, state.audit, to])

  const columns: Column<AuditEvent>[] = [
    { key: 'ts', header: 'Timestamp', sortValue: (r) => r.timestamp, cell: (r) => formatDateTime(r.timestamp) },
    { key: 'actor', header: 'Actor', cell: (r) => (
      <span>
        <span className="block">{r.actor}</span>
        <span className="text-xs text-muted">{r.actorRole}</span>
      </span>
    ) },
    { key: 'entity', header: 'Entity', hideOnMobile: true, cell: (r) => `${r.entityType} · ${r.entityRef}` },
    { key: 'action', header: 'Action', cell: (r) => r.action },
    { key: 'status', header: 'Status change', hideOnMobile: true, cell: (r) => (r.previousStatus || r.updatedStatus ? `${r.previousStatus ?? '—'} → ${r.updatedStatus ?? '—'}` : '—') },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Append-only demonstration history. This prototype is not a production-grade immutable audit infrastructure. Seed events and demo-user actions are distinguished."
      />
      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-5">
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Application ID, actor or action" />
          <SelectField label="Actor" value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="all">All actors</option>
            {actors.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </SelectField>
          <SelectField label="Entity type" value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="all">All entities</option>
            {['Application', 'EVC', 'Undertaking', 'Document', 'Notification', 'System'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </SelectField>
          <TextField label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={setOpen} />
      </Card>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-950/40" aria-label="Close" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-lg rounded-lg border border-line bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold">{open.action}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div><span className="text-muted">When · </span>{formatDateTime(open.timestamp)}</div>
              <div><span className="text-muted">Actor · </span>{open.actor} ({open.actorRole})</div>
              <div><span className="text-muted">Entity · </span>{open.entityType} {open.entityRef}</div>
              <div><span className="text-muted">Origin · </span>{open.origin === 'seed' ? 'Simulated seed history' : 'Demo user action'}</div>
              {open.remarks ? <div><span className="text-muted">Remarks · </span>{open.remarks}</div> : null}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  )
}
