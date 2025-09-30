import { ProductService } from '@/app/services/productService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      )
    }
    
    const category = await ProductService.getCategoryById(categoryId)
    const products = await ProductService.getProductsByCategory(categoryId, 100)
    
    return NextResponse.json({
      success: true,
      data: { category, products }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    )
  }
}
