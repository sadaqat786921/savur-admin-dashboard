import { useState } from 'react'
import { NOTIF_DESC, useStore } from '../store'
import { Card, KV, Head, Name, Pad, Pill, Tabs } from '../components/ui'
import { InviteDialog } from '../components/dialogs'

const TABS = [{ id: 'profile', label: 'Profile & Preferences' }, { id: 'notif', label: 'Notifications' }, { id: 'team', label: 'Team Members' }]
const ZONES = ['Eastern Time (US)', 'Central Time (US)', 'Mountain Time (US)', 'Pacific Time (US)']

export default function Settings() {
  const { me, notif, admins, saveProfile, toggleNotif, revokeAdmin, openModal } = useStore()
  const [tab, setTab] = useState('profile')
  const [name, setName] = useState(me.name); const [lang, setLang] = useState(me.lang); const [tz, setTz] = useState(me.tz)
  return (
    <>
      <Head title="Settings" sub="Your profile, notifications and team" />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'profile' && (<>
        <Card title="Profile & Preferences"><Pad>
          <div className="form">
            <label className="fld">Name<input className="in" value={name} onChange={e => setName(e.target.value)} /></label>
            <label className="fld">Email<input className="in" value={me.email} disabled /><small>Managed by the identity provider</small></label>
            <label className="fld">Role<input className="in" value={me.role} disabled /></label>
            <label className="fld">Language<select className="sel" style={{ width: '100%' }} value={lang} onChange={e => setLang(e.target.value)}><option>English</option><option>Español</option></select></label>
            <label className="fld">Time zone<select className="sel" style={{ width: '100%' }} value={tz} onChange={e => setTz(e.target.value)}>{ZONES.map(z => <option key={z}>{z}</option>)}</select></label>
          </div>
          <div className="acts" style={{ marginTop: 20 }}><button className="btn pri" onClick={() => saveProfile({ name: name.trim() || me.name, lang, tz })}>Save changes</button></div>
        </Pad></Card>
        <Card title="Security"><Pad><KV items={[['Password', 'Managed by the identity provider'], ['Multi-factor authentication', <Pill s="Enforced" />]]} /></Pad></Card>
      </>)}
      {tab === 'notif' && (
        <Card title="Notifications">
          {Object.keys(notif).map(k => (
            <div className="sw" key={k}>
              <div><b>{k}</b><span>{NOTIF_DESC[k]}</span></div>
              <button className="tg" role="switch" aria-checked={notif[k]} aria-label={k} onClick={() => toggleNotif(k)} />
            </div>
          ))}
        </Card>
      )}
      {tab === 'team' && (
        <Card title="Savur administrators" action={<button className="btn pri" onClick={() => openModal(<InviteDialog />)}>Invite administrator</button>}>
          <div className="tw"><table>
            <thead><tr><th>Administrator</th><th className="hide-sm">Email</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>{admins.map((a, i) => (
              <tr key={a.id}><td><Name name={a.name} id={a.id} /></td><td className="hide-sm">{a.email}</td><td>{a.role}</td><td><Pill s={a.status} /></td>
                <td className="r">{a.status === 'Invited' && <button className="btn dng" onClick={() => revokeAdmin(i)}>Revoke</button>}</td></tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}
    </>
  )
}
