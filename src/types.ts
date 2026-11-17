export type Kind = 'bd' | 'np' | 'up'
export interface Note { t: string; by: string; at: string }
export interface Org {
  id: string; name: string; k: Kind; plan: string | null
  ver: string; access: string; accessNote: string; acct: string
  contactName: string; email: string | null; phone: string | null
  created: string | null; activity: string | null
  locations: number | null; locActive: number | null; locPending: number | null
  billing: string | null; docs: string | null; siStatus: string | null; siExpires: string | null
  legalName: string | null; ein: string | null; irs: string | null; address: string | null; area: string | null
  pathways: string[]
  notes: Note[]
}
export interface Membership { org: string; orgId: string; role: string; status: string; since: string }
export type Perm = { view: boolean; act: boolean; man: boolean }
export interface User {
  id: string; name: string; email: string; org: string; role: string; scope: string; status: string
  mfa: string; last: string; workspaces: string; invited: string; jurisdictions: string[] | null
  perms: Record<string, Perm> | null; responsibility: string | null
  memberships: Membership[]; internal: boolean; notes: Note[]
}
export interface SavviMember { id: string; label: string; name: string; zip: string; size: number; status: string; joined: string; npOrgId: string }
export interface Credit { id: string; npOrgId: string; funded: number; available: number; reserved: number; used: number; completedDeliveries: number; ach: string; threshold: number; status: string }
export interface Facility { id: string; name: string; orgId: string; address: string; pathway: string; capacity: string; status: string }
export interface Onboarding { id: string; submitted: string; status: string; reason: string; reviewer: string; ein: string; legal: string; irs: string; files: string; notes: string }
export interface AuditEvent { ts: string; user: string; action: string; record: string; detail: string }
export interface Invitation { id: string; email: string; org: string; workspace: string; role: string; status: string; expires: string; attempts: number }
export interface Plan { n: string; p: number; ag?: number; pre?: number; note?: string; l: string[]; st: 'Active' | 'Paused' }
export interface Admin { id: string; name: string; email: string; role: string; status: string }
