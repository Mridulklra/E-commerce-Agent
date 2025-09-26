import {z} from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const SignupSchema =z.object({
   email: z.email({ message: 'Invalid email format' }),
   password:z.string().min(8,'It should be of 8 min characters'),
   firstName :z.string().min(3,'name should be of minimum 3 characters'),
   lastName :z.string(),
   phone:z.int().optional(),
})

export const SingninSchema =z.object({
    email:z.email({message:'It should be unique'}),
    password:z.string().min(8,'It should be of minimum 8 characters ')
})

export const addressSchema = z.object({
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
})

export const hashPassword=async(password:string):Promise<string>=>{
    const round=12;
    return await bcrypt.hash(password,round);
}

export const verifyPassword=async(password:string,hashPassword:string):Promise<boolean>=>{
  return await bcrypt.compare(password,hashPassword)
}