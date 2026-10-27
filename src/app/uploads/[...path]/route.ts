import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/katresna-uploads'

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
}

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segs } = await ctx.params
  const clean = segs.map(s => s.replace(/[^a-zA-Z0-9._-]/g, '_'))
  const file = path.join(UPLOAD_DIR, ...clean)
  try {
    const buf = await fs.readFile(file)
    const ext = path.extname(file).toLowerCase()
    return new NextResponse(buf as any, {
      headers: {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
