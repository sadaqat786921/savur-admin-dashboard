import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { TL, TP, credits, facilities, onboarding, savviMembers } from '../data/seed'
import { money } from '../lib'
import { attention } from '../derive'
import { Back, Card, Empty, EventTable, KV, Name, Pad, Pill, Tabs, UserTable } from '../components/ui'
import { NoteDialog, ReasonDialog, VerifyDialog } from '../components/dialogs'
import type { Kind, Org } from '../types'

export default function OrgDetail({ kind }: { kind: Kind }) {
  const { id } = useParams()
  const { orgs, users, audit, invites, openModal, resendInvite, revokeInvite } = useStore()
  const [sp, setSp] = useSearchParams()
  const o = orgs.find(x => x.id === id && x.k === kind)
  if (!o) return <Navigate to={`/${kind}`} replace />

  const recs = users.filter(u => u.org === o.name)
  const members = savviMembers.filter(m => m.npOrgId === o.id)
  const pools = credits.filter(c => c.npOrgId === o.id)
  const facs = facilities.filter(f => f.orgId === o.id)
  const tabs: { id: string; label: string; count?: number }[] = [{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users', count: recs.length }]
  if (kind === 'bd') tabs.push({ id: 'locations', label: 'Locations' })
  if (kind === 'np') tabs.push({ id: 'savvi', label: 'Savvi Members', count: members.length }, { id: 'credits', label: 'Delivery Credits', count: pools.length })
  if (kind === 'up') tabs.push({ id: 'capabilities', label: 'Capabilities' })
  if (kind !== 'bd') tabs.push({ id: 'verification', label: 'Verification' })
  tabs.push({ id: 'access', label: 'Access' }, { id: 'activity', label: 'Activity' }, { id: 'account', label: 'Account' })
  const want = sp.get('tab') ?? 'overview'
  const tab = tabs.some(t => t.id === want) ? want : 'overview'
  const held = o.acct === 'Suspended' || o.acct === 'Paused'
  const ask = (to: 'Active' | 'Paused' | 'Suspended') => openModal(<ReasonDialog kind="org" id={o.id} to={to} />)

  return (
    <>
      <Back to={`/${kind}`} label={TP[kind]} />
      <div className="card"><div className="cb hero">
        <div>
          <h1>{o.name}</h1><p className="sub">{TL[kind]} · {o.id}</p>
          <div className="pills">
            <span className="l">Account</span><Pill s={o.acct} />
            {(kind !== 'bd' || o.ver !== 'Approved') && <><span className="l">Verification</span><Pill s={o.ver} /></>}
            <span className="l">Access</span><Pill s={o.access} />
          </div>
        </div>
        <div className="acts">
          <button className="btn" onClick={() => openModal(<NoteDialog kind="org" id={o.id} />)}>Add note</button>
          {held ? <button className="btn grn" onClick={() => ask('Active')}>Reactivate account</button> : <button className="btn dng" onClick={() => ask('Suspended')}>Suspend account</button>}
        </div>
      </div></div>
      <Tabs tabs={tabs} value={tab} onChange={t => setSp({ tab: t }, { replace: true })} />

      {tab === 'overview' && <Overview o={o} count={members.length} flagged={attention([o], []).length > 0} />}
      {tab === 'users' && <Card title="Users"><UserTable list={recs} /></Card>}
      {tab === 'locations' && (
        <Card title="Locations"><Pad><div className="stat">
          <div><b>{o.locations ?? '—'}</b><span>Named locations</span></div>
          <div><b>{o.locActive ?? '—'}</b><span>Active</span></div>
          <div><b>{o.locPending ?? '—'}</b><span>Pending approval</span></div>
        </div></Pad></Card>
      )}
      {tab === 'savvi' && (
        <Card title="Savvi members">
          {members.length ? (<>
            <div className="tw"><table>
              <thead><tr><th>Member</th><th>ZIP</th><th>Household</th><th>Status</th><th className="hide-sm">Joined</th></tr></thead>
              <tbody>{members.map(m => <tr key={m.id}><td><Name name={m.label || m.name} id={m.id} /></td><td>{m.zip}</td><td>{m.size}</td><td><Pill s={m.status} /></td><td className="hide-sm">{m.joined}</td></tr>)}</tbody>
            </table></div>
            <div className="cb mu" style={{ borderTop: '1px solid var(--row)', fontSize: 13 }}>Savvi members are managed by this nonprofit. Savur shows status only, not dietary or allergen details.</div>
          </>) : <Empty title="No Savvi members" text="This nonprofit has no Savvi members recorded." />}
        </Card>
      )}
      {tab === 'credits' && (pools.length ? pools.map(c => (
        <Card key={c.id} title={c.id}><Pad>
          <div className="stat">
            <div><b>{money(c.funded)}</b><span>Funded</span></div><div><b>{money(c.available)}</b><span>Available</span></div>
            <div><b>{money(c.reserved)}</b><span>Reserved</span></div><div><b>{money(c.used)}</b><span>Used</span></div>
          </div>
          <div style={{ marginTop: 18 }}><KV items={[['Status', <Pill s={c.status} />], ['Low-balance alert at', money(c.threshold)], ['Completed deliveries', String(c.completedDeliveries)], ['Settlement', c.ach]]} /></div>
        </Pad></Card>
      )) : <Card title="Delivery Credits"><Empty title="No Delivery Credit pool" text="No canonical pool is recorded for this nonprofit." /></Card>)}
      {tab === 'capabilities' && (<>
        <Card title="Capabilities"><Pad><KV items={[['Pathways', o.pathways.join(', ')], ['Facilities', String(facs.length)]]} /></Pad></Card>
        {facs.length > 0 && <Card title="Facilities"><div className="tw"><table>
          <thead><tr><th>Facility</th><th>Pathway</th><th className="hide-sm">Capacity</th><th>Status</th></tr></thead>
          <tbody>{facs.map(f => <tr key={f.id}><td><Name name={f.name} id={f.id} /><small>{f.address}</small></td><td>{f.pathway}</td><td className="hide-sm">{f.capacity}</td><td><Pill s={f.status} /></td></tr>)}</tbody>
        </table></div></Card>}
      </>)}
      {tab === 'verification' && <Verification o={o} />}
      {tab === 'access' && (<>
        <Card title="Access"><Pad><KV items={[['Workspace access', <Pill s={o.access} />], ['Account', <Pill s={o.acct} />], ['Users with access', String(recs.filter(u => u.status === 'Active').length)], ['Access note', o.accessNote]]} /></Pad></Card>
        <Card title="Invitations">
          {(() => {
            const inv = invites.filter(i => i.org === o.name)
            return inv.length ? (
              <div className="tw"><table>
                <thead><tr><th>Invitee</th><th>Role</th><th>Status</th><th className="hide-sm">Expires</th><th /></tr></thead>
                <tbody>{inv.map(i => (
                  <tr key={i.id}><td><Name name={i.email} id={i.id} /></td><td>{i.role}</td><td><Pill s={i.status} /></td><td className="hide-sm">{i.expires}</td>
                    <td className="r">{/Sent|Pending/i.test(i.status) && <><button className="btn" onClick={() => resendInvite(i.id)}>Resend</button> <button className="btn dng" onClick={() => revokeInvite(i.id)}>Revoke</button></>}</td></tr>
                ))}</tbody>
              </table></div>
            ) : <Empty title="No invitations" text="No invitations are open for this organization." />
          })()}
        </Card>
      </>)}
      {tab === 'activity' && <Card title="Activity"><EventTable list={audit.filter(a => a.record === o.id || a.detail.includes(o.name) || a.detail.includes(o.id))} /></Card>}
      {tab === 'account' && (<>
        <Card title="Account status"><div className="acard">
          <div><b><Pill s={o.acct} /></b><span>{held ? `Users from this organization cannot sign in while the account is ${o.acct.toLowerCase()}.` : o.acct === 'Pending activation' ? 'Waiting for verification approval before it can be activated.' : 'Account is in good standing.'}</span></div>
          {held ? <button className="btn grn" onClick={() => ask('Active')}>Reactivate</button>
            : <div className="acts"><button className="btn" onClick={() => ask('Paused')}>Pause</button><button className="btn dng" onClick={() => ask('Suspended')}>Suspend</button></div>}
        </div></Card>
        <Card title="Internal notes" action={<button className="btn" onClick={() => openModal(<NoteDialog kind="org" id={o.id} />)}>Add note</button>}>
          {o.notes.length ? o.notes.map((n, i) => <div className="note" key={i}>{n.t}<small>{n.by} · {n.at}</small></div>)
            : <Empty title="No notes" text="Notes are visible to Savur administrators only." />}
        </Card>
      </>)}
    </>
  )
}

function Overview({ o, count, flagged }: { o: Org; count: number; flagged: boolean }) {
  const pairs: [string, React.ReactNode][] = [['Organization name', o.name], ['Organization ID', o.id], ['Plan', o.plan ?? ''], ['Primary contact', o.contactName], ['Email', o.email ?? ''], ['Phone', o.phone ?? ''], ['Created', o.created ?? ''], ['Last activity', o.activity ?? '']]
  if (o.k === 'bd') pairs.push(['Locations', o.locations != null ? `${o.locations} (${o.locActive} active, ${o.locPending} pending)` : ''], ['Billing', o.billing ?? ''], ['Documents', o.docs ?? ''], ['Sponsor Impact', o.siStatus ? `${o.siStatus} · expires ${o.siExpires}` : 'Not entitled'])
  if (o.k === 'np') pairs.push(['Legal name', o.legalName ?? ''], ['EIN', o.ein ?? ''], ['IRS status', o.irs ?? ''], ['Address', o.address ?? ''], ['Service area', o.area ?? ''], ['Savvi members', String(count)])
  if (o.k === 'up') pairs.push(['Pathways', o.pathways.join(', ')], ['Documents', o.docs ?? ''], ['Billing', o.billing ?? ''])
  return <>
    <Card title="Organization overview"><Pad><KV items={pairs} /></Pad></Card>
    {flagged && <Card title="Needs attention"><Pad><Pill s={o.acct !== 'Active' ? o.acct : 'Verification review'} /></Pad></Card>}
  </>
}

function Verification({ o }: { o: Org }) {
  const { openModal } = useStore()
  const ob = onboarding.find(x => x.id === o.id)
  const review = o.ver === 'Needs Review'
  return (
    <Card title="Verification" action={review && (
      <div className="acts">
        <button className="btn" onClick={() => openModal(<VerifyDialog id={o.id} to="Info" />)}>Request info</button>
        <button className="btn dng" onClick={() => openModal(<VerifyDialog id={o.id} to="Declined" />)}>Decline</button>
        <button className="btn grn" onClick={() => openModal(<VerifyDialog id={o.id} to="Approved" />)}>Approve</button>
      </div>)}>
      <Pad><KV items={[['Verification status', <Pill s={o.ver} />], ['Legal name', ob?.legal ?? o.legalName ?? ''], ['EIN', ob?.ein ?? o.ein ?? ''], ['IRS status', ob?.irs ?? o.irs ?? ''], ['Documents', ob?.files ?? o.docs ?? ''], ['Reviewer', ob?.reviewer ?? ''], ['Submitted', ob?.submitted ?? ''], ['Reason listed', ob?.reason ?? '']]} /></Pad>
      {ob?.notes && <div className="cb mu" style={{ borderTop: '1px solid var(--row)' }}>{ob.notes}</div>}
    </Card>
  )
}
