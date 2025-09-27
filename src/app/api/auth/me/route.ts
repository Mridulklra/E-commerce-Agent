import { AuthService } from '@/app/services/authServices'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const user = await AuthService.getUserById(userId)
    
    return NextResponse.json(
      { success: true, message: 'User fetched successfully', data: { user } }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, data: null },
      { status: 404 }
    )
  }
}