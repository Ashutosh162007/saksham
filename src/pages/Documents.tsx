import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable, type Column } from '../components/ui/DataTable'
import { SelectField, TextField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { formatDate } from '../lib/dates'
import { documentDaysRemaining, documentValidityLabel } from '../lib/status'
import { REGIONS } from '../lib/constants'
import { useDemo } from '../store/demo-store'

export function DocumentsPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [region, setRegion] = useState('all')
  const [windowDays, setWindowDays] = useState('all')

  const decorated = useMemo(() => {
    return state.documents.map((d) => ({
      ...d,
      remaining: documentDaysRemaining(d, state.asOfDate),
      validity: documentValidityLabel(d, state.asOfDate),
    }))
  }, [state.asOfDate, state.documents])

  const valid = decorated.filter((d) => d.validity === 'Valid').length
  const soon = decorated.filter((d) => d.validity === 'Expiring soon').length
  const awaiting = decorated.filter((d) => d.validity === 'Renewal in verification').length
  const expired = decorated.filter((d) => d.validity === 'Expired').length

  const rows = decorated.filter((d) => {
    const query = q.trim().toLowerCase()
    if (query && !d.id.toLowerCase().includes(query) && !d.institutionName.toLowerCase().includes(query)) return false
    if (type !== 'all' && d.type !== type) return false
    if (region !== 'all' && d.region !== region) return false
    if (windowDays !== 'all') {
      const n = Number(windowDays)
      if (!(d.remaining >= 0 && d.remaining <= n)) return false
    }
    return true
  })

  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'id', header: 'Document ID', sortValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span> },
    { key: 'inst', header: 'Institution', sortValue: (r) => r.institutionName, cell: (r) => r.institutionName },
    { key: 'type', header: 'Type', cell: (r) => r.type },
    { key: 'issue', header: 'Issued', hideOnMobile: true, cell: (r) => formatDate(r.issueDate) },
    { key: 'exp', header: 'Expiry', sortValue: (r) => r.expiryDate, cell: (r) => formatDate(r.expiryDate) },
    { key: 'days', header: 'Days remaining', sortValue: (r) => r.remaining, cell: (r) => (r.remaining < 0 ? `${Math.abs(r.remaining)} overdue` : String(r.remaining)) },
    { key: 'ren', header: 'Renewal', hideOnMobile: true, cell: (r) => r.renewalStatus },
    { key: 'ver', header: 'Verification', cell: (r) => <StatusBadge label={r.verificationStatus} tone={applicationTone(r.verificationStatus)} /> },
  ]

  const timeline = decorated.slice().sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)).slice(0, 8)

  return (
    <div>
      <PageHeader
        title="Document Validity"
        subtitle="Lease and statutory-document monitoring for the demonstration set. Reminder windows are configurable; an uploaded renewal is not treated as valid until verified."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-xs text-muted">Currently valid</p><p className="mt-1 text-2xl font-semibold">{valid}</p></Card>
        <Card><p className="text-xs text-muted">Expiring soon</p><p className="mt-1 text-2xl font-semibold text-amber-ink">{soon}</p></Card>
        <Card><p className="text-xs text-muted">Renewals awaiting verification</p><p className="mt-1 text-2xl font-semibold">{awaiting}</p></Card>
        <Card><p className="text-xs text-muted">Expired — action required</p><p className="mt-1 text-2xl font-semibold text-danger-ink">{expired}</p></Card>
      </div>
      <Card className="mb-4">
        <p className="mb-3 text-sm font-semibold">Expiry timeline</p>
        <ol className="grid gap-2 md:grid-cols-2">
          {timeline.map((d) => (
            <li key={d.id}>
              <button type="button" className="flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-left text-sm hover:bg-navy-50" onClick={() => navigate(`/documents/${d.id}`)}>
                <span>
                  <span className="block font-medium">{d.type}</span>
                  <span className="text-xs text-muted">{d.institutionName}</span>
                </span>
                <span className="text-xs text-muted">{formatDate(d.expiryDate)}</span>
              </button>
            </li>
          ))}
        </ol>
      </Card>
      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-4">
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <SelectField label="Document type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {[...new Set(state.documents.map((d) => d.type))].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </SelectField>
          <SelectField label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <SelectField label="Expiry window" value={windowDays} onChange={(e) => setWindowDays(e.target.value)}>
            <option value="all">Any</option>
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="45">Next 45 days</option>
          </SelectField>
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(r) => navigate(`/documents/${r.id}`)} />
      </Card>
    </div>
  )
}
