import { useState } from 'react'
import { useStore } from '../store'
import { TL } from '../data/seed'
import { money } from '../lib'
import { Head, Pill, Tabs } from '../components/ui'
import { PlanDialog } from '../components/dialogs'
import type { Kind } from '../types'

const KINDS: Kind[] = ['bd', 'np', 'up']

export default function Plans() {
  const { plans, openModal, togglePlan } = useStore()
  const [k, setK] = useState<Kind>('bd')
  return (
    <>
      <Head title="Plan Management" sub="Pricing plans for each partner type">
        <button className="btn grn" onClick={() => openModal(<PlanDialog kind={k} index={-1} />)}>+ Add plan</button>
      </Head>
      <Tabs tabs={KINDS.map(x => ({ id: x, label: TL[x] }))} value={k} onChange={t => setK(t as Kind)} />
      <div className="plans">
        {plans[k].map((p, i) => {
          const off = p.st === 'Paused'
          return (
            <div className={`plan${off ? ' off' : ''}`} key={p.n + i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><h3>{p.n}</h3><Pill s={p.st} /></div>
              <div className="price">{money(p.p)} <small>/ month</small></div>
              <div className="mu" style={{ fontSize: 12 }}>{p.ag != null ? `12-month agreement ${money(p.ag)}/mo · Annual prepay ${money(p.pre ?? 0)}` : p.note ?? ''}</div>
              <ul>{p.l.map(x => <li key={x}>{x}</li>)}</ul>
              <div className="a">
                <button className="btn" onClick={() => openModal(<PlanDialog kind={k} index={i} />)}>Edit</button>
                <button className="btn" onClick={() => togglePlan(k, i)}>{off ? 'Activate' : 'Pause'}</button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
