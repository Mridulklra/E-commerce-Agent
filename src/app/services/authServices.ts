import  prisma  from '../lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '../lib/utils'
import type { SignupData, AuthResponse, UserResponse } from '../lib/types'

export class AuthService {
  static async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password)

      // Create user with address
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          addressLine1: userData.addressLine1,
          addressLine2: userData.addressLine2,
          city: userData.city,
          state: userData.state,
          country: userData.country,
          postalCode: userData.postalCode,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          createdAt: true
        }
      })

      // Generate token
      const token = generateToken({ 
        userId: user.id, 
        email: user.email 
      })

      return { user, token }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated')
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid email or password')
      }

      // Generate token
      const token = generateToken({ 
        userId: user.id, 
        email: user.email 
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return { user: userWithoutPassword, token }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getUserById(userId: number): Promise<UserResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          createdAt: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateUser(userId: number, updateData: Partial<SignupData>): Promise<UserResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          createdAt: true
        }
      })

      return user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
