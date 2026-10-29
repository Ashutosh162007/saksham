import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable, type Column } from '../components/ui/DataTable'
import { SelectField, TextField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { Button } from '../components/ui/Button'
import { formatDate, addDays } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import { useToast } from '../components/feedback/Toast'
import { useConfirm } from '../components/feedback/ConfirmDialog'
import type { EvcVisit } from '../types'

const STATUSES: EvcVisit['status'][] = ['Awaiting Scheduling', 'Scheduled', 'Upcoming', 'Completed', 'Delayed']

export function EvcPage() {
  const { state, dispatch, canScheduleEvc } = useDemo()
  const { push } = useToast()
  const { confirm } = useConfirm()
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<EvcVisit | null>(null)
  const [date, setDate] = useState(addDays(state.asOfDate, 7))

  const filtered = useMemo(
    () => state.visits.filter((v) => status === 'all' || v.status === status),
    [state.visits, status],
  )

  const counts = STATUSES.map((s) => ({ s, n: state.visits.filter((v) => v.status === s).length }))
  const calendar = state.visits.filter((v) => v.plannedDate).slice().sort((a, b) => (a.plannedDate ?? '').localeCompare(b.plannedDate ?? ''))

  const columns: Column<EvcVisit>[] = [
    { key: 'app', header: 'Application ID', sortValue: (r) => r.applicationId, cell: (r) => r.applicationId },
    { key: 'inst', header: 'Institution', sortValue: (r) => r.institutionName, cell: (r) => r.institutionName },
    { key: 'region', header: 'Region', hideOnMobile: true, cell: (r) => r.region },
    { key: 'prereq', header: 'Prerequisites', hideOnMobile: true, cell: (r) => (r.prerequisiteMet ? 'Ready (demo)' : 'Pending') },
    { key: 'deadline', header: 'Scheduling deadline', sortValue: (r) => r.schedulingDeadline, cell: (r) => formatDate(r.schedulingDeadline) },
    { key: 'coord', header: 'Coordinator', hideOnMobile: true, cell: (r) => r.coordinatorName },
    { key: 'planned', header: 'Planned date', cell: (r) => formatDate(r.plannedDate) },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge label={r.status} tone={applicationTone(r.status)} /> },
  ]

  return (
    <div>
      <PageHeader
        title="EVC Scheduling"
        subtitle="Fictional expert visit coordination. No actual inspections have been booked."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map((c) => (
          <button key={c.s} type="button" className="text-left" onClick={() => setStatus(c.s)}>
            <Card>
              <p className="text-xs text-muted">{c.s}</p>
              <p className="mt-1 text-2xl font-semibold">{c.n}</p>
            </Card>
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="w-56">
          <SelectField label="Filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All visits</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
        </div>
        <p className="text-xs text-muted">Alerts use the demonstration clock and configured scheduling deadlines.</p>
      </div>
      <Card padded={false}>
        <DataTable columns={columns} rows={filtered} onRowClick={setSelected} />
      </Card>
      <Card className="mt-4">
        <SectionTitle title="Compact schedule" description="Planned fictional dates only." />
        {calendar.length === 0 ? (
          <p className="text-sm text-muted">No planned visits in the sample set.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {calendar.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {formatDate(v.plannedDate)} · {v.institutionName}
                </span>
                <StatusBadge label={v.status} tone={applicationTone(v.status)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selected ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-950/40" aria-label="Close" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg rounded-lg border border-line bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold">{selected.id}</h2>
            <p className="mt-1 text-sm text-muted">{selected.institutionName} · {selected.applicationId}</p>
            <p className="mt-3 text-sm">{selected.prerequisiteNote}</p>
            <p className="mt-2 text-xs text-amber-ink">{selected.notes}</p>
            {canScheduleEvc ? (
              <div className="mt-4 space-y-3">
                <TextField label="Planned visit date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Record a fictional visit date?',
                        message: 'This does not book an inspection. It only updates the demonstration register.',
                        confirmLabel: 'Save demo date',
                      })
                      if (!ok) return
                      dispatch.scheduleEvc(selected.id, date)
                      push({ title: 'Visit scheduled in demo', description: 'No actual inspection booked.', tone: 'success' })
                      setSelected(null)
                    }}
                  >
                    Schedule visit
                  </Button>
                  <SelectField
                    label="Status"
                    value={selected.status}
                    onChange={(e) => {
                      dispatch.updateEvcStatus(selected.id, e.target.value as EvcVisit['status'])
                      push({ title: 'EVC status updated', tone: 'success' })
                      setSelected(null)
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </SelectField>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">The current demo role cannot change EVC scheduling.</p>
            )}
            <Button variant="secondary" className="mt-4" onClick={() => navigate(`/applications/${selected.applicationId}`)}>
              Open application
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
