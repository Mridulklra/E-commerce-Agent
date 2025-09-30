import { createCategorySchema, createSlug } from "@/app/lib/utils"
import { ProductService } from "@/app/services/productService"
import { NextResponse,NextRequest } from "next/server"
import { success } from "zod"
import { ca } from "zod/locales"


export async function GET(){
    try{
    const categories= await ProductService.getAllCategories()
    return NextResponse.json(
        {
            success:true,
            data:categories,
             status :201
        }
    )
    }
    catch(error:any){
     return NextResponse.json(
       { success:false,message:error.message,status:500}
     )
    }
}

export async function POST(request:NextRequest){
    try{
     const body = await request.json()
      if(!body.slug&&body){
        body.slug=createSlug(body.name);
      }
      const validate = createCategorySchema.parse(body)
      const category= await ProductService.createCategory(validate)
      return NextResponse.json(
           {success:true,
             status :201,
             data:category
           }
      )
    }
    catch(error:any){
     return NextResponse.json(
        {
            success:false,message:error.message,status:500
        }
     )
    }
}