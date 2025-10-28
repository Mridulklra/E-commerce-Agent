// src/app/services/cartService.ts
import { prisma } from '../lib/prisma'
import { serializeProduct } from '../lib/utils'

export interface CartItemData {
  productId: number
  quantity: number
}

export interface CartResponse {
  id: number
  items: Array<{
    id: number
    quantity: number
    product: any
  }>
  totalItems: number
  totalPrice: number
}

export class CartService {
  // Get or create cart for user
  static async getOrCreateCart(userId: number): Promise<CartResponse> {
    try {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        })
      }

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = cart.items.reduce((sum, item) => {
        const price = typeof item.product.price === 'number' 
          ? item.product.price 
          : parseFloat(item.product.price.toString())
        return sum + (price * item.quantity)
      }, 0)

      return {
        id: cart.id,
        items: cart.items.map(item => ({
          ...item,
          product: serializeProduct(item.product)
        })),
        totalItems,
        totalPrice
      }
    } catch (error: any) {
      throw new Error(`Cart error: ${error.message}`)
    }
  }

  // Add item to cart
  static async addToCart(userId: number, cartItemData: CartItemData): Promise<CartResponse> {
    try {
      // Get or create cart
      const cart = await prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {}
      })

      // Check if product exists and has enough stock
      const product = await prisma.product.findUnique({
        where: { id: cartItemData.productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      if (!product.isActive) {
        throw new Error('Product is not available')
      }

      if (product.stock < cartItemData.quantity) {
        throw new Error('Insufficient stock')
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: cartItemData.productId
          }
        }
      })

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + cartItemData.quantity

        if (product.stock < newQuantity) {
          throw new Error('Insufficient stock')
        }

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity }
        })
      } else {
        // Create new cart item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: cartItemData.productId,
            userId: userId,
            quantity: cartItemData.quantity
          }
        })
      }

      return await this.getOrCreateCart(userId)
    } catch (error: any) {
      throw new Error(`Add to cart error: ${error.message}`)
    }
  }

  // Update cart item quantity
  static async updateCartItem(
    userId: number, 
    cartItemId: number, 
    quantity: number
  ): Promise<CartResponse> {
    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
          product: true
        }
      })

      if (!cartItem) {
        throw new Error('Cart item not found')
      }

      if (cartItem.userId !== userId) {
        throw new Error('Unauthorized')
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0')
      }

      if (cartItem.product.stock < quantity) {
        throw new Error('Insufficient stock')
      }

      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      })

      return await this.getOrCreateCart(userId)
    } catch (error: any) {
      throw new Error(`Update cart error: ${error.message}`)
    }
  }

  // Remove item from cart
  static async removeFromCart(userId: number, cartItemId: number): Promise<CartResponse> {
    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true }
      })

      if (!cartItem) {
        throw new Error('Cart item not found')
      }

      if (cartItem.userId !== userId) {
        throw new Error('Unauthorized')
      }

      await prisma.cartItem.delete({
        where: { id: cartItemId }
      })

      return await this.getOrCreateCart(userId)
    } catch (error: any) {
      throw new Error(`Remove from cart error: ${error.message}`)
    }
  }

  // Clear cart
  static async clearCart(userId: number): Promise<void> {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId }
      })

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        })
      }
    } catch (error: any) {
      throw new Error(`Clear cart error: ${error.message}`)
    }
  }
}