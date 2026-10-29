import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable, type Column } from '../components/ui/DataTable'
import { TextField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { formatDate } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import type { Undertaking } from '../types'

const FILTERS = [
  'all',
  'Pending Submission',
  'Submitted',
  'Awaiting Verification',
  'Verified',
  'Rejected for Correction',
  'Overdue',
] as const

export function CompliancePage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return state.undertakings.filter((u) => {
      const query = q.trim().toLowerCase()
      if (query && !u.id.toLowerCase().includes(query) && !u.institutionName.toLowerCase().includes(query) && !u.applicationId.toLowerCase().includes(query)) return false
      if (filter === 'all') return true
      if (filter === 'Overdue') return u.submissionStatus === 'Overdue'
      if (filter === 'Pending Submission') return u.submissionStatus === 'Pending Submission'
      if (filter === 'Submitted') return u.submissionStatus === 'Submitted'
      return u.verificationStatus === filter
    })
  }, [filter, q, state.undertakings])

  const columns: Column<Undertaking>[] = [
    { key: 'id', header: 'Undertaking ID', sortValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span> },
    { key: 'inst', header: 'Institution', sortValue: (r) => r.institutionName, cell: (r) => r.institutionName },
    { key: 'app', header: 'Application', hideOnMobile: true, cell: (r) => r.applicationId },
    { key: 'desc', header: 'Condition', cell: (r) => <span className="line-clamp-2 max-w-sm text-muted">{r.description}</span> },
    { key: 'issued', header: 'Issued', hideOnMobile: true, cell: (r) => formatDate(r.issuedOn) },
    { key: 'due', header: 'Due', sortValue: (r) => r.dueDate, cell: (r) => formatDate(r.dueDate) },
    { key: 'sub', header: 'Submission', cell: (r) => <StatusBadge label={r.submissionStatus} tone={applicationTone(r.submissionStatus)} /> },
    { key: 'ver', header: 'Verification', cell: (r) => <StatusBadge label={r.verificationStatus} tone={applicationTone(r.verificationStatus)} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Undertakings & Compliance"
        subtitle="Institutional obligations in the demonstration register. Evidence submitted by an institution is distinct from evidence accepted by an authorised official."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${filter === f ? 'border-royal bg-royal-soft text-royal' : 'border-line text-muted'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <Card padded={false}>
        <div className="border-b border-line p-4">
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, institution or application" />
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(r) => navigate(`/compliance/${r.id}`)} />
      </Card>
    </div>
  )
}
