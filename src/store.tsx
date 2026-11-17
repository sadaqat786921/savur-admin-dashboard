import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Admin, AuditEvent, Invitation, Kind, Org, Plan, User } from './types'
import { seedAudit, seedInvites, seedOrgs, seedPlans, seedUsers } from './data/seed'

export interface Me { name: string; email: string; role: string; lang: string; tz: string }
export const NOTIF_DESC: Record<string, string> = {
  'Account holds': 'When an account is suspended or paused',
  'Verification submissions': 'When a partner submits verification for review',
  'Delivery Credit alerts': 'When a pool falls below its alert threshold',
  'Weekly summary email': 'A Monday summary of platform activity',
}

interface Store {
  orgs: Org[]; users: User[]; audit: AuditEvent[]; invites: Invitation[]
  plans: Record<Kind, Plan[]>; admins: Admin[]; notif: Record<string, boolean>; me: Me
  log: (action: string, record?: string, detail?: string) => void
  setOrgAcct: (id: string, to: string, reason: string) => void
  setUserStatus: (id: string, to: string, reason: string) => void
  addNote: (kind: 'org' | 'user', id: string, text: string) => void
  verifyOrg: (id: string, to: 'Approved' | 'Declined' | 'Info', msg: string) => void
  resendInvite: (id: string) => void
  revokeInvite: (id: string) => void
  savePlan: (kind: Kind, index: number, plan: { n: string; p: number; l: string[] }) => void
  togglePlan: (kind: Kind, index: number) => void
  inviteAdmin: (email: string, role: string) => void
  revokeAdmin: (index: number) => void
  saveProfile: (p: Pick<Me, 'name' | 'lang' | 'tz'>) => void
  toggleNotif: (k: string) => void
  toast: (m: string) => void
  toastMsg: string
  modal: ReactNode | null
  openModal: (n: ReactNode) => void
  closeModal: () => void
}
const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)

const KIND_LBL: Record<Kind, string> = { bd: 'Business Donor', np: 'Nonprofit Partner', up: 'Upcycle Partner' }
export const PLAN_KIND_LABEL = KIND_LBL

