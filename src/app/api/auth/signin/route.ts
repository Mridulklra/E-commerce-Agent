
import { AuthService } from '@/app/services/authServices'
import { NextRequest,NextResponse } from 'next/server'

import { signinSchema, createResponse,updateProfileSchema } from '@/app/lib/utils'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password } = signinSchema.parse(body)
    
    // Authenticate user
    const { user, token } = await AuthService.signin(email, password)
    
    // Set cookie
    const response = NextResponse.json(
      { success: true, message: 'Signed in successfully', data: { user } }
    )
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    return response
  } catch (error: any) {
     return NextResponse.json(
      { success: false, message: error.message, data: null },
      { status: 400 }
    )
  }
}


