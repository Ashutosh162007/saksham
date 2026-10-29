import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { SelectField, TextField } from '../components/ui/Field'
import { WorkflowTimeline } from '../components/workflow/WorkflowTimeline'
import { StatusBadge, applicationTone } from '../components/ui/StatusBadge'
import { deriveApplicationStatus } from '../lib/status'
import { formatDate } from '../lib/dates'
import { useDemo } from '../store/demo-store'
import { STAGE_SEQUENCE } from '../lib/constants'
import type { WorkflowStageName } from '../types'

export function WorkflowPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState(state.applications[1]?.id ?? state.applications[0]?.id)
  const [stageFilter, setStageFilter] = useState('all')

  const filtered = useMemo(() => {
    return state.applications.filter((app) => {
      const query = q.trim().toLowerCase()
      if (query && !app.id.toLowerCase().includes(query) && !app.institutionName.toLowerCase().includes(query)) return false
      if (stageFilter !== 'all' && app.currentStage !== stageFilter) return false
      return true
    })
  }, [q, stageFilter, state.applications])

  const selected = state.applications.find((a) => a.id === selectedId) ?? filtered[0]
  const status = selected ? deriveApplicationStatus(selected, state.asOfDate) : 'Pending'
  const [stageName, setStageName] = useState<WorkflowStageName | undefined>(selected?.currentStage)

  return (
    <div>
      <PageHeader
        title="Workflow Tracker"
        subtitle="Visualise how a demonstration file moves through configured stages. Automated progression is never treated as statutory approval."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <TextField label="Find application" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID or institution" />
        <SelectField label="Current stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="all">All stages</option>
          {STAGE_SEQUENCE.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card padded={false} className="lg:col-span-2">
          <div className="border-b border-line px-4 py-3">
            <SectionTitle title="Files" description={`${filtered.length} in view`} />
          </div>
          <ul className="max-h-[70vh] overflow-y-auto scrollbar-thin">
            {filtered.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  className={`w-full border-b border-line px-4 py-3 text-left ${selectedId === app.id ? 'bg-royal-soft' : 'hover:bg-navy-50'}`}
                  onClick={() => {
                    setSelectedId(app.id)
                    setStageName(app.currentStage)
                  }}
                >
                  <p className="text-sm font-medium">{app.id}</p>
                  <p className="text-xs text-muted">{app.institutionName}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">{app.currentStage}</span>
                    <StatusBadge label={deriveApplicationStatus(app, state.asOfDate)} tone={applicationTone(deriveApplicationStatus(app, state.asOfDate))} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-3">
          {selected ? (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">{selected.id}</h2>
                  <p className="text-sm text-muted">{selected.institutionName} · assigned to {selected.assignedOfficerName}</p>
                </div>
                <StatusBadge label={status} tone={applicationTone(status)} />
              </div>
              <WorkflowTimeline
                stages={selected.stages}
                selected={stageName}
                onSelect={(name) => setStageName(name as WorkflowStageName)}
              />
              {stageName ? (
                <div className="mt-2 rounded-md border border-line bg-canvas p-3 text-sm">
                  {(() => {
                    const stage = selected.stages.find((s) => s.name === stageName)
                    if (!stage) return null
                    return (
                      <>
                        <p className="font-medium">{stage.name}</p>
                        <p className="mt-1 text-muted">State: {stage.state.replace('-', ' ')}</p>
                        {stage.assignee ? <p className="text-muted">Responsibility: {stage.assignee}</p> : null}
                        {stage.startedAt ? <p className="text-muted">Opened {formatDate(stage.startedAt)}</p> : null}
                        {stage.completedAt ? <p className="text-muted">Completed {formatDate(stage.completedAt)}</p> : null}
                        {stage.returnReason ? <p className="mt-1 text-amber-ink">Returned: {stage.returnReason}</p> : null}
                        <button type="button" className="mt-2 text-royal hover:underline" onClick={() => navigate(`/applications/${selected.id}`)}>
                          Open application workspace
                        </button>
                      </>
                    )
                  })()}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">Select a file to inspect its demonstration path.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
