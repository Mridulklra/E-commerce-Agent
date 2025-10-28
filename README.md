# 🛍️ Agentic E-Commerce Platform

An AI-powered e-commerce platform with a conversational shopping assistant built with Next.js 15, Prisma, and PostgreSQL.

## ✨ Features

### 🤖 AI Shopping Assistant
- **Natural Language Search**: Ask in plain language - "Show me black shoes under 3000"
- **Smart Product Recommendations**: Context-aware suggestions based on user queries
- **Conversational Interface**: Chat-like experience for seamless shopping

### 🛒 Core E-Commerce Features
- User authentication (Sign up, Sign in, Profile management)
- Product catalog with categories
- Shopping cart management
- Order placement and tracking
- Real-time stock management

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS 4
- Gradient-based modern interface
- Real-time chat interface for AI assistant
- Product cards with images
- Category browsing

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd agentic-e-commerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Bcrypt Rounds
BCRYPT_ROUNDS=12

# Node Environment
NODE_ENV=development
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Setup

```bash
# Push Prisma schema to database
npm run db:push

# Generate Prisma Client
npx prisma generate

# Seed database with sample data
npm install -D tsx
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Sample data seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── categories/    # Category management
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── orders/        # Order management
│   │   │   └── agent/         # AI assistant
│   │   ├── shop/              # AI shopping assistant UI
│   │   ├── lib/               # Utilities
│   │   │   ├── prisma.ts      # Prisma client
│   │   │   ├── utils.ts       # Helper functions
│   │   │   └── types.ts       # TypeScript types
│   │   ├── services/          # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── orderService.ts
│   │   │   └── agentService.ts
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── middleware.ts          # Auth middleware
│   └── generated/prisma/      # Generated Prisma client
└── package.json
```

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/signup        # Create account
POST   /api/auth/signin