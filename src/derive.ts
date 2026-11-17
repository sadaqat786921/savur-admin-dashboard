import type { Kind, Org, User } from './types'
import { TL } from './data/seed'
import { savviAccountCount } from './data/seed'

export interface AttnRow { name: string; id: string; type: string; status: string; to: string; rank: number }

export function attention(orgs: Org[], users: User[]): AttnRow[] {
  const rows: AttnRow[] = []
  orgs.forEach(o => {
    let st: string | null = null
    if (o.acct === 'Suspended' || o.acct === 'Paused') st = o.acct
    else if (o.acct === 'Pending activation') st = 'Pending activation'
    else if (o.ver === 'Needs Review') st = 'Verification review'
    if (st) rows.push({ name: o.name, id: o.id, type: TL[o.k], status: st, to: `/${o.k}/${o.id}`, rank: /Suspended|Paused/.test(st) ? 0 : 1 })
  })
  users.forEach(u => {
    if (u.status !== 'Active') rows.push({ name: u.name, id: u.id, type: 'User', status: u.status, to: `/users/${u.id}`, rank: /Suspended|Paused/.test(u.status) ? 0 : 1 })
  })
  return rows.sort((a, b) => a.rank - b.rank)
}

export function stats(orgs: Org[], users: User[]) {
  const n: Record<Kind, number> = { bd: 0, np: 0, up: 0 }
  orgs.forEach(o => n[o.k]++)
  const adm = users.filter(u => u.internal).length
  const npAll = orgs.filter(o => o.k === 'np')
  const npAct = npAll.filter(o => o.acct === 'Active').length
  const held = orgs.filter(o => o.acct === 'Suspended' || o.acct === 'Paused').length + users.filter(u => u.status === 'Suspended' || u.status === 'Paused').length
  return { orgs: orgs.length, n, users: users.length + savviAccountCount, part: users.length - adm, sv: savviAccountCount, adm, npAll: npAll.length, npAct, held }
}
