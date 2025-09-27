import { AuthService } from '@/app/services/authServices'
import { NextRequest, NextResponse } from 'next/server'
import { updateProfileSchema } from '@/app/lib/utils'

export async function PUT(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)
    
    // Update user
    const user = await AuthService.updateUser(userId, validatedData)
    
    return NextResponse.json(
      { success: true, message: 'Profile updated successfully', data: { user } }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, data: null },
      { status: 400 }
    )
  }
}         