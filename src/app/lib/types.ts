import { Decimal } from "@prisma/client/runtime/library"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  country: string
  postalCode: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface SigninData {
  email: string
  password: string
}

export interface UserResponse {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  country: string
  postalCode: string
  createdAt: Date
}

export interface AuthResponse {
  user: UserResponse
  token: string
}


export interface Category{
  id:number
  name:string
  description?:string|null
  slug:string
  isActive:boolean
  createdAt: Date
  updatedAt:Date
}

export interface Product{
  id:number
  name:string
   description?:string|null
   price:number
   sku:string
   stock:number
   images: string[]
  isActive: boolean
  categoryId: number
  category?: Category
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryData{
  name:string
  description?:string|null
  slug:string
}


export interface CreateProductData {
  name: string
  description?: string
  price: number
  sku: string
  stock: number
  images: string[]
  categoryId: number
}
export interface UpdateProductData{
   name?: string
  description?: string
  price?: number
  stock?: number
  images?: string[]
  categoryId?: number
  isActive?: boolean
}
export interface ProductFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  limit?: number
}


export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}