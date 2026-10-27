import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/katresna-uploads'
const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '_')

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'auth required' }, { status: 401 })

  const { bucket, paths } = await req.json()
  const b = safe(String(bucket || ''))
  if (!b || !Array.isArray(paths)) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  for (const p of paths) {
    const fname = safe(String(p).split('/').pop() || '')
    if (!fname) continue
    try { await fs.unlink(path.join(UPLOAD_DIR, b, fname)) } catch {}
  }
  return NextResponse.json({ data: paths })
}
