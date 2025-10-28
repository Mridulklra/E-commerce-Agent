// src/app/api/agent/recommendations/[id]/route.ts
import { AgentService } from '@/app/services/agentService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const recommendations = await AgentService.getRecommendations(productId)

    return NextResponse.json({
      success: true,
      data: { recommendations }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}