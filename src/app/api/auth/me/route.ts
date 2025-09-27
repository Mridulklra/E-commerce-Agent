import { AuthService } from '@/app/services/authServices'
import { NextRequest } from 'next/server'

import { signinSchema, createResponse,updateProfileSchema } from '@/app/lib/utils'
export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const user = await AuthService.getUserById(userId)
    
    return createResponse(true, 'User fetched successfully', { user })
  } catch (error: any) {
    return createResponse(false, error.message, null, 404)
  }
}
