import type { ReactNode } from 'react'

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  onClick,
}: {
  label: string
  value: number | string
  hint: string
  icon: ReactNode
  tone?: 'default' | 'warning' | 'danger'
  onClick?: () => void
}) {
  const ring = tone === 'danger' ? 'border-danger-line' : tone === 'warning' ? 'border-amber-line' : 'border-line'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-navy-50 ${ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className={`rounded-md p-1.5 ${tone === 'danger' ? 'bg-danger-bg text-danger-ink' : tone === 'warning' ? 'bg-amber-bg text-amber-ink' : 'bg-royal-soft text-royal'}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>
    </button>
  )
}
