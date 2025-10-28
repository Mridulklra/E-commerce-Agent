// src/app/services/agentService.ts
import { ProductService } from './productService'
import type { Product, ProductFilters } from '../lib/types'

interface AgentQuery {
  query: string
  conversationHistory?: ConversationMessage[]
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AgentResponse {
  message: string
  products: Product[]
  filters: ProductFilters
  suggestions?: string[]
}

export class AgentService {
  // Extract product attributes from natural language
  private static extractFilters(query: string): ProductFilters {
    const filters: ProductFilters = {}
    const lowerQuery = query.toLowerCase()

    // Extract price range
    const priceMatch = lowerQuery.match(/under\s+(\d+)|below\s+(\d+)|less\s+than\s+(\d+)|₹\s*(\d+)|rs\s*(\d+)/i)
    if (priceMatch) {
      const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4] || priceMatch[5])
      filters.maxPrice = price
    }

    const priceRangeMatch = lowerQuery.match(/between\s+(\d+)\s+and\s+(\d+)|(\d+)\s*-\s*(\d+)/i)
    if (priceRangeMatch) {
      filters.minPrice = parseInt(priceRangeMatch[1] || priceRangeMatch[3])
      filters.maxPrice = parseInt(priceRangeMatch[2] || priceRangeMatch[4])
    }

    // Extract search terms (remove price-related words and common phrases)
    const cleanedQuery = lowerQuery
      .replace(/show me|find|search for|looking for|i want|i need|get me/gi, '')
      .replace(/under\s+\d+|below\s+\d+|less\s+than\s+\d+|between\s+\d+\s+and\s+\d+/gi, '')
      .replace(/₹\s*\d+|rs\s*\d+/gi, '')
      .trim()

    if (cleanedQuery) {
      filters.search = cleanedQuery
    }

    filters.limit = 20

    return filters
  }

  // Generate conversational response
  private static generateResponse(
    query: string,
    products: Product[],
    filters: ProductFilters
  ): string {
    if (products.length === 0) {
      return `I couldn't find any products matching "${query}". Try:\n- Using different keywords\n- Checking the spelling\n- Broadening your search criteria`
    }

    let response = `I found ${products.length} product${products.length > 1 ? 's' : ''} `

    if (filters.search) {
      response += `matching "${filters.search}"`
    }

    if (filters.minPrice && filters.maxPrice) {
      response += ` in the price range ₹${filters.minPrice} - ₹${filters.maxPrice}`
    } else if (filters.maxPrice) {
      response += ` under ₹${filters.maxPrice}`
    } else if (filters.minPrice) {
      response += ` above ₹${filters.minPrice}`
    }

    response += `. Here are the results:`

    return response
  }

  // Generate helpful suggestions
  private static generateSuggestions(query: string, products: Product[]): string[] {
    const suggestions: string[] = []

    if (products.length > 0) {
      // Suggest related categories
      const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))]
      if (categories.length > 1) {
        suggestions.push(`Filter by category: ${categories.join(', ')}`)
      }

      // Suggest price refinement
      const prices = products.map(p => p.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      if (maxPrice - minPrice > 1000) {
        suggestions.push(`Refine by price: ₹${minPrice} - ₹${maxPrice}`)
      }
    } else {
      suggestions.push('Try using different keywords')
      suggestions.push('Check product categories')
      suggestions.push('Browse all products')
    }

    return suggestions.slice(0, 3)
  }

  // Main agent query handler
  static async processQuery(agentQuery: AgentQuery): Promise<AgentResponse> {
    try {
      const { query } = agentQuery

      // Extract filters from natural language
      const filters = this.extractFilters(query)

      // Get products based on filters
      const { products } = await ProductService.getAllProducts(filters)

      // Generate conversational response
      const message = this.generateResponse(query, products, filters)

      // Generate suggestions
      const suggestions = this.generateSuggestions(query, products)

      return {
        message,
        products,
        filters,
        suggestions
      }
    } catch (error: any) {
      throw new Error(`Agent error: ${error.message}`)
    }
  }

  // Get product recommendations based on a product
  static async getRecommendations(productId: number): Promise<Product[]> {
    try {
      const product = await ProductService.getProductById(productId)
      
      // Get similar products from same category
      const similarProducts = await ProductService.getProductsByCategory(
        product.categoryId,
        6
      )

      // Filter out the current product
      return similarProducts.filter(p => p.id !== productId)
    } catch (error: any) {
      throw new Error(`Recommendation error: ${error.message}`)
    }
  }

  // Get trending/popular products
  static async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { products } = await ProductService.getAllProducts({
        limit,
        page: 1
      })

      return products
    } catch (error: any) {
      throw new Error(`Trending products error: ${error.message}`)
    }
  }
}