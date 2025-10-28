// src/app/api/cart/route.ts
import { CartService } from '@/app/services/cartService'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.number().positive(),
  quantity: z.number().positive().default(1)
})

export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    const cart = await CartService.getOrCreateCart(userId)
    
    return NextResponse.json({
      success: true,
      data: cart
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
    
    const validatedData = addToCartSchema.parse(body)
    const cart = await CartService.addToCart(userId, validatedData)
    
    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('user-id')!)
    await CartService.clearCart(userId)
    
    return NextResponse.json({
      success: true,
      message: 'Cart cleared'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

// src/app/api/cart/[itemId]/route.ts
// Create this in a new file: src/app/api/cart/[itemId]/route.ts
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