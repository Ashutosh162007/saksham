import { Check, Circle, RotateCcw, Timer } from 'lucide-react'
import { formatDate } from '../../lib/dates'
import type { WorkflowStage } from '../../types'

export function WorkflowTimeline({
  stages,
  onSelect,
  selected,
}: {
  stages: WorkflowStage[]
  onSelect?: (name: string) => void
  selected?: string
}) {
  return (
    <ol className="space-y-0">
      {stages.map((stage, index) => {
        const Icon =
          stage.state === 'completed'
            ? Check
            : stage.state === 'returned'
              ? RotateCcw
              : stage.state === 'overdue'
                ? Timer
                : Circle
        const color =
          stage.state === 'completed'
            ? 'bg-success-ink text-white'
            : stage.state === 'active'
              ? 'bg-royal text-white'
              : stage.state === 'returned'
                ? 'bg-amber-ink text-white'
                : stage.state === 'overdue'
                  ? 'bg-danger-ink text-white'
                  : 'bg-navy-50 text-muted'
        const label =
          stage.state === 'not-applicable'
            ? 'Not applicable'
            : stage.state === 'active'
              ? 'Active'
              : stage.state[0].toUpperCase() + stage.state.slice(1)
        return (
          <li key={stage.name} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
                <Icon size={14} />
              </span>
              {index < stages.length - 1 ? <span className="my-1 w-px flex-1 bg-line" /> : null}
            </div>
            <button
              type="button"
              className={`mb-4 flex-1 rounded-md border px-3 py-2.5 text-left ${
                selected === stage.name ? 'border-royal bg-royal-soft' : 'border-transparent hover:bg-navy-50'
              }`}
              onClick={() => onSelect?.(stage.name)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{stage.name}</p>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {stage.state === 'not-applicable'
                  ? stage.remarks
                  : stage.completedAt
                    ? `Completed ${formatDate(stage.completedAt)}`
                    : stage.startedAt
                      ? `Opened ${formatDate(stage.startedAt)}${stage.assignee ? ` · ${stage.assignee}` : ''}`
                      : 'Not started'}
              </p>
              {stage.returnReason ? <p className="mt-1 text-xs text-amber-ink">{stage.returnReason}</p> : null}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
