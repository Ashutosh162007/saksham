import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { SelectField, TextField } from '../components/ui/Field'
import { DEMO_ROLES, STORAGE_KEY } from '../lib/constants'
import { useDemo } from '../store/demo-store'
import { useToast } from '../components/feedback/Toast'
import { useConfirm } from '../components/feedback/ConfirmDialog'
import type { DemoRole } from '../types'

export function SettingsPage() {
  const { state, user, dispatch } = useDemo()
  const { push } = useToast()
  const { confirm } = useConfirm()

  return (
    <div>
      <PageHeader
        title="Administration and Settings"
        subtitle="Demonstration controls only. There is no real authentication, messaging or production database in this phase."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Signed-in demo identity" />
          <dl className="space-y-2 text-sm">
            <div><span className="text-muted">Name · </span>{user.name}</div>
            <div><span className="text-muted">Office · </span>{user.office}</div>
            <SelectField
              label="Demonstrate as role"
              value={state.currentRole}
              onChange={(e) => {
                dispatch.setRole(e.target.value as DemoRole)
                push({ title: 'Demo role updated', description: 'Permitted actions on subsequent screens follow this role.', tone: 'success' })
              }}
            >
              {DEMO_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </SelectField>
          </dl>
        </Card>
        <Card>
          <SectionTitle title="Demonstration clock" description="Shift the as-of date to show upcoming and overdue alerts without waiting for real deadlines." />
          <TextField
            label="As-of date"
            type="date"
            value={state.asOfDate}
            onChange={(e) => dispatch.setAsOf(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted">KPI cards, ageing and expiry labels recompute from this date. Underlying due dates do not change.</p>
        </Card>
        <Card>
          <SectionTitle title="Reminder intervals" description="Document reminders in this prototype default to 45, 30, 15 and 7 days. Regulatory deadlines are not hardcoded as law." />
          <p className="text-sm text-muted">Per-document intervals are stored on each sample record and shown on the document detail page.</p>
        </Card>
        <Card>
          <SectionTitle title="Reset demonstration data" />
          <p className="mb-3 text-sm text-muted">Clears local browser state ({STORAGE_KEY}) and restores the seed dataset. Your as-of date is kept.</p>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirm({
                title: 'Reset the demonstration workspace?',
                message: 'All simulated actions taken in this browser will be discarded.',
                confirmLabel: 'Reset data',
                tone: 'danger',
              })
              if (!ok) return
              dispatch.reset()
              push({ title: 'Demonstration data restored', tone: 'success' })
            }}
          >
            Restore seed data
          </Button>
        </Card>
      </div>
    </div>
  )
}
