// src/app/api/orders/[orderId]/route.ts (NEW FILE - Individual order operations)
import { OrderService } from '@/app/services/orderService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const orderId = parseInt(params.orderId)
    
    const order = await OrderService.getOrderById(userId, orderId)
    
    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const orderId = parseInt(params.orderId)
    
    const order = await OrderService.cancelOrder(userId, orderId)
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}