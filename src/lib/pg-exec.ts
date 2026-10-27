// Server-only: executes a supabase-like query descriptor against Postgres.
import { query as dbQuery } from './db'

export type FilterOp = 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt' | 'is' | 'in'
export interface Filter { col: string; op: FilterOp; val: any }

export interface QueryDesc {
  table: string
  action: 'select' | 'insert' | 'update' | 'delete'
  select?: string
  filters?: Filter[]
  values?: Record<string, any> | Record<string, any>[]
  order?: { col: string; ascending: boolean }
  limit?: number
  single?: boolean
  maybeSingle?: boolean
  head?: boolean
  count?: boolean
}

// Whitelisted tables (prevents arbitrary table access).
const TABLES = new Set([
  'users', 'categories', 'products', 'store_settings',
  'banners', 'resellers', 'commission_tiers', 'commissions', 'orders',
])

const IDENT = /^[a-z_][a-z0-9_]*$/i

function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`bad identifier: ${name}`)
  return `"${name}"`
}

// Parse a select string into base columns + embeds (foreign joins).
// Supports: "*", "a, b", "*, alias:other_table(f1, f2)", "alias:other_table(*)"
interface Embed { alias: string; table: string; cols: string }
function parseSelect(sel: string): { base: string[]; embeds: Embed[] } {
  const base: string[] = []
  const embeds: Embed[] = []
  let depth = 0, cur = ''
  const parts: string[] = []
  for (const ch of sel) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' }
    else cur += ch
  }
  if (cur.trim()) parts.push(cur)

  for (const raw of parts) {
    const p = raw.trim()
    const m = p.match(/^([a-z_][a-z0-9_]*)\s*:\s*([a-z_][a-z0-9_]*)\s*\((.*)\)$/i)
    if (m) {
      embeds.push({ alias: m[1], table: m[2], cols: m[3].trim() })
    } else {
      base.push(p)
    }
  }
  return { base, embeds }
}

function whereClause(filters: Filter[] | undefined, params: any[]): string {
  if (!filters || !filters.length) return ''
  const parts = filters.map(f => {
    const col = ident(f.col)
    if (f.op === 'is') {
      if (f.val === null) return `${col} is null`
      return `${col} is ${f.val ? 'true' : 'false'}`
    }
    if (f.op === 'in') {
      const arr = Array.isArray(f.val) ? f.val : [f.val]
      const ph = arr.map(v => { params.push(v); return `$${params.length}` })
      return `${col} in (${ph.join(',')})`
    }
    const opMap: Record<string, string> = { eq: '=', neq: '<>', gte: '>=', lte: '<=', gt: '>', lt: '<' }
    params.push(f.val)
    return `${col} ${opMap[f.op]} $${params.length}`
  })
  return 'where ' + parts.join(' and ')
}

function selectExpr(desc: QueryDesc): { expr: string; joins: string } {
  const sel = (desc.select || '*').trim()
  if (sel === '*') return { expr: `${ident(desc.table)}.*`, joins: '' }
  const { base, embeds } = parseSelect(sel)

  const cols: string[] = []
  for (const b of base) {
    if (b === '*') cols.push(`${ident(desc.table)}.*`)
    else cols.push(`${ident(desc.table)}.${ident(b)}`)
  }
  let joins = ''
  for (const e of embeds) {
    if (!TABLES.has(e.table)) throw new Error(`bad embed table: ${e.table}`)
    // FK assumed: base.<alias>_id -> embed.id  (e.g. reseller_id, category_id)
    const fk = `${e.alias}_id`
    const et = ident(e.table)
    const ea = ident(e.alias + '__j')
    const sub = e.cols === '*'
      ? `to_jsonb(${ea}.*)`
      : `jsonb_build_object(${e.cols.split(',').map(c => {
          const cc = c.trim()
          return `'${cc}', ${ea}.${ident(cc)}`
        }).join(', ')})`
    cols.push(`${sub} as ${ident(e.alias)}`)
    joins += ` left join ${et} ${ea} on ${ea}."id" = ${ident(desc.table)}.${ident(fk)}`
  }
  return { expr: cols.join(', '), joins }
}

export interface ExecResult { data: any; error: { message: string } | null; count: number | null }

export async function execQuery(desc: QueryDesc): Promise<ExecResult> {
  try {
    if (!TABLES.has(desc.table)) throw new Error(`table not allowed: ${desc.table}`)
    const t = ident(desc.table)

    if (desc.action === 'select') {
      const params: any[] = []
      if (desc.head && desc.count) {
        const where = whereClause(desc.filters, params)
        const rows = await dbQuery<{ c: number }>(`select count(*)::int as c from ${t} ${where}`, params)
        return { data: null, error: null, count: rows[0]?.c ?? 0 }
      }
      const { expr, joins } = selectExpr(desc)
      const where = whereClause(desc.filters, params)
      const order = desc.order ? `order by ${ident(desc.order.col)} ${desc.order.ascending ? 'asc' : 'desc'}` : ''
      const limit = desc.limit != null ? `limit ${Number(desc.limit)}` : (desc.single || desc.maybeSingle ? 'limit 1' : '')
      const sql = `select ${expr} from ${t}${joins} ${where} ${order} ${limit}`
      const rows = await dbQuery(sql, params)
      if (desc.single || desc.maybeSingle) {
        return { data: rows[0] ?? null, error: null, count: null }
      }
      return { data: rows, error: null, count: null }
    }

    if (desc.action === 'insert') {
      const vals = Array.isArray(desc.values) ? desc.values : [desc.values!]
      if (!vals.length) return { data: [], error: null, count: null }
      const cols = Object.keys(vals[0])
      const params: any[] = []
      const rowsSql = vals.map(v => {
        const ph = cols.map(c => { params.push(serial(v[c])); return `$${params.length}` })
        return `(${ph.join(',')})`
      })
      const sql = `insert into ${t} (${cols.map(ident).join(',')}) values ${rowsSql.join(',')} returning *`
      const rows = await dbQuery(sql, params)
      return { data: rows, error: null, count: null }
    }

    if (desc.action === 'update') {
      const v = desc.values as Record<string, any>
      const cols = Object.keys(v)
      const params: any[] = []
      const set = cols.map(c => { params.push(serial(v[c])); return `${ident(c)} = $${params.length}` }).join(', ')
      const where = whereClause(desc.filters, params)
      const sql = `update ${t} set ${set} ${where} returning *`
      const rows = await dbQuery(sql, params)
      return { data: rows, error: null, count: null }
    }

    if (desc.action === 'delete') {
      const params: any[] = []
      const where = whereClause(desc.filters, params)
      const sql = `delete from ${t} ${where} returning *`
      const rows = await dbQuery(sql, params)
      return { data: rows, error: null, count: null }
    }

    throw new Error('unknown action')
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'query error' }, count: null }
  }
}

function serial(v: any): any {
  if (v !== null && typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v)
  return v
}
