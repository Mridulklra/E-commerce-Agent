import { AuthService } from '@/app/services/authServices'
import { NextRequest } from 'next/server'

import { createResponse ,signupSchema} from '@/app/lib/utils'
// app/api/auth/update-profile/route.ts


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    
    // Create user with address
    const { user, token } = await AuthService.signup(validatedData)
    
    // Set cookie
    const response = createResponse(true, 'User created successfully', { user }, 201)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    return response
  } catch (error: any) {
    return createResponse(false, error.message, null, 400)
  }
}
