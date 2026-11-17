import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { pillClass, initials } from '../lib'
import type { AuditEvent, User } from '../types'
import { useNavigate } from 'react-router-dom'

export const Pill = ({ s }: { s: string | null | undefined }) => <span className={`pill p-${pillClass(s)}`}>{s || 'Not recorded'}</span>

export function Head({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="head">
      <div><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</div>
      <div className="acts"><span className="demo">Demo data</span>{children}</div>
    </div>
  )
}
export const Card = ({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) => (
  <div className="card">
    {title && <div className="ch"><h2>{title}</h2>{action}</div>}
    {children}
  </div>
)
export const Pad = ({ children }: { children: ReactNode }) => <div className="cb">{children}</div>
export const Empty = ({ title, text }: { title: string; text: string }) => <div className="empty"><b>{title}</b>{text}</div>
export const Name = ({ name, id }: { name: string; id: string }) => <><strong>{name}</strong><small>{id}</small></>
export function KV({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="kv">
      {items.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v === '' || v == null ? <span className="mu">Not recorded</span> : v}</dd></div>
      ))}
    </dl>
  )
}
export function Back({ to, label }: { to: string; label: string }) {
  const nav = useNavigate()
  return <button className="back" onClick={() => nav(to)}><ChevronLeft />{label}</button>
}
export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => (
        <button key={t.id} className="tab" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}{t.count != null && <i>{t.count}</i>}
        </button>
      ))}
    </div>
  )
}
export function EventTable({ list }: { list: AuditEvent[] }) {
  if (!list.length) return <Empty title="No activity yet" text="Actions taken on this record will appear here." />
  return (
    <div className="tw"><table>
      <thead><tr><th>When</th><th>Actor</th><th>Action</th><th className="hide-sm">Details</th></tr></thead>
      <tbody>{list.map((a, i) => (
        <tr key={i}><td>{a.ts}</td><td>{a.user}</td><td><strong style={{ fontWeight: 600 }}>{a.action}</strong><small>{a.record !== '—' ? a.record : ''}</small></td><td className="hide-sm">{a.detail}</td></tr>
      ))}</tbody>
    </table></div>
  )
}
export function UserTable({ list }: { list: User[] }) {
  const nav = useNavigate()
  if (!list.length) return <Empty title="No user records" text="No user accounts are recorded for this organization yet." />
  return (
    <div className="tw"><table>
      <thead><tr><th>User</th><th className="hide-sm">Email</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>{list.map(u => (
        <tr key={u.id} className="go" tabIndex={0} onClick={() => nav(`/users/${u.id}`)} onKeyDown={e => e.key === 'Enter' && nav(`/users/${u.id}`)}>
          <td><Name name={u.name} id={u.id} /></td><td className="hide-sm">{u.email}</td><td>{u.role}</td><td><Pill s={u.status} /></td>
        </tr>
      ))}</tbody>
    </table></div>
  )
}
export const Avatar = ({ name, sys }: { name: string; sys?: boolean }) => (
  <div className="dot" style={{ background: sys ? '#F1F5F9' : '#EAF0F8', color: sys ? '#475569' : '#01284D' }}>{initials(name)}</div>
)

/* Modal shell: focus trap, Esc, backdrop click */
export function Dialog({ title, sub, onClose, children, footer }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = box.current?.querySelector<HTMLElement>('input,textarea,select')
    ;(first ?? box.current?.querySelector<HTMLElement>('button.btn:last-child'))?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>('button,input,select,textarea')]
        if (!f.length) return
        const i = f.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [onClose])
  return (
    <div className="modal open" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="mb" ref={box} role="dialog" aria-modal="true" aria-labelledby="mt">
        <div className="mh"><h2 id="mt">{title}</h2>{sub && <p>{sub}</p>}</div>
        <div className="mc">{children}</div>
        <div className="mf">{footer}</div>
      </div>
    </div>
  )
}
