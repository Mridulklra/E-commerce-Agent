// src/app/api/orders/route.ts (FIXED - Main order operations)
import { OrderService } from '@/app/services/orderService'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createOrderSchema = z.object({
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingState: z.string().min(2),
  shippingZip: z.string().min(3)
})

export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const orders = await OrderService.getUserOrders(userId)
    
    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const body = await request.json()
    
    const validatedData = createOrderSchema.parse(body)
    const order = await OrderService.createOrder(userId, validatedData)
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}