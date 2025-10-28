// src/app/api/cart/[itemId]/route.ts (NEW FILE - Cart item operations)
import { CartService } from '@/app/services/cartService'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateQuantitySchema = z.object({
  quantity: z.number().positive()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const itemId = parseInt(params.itemId)
    const body = await request.json()
    
    const { quantity } = updateQuantitySchema.parse(body)
    const cart = await CartService.updateCartItem(userId, itemId, quantity)
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      data: cart
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const itemId = parseInt(params.itemId)
    
    const cart = await CartService.removeFromCart(userId, itemId)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}