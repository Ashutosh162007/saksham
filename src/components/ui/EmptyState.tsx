import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-md border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger-ink" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="font-medium underline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function LoadingBlock({ label = 'Loading demonstration records…' }: { label?: string }) {
  return (
    <div className="animate-pulse rounded-lg border border-line bg-surface p-6">
      <div className="h-4 w-48 rounded bg-navy-50" />
      <div className="mt-4 h-24 rounded bg-navy-50" />
      <p className="sr-only">{label}</p>
    </div>
  )
}
