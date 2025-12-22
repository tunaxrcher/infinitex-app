---
description: 'Pattern สำหรับ Prisma repositories ใน repositories folder'
globs:
  - '**/repositories/**Repository.ts'
  - '**/repositories/*.ts'
alwaysApply: false
---

# Prisma Repository Pattern

## โครงสร้างไฟล์ Repository

```typescript
// src/features/[feature-name]/repositories/entityRepository.ts
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class EntityRepository extends BaseRepository<typeof prisma.entity> {
  constructor() {
    super(prisma.entity)
  }

  // ============================================
  // Custom Find Methods
  // ============================================

  async findWithDetails(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        profile: true,
        relatedItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async findByAgentId(agentId: string) {
    return prisma.agentCustomer.findMany({
      where: {
        agentId,
        isActive: true,
      },
      include: {
        customer: {
          include: {
            profile: true,
            loans: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })
  }

  // ============================================
  // Custom Create Methods
  // ============================================

  async createWithProfile(entityData: any, profileData: any) {
    return this.model.create({
      data: {
        ...entityData,
        profile: {
          create: profileData,
        },
      },
      include: {
        profile: true,
      },
    })
  }

  // ============================================
  // Search Methods
  // ============================================

  async searchByNameOrPhone(searchTerm: string, agentId?: string) {
    const whereClause: any = {
      userType: 'CUSTOMER',
      OR: [
        { phoneNumber: { contains: searchTerm } },
        {
          profile: {
            OR: [
              { firstName: { contains: searchTerm } },
              { lastName: { contains: searchTerm } },
            ],
          },
        },
      ],
    }

    if (agentId) {
      whereClause.customerAgents = {
        some: { agentId, isActive: true },
      }
    }

    return this.model.findMany({
      where: whereClause,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ============================================
  // Lookup Methods
  // ============================================

  async findByPhoneNumber(phoneNumber: string) {
    return this.model.findUnique({
      where: { phoneNumber },
      include: { profile: true },
    })
  }
}

// Export singleton instance
export const entityRepository = new EntityRepository()
```

## BaseRepository Class

โปรเจคมี `BaseRepository` ที่ repositories ต้อง extend:

```typescript
// src/shared/repositories/baseRepository.ts
export abstract class BaseRepository<TModel extends Record<string, any>> {
  constructor(protected readonly model: TModel) {}

  // Built-in methods จาก BaseRepository:
  // - create(args)
  // - update(args)
  // - delete(args)
  // - findManyWithCursor(args)
  // - exists(where)
  // - paginate({ where, orderBy, include, select, page, limit })
  // - findOrCreate(where, create)
  // - updateOrCreate(where, update, create)
}
```

## ข้อกำหนดสำคัญ

### Extend BaseRepository

```typescript
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class CustomerRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user)
  }

  // Custom methods...
}
```

### ID Format - ใช้ String (cuid)

**โปรเจคนี้ใช้ String IDs ไม่ใช่ Number:**

```typescript
// ✅ ถูก - String ID
async findById(id: string) {
  return this.model.findUnique({ where: { id } });
}

// ❌ ผิด - Number ID
async findById(id: number) { ... }
```

### Naming Convention

| Type     | Format     | Example                 |
| -------- | ---------- | ----------------------- |
| Class    | PascalCase | `CustomerRepository`    |
| Instance | camelCase  | `customerRepository`    |
| File     | camelCase  | `customerRepository.ts` |

### Methods จาก BaseRepository

```typescript
// Create - ใช้ Prisma args pattern
await customerRepository.create({
  data: { phoneNumber, userType: 'CUSTOMER' },
})

// Update
await customerRepository.update({
  where: { id },
  data: { isActive: false },
  include: { profile: true },
})

// Delete
await customerRepository.delete({
  where: { id },
})

// Paginate
const result = await customerRepository.paginate({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' },
  include: { profile: true },
  page: 1,
  limit: 10,
})
// Returns: { data: [...], pagination: { total, totalPages, page, limit, ... } }

// Check exists
const exists = await customerRepository.exists({ id })
```

### Soft Delete Pattern

ใช้ `isActive: false` หรือ `deletedAt`:

```typescript
async delete(id: string) {
  return this.update({
    where: { id },
    data: { isActive: false },
  });
}

// หรือ
async delete(id: string) {
  return this.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

### Include Relations

```typescript
async findWithDetails(id: string) {
  return this.model.findUnique({
    where: { id },
    include: {
      profile: true,
      loanApplications: {
        orderBy: { createdAt: 'desc' },
      },
      loans: {
        orderBy: { createdAt: 'desc' },
      },
      customerAgents: {
        where: { isActive: true },
        include: {
          agent: { include: { profile: true } },
        },
      },
    },
  });
}
```

## ตัวอย่างจริงจากโปรเจค

```typescript
// src/features/customer/repositories/customerRepository.ts
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class CustomerRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user)
  }

  async findByAgentId(agentId: string) {
    return prisma.agentCustomer.findMany({
      where: { agentId, isActive: true },
      include: {
        customer: {
          include: {
            profile: true,
            loanApplications: {
              select: { id: true, status: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            },
            loans: {
              select: { id: true, status: true, loanNumber: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })
  }

  async createWithProfile(customerData: any, profileData: any) {
    return this.model.create({
      data: {
        ...customerData,
        userType: 'CUSTOMER',
        profile: { create: profileData },
      },
      include: { profile: true },
    })
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.model.findUnique({
      where: { phoneNumber },
      include: { profile: true },
    })
  }
}

export const customerRepository = new CustomerRepository()
```

## Checklist สำหรับ Repository ใหม่

- [ ] Extend `BaseRepository`
- [ ] Import `prisma` จาก `@src/shared/lib/db`
- [ ] ใช้ String ID (cuid) ไม่ใช่ Number
- [ ] ใช้ `this.model` สำหรับ Prisma operations พื้นฐาน
- [ ] ใช้ `prisma.xxx` สำหรับ query related models
- [ ] Export ทั้ง class และ singleton instance
