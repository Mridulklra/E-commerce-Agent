import { ProductService } from '@/app/services/productService'
import { NextRequest, NextResponse } from 'next/server'
import { createProductSchema, generateSKU } from '@/app/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      categoryId: searchParams.get('categoryId') 
        ? parseInt(searchParams.get('categoryId')!) 
        : undefined,
      minPrice: searchParams.get('minPrice') 
        ? parseFloat(searchParams.get('minPrice')!) 
        : undefined,
      maxPrice: searchParams.get('maxPrice') 
        ? parseFloat(searchParams.get('maxPrice')!) 
        : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12')
    }
    
    const result = await ProductService.getAllProducts(filters)
    
    return NextResponse.json({
      success: true,
      data: {
        products: result.products,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.sku && body.name) {
      body.sku = generateSKU(body.name)
    }
    
    const validatedData = createProductSchema.parse(body)
    const product = await ProductService.createProduct(validatedData)
    
    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}