import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { hashPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email & password wajib' }, { status: 400 })
    if (String(password).length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

    const norm = String(email).trim().toLowerCase()
    const existing = await queryOne<{ id: string }>('select id from users where email = $1', [norm])
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

    const hash = await hashPassword(password)
    const user = await queryOne<{ id: string; email: string }>(
      'insert into users (email, password_hash) values ($1, $2) returning id, email',
      [norm, hash],
    )
    if (!user) return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 })

    const token = await signSession({ uid: user.id, email: user.email })
    const res = NextResponse.json({ user: { id: user.id, email: user.email } })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions)
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
