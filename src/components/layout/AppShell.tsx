import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronLeft, Menu, Search, X } from 'lucide-react'
import { PRODUCT_NAME, PRODUCT_SUBTITLE, DEMO_BANNER } from '../../lib/constants'
import { formatDate } from '../../lib/dates'
import { useDemo } from '../../store/demo-store'
import { NAV_ITEMS, PAGE_TITLES, ShieldCheck } from './nav'

export function AppShell() {
  const { state, user } = useDemo()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const unread = state.notifications.filter((n) => !n.read).length

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    const items = [{ label: 'Home', to: '/' }]
    if (parts[0]) {
      const base = `/${parts[0]}`
      items.push({ label: PAGE_TITLES[base] ?? parts[0], to: base })
    }
    if (parts[1]) items.push({ label: decodeURIComponent(parts[1]), to: location.pathname })
    return items
  }, [location.pathname])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const apps = state.applications
      .filter((a) => a.id.toLowerCase().includes(q) || a.institutionName.toLowerCase().includes(q))
      .slice(0, 6)
      .map((a) => ({ to: `/applications/${a.id}`, title: a.id, meta: a.institutionName }))
    const docs = state.documents
      .filter((d) => d.id.toLowerCase().includes(q) || d.institutionName.toLowerCase().includes(q))
      .slice(0, 4)
      .map((d) => ({ to: `/documents/${d.id}`, title: d.id, meta: `${d.type} · ${d.institutionName}` }))
    return [...apps, ...docs]
  }, [query, state.applications, state.documents])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 border-b border-white/10 px-4 ${collapsed ? 'justify-center py-4' : 'py-5'}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white">
          <ShieldCheck size={18} />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-white">{PRODUCT_NAME}</p>
            <p className="text-[11px] text-white/60">{PRODUCT_SUBTITLE}</p>
          </div>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin" aria-label="Primary">
        {NAV_ITEMS.map((item, index) => {
          const prev = NAV_ITEMS[index - 1]
          return (
            <div key={item.to}>
              {item.section && prev && !prev.section ? <div className="my-2 border-t border-white/10" /> : null}
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                    isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={item.label}
              >
                <item.icon size={17} />
                {!collapsed ? <span>{item.label}</span> : null}
              </NavLink>
            </div>
          )
        })}
      </nav>
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-white/80 hover:bg-white/8"
          onClick={() => navigate('/settings')}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
            {user.initials}
          </span>
          {!collapsed ? (
            <span>
              <span className="block text-xs font-medium text-white">{user.name}</span>
              <span className="block text-[11px] text-white/55">{user.role}</span>
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden bg-navy-950 md:block ${collapsed ? 'w-[72px]' : 'w-[272px]'}`}>
        {sidebar}
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-navy-950/50" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-[272px] bg-navy-950">{sidebar}</aside>
        </div>
      ) : null}

      <div className={`${collapsed ? 'md:pl-[72px]' : 'md:pl-[272px]'}`}>
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4">
            <button type="button" className="rounded-md p-1.5 text-muted hover:bg-navy-50 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <button
              type="button"
              className="hidden rounded-md p-1.5 text-muted hover:bg-navy-50 md:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
            <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 items-center gap-1 text-xs text-muted sm:flex">
              {crumbs.map((c, i) => (
                <span key={c.to} className="flex items-center gap-1">
                  {i > 0 ? <span>/</span> : null}
                  {i === crumbs.length - 1 ? (
                    <span className="truncate font-medium text-ink">{c.label}</span>
                  ) : (
                    <Link className="truncate hover:text-ink" to={c.to}>
                      {c.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <div className="relative ml-auto w-full max-w-sm">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-2.5 text-faint" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search application ID or institution"
                className="h-9 w-full rounded-md border border-line bg-canvas pl-8 pr-8 text-sm"
                aria-label="Global search"
              />
              {query ? (
                <button type="button" className="absolute right-2 top-2 text-faint" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              ) : null}
              {searchOpen && query.trim().length >= 2 ? (
                <div className="absolute top-10 z-30 w-full rounded-md border border-line bg-white py-1 shadow-lg">
                  {results.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted">No matching demonstration records.</p>
                  ) : (
                    results.map((r) => (
                      <button
                        key={r.to}
                        type="button"
                        className="block w-full px-3 py-2 text-left hover:bg-navy-50"
                        onClick={() => navigate(r.to)}
                      >
                        <span className="block text-sm font-medium text-ink">{r.title}</span>
                        <span className="block text-xs text-muted">{r.meta}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="relative rounded-md p-2 text-muted hover:bg-navy-50"
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 min-w-4 rounded-full bg-danger-ink px-1 text-[10px] font-semibold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              ) : null}
            </button>
            <span className="hidden rounded-full border border-amber-line bg-amber-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-ink lg:inline">
              Demo environment
            </span>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-navy-50"
                onClick={() => setProfileOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                  {user.initials}
                </span>
              </button>
              {profileOpen ? (
                <div role="menu" className="absolute right-0 mt-1 w-56 rounded-md border border-line bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-sm font-medium">{user.name}</p>
                  <p className="px-2 text-xs text-muted">{user.role}</p>
                  <p className="px-2 pb-2 text-xs text-muted">{user.office}</p>
                  <Link to="/settings" className="block rounded px-2 py-1.5 text-sm hover:bg-navy-50">
                    Administration and Settings
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
          <div className="border-t border-amber-line bg-amber-bg px-4 py-1.5 text-center text-[11px] text-amber-ink">
            {DEMO_BANNER} Demo clock: {formatDate(state.asOfDate)}.
          </div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
