---
description: 'Pattern สำหรับ Client-side API calls ใน feature api.ts'
globs:
  - '**/features/**/api.ts'
alwaysApply: false
---

# Feature API Client Pattern

## โครงสร้างไฟล์ api.ts

```typescript
// src/features/[feature-name]/api.ts
import { api } from '@src/shared/lib/api-client';

import {
  type EntityCreateSchema,
  type EntityFiltersSchema,
  type EntityUpdateSchema,
} from './validations';

export const entityApi = {
  // ============================================
  // Query Methods
  // ============================================

  getList: async (filters?: EntityFiltersSchema) => {
    const searchParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return api.get(`/api/entities${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return api.get(`/api/entities/${id}`);
  },

  // ============================================
  // Mutation Methods
  // ============================================

  create: async (data: EntityCreateSchema) => {
    return api.post('/api/entities', data);
  },

  update: async (id: string, data: EntityUpdateSchema) => {
    return api.put(`/api/entities/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/api/entities/${id}`);
  },
};
```

## API Client Methods

ใช้ `api` object จาก `@src/shared/lib/api-client`:

```typescript
import { api } from '@src/shared/lib/api-client';

// GET request
api.get('/api/path');

// POST request (JSON)
api.post('/api/path', { key: value });

// POST request (FormData)
api.post('/api/path', formData);

// PUT request
api.put('/api/path', { key: value });

// PATCH request
api.patch('/api/path', { key: value });

// DELETE request
api.delete('/api/path');
```

## ข้อกำหนดสำคัญ

1. **Import**: ใช้ `api` จาก `@src/shared/lib/api-client`
2. **Export**: เป็น object เดียวชื่อ `[entity]Api`
3. **Standard CRUD**: `getList`, `getById`, `create`, `update`, `delete`
4. **Error handling**: `api` จะ throw Error อัตโนมัติ ไม่ต้อง handle เอง
5. **Search params**: สร้างจาก filters object สำหรับ getList
6. **Type imports**: import types จาก `./validations`

## File Upload Pattern

ใช้ FormData สำหรับ upload files:

```typescript
/**
 * Upload single file
 */
uploadFile: async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/api/upload', formData);
},

/**
 * Upload multiple files
 */
uploadFiles: async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });

  return api.post('/api/upload', formData);
},

/**
 * Upload with additional data
 */
createWithFile: async (data: CreateSchema, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // Add other fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return api.post('/api/entities', formData);
},
```

## Custom Operations

เพิ่ม methods ตามความต้องการ:

```typescript
export const loanApi = {
  // Standard CRUD...

  /**
   * Submit loan application
   */
  submit: async (data: LoanSubmitSchema) => {
    return api.post('/api/loans/submit', data);
  },

  /**
   * Analyze title deed with AI
   */
  analyzeTitleDeed: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/api/loans/title-deed/analyze', formData);
  },

  /**
   * Get loans by agent ID
   */
  getByAgentId: async (agentId: string) => {
    return api.get(`/api/loans/agent/${agentId}`);
  },

  /**
   * Update status
   */
  updateStatus: async (id: string, status: string, notes?: string) => {
    return api.patch(`/api/loans/${id}/status`, { status, notes });
  },
};
```

## Naming Convention

| Type        | Format    | Example             |
| ----------- | --------- | ------------------- |
| API Object  | camelCase | `loanApi`           |
| Methods     | camelCase | `getById`, `create` |
| Parameters  | camelCase | `agentId`           |
| Return Type | Promise   | `Promise<any>`      |

## ตัวอย่างจริงจากโปรเจค

```typescript
// src/features/loan/api.ts
import { api } from '@src/shared/lib/api-client';

export const loanApi = {
  submitApplication: async (data: any): Promise<any> => {
    return api.post('/api/loans/submit', data);
  },

  analyzeTitleDeed: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/loans/title-deed/analyze', formData);
  },

  uploadIdCard: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/loans/id-card/upload', formData);
  },

  getByAgentId: async (agentId: string): Promise<any> => {
    return api.get(`/api/loans/agent/${agentId}`);
  },

  getById: async (id: string): Promise<any> => {
    return api.get(`/api/loans/${id}`);
  },
};
```
