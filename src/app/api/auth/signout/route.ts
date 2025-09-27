import { AuthService } from '@/app/services/authServices'
import { NextRequest } from 'next/server'

import { signinSchema, createResponse,updateProfileSchema } from '@/app/lib/utils'
export async function POST() {
  const response = createResponse(true, 'Signed out successfully')
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })
  
  return response
}