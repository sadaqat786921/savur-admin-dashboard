import { useNavigate } from 'react-router-dom'
import { Building2, Users, Heart, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStore } from '../store'
import { attention, stats } from '../derive'
import { Avatar, Head, Name, Pill } from '../components/ui'

interface KpiProps {
  label: string; icon: ReactNode; bg: string; fg: string; num: number; numColor?: string; warn?: boolean
  bar: [number, string][]; legend: [string, string][]; to: string
}
function Kpi({ label, icon, bg, fg, num, numColor, warn, bar, legend, to }: KpiProps) {
  const nav = useNavigate()
  return (
    <button className={`k${warn ? ' warn' : ''}`} onClick={() => nav(to)} aria-label={`${label}: ${num}. ${legend.map(l => l[0]).join(', ')}`}>
      <div className="t"><label>{label}</label><div className="ic" style={{ background: bg, color: fg }}>{icon}</div></div>
      <div className="num" style={numColor ? { color: numColor } : undefined}>{num}</div>
      <div className="bar">{bar.map(([w, c], i) => <i key={i} style={{ width: `${w}%`, background: c }} />)}</div>
      <div className="cap">{legend.map(([t, c]) => <em key={t} style={{ ['--c' as string]: c }}>{t}</em>)}</div>
    </button>
  )
}
const pct = (v: number, t: number) => (t ? Math.round((v * 1000) / t) / 10 : 0)

export default function Dashboard() {
  const { orgs, users, audit } = useStore()
  const nav = useNavigate()
  const s = stats(orgs, users)
  const att = attention(orgs, users)
  return (
    <>
      <Head title="Dashboard" sub="Platform overview for Savur administrators" />
      <section className="kpis">
        <Kpi label="Total Organizations" icon={<Building2 />} bg="#EAF0F8" fg="#01284D" num={s.orgs} to="/bd"
          bar={[[pct(s.n.bd, s.orgs), '#01284D'], [pct(s.n.np, s.orgs), '#29E050'], [pct(s.n.up, s.orgs), '#00BDFF']]}
          legend={[[`${s.n.bd} Donors`, '#01284D'], [`${s.n.np} Nonprofits`, '#29E050'], [`${s.n.up} Upcycle`, '#00BDFF']]} />
        <Kpi label="Total Users" icon={<Users />} bg="#E6F6FD" fg="#0284C7" num={s.users} to="/users"
          bar={[[pct(s.part, s.users), '#01284D'], [pct(s.sv, s.users), '#29E050'], [pct(s.adm, s.users), '#00BDFF']]}
          legend={[[`${s.part} Partner`, '#01284D'], [`${s.sv} Savvi`, '#29E050'], [`${s.adm} Admins`, '#00BDFF']]} />
        <Kpi label="Active Nonprofits" icon={<Heart />} bg="#E8FBEE" fg="#16A34A" num={s.npAct} to="/np"
          bar={[[pct(s.npAct, s.npAll), '#29E050'], [pct(s.npAll - s.npAct, s.npAll), '#E4E9F1']]}
          legend={[[`${s.npAct} of ${s.npAll} nonprofits active`, '#29E050']]} />
        <Kpi label="Suspended or Paused" icon={<AlertTriangle />} bg="#FFF4DD" fg="#D97706" num={s.held} numColor="#B45309" warn to="/attention"
          bar={[[100, '#F59E0B']]} legend={[['Accounts needing a Savur decision', '#F59E0B']]} />
      </section>
      <section className="row2">
        <div className="card">
          <div className="ch"><h2>Accounts Needing Attention</h2>
            {att.length > 6 && <button className="link" onClick={() => nav('/attention')}>View all ({att.length}) →</button>}
          </div>
          <div className="tw"><table>
            <thead><tr><th>Account</th><th className="hide-sm">Type</th><th>Status</th><th /></tr></thead>
            <tbody>
              {att.slice(0, 6).map(r => (
                <tr key={r.id} className="go" tabIndex={0} onClick={() => nav(r.to)} onKeyDown={e => e.key === 'Enter' && nav(r.to)}>
                  <td><Name name={r.name} id={r.id} /></td><td className="hide-sm">{r.type}</td><td><Pill s={r.status} /></td>
                  <td className="r"><button className="btn" aria-label={`Open ${r.name}`} onClick={e => { e.stopPropagation(); nav(r.to) }}>Open</button></td>
                </tr>
              ))}
              {!att.length && <tr><td colSpan={4}><div className="empty"><b>All clear</b>No accounts need attention.</div></td></tr>}
            </tbody>
          </table></div>
        </div>
        <div className="card">
          <div className="ch"><h2>Recent Activity</h2><button className="link" onClick={() => nav('/audit')}>View all →</button></div>
          {audit.slice(0, 5).map((a, i) => (
            <div className="ev" key={i}>
              <Avatar name={a.user} sys={/system/i.test(a.user)} />
              <div><b>{a.action}</b><span>{a.user}{a.record && a.record !== '—' ? ` · ${a.record}` : ''}{a.detail ? ` — ${a.detail}` : ''}</span></div>
              <time>{String(a.ts).replace('Today, ', '')}</time>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
