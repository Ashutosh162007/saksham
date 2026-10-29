import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable, type Column } from '../components/ui/DataTable'
import { PageHeader } from '../components/ui/PageHeader'
import { SelectField, TextField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { APPLICATION_TYPES, REGIONS } from '../lib/constants'
import { formatDate } from '../lib/dates'
import { isApproachingDeadline } from '../lib/status'
import { kpis, withStatus } from '../lib/selectors'
import { useDemo } from '../store/demo-store'
import { useToast } from '../components/feedback/Toast'
import { OFFICERS } from '../data/reference'
import type { ApplicationStatus } from '../types'

type Row = ReturnType<typeof withStatus>[number]

export function ApplicationsPage() {
  const { state, dispatch, canMutateWorkflow } = useDemo()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const statusFilter = params.get('status') ?? 'all'
  const [region, setRegion] = useState('all')
  const [stage, setStage] = useState('all')
  const [officer, setOfficer] = useState('all')
  const [type, setType] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const metrics = kpis(state)
  const rows = withStatus(state.applications, state.asOfDate)

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const query = q.trim().toLowerCase()
      if (query && !row.id.toLowerCase().includes(query) && !row.institutionName.toLowerCase().includes(query)) return false
      if (region !== 'all' && row.region !== region) return false
      if (stage !== 'all' && row.currentStage !== stage) return false
      if (officer !== 'all' && row.assignedOfficerId !== officer) return false
      if (type !== 'all' && row.type !== type) return false
      if (from && row.submittedOn < from) return false
      if (to && row.submittedOn > to) return false
      if (statusFilter === 'Overdue') return row.status === 'Overdue'
      if (statusFilter === 'open') return row.status !== 'Completed'
      if (statusFilter === 'approaching') return isApproachingDeadline(row, state.asOfDate)
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return true
    })
  }, [from, officer, q, region, rows, stage, statusFilter, state.asOfDate, to, type])

  const columns: Column<Row>[] = [
    { key: 'id', header: 'Application ID', sortValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span> },
    { key: 'institution', header: 'Institution', sortValue: (r) => r.institutionName, cell: (r) => (
      <span>
        <span className="block">{r.institutionName}</span>
        <span className="text-xs text-muted">{r.city}</span>
      </span>
    ) },
    { key: 'region', header: 'Region', hideOnMobile: true, sortValue: (r) => r.region, cell: (r) => r.region },
    { key: 'type', header: 'Type', hideOnMobile: true, sortValue: (r) => r.type, cell: (r) => r.type },
    { key: 'stage', header: 'Stage', sortValue: (r) => r.currentStage, cell: (r) => r.currentStage },
    { key: 'officer', header: 'Assigned officer', hideOnMobile: true, sortValue: (r) => r.assignedOfficerName, cell: (r) => r.assignedOfficerName },
    { key: 'submitted', header: 'Submitted', hideOnMobile: true, sortValue: (r) => r.submittedOn, cell: (r) => formatDate(r.submittedOn) },
    { key: 'due', header: 'Due', sortValue: (r) => r.dueDate, cell: (r) => formatDate(r.dueDate) },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, cell: (r) => <StatusBadge label={r.status} tone={applicationTone(r.status)} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r) => (
        <button
          type="button"
          className="text-royal hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/applications/${r.id}`)
          }}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Institutional files in the demonstration queue. Counts and filters operate on fictional records only."
        actions={
          canMutateWorkflow ? (
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                const id = dispatch.createSample()
                push({ title: 'Sample application created', description: id, tone: 'success' })
                navigate(`/applications/${id}`)
              }}
            >
              Create sample application
            </Button>
          ) : null
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Total</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.total}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Pending / in progress</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.pending}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-danger-ink">{metrics.overdue}</p>
        </Card>
      </div>
      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-3 xl:grid-cols-6">
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID or institution" />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              const next = new URLSearchParams(params)
              if (e.target.value === 'all') next.delete('status')
              else next.set('status', e.target.value)
              setParams(next)
            }}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="approaching">Approaching deadline</option>
            {(['Pending', 'In Progress', 'Overdue', 'Returned', 'Completed'] as ApplicationStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
          <SelectField label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <SelectField label="Stage" value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="all">All stages</option>
            {[...new Set(rows.map((r) => r.currentStage))].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <SelectField label="Officer" value={officer} onChange={(e) => setOfficer(e.target.value)}>
            <option value="all">All officers</option>
            {OFFICERS.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </SelectField>
          <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {APPLICATION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </SelectField>
          <TextField label="Submitted from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField label="Submitted to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => navigate(`/applications/${row.id}`)} />
      </Card>
    </div>
  )
}
