import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  Clock3,
  Files,
  Hourglass,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, SectionTitle } from '../components/ui/Card'
import { KpiCard } from '../components/ui/KpiCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { SelectField } from '../components/ui/Field'
import { formatDate, formatDateTime, addDays } from '../lib/dates'
import { ageingBuckets, attentionItems, kpis, pipeline, regionLoad, statusMix, withStatus } from '../lib/selectors'
import { useDemo } from '../store/demo-store'

const PIE_COLORS = ['#5c6778', '#1f4ebd', '#067647', '#b42318', '#9a6700']
const BAR_COLOR = '#1f4ebd'

export function DashboardPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [range, setRange] = useState('30')
  const metrics = useMemo(() => kpis(state), [state])
  const pipe = useMemo(() => pipeline(state), [state])
  const mix = useMemo(() => statusMix(state), [state])
  const regions = useMemo(() => regionLoad(state), [state])
  const ageing = useMemo(() => ageingBuckets(state), [state])
  const attention = useMemo(() => attentionItems(state), [state])
  const activity = state.audit.slice(0, 8)
  const evcSummary = useMemo(() => {
    const groups = ['Awaiting Scheduling', 'Scheduled', 'Upcoming', 'Completed', 'Delayed'] as const
    return groups.map((name) => ({ name, value: state.visits.filter((v) => v.status === name).length }))
  }, [state.visits])
  const upcomingCompliance = state.undertakings
    .filter((u) => u.verificationStatus !== 'Verified')
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
  const apps = withStatus(state.applications, state.asOfDate)
  const filteredCount = apps.filter((a) => a.submittedOn >= addDays(state.asOfDate, -Number(range))).length

  return (
    <div>
      <PageHeader
        title="Approval Operations Overview"
        subtitle="A consolidated view of applications, compliance obligations and time-sensitive actions. All figures are fictional demonstration data."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted">Last updated {formatDateTime(`${state.asOfDate}T09:40:00`)} (demo clock)</p>
            <div className="w-40">
              <SelectField label="Date range" value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </SelectField>
            </div>
          </div>
        }
      />
      <p className="mb-4 text-xs text-muted">{filteredCount} applications fall within the selected demonstration window.</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total applications"
          value={metrics.total}
          hint={`${metrics.completed} completed in the sample set`}
          icon={<Files size={16} />}
          onClick={() => navigate('/applications')}
        />
        <KpiCard
          label="Applications pending"
          value={metrics.pending}
          hint="Open files still in the demo workflow"
          icon={<Hourglass size={16} />}
          onClick={() => navigate('/applications?status=open')}
        />
        <KpiCard
          label="Overdue cases"
          value={metrics.overdue}
          hint="Due date passed; action still outstanding"
          icon={<AlertTriangle size={16} />}
          tone="danger"
          onClick={() => navigate('/applications?status=Overdue')}
        />
        <KpiCard
          label="Deadlines approaching"
          value={metrics.approaching}
          hint="Due within 14 days on the demo clock"
          icon={<Clock3 size={16} />}
          tone="warning"
          onClick={() => navigate('/applications?status=approaching')}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Application pipeline" description="Distribution across configured demonstration stages." />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipe} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid stroke="#e3e7ee" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5c6778' }} interval={0} angle={-18} textAnchor="end" height={56} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5c6778' }} />
                <Tooltip />
                <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Application status" description="Pending, in progress, completed and overdue — plus returned files." />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>
                  {mix.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Region-wise open workload" description="Open demonstration files by region." />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regions} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="#e3e7ee" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#23406a" radius={[0, 4, 4, 0]} name="Open files" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Application ageing" description="How long open files have been in the queue (demo clock)." />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageing}>
                <CartesianGrid stroke="#e3e7ee" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2c4f82" radius={[4, 4, 0, 0]} name="Open files" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title="EVC scheduling overview" description="Fictional visit coordination only." action={<CalendarClock size={16} className="text-muted" />} />
          <ul className="divide-y divide-line text-sm">
            {evcSummary.map((row) => (
              <li key={row.name} className="flex items-center justify-between py-2.5">
                <span className="text-muted">{row.name}</span>
                <span className="font-semibold tabular-nums">{row.value}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle title="Upcoming compliance deadlines" description="Undertakings still open in the demonstration register." />
          {upcomingCompliance.length === 0 ? (
            <p className="text-sm text-muted">No open undertakings in this sample.</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcomingCompliance.map((u) => (
                <li key={u.id}>
                  <button type="button" className="flex w-full items-start justify-between gap-3 py-2.5 text-left" onClick={() => navigate(`/compliance/${u.id}`)}>
                    <span>
                      <span className="block text-sm font-medium text-ink">{u.id}</span>
                      <span className="block text-xs text-muted">{u.institutionName}</span>
                    </span>
                    <span className="text-right">
                      <StatusBadge label={u.submissionStatus} tone={applicationTone(u.submissionStatus)} />
                      <span className="mt-1 block text-xs text-muted">{formatDate(u.dueDate)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle title="Requires attention" description="Sorted by urgency and deadline. Red is reserved for overdue or expired items." />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy-50 text-left text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Institution</th>
                <th className="px-3 py-2">Issue</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Responsible</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {attention.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-3 py-2.5 font-medium">{item.ref}</td>
                  <td className="px-3 py-2.5">{item.institution}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge label={item.issue} tone={item.tone === 'danger' ? 'danger' : 'warning'} />
                  </td>
                  <td className="px-3 py-2.5 text-muted">{formatDate(item.due)}</td>
                  <td className="px-3 py-2.5">{item.role}</td>
                  <td className="px-3 py-2.5">
                    <button type="button" className="text-royal hover:underline" onClick={() => navigate(item.to)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <SectionTitle title="Recent activity" description="Workflow events from the demonstration audit log." />
        <ul className="divide-y divide-line">
          {activity.map((event) => (
            <li key={event.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-ink">{event.action}</p>
                <p className="text-xs text-muted">
                  {event.entityRef} · {event.actor}
                </p>
              </div>
              <p className="text-xs text-muted">{formatDateTime(event.timestamp)}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
