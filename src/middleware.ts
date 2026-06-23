import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Redirect bare domain to www (301 permanent)
  if (hostname === 'shepherdaitech.com') {
    const newUrl = new URL(url.pathname + url.search, 'https://www.shepherdaitech.com')
    return NextResponse.redirect(newUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
