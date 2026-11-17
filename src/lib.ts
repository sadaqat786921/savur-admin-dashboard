export const money = (v: number) =>
  '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })
export const initials = (n: string) =>
  /system/i.test(n) ? 'SY' : n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
export const cnt = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`
export const uniq = (a: (string | null | undefined)[]) => a.filter((x, i): x is string => !!x && a.indexOf(x) === i)
export function pillClass(s: string | null | undefined) {
  const v = String(s ?? '')
  if (/^(active|approved|enabled|enforced|settled|good|complete|sent)/i.test(v)) return 'g'
  if (/suspend|declin|revok|inactive|returned|failed/i.test(v)) return 'r'
  if (/pause|hold|expired|warn/i.test(v)) return 'a'
  if (/pending|review|invited|not granted|not active|connected/i.test(v)) return 'b'
  return 'n'
}
