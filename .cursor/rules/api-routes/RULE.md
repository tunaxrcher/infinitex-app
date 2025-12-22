---
description: 'Pattern สำหรับ Next.js API routes ใน app/api'
globs:
  - '**/app/api/**/route.ts'
alwaysApply: false
---

# Next.js API Routes Pattern

## โครงสร้างไฟล์ route.ts

```typescript
// src/app/api/[entity]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { entityService } from '@src/features/[feature]/services/server';
import { entityCreateSchema } from '@src/features/[feature]/validations';

// ============================================
// GET - List/Search
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // Get user info from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userType = request.headers.get('x-user-type');

    // Check authorization if needed
    if (!userId || userType !== 'AGENT') {
      return NextResponse.json(
        { error: 'Agent access required' },
        { status: 403 }
      );
    }

    const filters = {
      search: search || undefined,
    };

    const result = await entityService.getList(userId, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/entities error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = entityCreateSchema.parse(body);

    // Get user info from headers
    const userId = request.headers.get('x-user-id');
    const userType = request.headers.get('x-user-type');

    if (!userId || userType !== 'AGENT') {
      return NextResponse.json(
        { error: 'Agent access required' },
        { status: 403 }
      );
    }

    const result = await entityService.create(validatedData, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/entities error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
```

## Dynamic Route Pattern

```typescript
// src/app/api/[entity]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { entityService } from '@src/features/[feature]/services/server';
import { entityUpdateSchema } from '@src/features/[feature]/validations';

type RouteParams = { params: Promise<{ id: string }> };

// ============================================
// GET - Get by ID
// ============================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await entityService.getById(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`GET /api/entities/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: error instanceof Error && error.message === 'ไม่พบข้อมูล' ? 404 : 500 }
    );
  }
}

// ============================================
// PUT - Update
// ============================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = entityUpdateSchema.parse(body);

    const result = await entityService.update(id, validatedData);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`PUT /api/entities/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete
// ============================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await entityService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/entities/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
```

## ⚠️ หลักการสำคัญ: แยก Logic ไปที่ Service

**API Route ต้องบาง (thin) - ไม่ควรมี business logic ใดๆ**

### หน้าที่ของ API Route:

1. ✅ รับ request (query params, body, formData)
2. ✅ ดึง user info จาก headers (`x-user-id`, `x-user-type`)
3. ✅ ตรวจสอบ authorization เบื้องต้น
4. ✅ Validate ด้วย Zod schema
5. ✅ เรียก service method
6. ✅ Return response
7. ✅ Handle errors และ log

### สิ่งที่ไม่ควรทำใน API Route:

- ❌ เขียน query database โดยตรง
- ❌ เขียน business logic
- ❌ เรียก repository โดยตรง (ต้องผ่าน service)
- ❌ Import prisma โดยตรง

---

## Auth Pattern

ใช้ headers จาก middleware:

```typescript
// Get user info from headers (set by middleware)
const userId = request.headers.get('x-user-id');
const userType = request.headers.get('x-user-type');

// Check authorization
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

if (userType !== 'AGENT') {
  return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
}
```

## Response Format

**โปรเจคนี้ใช้ 2 รูปแบบ:**

### แบบที่ 1: Return data โดยตรง (ใช้บ่อย)

```typescript
const result = await entityService.getList(filters);
return NextResponse.json(result);
```

### แบบที่ 2: Wrapped response (เมื่อต้องการ success flag)

```typescript
return NextResponse.json({
  success: true,
  data: result,
  message: 'สำเร็จ',
});
```

### Error response

```typescript
return NextResponse.json(
  { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
  { status: 500 }
);
```

## Error Logging

```typescript
console.error('GET /api/customers error:', error);
console.error(`PUT /api/customers/${id} error:`, error);
```

## Validation Pattern

```typescript
// Query params
const searchParams = request.nextUrl.searchParams;
const search = searchParams.get('search');

// Body with Zod
const body = await request.json();
const validatedData = entityCreateSchema.parse(body);

// Handle Zod errors
if (error instanceof Error && error.name === 'ZodError') {
  return NextResponse.json(
    { error: 'ข้อมูลไม่ถูกต้อง', details: error.message },
    { status: 400 }
  );
}
```

## File Upload Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'กรุณาเลือกไฟล์' },
        { status: 400 }
      );
    }

    const result = await fileService.processAndUpload(file);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
```
