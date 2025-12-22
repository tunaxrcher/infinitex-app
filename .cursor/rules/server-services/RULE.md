---
description: 'Pattern สำหรับ Server-side services ใน services/server.ts'
globs:
  - '**/services/server.ts'
  - '**/services/*.server.ts'
alwaysApply: false
---

# Server Services Pattern

## โครงสร้างไฟล์ services/server.ts

```typescript
// src/features/[feature-name]/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { entityRepository } from '../repositories/entityRepository'
import {
  type EntityCreateSchema,
  type EntityUpdateSchema,
} from '../validations'

export const entityService = {
  // ============================================
  // Query Methods
  // ============================================

  async getList(userId: string, filters: any = {}) {
    try {
      const entities = await entityRepository.findByUserId(userId)

      // Transform data for frontend
      const result = entities.map((item) => ({
        id: item.id,
        name: item.profile?.fullName || 'ไม่ระบุชื่อ',
        // ... transform fields
      }))

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return result.filter((item) =>
          item.name.toLowerCase().includes(searchTerm)
        )
      }

      return result
    } catch (error) {
      console.error('Error fetching entities:', error)
      throw new Error('ไม่สามารถดึงข้อมูลได้')
    }
  },

  async getById(id: string) {
    const entity = await entityRepository.findWithDetails(id)
    if (!entity) {
      throw new Error('ไม่พบข้อมูล')
    }
    return entity
  },

  // ============================================
  // Mutation Methods
  // ============================================

  async create(data: EntityCreateSchema, userId?: string) {
    try {
      // Business logic validation
      const existing = await entityRepository.findByPhoneNumber(
        data.phoneNumber
      )
      if (existing) {
        throw new Error('เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว')
      }

      // Create entity
      const entity = await entityRepository.createWithProfile(
        { ...data },
        { ...profileData }
      )

      // Create relationship if userId provided
      if (userId) {
        await prisma.agentCustomer.create({
          data: {
            agentId: userId,
            customerId: entity.id,
            isActive: true,
          },
        })
      }

      return entity
    } catch (error) {
      console.error('Error creating entity:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('ไม่สามารถสร้างข้อมูลได้')
    }
  },

  async update(id: string, data: EntityUpdateSchema) {
    try {
      const existing = await entityRepository.findById(id)
      if (!existing) {
        throw new Error('ไม่พบข้อมูล')
      }

      return entityRepository.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error updating entity:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('ไม่สามารถอัปเดตข้อมูลได้')
    }
  },

  async delete(id: string) {
    try {
      // Soft delete by setting isActive to false
      return entityRepository.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error deleting entity:', error)
      throw new Error('ไม่สามารถลบข้อมูลได้')
    }
  },
}
```

## ข้อกำหนดสำคัญ

### 1. Server-Only Directive

```typescript
import { prisma } from '@src/shared/lib/db'
import 'server-only'
```

> Note: ในโปรเจคนี้ `import 'server-only'` อาจไม่อยู่บรรทัดแรก แต่ต้องมีอยู่

### 2. ID Format - String (cuid)

```typescript
// ✅ ถูก - String ID
async getById(id: string) {
  const entity = await entityRepository.findWithDetails(id);
  // ...
}
```

### 3. Error Handling Pattern

```typescript
async create(data: any) {
  try {
    // Business logic...
    return result;
  } catch (error) {
    console.error('Error creating entity:', error);
    if (error instanceof Error) {
      throw error;  // Re-throw known errors
    }
    throw new Error('ไม่สามารถสร้างข้อมูลได้');  // Generic error
  }
}
```

### 4. Error Messages ภาษาไทย

```typescript
throw new Error('ไม่พบข้อมูล')
throw new Error('ไม่พบข้อมูลลูกค้า')
throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
throw new Error('เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว')
throw new Error('ลูกค้าชื่อ "xxx" มีอยู่ในระบบแล้ว')
throw new Error('ลูกค้านี้อยู่ภายใต้ Agent นี้อยู่แล้ว')
throw new Error('ไม่สามารถมอบหมายลูกค้าให้ Agent ได้')
```

### 5. Soft Delete Pattern

ใช้ `isActive: false`:

```typescript
async delete(id: string) {
  try {
    return entityRepository.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    throw new Error('ไม่สามารถลบข้อมูลได้');
  }
}
```

### 6. Data Transformation

```typescript
async getListByAgent(agentId: string, filters: any = {}) {
  try {
    const agentCustomers = await customerRepository.findByAgentId(agentId);

    // Transform data for frontend
    const customers = agentCustomers.map((ac) => ({
      id: ac.customer.id,
      name: ac.customer.profile
        ? `${ac.customer.profile.firstName || ''} ${ac.customer.profile.lastName || ''}`.trim()
        : 'ไม่ระบุชื่อ',
      phoneNumber: ac.customer.phoneNumber,
      loanCount: ac.customer.loans.length,
      applicationCount: ac.customer.loanApplications.length,
      lastApplicationStatus: ac.customer.loanApplications[0]?.status || null,
      assignedAt: ac.assignedAt,
      profile: ac.customer.profile,
      isActive: ac.customer.isActive,
    }));

    // Apply search filter if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phoneNumber.includes(searchTerm)
      );
    }

    return customers;
  } catch (error) {
    console.error('Error fetching agent customers:', error);
    throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้');
  }
}
```

### 7. Duplicate Check Pattern

```typescript
async create(data: CustomerCreateSchema, agentId?: string) {
  try {
    // Normalize phone number
    const normalizedPhone = data.phoneNumber.replace(/\D/g, '');

    // Check if phone number already exists
    const existingCustomer = await customerRepository.findByPhoneNumber(normalizedPhone);
    if (existingCustomer) {
      throw new Error('เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว');
    }

    // Check if name already exists for this agent
    if (agentId) {
      const existingName = await prisma.agentCustomer.findFirst({
        where: {
          agentId,
          isActive: true,
          customer: {
            profile: {
              firstName: data.firstName,
              lastName: data.lastName || null,
            },
          },
        },
      });

      if (existingName) {
        const fullName = data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.firstName;
        throw new Error(`ลูกค้าชื่อ "${fullName}" มีอยู่ในระบบแล้ว`);
      }
    }

    // Create customer...
  } catch (error) {
    // Error handling...
  }
}
```

### 8. Relationship Management

```typescript
async assignToAgent(customerId: string, agentId: string) {
  try {
    // Check if relationship already exists
    const existing = await prisma.agentCustomer.findUnique({
      where: {
        agentId_customerId: {
          agentId,
          customerId,
        },
      },
    });

    if (existing) {
      // Reactivate if exists but inactive
      if (!existing.isActive) {
        return prisma.agentCustomer.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      throw new Error('ลูกค้านี้อยู่ภายใต้ Agent นี้อยู่แล้ว');
    }

    // Create new relationship
    return prisma.agentCustomer.create({
      data: {
        agentId,
        customerId,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error assigning customer to agent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถมอบหมายลูกค้าให้ Agent ได้');
  }
}
```

## Method Structure

1. **Query methods**: `getList`, `getById`, `getByField`, `search`
2. **Mutation methods**: `create`, `update`, `delete`, `assignTo`
3. **All methods should have try-catch with proper error handling**
