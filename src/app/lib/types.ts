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

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}
