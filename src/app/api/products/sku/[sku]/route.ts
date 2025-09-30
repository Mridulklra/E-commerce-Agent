

import { ProductService } from '@/app/services/productService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const product = await ProductService.getProductBySKU(params.sku)
    
    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    )
  }
}