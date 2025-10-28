// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Create test user
  const hashedPassword = await hashPassword('password123')
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001'
    }
  })

  console.log('✅ Created test user:', user.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronic devices'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trendy clothing and accessories'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Everything for your home'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        slug: 'books',
        description: 'Wide range of books'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories'
      }
    })
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create products
  const products = [
    // Electronics
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-cancelling headphones with 30-hour battery life',
      price: 2999,
      sku: 'HEADPH01',
      stock: 50,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      categoryId: categories[0].id
    },
    {
      name: 'Smart Watch Series 5',
      description: 'Fitness tracker with heart rate monitor and GPS',
      price: 4999,
      sku: 'WATCH01',
      stock: 30,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      categoryId: categories[0].id
    },
    {
      name: 'Laptop 15.6" FHD',
      description: 'Powerful laptop with Intel i5, 8GB RAM, 512GB SSD',
      price: 45999,
      sku: 'LAPTOP01',
      stock: 15,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      categoryId: categories[0].id
    },
    
    // Fashion
    {
      name: 'Classic Denim Jacket',
      description: 'Stylish denim jacket for all seasons',
      price: 1999,
      sku: 'JACKET01',
      stock: 40,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
      categoryId: categories[1].id
    },
    {
      name: 'Running Shoes Pro',
      description: 'Comfortable running shoes with advanced cushioning',
      price: 3499,
      sku: 'SHOES01',
      stock: 60,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      categoryId: categories[1].id
    },
    {
      name: 'Cotton T-Shirt Pack',
      description: 'Pack of 3 premium cotton t-shirts',
      price: 899,
      sku: 'TSHIRT01',
      stock: 100,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      categoryId: categories[1].id
    },
    
    // Home & Kitchen
    {
      name: 'Coffee Maker Deluxe',
      description: 'Programmable coffee maker with thermal carafe',
      price: 3999,
      sku: 'COFFEE01',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
      categoryId: categories[2].id
    },
    {
      name: 'Non-Stick Cookware Set',
      description: '5-piece non-stick cookware set',
      price: 2499,
      sku: 'COOK01',
      stock: 35,
      images: ['https://images.unsplash.com/photo-1584990347498-7ab0b7cb2d14?w=500'],
      categoryId: categories[2].id
    },
    
    // Books
    {
      name: 'The Complete JavaScript Guide',
      description: 'Comprehensive guide to modern JavaScript',
      price: 599,
      sku: 'BOOK01',
      stock: 50,
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      categoryId: categories[3].id
    },
    {
      name: 'AI & Machine Learning Basics',
      description: 'Introduction to AI and ML concepts',
      price: 799,
      sku: 'BOOK02',
      stock: 40,
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'],
      categoryId: categories[3].id
    },
    
    // Sports
    {
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with carrying strap',
      price: 1299,
      sku: 'YOGA01',
      stock: 45,
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
      categoryId: categories[4].id
    },
    {
      name: 'Dumbbells Set 10kg',
      description: 'Adjustable dumbbell set with storage case',
      price: 2999,
      sku: 'DUMB01',
      stock: 20,
      images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
      categoryId: categories[4].id
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log(`✅ Created ${products.length} products`)

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📝 Test credentials:')
  console.log('Email: test@example.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })