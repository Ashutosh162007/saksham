import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ToastItem {
  id: string
  title: string
  description?: string
  tone?: 'success' | 'danger' | 'info'
}

interface ToastApi {
  push: (item: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = String(Date.now())
    setItems((prev) => [...prev, { ...item, id }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,360px)] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-md border bg-white px-4 py-3 text-sm shadow-lg ${
              item.tone === 'danger'
                ? 'border-danger-line'
                : item.tone === 'success'
                  ? 'border-success-line'
                  : 'border-line'
            }`}
            role="status"
          >
            <p className="font-medium text-ink">{item.title}</p>
            {item.description ? <p className="mt-0.5 text-muted">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
