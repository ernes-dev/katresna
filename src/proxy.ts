import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // admin subdomain: redirect non-/admin paths to /admin equivalent
  if (hostname.startsWith('admin.') && !pathname.startsWith('/admin')) {
    const target = pathname === '/' ? '/admin' : '/admin' + pathname
    return NextResponse.redirect(new URL(target, request.url))
  }

  // mitra subdomain: redirect non-/mitra paths to /mitra equivalent
  if (hostname.startsWith('mitra.') && !pathname.startsWith('/mitra') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.match(/\.[a-z0-9]+$/i)) {
    const target = pathname === '/' ? '/mitra' : '/mitra' + pathname
    return NextResponse.redirect(new URL(target, request.url))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|couriers/|images/).*)',],
}
