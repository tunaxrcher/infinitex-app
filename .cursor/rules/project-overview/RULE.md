---
description: 'ภาพรวมโปรเจค Infinitex App - ข้อมูลสำคัญที่ต้องรู้'
alwaysApply: true
---

# Infinitex App - Project Overview

ระบบ Mobile Web Application สำหรับลูกค้าและตัวแทน (Agent) ในธุรกิจสินเชื่อ ประกอบด้วยการสมัครสินเชื่อ, การชำระเงิน, การติดตามสถานะ และระบบ Gamification

## ประเภทผู้ใช้งาน

| User Type | Description                                   |
| --------- | --------------------------------------------- |
| Customer  | ลูกค้าที่ต้องการสมัครสินเชื่อหรือชำระเงิน    |
| Agent     | ตัวแทนที่ช่วยลูกค้าสมัครสินเชื่อ             |

## Tech Stack

| Category      | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 14 (App Router)             |
| Language      | TypeScript + Zod validation         |
| Database      | Prisma ORM + MySQL                  |
| Auth          | NextAuth.js v4 (PIN/OTP)            |
| Client State  | React Query (@tanstack/react-query) |
| UI            | Radix UI + Tailwind CSS v4          |
| Forms         | React Hook Form + Zod               |
| Tables        | @tanstack/react-table               |
| AI Services   | Vercel AI SDK + OpenAI/Gemini       |
| Notifications | sonner                              |

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run prettier:write   # Format with Prettier

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open Prisma Studio GUI
npm run db:seed          # Run seed script
```

## Path Aliases

โปรเจคใช้ `@src/*` สำหรับ import:

```typescript
// Feature imports
@src/features/[feature]/*           # Feature code

// Shared imports
@src/shared/ui/*                    # UI components (shadcn/ui)
@src/shared/components/*            # Common components
@src/shared/lib/*                   # Utilities
@src/shared/hooks/*                 # Shared hooks
@src/shared/providers/*             # React providers
@src/shared/validations/*           # Shared Zod schemas
@src/shared/contexts/*              # React contexts
```

## Directory Structure

### `src/features/` - Feature Modules

```
src/features/
├── agent/           # Agent dashboard และ loan submission
├── bills/           # รายการบิล
├── customer/        # Customer profile และ management
├── home/            # Homepage components
├── loan/            # สมัครสินเชื่อ (หลายขั้นตอน)
├── more/            # Menu เพิ่มเติม
├── notifications/   # การแจ้งเตือน
├── payment/         # การชำระเงิน (QR/Barcode)
└── products/        # รายการสินเชื่อที่มี
```

**แต่ละ feature ประกอบด้วย:**

- `api.ts` - Client-side API calls
- `hooks.ts` - React Query hooks
- `validations.ts` - Zod schemas
- `repositories/` - Database access (extends BaseRepository)
- `services/server.ts` - Server-side business logic (marked with `"server-only"`)
- `components/` - Feature-specific components

### `src/shared/` - Shared Code

```
src/shared/
├── ui/              # UI components (shadcn/ui style)
├── components/      # Common reusable components
├── lib/             # Utilities (api-client, db, auth, utils, storage)
├── hooks/           # Custom React hooks
├── providers/       # React context providers (query, session)
├── contexts/        # React contexts (auth)
├── types/           # TypeScript type definitions
├── middleware/      # API middleware
├── repositories/    # Base repository class
└── validations/     # Shared Zod schemas
```

### `src/app/` - Next.js App Router

```
src/app/
├── (layout)/        # Pages with bottom navigation
│   ├── (shared)/    # Shared pages (bills, more, notifications, payment)
│   ├── agent/       # Agent-specific pages
│   ├── customer/    # Customer-specific pages
│   └── login/       # Login page
├── (non-layout)/    # Full-screen pages without navigation
├── api/             # API routes
│   ├── auth/        # NextAuth routes
│   ├── customers/   # Customer API
│   └── loans/       # Loan API
└── components/      # App-level components
```

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Components (React)                                     │
│  └─> ใช้ hooks สำหรับ data fetching                      │
├─────────────────────────────────────────────────────────┤
│  Hooks (React Query)                                    │
│  └─> เรียก api.ts, จัดการ cache                          │
├─────────────────────────────────────────────────────────┤
│  API Client (api.ts)                                    │
│  └─> HTTP calls ไปยัง API routes                         │
├─────────────────────────────────────────────────────────┤
│  API Routes (route.ts)                                  │
│  └─> Validate + เรียก service                            │
├─────────────────────────────────────────────────────────┤
│  Services (server.ts)                                   │
│  └─> Business logic, เรียก repository                    │
├─────────────────────────────────────────────────────────┤
│  Repositories                                           │
│  └─> Database queries via Prisma                        │
└─────────────────────────────────────────────────────────┘
```

## Core Patterns

แต่ละ pattern มี rule เฉพาะ - ใช้เมื่อทำงานกับไฟล์ที่เกี่ยวข้อง:

| Pattern        | Rule                     | ใช้เมื่อ                         |
| -------------- | ------------------------ | -------------------------------- |
| Client API     | `@feature-api-client`    | สร้าง/แก้ไข `api.ts`             |
| React Query    | `@react-query-hooks`     | สร้าง/แก้ไข `hooks.ts`           |
| Zod Validation | `@zod-validations`       | สร้าง/แก้ไข `validations.ts`     |
| Repository     | `@prisma-repositories`   | สร้าง/แก้ไข `*Repository.ts`     |
| Service        | `@server-services`       | สร้าง/แก้ไข `services/server.ts` |
| API Routes     | `@api-routes`            | สร้าง/แก้ไข `route.ts`           |
| New Feature    | `@new-feature-generator` | สร้าง feature ใหม่ทั้งหมด        |

## Key Files

| File                             | Purpose                    |
| -------------------------------- | -------------------------- |
| `@src/shared/lib/api-client.ts`  | API client (`api`)         |
| `@src/shared/lib/db.ts`          | Prisma client (`prisma`)   |
| `@src/shared/lib/auth.ts`        | Auth utilities             |
| `@src/shared/lib/storage.ts`     | File storage (S3)          |
| `@src/shared/lib/utils.ts`       | Utility functions (`cn`)   |
| `@src/shared/lib/ai-services.ts` | AI integration (OpenAI)    |
| `@src/shared/contexts/auth-context.tsx` | Auth context        |

## Important Notes

- **React 18**: ใช้ React 18 - ไม่ต้อง import React ในไฟล์ component
- **Tailwind v4**: ใช้ `@tailwindcss/postcss` plugin
- **Next.js 14**: App Router, React Server Components
- **Thai Language**: Error messages และ UI text ใช้ภาษาไทย
- **Soft Delete**: ใช้ `deletedAt` field แทนการลบจริง
- **String IDs**: ใช้ `cuid()` สำหรับ primary keys (ไม่ใช่ auto-increment)
- **Mobile-First**: UI ออกแบบสำหรับ mobile เป็นหลัก
- **Sonner**: ใช้ `sonner` สำหรับ toast notifications

## Database Schema Overview

```prisma
// User Types: CUSTOMER, AGENT
model User { ... }
model UserProfile { ... }
model AgentCustomer { ... }

// Loan System
model LoanApplication { ... }
model Loan { ... }
model LoanInstallment { ... }

// Payment System
model Payment { ... }

// Notifications & Gamification
model Notification { ... }
model CoinTransaction { ... }
model Reward { ... }

// Content Management
model Banner { ... }
model Privilege { ... }
```
