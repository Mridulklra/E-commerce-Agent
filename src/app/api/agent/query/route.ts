// src/app/api/agent/query/route.ts
import { AgentService } from '@/app/services/agentService'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, conversationHistory } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    const response = await AgentService.processQuery({
      query,
      conversationHistory
    })

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}