export function StoreProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>(seedOrgs)
  const [users, setUsers] = useState<User[]>(seedUsers)
  const [audit, setAudit] = useState<AuditEvent[]>(seedAudit)
  const [invites, setInvites] = useState<Invitation[]>(seedInvites)
  const [plans, setPlans] = useState(seedPlans)
  const [admins, setAdmins] = useState<Admin[]>(() => seedUsers.filter(u => u.internal).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })))
  const [notif, setNotif] = useState<Record<string, boolean>>({ 'Account holds': true, 'Verification submissions': true, 'Delivery Credit alerts': true, 'Weekly summary email': false })
  const [me, setMe] = useState<Me>({ name: 'Monica Johnson', email: 'monica@savur.com', role: 'Super Admin', lang: 'English', tz: 'Central Time (US)' })
  const [toastMsg, setToastMsg] = useState('')
  const [modal, setModal] = useState<ReactNode | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const toast = useCallback((m: string) => {
    setToastMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastMsg(''), 2800)
  }, [])
  const log = useCallback((action: string, record = '—', detail = '') => {
    setAudit(a => [{ ts: 'Just now', user: me.name, action, record, detail }, ...a])
  }, [me.name])

  const value = useMemo<Store>(() => ({
    orgs, users, audit, invites, plans, admins, notif, me, toastMsg, modal,
    log, toast,
    openModal: n => setModal(n),
    closeModal: () => setModal(null),
    setOrgAcct: (id, to, reason) => {
      const o = orgs.find(x => x.id === id)!
      setOrgs(l => l.map(x => x.id === id ? { ...x, acct: to, access: to === 'Active' && x.access === 'Inactive' ? 'Active' : x.access } : x))
      const verb = { Active: 'Reactivated', Paused: 'Paused', Suspended: 'Suspended' }[to] ?? to
      log(`${verb} account`, id, o.name + (reason ? ' — ' + reason : ''))
      toast(`${o.name} is now ${to.toLowerCase()}`)
    },
    setUserStatus: (id, to, reason) => {
      const u = users.find(x => x.id === id)!
      setUsers(l => l.map(x => x.id === id ? { ...x, status: to } : x))
      const verb = { Active: 'Reactivated', Paused: 'Paused', Suspended: 'Suspended' }[to] ?? to
      log(`${verb} user`, id, u.name + (reason ? ' — ' + reason : ''))
      toast(`${u.name} is now ${to.toLowerCase()}`)
    },
    addNote: (kind, id, text) => {
      const note = { t: text, by: me.name, at: 'Just now' }
      if (kind === 'org') setOrgs(l => l.map(x => x.id === id ? { ...x, notes: [note, ...x.notes] } : x))
      else setUsers(l => l.map(x => x.id === id ? { ...x, notes: [note, ...x.notes] } : x))
      log('Added internal note', id, text)
      toast('Note saved')
    },
    verifyOrg: (id, to, msg) => {
      const o = orgs.find(x => x.id === id)!
      setOrgs(l => l.map(x => {
        if (x.id !== id) return x
        if (to === 'Approved') return { ...x, ver: 'Approved', acct: x.acct === 'Pending activation' ? 'Active' : x.acct, access: x.access === 'Inactive' || /Not active/.test(x.access) ? 'Active' : x.access }
        if (to === 'Declined') return { ...x, ver: 'Declined' }
        return x
      }))
      log(to === 'Approved' ? 'Approved verification' : to === 'Declined' ? 'Declined verification' : 'Requested more information', id, o.name + (msg ? ' — ' + msg : ''))
      toast('Verification ' + (to === 'Info' ? 'info requested' : to.toLowerCase()))
    },
    resendInvite: id => {
      const i = invites.find(x => x.id === id)!
      setInvites(l => l.map(x => x.id === id ? { ...x, attempts: (x.attempts || 1) + 1 } : x))
      log('Resent invitation', id, i.email); toast('Invitation resent to ' + i.email)
    },
    revokeInvite: id => {
      const i = invites.find(x => x.id === id)!
      setInvites(l => l.map(x => x.id === id ? { ...x, status: 'Revoked' } : x))
      log('Revoked invitation', id, i.email); toast('Invitation revoked')
    },
    savePlan: (kind, index, p) => {
      setPlans(all => {
        const list = all[kind].slice()
        if (index < 0) list.push({ n: p.n, p: p.p, l: p.l, st: 'Active' })
        else list[index] = { ...list[index], n: p.n, p: p.p, l: p.l }
        return { ...all, [kind]: list }
      })
      log(index < 0 ? 'Added plan' : 'Edited plan', p.n, KIND_LBL[kind]); toast('Plan saved')
    },
    togglePlan: (kind, index) => {
      const cur = plans[kind][index]; const st = cur.st === 'Paused' ? 'Active' : 'Paused'
      setPlans(all => ({ ...all, [kind]: all[kind].map((x, i) => i === index ? { ...x, st } : x) }))
      log(st === 'Paused' ? 'Paused plan' : 'Activated plan', cur.n, KIND_LBL[kind]); toast(`${cur.n} is now ${st.toLowerCase()}`)
    },
    inviteAdmin: (email, role) => {
      setAdmins(a => [...a, { id: 'INV-' + (9000 + a.length), name: email.split('@')[0], email, role, status: 'Invited' }])
      log('Invited administrator', email, role); toast('Invitation sent to ' + email)
    },
    revokeAdmin: index => {
      const a = admins[index]
      setAdmins(l => l.filter((_, i) => i !== index)); log('Revoked invitation', a.email); toast('Invitation revoked')
    },
    saveProfile: p => { setMe(m => ({ ...m, ...p })); log('Updated profile', '—', 'Preferences saved'); toast('Profile saved') },
    toggleNotif: k => setNotif(n => ({ ...n, [k]: !n[k] })),
  }), [orgs, users, audit, invites, plans, admins, notif, me, toastMsg, modal, log, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
