import { prisma } from '../lib/prisma'
import type { 
  Category, 
  Product, 
  CreateCategoryData, 
  CreateProductData, 
  UpdateProductData,
  ProductFilters 
} from '../lib/types'
import { serializeProduct,serializeProducts } from '../lib/utils'
export class ProductService {
  // Category Methods
  static async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      // Check if category with same name or slug exists
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            { name: categoryData.name },
            { slug: categoryData.slug }
          ]
        }
      })

      if (existing) {
        throw new Error('Category with this name or slug already exists')
      }

      const category = await prisma.category.create({
        data: categoryData
      })

      return category
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })

      return categories
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getCategoryById(categoryId: number): Promise<Category> {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        throw new Error('Category not found')
      }

      return category
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Product Methods
  static async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      // Check if product with same SKU exists
      const existingSKU = await prisma.product.findUnique({
        where: { sku: productData.sku }
      })

      if (existingSKU) {
        throw new Error('Product with this SKU already exists')
      }

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: productData.categoryId }
      })

      if (!category) {
        throw new Error('Category not found')
      }

      const product = await prisma.product.create({
        data: productData,
        include: {
          category: true
        }
      })

      return  serializeProduct(product)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAllProducts(filters: ProductFilters = {}): Promise<{
    products: Product[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const {
        categoryId,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 10
      } = filters

      // Build where clause
      const where: any = {
        isActive: true
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = minPrice
        if (maxPrice !== undefined) where.price.lte = maxPrice
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }

      // Calculate pagination
      const skip = (page - 1) * limit

      // Get products and total count
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.product.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        products: serializeProducts(products),
        total,
        page,
        totalPages
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getProductById(productId: number): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true
        }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      return serializeProduct(product)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getProductBySKU(sku: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { sku },
        include: {
          category: true
        }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      return serializeProduct(product)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateProduct(productId: number, updateData: UpdateProductData): Promise<Product> {
    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!existingProduct) {
        throw new Error('Product not found')
      }

      // If updating category, verify it exists
      if (updateData.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: updateData.categoryId }
        })

        if (!category) {
          throw new Error('Category not found')
        }
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true
        }
      })

      return serializeProduct(product)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async deleteProduct(productId: number): Promise<void> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      // Soft delete by setting isActive to false
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false }
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getProductsByCategory(categoryId: number, limit: number = 10): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          categoryId,
          isActive: true
        },
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return serializeProducts(products)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateStock(productId: number, quantity: number): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      if (product.stock + quantity < 0) {
        throw new Error('Insufficient stock')
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: product.stock + quantity
        },
        include: {
          category: true
        }
      })

      return  serializeProduct(updatedProduct)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}