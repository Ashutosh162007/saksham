type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'navy'

const tones: Record<Tone, string> = {
  neutral: 'bg-navy-50 text-navy-800 border-line',
  info: 'bg-info-bg text-info-ink border-transparent',
  success: 'bg-success-bg text-success-ink border-success-line',
  warning: 'bg-amber-bg text-amber-ink border-amber-line',
  danger: 'bg-danger-bg text-danger-ink border-danger-line',
  navy: 'bg-navy-900 text-white border-transparent',
}

export function StatusBadge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string
  tone?: Tone
  icon?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]}`}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {label}
    </span>
  )
}

export function applicationTone(status: string): Tone {
  if (status === 'Completed' || status === 'Verified' || status === 'Currently Valid' || status === 'Verified Renewal') return 'success'
  if (status === 'Overdue' || status.startsWith('Expired') || status === 'Delayed' || status === 'Critical') return 'danger'
  if (status === 'Returned' || status === 'Expiring soon' || status === 'Upcoming' || status === 'High' || status.includes('Awaiting')) return 'warning'
  if (status === 'In Progress' || status === 'Scheduled' || status === 'Submitted') return 'info'
  return 'neutral'
}
