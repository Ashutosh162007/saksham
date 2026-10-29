import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  hideOnMobile?: boolean
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No records',
  emptyDescription = 'Nothing matches the current filters in this demonstration set.',
}: {
  columns: Column<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
}) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [columns, rows, sortDir, sortKey])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const slice = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-navy-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`border-b border-line px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted ${
                    col.hideOnMobile ? 'hidden md:table-cell' : ''
                  } ${col.className ?? ''}`}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-ink"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key ? <span aria-hidden>{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-line ${onRowClick ? 'cursor-pointer hover:bg-navy-50/70' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 align-middle text-ink ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className ?? ''}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5 text-xs text-muted">
        <p>
          {sorted.length} record{sorted.length === 1 ? '' : 's'} · page {safePage + 1} of {pageCount}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} icon={<ChevronLeft size={14} />}>
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            icon={<ChevronRight size={14} />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
