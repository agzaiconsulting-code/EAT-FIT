import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? 'dev-secret-change-me')

const PUBLIC_PATHS = ['/pin', '/signup', '/setup-pin', '/auth', '/api']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    /\.(png|ico|svg|jpg|jpeg|webp)$/.test(pathname)

  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('eatfit_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/pin', request.url))
  }

  try {
    await jwtVerify(token, SECRET())
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/pin', request.url))
    res.cookies.delete('eatfit_session')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
