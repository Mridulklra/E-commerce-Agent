import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { number, z } from 'zod'
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



export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
})
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  categoryId: z.number().int().positive('Valid category is required')
})

export const updateProductSchema=z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  categoryId: z.number().int().positive('Valid category is required').optional(),
  isActive: z.boolean().optional()
})

export const productFiltersSchema = z.object({
  categoryId: z.string().transform(Number).optional(),
  minPrice: z.string().transform(Number).optional(), 
  maxPrice: z.string().transform(Number).optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10)
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

export const decimatToNumber=(decimal:any):number=>{
  if(typeof decimal ==='number')return  decimal
  if(decimal?.toNumber) return decimal.toNumber()
  return  parseFloat(decimal.toString());
}
export const serializeProduct=(product :any):any=>{
  return {
    ...product,
    price:decimatToNumber(product.price)

  }
}

export const serializeProducts=(products:any[]):any[]=>{
  return products.map(serializeProduct)
}

export const generateSKU = (productName: string): string => {
  return productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8) + 
    Date.now().toString().slice(-4)
}
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim()
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