import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { TextAreaField } from '../components/ui/Field'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { ErrorBanner } from '../components/ui/EmptyState'
import { formatDate, formatDateTime } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import { useToast } from '../components/feedback/Toast'
import { useConfirm } from '../components/feedback/ConfirmDialog'

export function ComplianceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, canVerifyCompliance } = useDemo()
  const { push } = useToast()
  const { confirm } = useConfirm()
  const [obs, setObs] = useState('')
  const item = state.undertakings.find((u) => u.id === id)
  const history = state.audit.filter((e) => e.entityRef === id)

  if (!item) return <ErrorBanner message="Undertaking not found in the demonstration register." onRetry={() => navigate('/compliance')} />

  return (
    <div>
      <PageHeader
        title={item.id}
        subtitle={`${item.institutionName} · linked to ${item.applicationId}`}
        actions={<StatusBadge label={item.verificationStatus} tone={applicationTone(item.verificationStatus)} />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Prescribed condition (sample)" />
          <p className="text-sm leading-6">{item.description}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Issued</dt>
              <dd>{formatDate(item.issuedOn)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Due</dt>
              <dd>{formatDate(item.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Required evidence</dt>
              <dd>{item.requiredEvidence}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Verifier role</dt>
              <dd>{item.verifierRole}</dd>
            </div>
          </dl>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-line p-3">
              <p className="text-xs uppercase tracking-wide text-muted">Institution submission</p>
              <p className="mt-1 text-sm font-medium">{item.evidenceFileName ?? 'No file yet'}</p>
              <p className="text-xs text-muted">{item.submittedAt ? `${item.submittedBy} · ${formatDateTime(item.submittedAt)}` : 'Awaiting institution desk (demo)'}</p>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs uppercase tracking-wide text-muted">Official verification</p>
              <p className="mt-1 text-sm font-medium">{item.verificationStatus}</p>
              <p className="text-xs text-muted">{item.verifiedBy ? `${item.verifiedBy} · ${formatDateTime(item.verifiedAt)}` : 'Not verified'}</p>
            </div>
          </div>
          {item.observations ? <p className="mt-3 text-sm text-muted">{item.observations}</p> : null}
        </Card>
        <Card>
          <SectionTitle title="Demo actions" />
          {item.verificationStatus === 'Not Submitted' || item.verificationStatus === 'Rejected for Correction' ? (
            <Button
              onClick={() => {
                dispatch.submitUndertaking(item.id, `evidence-${item.id}.pdf`)
                push({ title: 'Sample evidence attached', description: 'Status is awaiting verification — not accepted yet.', tone: 'success' })
              }}
            >
              Upload fictional evidence
            </Button>
          ) : null}
          {canVerifyCompliance && item.verificationStatus === 'Awaiting Verification' ? (
            <div className="mt-3 space-y-3">
              <TextAreaField label="Verification observations" value={obs} onChange={(e) => setObs(e.target.value)} />
              <Button
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Accept this sample evidence?',
                    message: 'Verification in this prototype has no statutory effect.',
                    confirmLabel: 'Mark verified',
                  })
                  if (!ok) return
                  dispatch.verifyUndertaking(item.id, obs || 'Accepted in the demonstration workspace.', true)
                  push({ title: 'Evidence verified (demo)', tone: 'success' })
                }}
              >
                Verify and accept
              </Button>
              <Button
                variant="amber"
                onClick={async () => {
                  if (obs.trim().length < 8) {
                    push({ title: 'Observations required', description: 'Explain the correction needed.', tone: 'danger' })
                    return
                  }
                  dispatch.verifyUndertaking(item.id, obs, false)
                  push({ title: 'Returned for correction', tone: 'info' })
                }}
              >
                Reject for correction
              </Button>
            </div>
          ) : null}
          {!canVerifyCompliance ? <p className="text-sm text-muted">The current demo role cannot verify compliance evidence.</p> : null}
        </Card>
      </div>
      <Card className="mt-4">
        <SectionTitle title="Obligation history" description="Simulated reminder and verification events." />
        <ul className="divide-y divide-line text-sm">
          {history.length === 0 ? <li className="py-2 text-muted">No subsequent events beyond seed history.</li> : history.map((e) => (
            <li key={e.id} className="py-2.5">
              <p className="font-medium">{e.action}</p>
              <p className="text-xs text-muted">{formatDateTime(e.timestamp)} · {e.actor} · {e.remarks ?? '—'}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
