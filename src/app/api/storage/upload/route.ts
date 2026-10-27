import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'

export const runtime = 'nodejs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/katresna-uploads'
const ADMIN_BUCKETS = new Set(['banners', 'products'])

function safe(seg: string) {
  return seg.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'auth required' }, { status: 401 })

  const form = await req.formData()
  const bucket = safe(String(form.get('bucket') || ''))
  const rawPath = String(form.get('path') || '')
  const file = form.get('file') as File | null
  if (!bucket || !file) return NextResponse.json({ error: 'bucket & file wajib' }, { status: 400 })

  if (ADMIN_BUCKETS.has(bucket)) {
    const r = await queryOne<{ role: string }>('select role from resellers where user_id = $1', [session.uid])
    const isAdmin = r?.role === 'admin' || r?.role === 'owner'
    if (!isAdmin) return NextResponse.json({ error: 'admin only' }, { status: 403 })
  }

  const fname = safe(rawPath.split('/').pop() || `${Date.now()}`)
  const dir = path.join(UPLOAD_DIR, bucket)
  await fs.mkdir(dir, { recursive: true })
  const buf = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(dir, fname), buf)

  return NextResponse.json({ path: fname, publicUrl: `/uploads/${bucket}/${fname}` })
}
