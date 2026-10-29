import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '../ui/Button'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'primary'
}

interface Api {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<Api | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(value: boolean) => void>(() => undefined)

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpen(options)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (value: boolean) => {
    resolver.current(value)
    setOpen(null)
  }

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-950/40" aria-label="Dismiss dialog" onClick={() => close(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-xl">
            <h2 id="confirm-title" className="text-base font-semibold text-ink">
              {open.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{open.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button variant={open.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
                {open.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
