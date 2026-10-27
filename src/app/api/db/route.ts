import { NextResponse } from 'next/server'
import { execQuery, type QueryDesc } from '@/lib/pg-exec'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'

const PUBLIC_READ = new Set(['products', 'categories', 'store_settings', 'banners'])
const ADMIN_WRITE = new Set(['products', 'categories', 'store_settings', 'banners', 'commission_tiers'])

export async function POST(req: Request) {
  let desc: QueryDesc
  try {
    desc = await req.json()
  } catch {
    return NextResponse.json({ data: null, error: { message: 'bad request' }, count: null }, { status: 400 })
  }

  // never expose the users (credentials) table to the generic client API
  if (desc.table === 'users') {
    return NextResponse.json({ data: null, error: { message: 'forbidden' }, count: null }, { status: 403 })
  }

  const session = await getSession()
  let role: string | null = null
  if (session) {
    const r = await queryOne<{ role: string }>('select role from resellers where user_id = $1', [session.uid])
    role = r?.role ?? null
  }
  const isAdmin = role === 'admin' || role === 'owner'
  const deny = (msg: string, code = 403) =>
    NextResponse.json({ data: null, error: { message: msg }, count: null }, { status: code })

  if (desc.action === 'select') {
    if (!PUBLIC_READ.has(desc.table) && !session) return deny('auth required', 401)
  } else if (desc.action === 'insert') {
    const publicInsert = desc.table === 'orders' || desc.table === 'resellers'
    if (ADMIN_WRITE.has(desc.table)) { if (!isAdmin) return deny('admin only') }
    else if (!publicInsert && !session) return deny('auth required', 401)
  } else if (desc.action === 'update' || desc.action === 'delete') {
    if (ADMIN_WRITE.has(desc.table)) { if (!isAdmin) return deny('admin only') }
    else if (!session) return deny('auth required', 401)
  }

  const result = await execQuery(desc)
  const status = result.error ? 400 : 200
  return NextResponse.json(result, { status })
}
