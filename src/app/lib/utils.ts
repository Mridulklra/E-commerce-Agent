import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import type { SignupData, SigninData, ApiResponse } from './types'
import { SignJWT, jwtVerify } from 'jose' 
// Validation Schemas
export const signupSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  
  // Address validation
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
})

export const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
})

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  return await bcrypt.hash(password, rounds)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities for API routes (Node.js runtime)
export const generateToken = (payload: { userId: number; email: string }): string => {
  console.log('🎫 Generating token for:', payload)
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { userId: number; email: string } | null => {
  try {
    console.log('🔍 Verifying token with Node.js JWT...')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; email: string }
    console.log('✅ Token verified:', decoded)
    return decoded
  } catch (error: any) {
    console.log('❌ Node.js Token verification failed:', error.message)
    return null
  }
}

// JWT utilities for Edge Runtime (middleware)
const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export const generateTokenEdge = async (payload: { userId: number; email: string }): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const verifyTokenEdge = async (token: string): Promise<{ userId: number; email: string } | null> => {
  try {
    console.log('🔍 Verifying token with Edge-compatible JWT...')
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Edge token verified:', payload)
    return {
      userId: payload.userId as number,
      email: payload.email as string
    }
  } catch (error: any) {
    console.log('❌ Edge token verification failed:', error.message)
    return null
  }
}

// Response utilities remain same
export const createResponse = <T>(
  success: boolean, 
  message: string, 
  data?: T, 
  status: number = 200
): Response => {
  return Response.json(
    { success, message, data } as ApiResponse<T>,
    { status }
  )
}