import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { Back, Card, Empty, EventTable, KV, Pad, Pill, Tabs } from '../components/ui'
import { NoteDialog, ReasonDialog } from '../components/dialogs'

const AREA: Record<string, string> = {
  dash: 'Dashboard', orgverify: 'Organization verification', identity: 'Identity & access', recdiv: 'Recovery & diversion',
  savvi: 'Savvi', logi: 'Logistics', events: 'Events', fin: 'Finance', notif: 'Notifications', support: 'Support', reports: 'Reports', team: 'Team',
}
const tabs = [{ id: 'profile', label: 'Profile' }, { id: 'access', label: 'Access' }, { id: 'activity', label: 'Activity' }, { id: 'account', label: 'Account' }]

export default function UserDetail() {
  const { id } = useParams()
  const { users, orgs, audit, openModal } = useStore()
  const [sp, setSp] = useSearchParams()
  const u = users.find(x => x.id === id)
  if (!u) return <Navigate to="/users" replace />
  const want = sp.get('tab') ?? 'profile'
  const tab = tabs.some(t => t.id === want) ? want : 'profile'
  const org = orgs.find(o => o.name === u.org)
  const held = u.status !== 'Active'
  const self = u.id === users[0].id
  const ask = (to: 'Active' | 'Suspended') => openModal(<ReasonDialog kind="user" id={u.id} to={to} />)
  const perms = Object.entries(u.perms ?? {}).filter(([, p]) => p.view || p.act || p.man)
  const yes = (v: boolean) => (v ? <span className="pill p-g">Yes</span> : <span className="mu">—</span>)
  return (
    <>
      <Back to="/users" label="Users" />
      <div className="card"><div className="cb hero">
        <div>
          <h1>{u.name}</h1><p className="sub">{u.email} · {u.id}</p>
          <div className="pills"><span className="l">Status</span><Pill s={u.status} /><span className="l">Role</span><span className="pill p-n">{u.role}</span></div>
        </div>
        <div className="acts">
          <button className="btn" onClick={() => openModal(<NoteDialog kind="user" id={u.id} />)}>Add note</button>
          {!self && (held ? <button className="btn grn" onClick={() => ask('Active')}>Reactivate user</button> : <button className="btn dng" onClick={() => ask('Suspended')}>Suspend user</button>)}
        </div>
      </div></div>
      <Tabs tabs={tabs} value={tab} onChange={t => setSp({ tab: t }, { replace: true })} />

      {tab === 'profile' && <Card title="Profile"><Pad><KV items={[
        ['Name', u.name], ['User ID', u.id], ['Email', u.email],
        ['Organization', org ? <a className="link" href={`#/${org.k}/${org.id}`}>{u.org}</a> : u.org],
        ['User type', u.internal ? 'Savur administrator' : 'Organization user'], ['Last sign-in', u.last], ['Invited', u.invited], ['Workspaces', u.workspaces]]} /></Pad></Card>}
      {tab === 'access' && (<>
        <Card title="Access"><Pad><KV items={[['Role', u.role], ['Scope', u.scope], ['MFA', <Pill s={u.mfa} />], ['Responsibility', u.responsibility ?? ''], ['Jurisdictions', (u.jurisdictions ?? []).join(', ')]]} /></Pad></Card>
        {u.memberships.length > 0 && <Card title="Organization memberships"><div className="tw"><table>
          <thead><tr><th>Organization</th><th>Role</th><th>Status</th><th className="hide-sm">Since</th></tr></thead>
          <tbody>{u.memberships.map(m => <tr key={m.orgId}><td><strong>{m.org}</strong><small>{m.orgId}</small></td><td>{m.role}</td><td><Pill s={m.status[0] + m.status.slice(1).toLowerCase()} /></td><td className="hide-sm">{m.since}</td></tr>)}</tbody>
        </table></div></Card>}
        {perms.length > 0 && <Card title="Permissions"><div className="tw"><table>
          <thead><tr><th>Area</th><th>View</th><th>Act</th><th>Manage</th></tr></thead>
          <tbody>{perms.map(([k, p]) => <tr key={k}><td>{AREA[k] ?? k}</td><td>{yes(p.view)}</td><td>{yes(p.act)}</td><td>{yes(p.man)}</td></tr>)}</tbody>
        </table></div></Card>}
      </>)}
      {tab === 'activity' && <Card title="Activity"><EventTable list={audit.filter(a => a.user === u.name || a.record === u.id || a.detail.includes(u.name))} /></Card>}
      {tab === 'account' && (<>
        <Card title="Account status"><div className="acard">
          <div><b><Pill s={u.status} /></b><span>{held ? 'This user cannot sign in.' : 'This user can sign in.'}</span></div>
          {self ? <span className="mu">You cannot change your own account.</span>
            : held ? <button className="btn grn" onClick={() => ask('Active')}>Reactivate</button> : <button className="btn dng" onClick={() => ask('Suspended')}>Suspend</button>}
        </div></Card>
        <Card title="Internal notes" action={<button className="btn" onClick={() => openModal(<NoteDialog kind="user" id={u.id} />)}>Add note</button>}>
          {u.notes.length ? u.notes.map((n, i) => <div className="note" key={i}>{n.t}<small>{n.by} · {n.at}</small></div>) : <Empty title="No notes" text="Notes are visible to Savur administrators only." />}
        </Card>
      </>)}
    </>
  )
}
