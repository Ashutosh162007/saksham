import { useParams, useNavigate } from 'react-router-dom'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { ErrorBanner } from '../components/ui/EmptyState'
import { formatDate, formatDateTime } from '../lib/dates'
import { documentDaysRemaining, documentValidityLabel } from '../lib/status'
import { useDemo } from '../store/demo-store'
import { useToast } from '../components/feedback/Toast'
import { useConfirm } from '../components/feedback/ConfirmDialog'

export function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, canVerifyCompliance } = useDemo()
  const { push } = useToast()
  const { confirm } = useConfirm()
  const doc = state.documents.find((d) => d.id === id)
  const history = state.audit.filter((e) => e.entityRef === id)

  if (!doc) return <ErrorBanner message="Document not found in the demonstration register." onRetry={() => navigate('/documents')} />

  const remaining = documentDaysRemaining(doc, state.asOfDate)
  const validity = documentValidityLabel(doc, state.asOfDate)

  return (
    <div>
      <PageHeader
        title={doc.id}
        subtitle={`${doc.type} · ${doc.institutionName}`}
        actions={<StatusBadge label={validity} tone={applicationTone(doc.verificationStatus)} />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Metadata" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted">Issue date</dt><dd>{formatDate(doc.issueDate)}</dd></div>
            <div><dt className="text-xs text-muted">Expiry date</dt><dd>{formatDate(doc.expiryDate)}</dd></div>
            <div><dt className="text-xs text-muted">Days remaining</dt><dd>{remaining < 0 ? `${Math.abs(remaining)} days overdue` : remaining}</dd></div>
            <div><dt className="text-xs text-muted">Reminder intervals</dt><dd>{doc.reminderIntervalsDays.join(', ')} days before expiry</dd></div>
            <div><dt className="text-xs text-muted">Renewal file</dt><dd>{doc.renewalFileName ?? 'None'}</dd></div>
            <div><dt className="text-xs text-muted">Renewal submitted</dt><dd>{doc.renewalSubmittedAt ? formatDateTime(doc.renewalSubmittedAt) : '—'}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">An uploaded renewal remains unverified until an authorised official accepts it in this demonstration workflow.</p>
        </Card>
        <Card>
          <SectionTitle title="Demo actions" />
          {doc.verificationStatus !== 'Awaiting Verification' && doc.verificationStatus !== 'Verified Renewal' ? (
            <Button
              onClick={() => {
                dispatch.submitRenewal(doc.id, `${doc.id}-renewal.pdf`)
                push({ title: 'Renewal uploaded', description: 'Not valid until verified.', tone: 'success' })
              }}
            >
              Upload fictional renewal
            </Button>
          ) : null}
          {canVerifyCompliance && doc.verificationStatus === 'Awaiting Verification' ? (
            <div className="mt-3 flex flex-col gap-2">
              <Button
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Verify this renewal?',
                    message: 'The demonstration register will treat the document as renewed. No statutory effect.',
                    confirmLabel: 'Verify renewal',
                  })
                  if (!ok) return
                  dispatch.verifyDocument(doc.id, true)
                  push({ title: 'Renewal verified (demo)', tone: 'success' })
                }}
              >
                Verify renewal
              </Button>
              <Button variant="amber" onClick={() => dispatch.verifyDocument(doc.id, false)}>
                Reject renewal
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
      <Card className="mt-4">
        <SectionTitle title="Verification history" />
        <ul className="divide-y divide-line text-sm">
          {history.length === 0 ? <li className="py-2 text-muted">No subsequent events beyond the seed register.</li> : history.map((e) => (
            <li key={e.id} className="py-2.5">
              <p className="font-medium">{e.action}</p>
              <p className="text-xs text-muted">{formatDateTime(e.timestamp)} · {e.actor}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
