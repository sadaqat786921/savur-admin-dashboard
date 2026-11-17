import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutGrid, Users, Building2, Heart, Leaf, CreditCard, FileText, Settings as Gear, Menu } from 'lucide-react'
import { useStore } from '../store'
import { initials } from '../lib'
import { SignOutDialog } from './dialogs'

const NAV = [
  { label: 'Overview', items: [{ to: '/dashboard', name: 'Dashboard', Icon: LayoutGrid }] },
  { label: 'Directory', items: [
    { to: '/users', name: 'Users', Icon: Users }, { to: '/bd', name: 'Business Donors', Icon: Building2 },
    { to: '/np', name: 'Nonprofit Organizations', Icon: Heart }, { to: '/up', name: 'Upcycle Partners', Icon: Leaf }] },
  { label: 'Administration', items: [
    { to: '/plans', name: 'Plan Management', Icon: CreditCard }, { to: '/audit', name: 'Audit & Activity', Icon: FileText },
    { to: '/settings', name: 'Settings', Icon: Gear }] },
]

export default function Layout() {
  const { me, modal, toastMsg, openModal } = useStore()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isActive = (to: string) => loc.pathname === to || loc.pathname.startsWith(to + '/') || (to === '/dashboard' && loc.pathname === '/attention')
  return (
    <>
      <aside className={`side${open ? ' open' : ''}`} aria-label="Main navigation">
        <div className="brand">Savur</div>
        <div className="org"><div><b>Savur, Inc.</b><span>Platform Admin</span></div><div className="tag">SUPER ADMIN</div></div>
        {NAV.map((g, i) => (
          <div key={g.label}>
            {i > 0 && <div className="grp">{g.label.toUpperCase()}</div>}
            {g.items.map(({ to, name, Icon }) => (
              <NavLink key={to} to={to} className={`nav${isActive(to) ? ' on' : ''}`} aria-current={isActive(to) ? 'page' : undefined} onClick={() => setOpen(false)}>
                <Icon aria-hidden />{name}
              </NavLink>
            ))}
          </div>
        ))}
        <button className="me" onClick={() => openModal(<SignOutDialog />)}>
          <div className="av">{initials(me.name)}</div><div><b>{me.name}</b><span>{me.role}</span></div>
        </button>
      </aside>
      <div className={`scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <main className="main" id="main">
        <div className="top"><button aria-label="Open menu" onClick={() => setOpen(o => !o)}><Menu /></button><div className="brand">Savur</div></div>
        <Outlet />
      </main>
      {modal}
      <div className={`toast${toastMsg ? ' show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </>
  )
}
