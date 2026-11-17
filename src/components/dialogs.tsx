import { useState } from 'react'
import { Dialog } from './ui'
import { useStore, PLAN_KIND_LABEL } from '../store'
import type { Kind } from '../types'

function useDialog() {
  const { closeModal } = useStore()
  const [err, setErr] = useState('')
  return { closeModal, err, setErr }
}
const Foot = ({ onClose, ok, cls, onOk }: { onClose: () => void; ok: string; cls: string; onOk: () => void }) => (
  <>
    <button type="button" className="btn" onClick={onClose}>Cancel</button>
    <button type="button" className={`btn ${cls}`} onClick={onOk}>{ok}</button>
  </>
)
const Err = ({ m }: { m: string }) => <div className="err" role="alert">{m}</div>

export function ReasonDialog({ kind, id, to }: { kind: 'org' | 'user'; id: string; to: 'Active' | 'Paused' | 'Suspended' }) {
  const s = useStore(); const { closeModal, err, setErr } = useDialog()
  const [reason, setReason] = useState('')
  const isU = kind === 'user'
  const x = isU ? s.users.find(u => u.id === id)! : s.orgs.find(o => o.id === id)!
  const verb = to === 'Active' ? 'Reactivate' : to === 'Paused' ? 'Pause' : 'Suspend'
  const need = to !== 'Active'
  const ok = () => {
    const r = reason.trim()
    if (need && !r) return setErr('Add a reason so the audit log is complete.')
    if (isU) s.setUserStatus(id, to, r); else s.setOrgAcct(id, to, r)
    closeModal()
  }
  return (
    <Dialog title={`${verb} ${isU ? 'user' : 'account'}?`} sub={`${x.name} · ${id}`} onClose={closeModal}
      footer={<Foot onClose={closeModal} ok={verb} cls={to === 'Active' ? 'grn' : 'dng'} onOk={ok} />}>
      <p>{to === 'Active'
        ? (isU ? 'This user will be able to sign in again.' : 'Users from this organization will be able to sign in again.')
        : (isU ? 'This user will not be able to sign in.' : 'Users from this organization will not be able to sign in.')}</p>
      <label className="fld">Reason {need ? '(required)' : '(optional)'}
        <textarea className="ta" value={reason} onChange={e => setReason(e.target.value)} placeholder="Visible in the audit log" />
      </label>
      <Err m={err} />
    </Dialog>
  )
}

export function NoteDialog({ kind, id }: { kind: 'org' | 'user'; id: string }) {
  const s = useStore(); const { closeModal, err, setErr } = useDialog()
  const [t, setT] = useState('')
  const x = kind === 'user' ? s.users.find(u => u.id === id)! : s.orgs.find(o => o.id === id)!
  const ok = () => { if (!t.trim()) return setErr('Write a note first.'); s.addNote(kind, id, t.trim()); closeModal() }
  return (
    <Dialog title="Add internal note" sub={`${x.name} · visible to Savur administrators only`} onClose={closeModal}
      footer={<Foot onClose={closeModal} ok="Save note" cls="pri" onOk={ok} />}>
      <label className="fld">Note<textarea className="ta" value={t} onChange={e => setT(e.target.value)} /></label>
      <Err m={err} />
    </Dialog>
  )
}

export function VerifyDialog({ id, to }: { id: string; to: 'Approved' | 'Declined' | 'Info' }) {
  const s = useStore(); const { closeModal, err, setErr } = useDialog()
  const [m, setM] = useState('')
  const o = s.orgs.find(x => x.id === id)!
  const lbl = { Approved: 'Approve', Declined: 'Decline', Info: 'Request more information' }[to]
  const ok = () => { if (to !== 'Approved' && !m.trim()) return setErr('A message is required.'); s.verifyOrg(id, to, m.trim()); closeModal() }
  return (
    <Dialog title={`${lbl} verification?`} sub={`${o.name} · ${id}`} onClose={closeModal}
      footer={<Foot onClose={closeModal} ok={lbl} cls={to === 'Approved' ? 'grn' : to === 'Declined' ? 'dng' : 'pri'} onOk={ok} />}>
      {to === 'Approved' && <p>The organization will be marked Approved{o.acct === 'Pending activation' ? ' and its account activated' : ''}.</p>}
      <label className="fld">{to === 'Approved' ? 'Note (optional)' : 'Message to the organization (required)'}
        <textarea className="ta" value={m} onChange={e => setM(e.target.value)} />
      </label>
      <Err m={err} />
    </Dialog>
  )
}

export function PlanDialog({ kind, index }: { kind: Kind; index: number }) {
  const s = useStore(); const { closeModal, err, setErr } = useDialog()
  const add = index < 0
  const cur = add ? { n: '', p: 0, l: [] as string[] } : s.plans[kind][index]
  const [n, setN] = useState(cur.n); const [p, setP] = useState(String(cur.p)); const [l, setL] = useState(cur.l.join('\n'))
  const ok = () => {
    const price = parseFloat(p)
    if (!n.trim()) return setErr('Enter a plan name.')
    if (isNaN(price) || price < 0) return setErr('Enter a price of $0 or more.')
    s.savePlan(kind, index, { n: n.trim(), p: price, l: l.split('\n').map(x => x.trim()).filter(Boolean) }); closeModal()
  }
  return (
    <Dialog title={add ? 'Add plan' : `Edit ${cur.n}`} sub={`${PLAN_KIND_LABEL[kind]} plan`} onClose={closeModal}
      footer={<Foot onClose={closeModal} ok="Save plan" cls="pri" onOk={ok} />}>
      <label className="fld">Plan name<input className="in" value={n} onChange={e => setN(e.target.value)} /></label>
      <label className="fld">Monthly price (USD)<input className="in" type="number" min="0" step="1" value={p} onChange={e => setP(e.target.value)} /></label>
      <label className="fld">What is included<textarea className="ta" value={l} onChange={e => setL(e.target.value)} placeholder="One item per line" /></label>
      <Err m={err} />
    </Dialog>
  )
}

export function InviteDialog() {
  const s = useStore(); const { closeModal, err, setErr } = useDialog()
  const [e, setE] = useState(''); const [role, setRole] = useState('Savur Admin')
  const ok = () => {
    const v = e.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return setErr('Enter a valid email address.')
    if (s.admins.some(a => a.email === v)) return setErr('That person is already on the team.')
    s.inviteAdmin(v, role); closeModal()
  }
  return (
    <Dialog title="Invite administrator" sub="They receive an email to join Savur Admin" onClose={closeModal}
      footer={<Foot onClose={closeModal} ok="Send invitation" cls="pri" onOk={ok} />}>
      <label className="fld">Email<input className="in" type="email" value={e} onChange={ev => setE(ev.target.value)} placeholder="name@savur.com" /></label>
      <label className="fld">Role
        <select className="sel" style={{ width: '100%' }} value={role} onChange={ev => setRole(ev.target.value)}><option>Savur Admin</option><option>Super Admin</option></select>
      </label>
      <Err m={err} />
    </Dialog>
  )
}

export function SignOutDialog() {
  const { closeModal, toast } = useStore()
  return (
    <Dialog title="Sign out?" sub="You will be returned to the sign-in screen." onClose={closeModal}
      footer={<Foot onClose={closeModal} ok="Sign out" cls="pri" onOk={() => { closeModal(); toast('Signed out (prototype)') }} />}>
      <></>
    </Dialog>
  )
}
