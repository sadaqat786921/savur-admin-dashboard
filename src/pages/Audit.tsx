import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../store'
import { cnt, uniq } from '../lib'
import { Card, Head } from '../components/ui'

export default function Audit() {
  const { audit, toast } = useStore()
  const [q, setQ] = useState(''); const [actor, setActor] = useState('')
  const rows = useMemo(() => audit.filter(a => (!actor || a.user === actor) && (!q || `${a.action} ${a.record} ${a.detail} ${a.user}`.toLowerCase().includes(q.toLowerCase()))), [audit, q, actor])
  const exportCsv = () => {
    const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
    const csv = ['When,Actor,Action,Record,Details', ...rows.map(a => [a.ts, a.user, a.action, a.record, a.detail].map(esc).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a'); a.href = url; a.download = 'savur-audit.csv'; a.click(); URL.revokeObjectURL(url)
    toast(`Exported ${cnt(rows.length, 'event')}`)
  }
  return (
    <>
      <Head title="Audit & Activity" sub="Recorded administrator and platform actions"><button className="btn" onClick={exportCsv}>Export CSV</button></Head>
      <Card>
        <div className="tools">
          <label className="search"><span className="sr">Search</span><Search aria-hidden />
            <input className="in" placeholder="Search actions or records" value={q} onChange={e => setQ(e.target.value)} autoComplete="off" />
          </label>
          <label><span className="sr">Actor</span>
            <select className="sel" aria-label="Actor" value={actor} onChange={e => setActor(e.target.value)}>
              <option value="">Actor: All</option>{uniq(audit.map(a => a.user)).map(o => <option key={o}>{o}</option>)}
            </select>
          </label>
          <span className="cnt">{cnt(rows.length, 'event')}</span>
        </div>
        <div className="tw"><table>
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th className="hide-sm">Record</th><th className="hide-md">Details</th></tr></thead>
          <tbody>{rows.length ? rows.map((a, i) => (
            <tr key={i}><td>{a.ts}</td><td>{a.user}</td><td><strong style={{ fontWeight: 600 }}>{a.action}</strong></td><td className="hide-sm">{a.record}</td><td className="hide-md">{a.detail}</td></tr>
          )) : <tr><td colSpan={5}><div className="empty"><b>No events</b>No events match your search.</div></td></tr>}</tbody>
        </table></div>
      </Card>
    </>
  )
}
