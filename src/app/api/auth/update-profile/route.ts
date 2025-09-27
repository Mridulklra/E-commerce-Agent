import { AuthService } from '@/app/services/authServices'
import { NextRequest } from 'next/server'

import { signinSchema, createResponse,updateProfileSchema } from '@/app/lib/utils'
export async function PUT(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)
    
    // Update user
    const user = await AuthService.updateUser(userId, validatedData)
    
    return createResponse(true, 'Profile updated successfully', { user })
  } catch (error: any) {
    return createResponse(false, error.message, null, 400)
  }
}
