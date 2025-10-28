// src/app/services/orderService.ts
import { prisma } from '../lib/prisma'
import { CartService } from './cartService'
import { serializeProduct } from '../lib/utils'

export interface CreateOrderData {
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
}

export interface OrderResponse {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  items: Array<{
    id: number
    quantity: number
    price: number
    product: any
  }>
  createdAt: Date
  updatedAt: Date
}

export class OrderService {
  // Generate unique order number
  private static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD-${timestamp}-${random}`
  }

  // Create order from cart
  static async createOrder(userId: number, orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      // Get user's cart
      const cart = await CartService.getOrCreateCart(userId)

      if (cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      // Verify stock availability for all items
      for (const item of cart.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.product.id }
        })

        if (!product) {
          throw new Error(`Product ${item.product.name} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`)
        }
      }

      // Create order in transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber: this.generateOrderNumber(),
            totalAmount: cart.totalPrice,
            shippingAddress: orderData.shippingAddress,
            shippingCity: orderData.shippingCity,
            shippingState: orderData.shippingState,
            shippingZip: orderData.shippingZip,
            status: 'PENDING'
          }
        })

        // Create order items and update product stock
        for (const item of cart.items) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            }
          })

          // Decrease product stock
          await tx.product.update({
            where: { id: item.product.id },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }

        // Clear cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        })

        return newOrder
      })

      // Fetch complete order with items
      return await this.getOrderById(userId, order.id)
    } catch (error: any) {
      throw new Error(`Create order error: ${error.message}`)
    }
  }

  // Get order by ID
  static async getOrderById(userId: number, orderId: number): Promise<OrderResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized')
      }

      return {
        ...order,
        totalAmount: typeof order.totalAmount === 'number' 
          ? order.totalAmount 
          : parseFloat(order.totalAmount.toString()),
        items: order.items.map(item => ({
          ...item,
          price: typeof item.price === 'number' 
            ? item.price 
            : parseFloat(item.price.toString()),
          product: serializeProduct(item.product)
        }))
      }
    } catch (error: any) {
      throw new Error(`Get order error: ${error.message}`)
    }
  }

  // Get all orders for user
  static async getUserOrders(userId: number): Promise<OrderResponse[]> {
    try {
      const orders = await prisma.order.findMany({
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
        },
        orderBy: { createdAt: 'desc' }
      })

      return orders.map(order => ({
        ...order,
        totalAmount: typeof order.totalAmount === 'number' 
          ? order.totalAmount 
          : parseFloat(order.totalAmount.toString()),
        items: order.items.map(item => ({
          ...item,
          price: typeof item.price === 'number' 
            ? item.price 
            : parseFloat(item.price.toString()),
          product: serializeProduct(item.product)
        }))
      }))
    } catch (error: any) {
      throw new Error(`Get orders error: ${error.message}`)
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: number, 
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  ): Promise<OrderResponse> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
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

      return {
        ...order,
        totalAmount: typeof order.totalAmount === 'number' 
          ? order.totalAmount 
          : parseFloat(order.totalAmount.toString()),
        items: order.items.map(item => ({
          ...item,
          price: typeof item.price === 'number' 
            ? item.price 
            : parseFloat(item.price.toString()),
          product: serializeProduct(item.product)
        }))
      }
    } catch (error: any) {
      throw new Error(`Update order status error: ${error.message}`)
    }
  }

  // Cancel order
  static async cancelOrder(userId: number, orderId: number): Promise<OrderResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized')
      }

      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        throw new Error('Cannot cancel this order')
      }

      // Update order status and restore stock
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Restore product stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
        }

        // Update order status
        return await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        })
      })

      return await this.getOrderById(userId, updatedOrder.id)
    } catch (error: any) {
      throw new Error(`Cancel order error: ${error.message}`)
    }
  }
}