import { NextResponse, NextRequest } from 'next/server'
import { verifyToken } from '@/app/lib/utils'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware triggered for:', pathname)

  // Protected routes
  const protectedRoutes = ['/api/auth/me', '/api/auth/update-profile']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth-token')?.value
    
    console.log('🔑 Auth header:', authHeader)
    console.log('🍪 Cookie token:', cookieToken ? 'Present' : 'Not present')
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken
    
    console.log('🎫 Final token:', token ? 'Present' : 'Not present')

    if (!token) {
      console.log('❌ No token provided')
      return NextResponse.json(
        { success: false, message: 'Access denied. No token provided.' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('🔓 Decoded token:', decoded)
    
    if (!decoded) {
      console.log('❌ Invalid token')
      return NextResponse.json(
        { success: false, message: 'Invalid token.' },
        { status: 401 }
      )
    }

    console.log('✅ Token valid, user:', decoded.userId)

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('user-id', decoded.userId.toString())
    requestHeaders.set('user-email', decoded.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/auth/me',
    '/api/auth/update-profile'
  ]
}