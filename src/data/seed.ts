import raw from './savur.json'
import type { Org, User, SavviMember, Credit, Facility, Onboarding, AuditEvent, Invitation, Plan, Kind } from '../types'

export const TL: Record<Kind, string> = { bd: 'Business Donor', np: 'Nonprofit', up: 'Upcycle Partner' }
export const TP: Record<Kind, string> = { bd: 'Business Donors', np: 'Nonprofit Organizations', up: 'Upcycle Partners' }

export const seedOrgs = (raw.orgs as unknown as Omit<Org, 'notes'>[]).map(o => ({ ...o, notes: [] })) as Org[]
export const seedUsers = (raw.users as unknown as Omit<User, 'notes'>[]).map(u => ({ ...u, notes: [] })) as User[]
export const savviMembers = raw.savviMembers as unknown as SavviMember[]
export const credits = raw.credits as unknown as Credit[]
export const facilities = raw.facilities as unknown as Facility[]
export const onboarding = raw.onboarding as unknown as Onboarding[]
export const seedAudit = raw.audit as unknown as AuditEvent[]
export const seedInvites = raw.invitations as unknown as Invitation[]
export const savviAccountCount: number = raw.savviAccounts

export const seedPlans: Record<Kind, Plan[]> = {
  bd: [
    { n: 'Savur Network', p: 0, note: 'Free network plan', l: ['1 location · 2 users', 'Ad-hoc food donation and inedible diversion', 'Approved partner connections and basic matching'], st: 'Active' },
    { n: 'Essential', p: 795, ag: 715.5, pre: 8109, l: ['1 location · 3 users', 'Edible and inedible recovery workflows', 'Chain of custody and verified weights'], st: 'Active' },
    { n: 'Growth', p: 1495, ag: 1345.5, pre: 15249, l: ['2 locations (max 6) · 5 users', 'Everything in Essential', 'Recurring templates and advanced reports'], st: 'Active' },
    { n: 'Professional', p: 2995, ag: 2695.5, pre: 30549, l: ['5 locations (max 25) · 10 users', 'Everything in Growth', 'Role-based access and audit exports'], st: 'Active' },
  ],
  np: [
    { n: 'Savur Network', p: 0, note: 'Free network plan', l: ['1 location · 2 users', 'Review, accept or decline eligible recovery', 'Record receipts and received weight'], st: 'Active' },
    { n: 'Basic', p: 350, ag: 330, pre: 3840, l: ['1 location · 2 users · $150 Delivery Funding', 'Savvi household request fulfillment', 'Food Access Alerts'], st: 'Active' },
    { n: 'Plus', p: 650, ag: 610, pre: 7080, l: ['1 location · 4 users · $250 Delivery Funding', 'Everything in Basic', 'Exports and full Grant Support Report'], st: 'Active' },
    { n: 'Enterprise', p: 1100, ag: 1030, pre: 11940, l: ['Up to 4 locations · 10 users · $400 Delivery Funding', 'Organization and location dashboards', 'Custom reporting by agreement'], st: 'Active' },
  ],
  up: [
    { n: 'Savur Network', p: 0, note: 'Free network plan', l: ['Network participation', 'Approved partner connections'], st: 'Active' },
    { n: 'Verified', p: 350, ag: 315, pre: 3570, l: ['Verified Upcycle Partner listing', 'Capability and facility management', 'Intake and diversion records'], st: 'Active' },
  ],
}
