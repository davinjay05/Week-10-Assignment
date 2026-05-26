import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/']
const publicRoutes = ['/login', '/register', '/docs']

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.includes(path)
  const isPublic = publicRoutes.includes(path)

  const session = req.cookies.get('session')?.value

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublic && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
