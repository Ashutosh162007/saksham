const DAY_MS = 86_400_000

export function parseDay(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T12:00:00`)
}

export function toIsoDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(isoDate: string, days: number): string {
  const date = parseDay(isoDate)
  date.setTime(date.getTime() + days * DAY_MS)
  return toIsoDay(date)
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseDay(toIso).getTime() - parseDay(fromIso).getTime()) / DAY_MS)
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return parseDay(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelative(iso: string, asOf: string): string {
  const days = daysBetween(iso, asOf)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days > 1) return `${days} days ago`
  if (days === -1) return 'Tomorrow'
  return `In ${Math.abs(days)} days`
}

export function isoStamp(asOf: string, hour = 10, minute = 24): string {
  return `${asOf}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}
