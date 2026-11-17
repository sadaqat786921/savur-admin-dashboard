import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../store'
import { TP } from '../data/seed'
import { savviMembers } from '../data/seed'
import { cnt, uniq } from '../lib'
import { Card, Head, Name, Pill } from '../components/ui'
import type { Kind } from '../types'

function Select({ label, opts, value, onChange }: { label: string; opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="sr">{label}</span>
      <select className="sel" aria-label={label} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{label}: All</option>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  )
}

export default function Directory({ kind }: { kind: 'users' | Kind }) {
  const { orgs, users } = useStore()
  const nav = useNavigate()
  const isU = kind === 'users'
  const [q, setQ] = useState(''); const [f1, setF1] = useState(''); const [f2, setF2] = useState('')

  const userRows = useMemo(() => users.filter(u => {
    const hay = `${u.name} ${u.id} ${u.email} ${u.org}`.toLowerCase()
    return (!q || hay.includes(q.toLowerCase())) && (!f1 || u.status === f1) && (!f2 || (u.internal ? 'Savur administrator' : 'Organization user') === f2)
  }), [users, q, f1, f2])
  const orgRows = useMemo(() => orgs.filter(o => o.k === kind && (() => {
    const hay = `${o.name} ${o.id} ${o.contactName} ${o.email ?? ''}`.toLowerCase()
    return (!q || hay.includes(q.toLowerCase())) && (!f1 || o.acct === f1) && (!f2 || o.ver === f2)
  })()), [orgs, kind, q, f1, f2])

  const pool = isU ? users : orgs.filter(o => o.k === kind)
  const f1opts = uniq(pool.map(x => ('acct' in x ? x.acct : x.status)))
  const f2opts = isU ? ['Savur administrator', 'Organization user'] : uniq(orgs.filter(o => o.k === kind).map(o => o.ver))
  const n = isU ? userRows.length : orgRows.length
  const title = isU ? 'Users' : TP[kind as Kind]

  return (
    <>
      <Head title={title} sub={isU ? 'Every user account and Savur administrator' : `All ${title.toLowerCase()} and their account status`} />
      <Card>
        <div className="tools">
          <label className="search"><span className="sr">Search</span><Search aria-hidden />
            <input className="in" placeholder={isU ? 'Search name, email or organization' : 'Search name or ID'} value={q} onChange={e => setQ(e.target.value)} autoComplete="off" />
          </label>
          <Select label={isU ? 'Status' : 'Account'} opts={f1opts} value={f1} onChange={setF1} />
          <Select label={isU ? 'Type' : 'Verification'} opts={f2opts} value={f2} onChange={setF2} />
          <span className="cnt">{cnt(n, isU ? 'user' : 'organization')}</span>
        </div>
        <div className="tw"><table>
          <thead>{isU
            ? <tr><th>User</th><th className="hide-md">Email</th><th>Organization</th><th className="hide-lg">Role</th><th>Status</th><th /></tr>
            : <tr><th>Organization</th><th className="hide-md">Primary contact</th><th className="hide-lg">{kind === 'bd' ? 'Locations' : kind === 'np' ? 'Savvi members' : 'Capabilities'}</th><th className="hide-sm">Verification</th><th>Account</th><th /></tr>}
          </thead>
          <tbody>
            {isU && userRows.map(u => (
              <tr key={u.id} className="go" tabIndex={0} onClick={() => nav(`/users/${u.id}`)} onKeyDown={e => e.key === 'Enter' && nav(`/users/${u.id}`)}>
                <td><Name name={u.name} id={u.id} /></td><td className="hide-md">{u.email}</td><td>{u.org}</td><td className="hide-lg">{u.role}</td><td><Pill s={u.status} /></td>
                <td className="r"><button className="btn" onClick={e => { e.stopPropagation(); nav(`/users/${u.id}`) }}>View</button></td>
              </tr>
            ))}
            {!isU && orgRows.map(o => (
              <tr key={o.id} className="go" tabIndex={0} onClick={() => nav(`/${o.k}/${o.id}`)} onKeyDown={e => e.key === 'Enter' && nav(`/${o.k}/${o.id}`)}>
                <td><Name name={o.name} id={o.id} /></td>
                <td className="hide-md">{o.contactName ? <><strong style={{ fontWeight: 500 }}>{o.contactName}</strong><small>{o.email}</small></> : <span className="mu">Not recorded</span>}</td>
                <td className="hide-lg">{kind === 'bd' ? (o.locations != null ? cnt(o.locations, 'location') : '—') : kind === 'np' ? `${savviMembers.filter(m => m.npOrgId === o.id).length} Savvi` : (o.pathways.join(', ') || '—')}</td>
                <td className="hide-sm"><Pill s={o.ver} /></td><td><Pill s={o.acct} /></td>
                <td className="r"><button className="btn" onClick={e => { e.stopPropagation(); nav(`/${o.k}/${o.id}`) }}>View</button></td>
              </tr>
            ))}
            {!n && <tr><td colSpan={6}><div className="empty"><b>No matches</b>Try a different search or clear the filters.</div></td></tr>}
          </tbody>
        </table></div>
      </Card>
    </>
  )
}
