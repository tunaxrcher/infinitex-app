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
import {
  entityCreateSchema,
  entityFiltersSchema,
} from '@src/features/[feature]/validations';

// ============================================
// GET - List/Search
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = Object.fromEntries(searchParams.entries());
    const validatedFilters = entityFiltersSchema.parse(filters);

    const result = await entityService.getList(validatedFilters);

    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error('[API Error] GET /api/entities:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
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
    const validatedData = entityCreateSchema.parse(body);

    const result = await entityService.create(validatedData);

    return NextResponse.json({
      success: true,
      message: 'สร้างรายการสำเร็จ',
      data: result,
    });
  } catch (error: any) {
    console.error('[API Error] POST /api/entities:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
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

    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result,
    });
  } catch (error: any) {
    console.error(`[API Error] GET /api/entities/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: error.message === 'ไม่พบข้อมูล' ? 404 : 500 }
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

    return NextResponse.json({
      success: true,
      message: 'แก้ไขรายการสำเร็จ',
      data: result,
    });
  } catch (error: any) {
    console.error(`[API Error] PUT /api/entities/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Soft Delete
// ============================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await entityService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'ลบรายการสำเร็จ',
    });
  } catch (error: any) {
    console.error(`[API Error] DELETE /api/entities/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: 500 }
    );
  }
}
```

## ⚠️ หลักการสำคัญ: แยก Logic ไปที่ Service

**API Route ต้องบาง (thin) - ไม่ควรมี business logic ใดๆ**

```typescript
// ❌ ผิด - เขียน logic ใน route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  // ❌ ไม่ควรมี business logic ใน route
  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber: body.phone },
  });
  if (existingUser) {
    throw new Error('เบอร์นี้ถูกใช้งานแล้ว');
  }

  const user = await prisma.user.create({
    data: { ...body },
  });

  return NextResponse.json({ success: true, data: user });
}

// ✅ ถูก - route เรียก service เท่านั้น
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = userCreateSchema.parse(body);

  const result = await userService.create(validatedData);

  return NextResponse.json({ success: true, data: result });
}
```

### หน้าที่ของ API Route:

1. ✅ รับ request (query params, body, formData)
2. ✅ Validate ด้วย Zod schema
3. ✅ เรียก service method
4. ✅ Return response ในรูปแบบมาตรฐาน
5. ✅ Handle errors และ log

### สิ่งที่ไม่ควรทำใน API Route:

- ❌ เขียน query database โดยตรง
- ❌ เขียน business logic (validation rules, calculations)
- ❌ เรียก repository โดยตรง (ต้องผ่าน service)
- ❌ Import prisma โดยตรง

---

## Response Format

```typescript
// Success response
{
  success: true,
  message: 'สำเร็จ',  // ภาษาไทย
  data: result,
  meta?: { page, limit, total, totalPages },  // สำหรับ pagination
}

// Error response
{
  success: false,
  message: error.message || 'เกิดข้อผิดพลาด',
}
```

## Error Logging

```typescript
console.error('[API Error] METHOD /api/path:', error);
```

## Validation Pattern

```typescript
// Query params
const filters = Object.fromEntries(searchParams.entries());
const validatedFilters = entityFiltersSchema.parse(filters);

// Body
const body = await request.json();
const validatedData = entityCreateSchema.parse(body);
```

## File Upload Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเลือกไฟล์' },
        { status: 400 }
      );
    }

    // Process with service
    const result = await fileService.processAndUpload(file);

    return NextResponse.json({
      success: true,
      message: 'อัปโหลดสำเร็จ',
      data: result,
    });
  } catch (error: any) {
    console.error('[API Error] POST /api/upload:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
```

## Common Success Messages

```typescript
'สำเร็จ';
'สร้างรายการสำเร็จ';
'แก้ไขรายการสำเร็จ';
'ลบรายการสำเร็จ';
'อนุมัติสำเร็จ';
'ยกเลิกสำเร็จ';
'อัปโหลดสำเร็จ';
'ส่งคำขอสินเชื่อสำเร็จ';
```
