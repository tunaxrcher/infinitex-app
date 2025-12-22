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
import 'server-only';

import { entityRepository } from '../repositories/entityRepository';
import {
  type EntityCreateSchema,
  type EntityFiltersSchema,
  type EntityUpdateSchema,
} from '../validations';

export const entityService = {
  // ============================================
  // Query Methods
  // ============================================

  async getList(filters: EntityFiltersSchema) {
    const where: any = { deletedAt: null };

    // Build where clause from filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    return entityRepository.paginate({
      where,
      orderBy: { createdAt: 'desc' },
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  },

  async getById(id: string) {
    const entity = await entityRepository.findById(id);
    if (!entity || entity.deletedAt) {
      throw new Error('ไม่พบข้อมูล');
    }
    return entity;
  },

  // ============================================
  // Mutation Methods
  // ============================================

  async create(data: EntityCreateSchema) {
    // Business logic validation
    await this.validateBusinessRules(data);

    return entityRepository.create(data);
  },

  async update(id: string, data: EntityUpdateSchema) {
    // Verify existence
    await this.getById(id);

    // Business logic validation
    await this.validateBusinessRules(data);

    return entityRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  },

  async delete(id: string) {
    // Verify existence
    await this.getById(id);

    // Soft delete
    return entityRepository.update(id, {
      deletedAt: new Date(),
    });
  },

  // ============================================
  // Business Logic Methods
  // ============================================

  async validateBusinessRules(data: any) {
    // Add business validation logic here
  },
};
```

## ข้อกำหนดสำคัญ

### 1. Server-Only Directive

```typescript
import 'server-only'; // บรรทัดแรกเสมอ!
```

### 2. ID Format - String (cuid)

```typescript
// ✅ ถูก - String ID
async getById(id: string) {
  const entity = await entityRepository.findById(id);
  // ...
}

// ❌ ผิด - Number ID
async getById(id: number) {
  // ไม่ใช้ Number ในโปรเจคนี้
}
```

### 3. Error Messages ภาษาไทย

```typescript
throw new Error('ไม่พบข้อมูล');
throw new Error('ไม่มีสิทธิ์ดำเนินการ');
throw new Error('ข้อมูลซ้ำ');
throw new Error('สถานะไม่ถูกต้อง');
throw new Error('กรุณาอัพโหลดรูปโฉนดที่ดิน');
```

### 4. Soft Delete Pattern

```typescript
async delete(id: string) {
  // Verify existence
  await this.getById(id);

  // Soft delete
  return entityRepository.update(id, {
    deletedAt: new Date(),
  });
}
```

### 5. Filter Building Pattern

```typescript
const where: any = { deletedAt: null };

if (filters.search) {
  where.OR = [
    /* search fields */
  ];
}

if (filters.status) {
  where.status = filters.status;
}

// Date range
if (filters.dateFrom || filters.dateTo) {
  where.createdAt = {};
  if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
  if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
}
```

### Method Structure

1. **Query methods**: `getList`, `getById`, `getByField`
2. **Mutation methods**: `create`, `update`, `delete`
3. **Business logic**: `validateBusinessRules`, custom validations
4. **Helpers**: private methods สำหรับ logic ที่ซ้ำ

## ตัวอย่างจริงจากโปรเจค

```typescript
// src/features/loan/services/server.ts
import 'server-only';

import { prisma } from '@src/shared/lib/db';
import { uploadToStorage } from '@src/shared/lib/storage';
import { analyzeImageWithAI } from '@src/shared/lib/ai-services';

import { loanApplicationRepository } from '../repositories/loanApplicationRepository';

export const loanService = {
  async getByAgentId(agentId: string) {
    return loanApplicationRepository.findByAgentId(agentId);
  },

  async getById(id: string) {
    const application = await loanApplicationRepository.findById(id);
    if (!application) {
      throw new Error('ไม่พบข้อมูลคำขอสินเชื่อ');
    }
    return application;
  },

  async analyzeTitleDeed(file: File) {
    // Upload file
    const fileUrl = await uploadToStorage(file, 'title-deeds');

    // Analyze with AI
    const analysis = await analyzeImageWithAI(file);

    return {
      fileUrl,
      analysis,
    };
  },

  async submitApplication(data: LoanApplicationSubmissionSchema) {
    // Validate required fields
    if (!data.titleDeedImage) {
      throw new Error('กรุณาอัพโหลดรูปโฉนดที่ดิน');
    }

    if (!data.requestedAmount || data.requestedAmount <= 0) {
      throw new Error('กรุณาระบุจำนวนเงินที่ต้องการกู้');
    }

    // Create application
    return loanApplicationRepository.create({
      customerId: data.customerId,
      agentId: data.agentId,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      // ... other fields
    });
  },

  async updateStatus(
    id: string,
    status: string,
    reviewNotes?: string
  ) {
    const application = await this.getById(id);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['SUBMITTED', 'CANCELLED'],
      'SUBMITTED': ['UNDER_REVIEW', 'CANCELLED'],
      'UNDER_REVIEW': ['APPROVED', 'REJECTED'],
    };

    const allowed = validTransitions[application.status] || [];
    if (!allowed.includes(status)) {
      throw new Error('การเปลี่ยนสถานะไม่ถูกต้อง');
    }

    return loanApplicationRepository.update(id, {
      status,
      reviewNotes,
      reviewedAt: new Date(),
    });
  },
};
```

## AI Service Integration

```typescript
async analyzeWithAI(file: File) {
  try {
    const result = await analyzeImageWithAI(file);
    return result;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
  }
}
```

## File Upload Pattern

```typescript
async uploadAndProcess(file: File, folder: string) {
  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)');
  }

  // Upload to storage
  const fileUrl = await uploadToStorage(file, folder);

  return { fileUrl };
}
```
