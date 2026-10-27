import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email & password wajib' }, { status: 400 })

    const norm = String(email).trim().toLowerCase()
    const user = await queryOne<{ id: string; email: string; password_hash: string }>(
      'select id, email, password_hash from users where email = $1',
      [norm],
    )
    if (!user) return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })

    const token = await signSession({ uid: user.id, email: user.email })
    const res = NextResponse.json({ user: { id: user.id, email: user.email } })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions)
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
