import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'katresna_session'

async function hasSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // admin subdomain: redirect non-/admin paths to /admin equivalent
  if (hostname.startsWith('admin.') && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/uploads')) {
    const target = pathname === '/' ? '/admin' : '/admin' + pathname
    return NextResponse.redirect(new URL(target, request.url))
  }

  // mitra subdomain: redirect non-/mitra paths to /mitra equivalent
  if (hostname.startsWith('mitra.') && !pathname.startsWith('/mitra') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/uploads') && !pathname.match(/\.[a-z0-9]+$/i)) {
    const target = pathname === '/' ? '/mitra' : '/mitra' + pathname
    return NextResponse.redirect(new URL(target, request.url))
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!(await hasSession(request))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|couriers/|images/).*)'],
}
