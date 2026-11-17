import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { attention } from '../derive'
import { cnt } from '../lib'
import { Back, Card, Empty, Head, Name, Pill } from '../components/ui'

export default function Attention() {
  const { orgs, users } = useStore()
  const nav = useNavigate()
  const att = attention(orgs, users)
  return (
    <>
      <Back to="/dashboard" label="Dashboard" />
      <Head title="Accounts Needing Attention" sub={`${cnt(att.length, 'account')} need a Savur decision`} />
      <Card>
        {att.length ? (
          <div className="tw"><table>
            <thead><tr><th>Account</th><th className="hide-sm">Type</th><th>Status</th><th /></tr></thead>
            <tbody>{att.map(r => (
              <tr key={r.id} className="go" tabIndex={0} onClick={() => nav(r.to)} onKeyDown={e => e.key === 'Enter' && nav(r.to)}>
                <td><Name name={r.name} id={r.id} /></td><td className="hide-sm">{r.type}</td><td><Pill s={r.status} /></td>
                <td className="r"><button className="btn" onClick={e => { e.stopPropagation(); nav(r.to) }}>Open</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <Empty title="All clear" text="No accounts need attention." />}
      </Card>
    </>
  )
}
