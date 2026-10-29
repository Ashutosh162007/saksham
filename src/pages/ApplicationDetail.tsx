import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { SelectField, TextAreaField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { EmptyState, ErrorBanner } from '../components/ui/EmptyState'
import { WorkflowTimeline } from '../components/workflow/WorkflowTimeline'
import { useConfirm } from '../components/feedback/ConfirmDialog'
import { useToast } from '../components/feedback/Toast'
import { OFFICERS } from '../data/reference'
import { formatDate, formatDateTime } from '../lib/dates'
import { ageingDays, deriveApplicationStatus, isTerminal } from '../lib/status'
import { useDemo } from '../store/demo-store'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, canMutateWorkflow } = useDemo()
  const { confirm } = useConfirm()
  const { push } = useToast()
  const [tab, setTab] = useState('summary')
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')
  const [reasonError, setReasonError] = useState('')
  const app = state.applications.find((a) => a.id === id)

  const status = app ? deriveApplicationStatus(app, state.asOfDate) : 'Pending'
  const relatedU = state.undertakings.filter((u) => u.applicationId === id)
  const relatedD = state.documents.filter((d) => d.institutionId === app?.institutionId)
  const relatedE = state.visits.find((v) => v.applicationId === id)
  const audit = state.audit.filter((e) => e.entityRef === id)
  const active = app?.stages.find((s) => s.state === 'active' || s.state === 'overdue' || s.state === 'returned')

  const tabs = useMemo(
    () => [
      ['summary', 'Summary'],
      ['documents', 'Document checklist'],
      ['timeline', 'Timeline'],
      ['observations', 'Observations'],
      ['related', 'Related records'],
      ['audit', 'Audit history'],
    ],
    [],
  )

  if (!app) {
    return <ErrorBanner message="This demonstration application ID was not found." onRetry={() => navigate('/applications')} />
  }

  return (
    <div>
      <PageHeader
        title={app.id}
        subtitle={`${app.institutionName}, ${app.city} · ${app.type}. Fictional demonstration file.`}
        actions={<StatusBadge label={status} tone={applicationTone(status)} />}
      />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Card>
          <p className="text-xs text-muted">Current stage</p>
          <p className="mt-1 text-sm font-semibold">{app.currentStage}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Assigned officer</p>
          <p className="mt-1 text-sm font-semibold">{app.assignedOfficerName}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Due date</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(app.dueDate)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Ageing</p>
          <p className="mt-1 text-sm font-semibold">{ageingDays(app, state.asOfDate)} days</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`border-b-2 px-3 py-2 text-sm ${tab === key ? 'border-royal font-medium text-royal' : 'border-transparent text-muted'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'summary' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionTitle title="Application summary" />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Institution</dt>
                <dd>{app.institutionName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Region</dt>
                <dd>{app.region}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Submitted</dt>
                <dd>{formatDate(app.submittedOn)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">EVC required (demo path)</dt>
                <dd>{app.requiresEvc ? 'Yes' : 'No'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Narrative</dt>
                <dd className="mt-1 text-muted">{app.summary}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <SectionTitle title="Permitted demo actions" description={canMutateWorkflow ? 'Regional Officer demonstration role.' : 'This demo role cannot change workflow stages.'} />
            {canMutateWorkflow && active && !isTerminal(app) ? (
              <div className="space-y-3">
                <TextAreaField label="Completion remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                <Button
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Complete this stage?',
                      message: `This records a simulated transition out of “${active.name}”. It is not a statutory approval.`,
                      confirmLabel: 'Complete stage',
                    })
                    if (!ok) return
                    dispatch.completeStage(app.id, remarks)
                    push({ title: 'Stage updated', description: 'Demonstration workflow advanced.', tone: 'success' })
                    setRemarks('')
                  }}
                >
                  Complete current stage
                </Button>
                <TextAreaField
                  label="Return reason (required)"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    setReasonError('')
                  }}
                />
                {reasonError ? <p className="text-xs text-danger-ink">{reasonError}</p> : null}
                <Button
                  variant="amber"
                  onClick={async () => {
                    if (reason.trim().length < 8) {
                      setReasonError('Enter a specific reason (at least 8 characters).')
                      return
                    }
                    const ok = await confirm({
                      title: 'Return this application?',
                      message: 'The file will be marked returned in the demonstration workflow.',
                      confirmLabel: 'Return file',
                      tone: 'danger',
                    })
                    if (!ok) return
                    dispatch.returnApplication(app.id, reason.trim())
                    push({ title: 'Application returned', description: 'Deficiency recorded on the sample file.', tone: 'info' })
                    setReason('')
                  }}
                >
                  Return with reason
                </Button>
                <SelectField
                  label="Reassign officer"
                  value={app.assignedOfficerId}
                  onChange={(e) => {
                    dispatch.assignOfficer(app.id, e.target.value)
                    push({ title: 'Officer updated', tone: 'success' })
                  }}
                >
                  {OFFICERS.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </SelectField>
              </div>
            ) : (
              <p className="text-sm text-muted">
                {isTerminal(app) ? 'This sample file has reached a terminal demonstration stage.' : 'No workflow mutations are enabled for the current demo role.'}
              </p>
            )}
          </Card>
        </div>
      ) : null}

      {tab === 'documents' ? (
        <Card>
          <SectionTitle title="Document checklist" description="Illustrative checklist only." />
          <ul className="divide-y divide-line">
            {app.checklist.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>{item.label}</span>
                <StatusBadge label={item.status} tone={applicationTone(item.status)} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === 'timeline' ? (
        <Card>
          <SectionTitle
            title="Stage-by-stage progress"
            description="Illustrative sequence. Not every application follows the same mandatory path."
          />
          <WorkflowTimeline stages={app.stages} />
        </Card>
      ) : null}

      {tab === 'observations' ? (
        <Card>
          <SectionTitle title="Observations and deficiencies" />
          {app.observations.length === 0 ? (
            <EmptyState title="No observations" description="No notes or deficiencies have been recorded on this sample file." />
          ) : (
            <ul className="space-y-3">
              {app.observations.map((obs) => (
                <li key={obs.id} className="rounded-md border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{obs.author}</p>
                    <StatusBadge label={obs.kind === 'deficiency' ? 'Deficiency' : 'Note'} tone={obs.kind === 'deficiency' ? 'warning' : 'neutral'} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{obs.body}</p>
                  <p className="mt-1 text-xs text-faint">{formatDateTime(obs.at)} · {obs.stage}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === 'related' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <SectionTitle title="Undertakings" />
            {relatedU.length === 0 ? <p className="text-sm text-muted">No linked undertakings in the sample set.</p> : relatedU.map((u) => (
              <Link key={u.id} to={`/compliance/${u.id}`} className="mb-2 block rounded-md border border-line p-3 text-sm hover:bg-navy-50">
                {u.id} · {u.verificationStatus}
              </Link>
            ))}
          </Card>
          <Card>
            <SectionTitle title="Documents" />
            {relatedD.slice(0, 6).map((d) => (
              <Link key={d.id} to={`/documents/${d.id}`} className="mb-2 block rounded-md border border-line p-3 text-sm hover:bg-navy-50">
                {d.type} · {d.verificationStatus}
              </Link>
            ))}
            {relatedE ? (
              <button type="button" className="mt-2 text-sm text-royal hover:underline" onClick={() => navigate('/evc')}>
                Open EVC record {relatedE.id}
              </button>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === 'audit' ? (
        <Card>
          <SectionTitle title="Audit history" description="Simulated, append-only demonstration log." />
          <ul className="divide-y divide-line text-sm">
            {audit.map((e) => (
              <li key={e.id} className="py-2.5">
                <p className="font-medium">{e.action}</p>
                <p className="text-xs text-muted">{formatDateTime(e.timestamp)} · {e.actor} · {e.remarks ?? '—'}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
