---
description: 'Security guidelines สำหรับ Infinitex App'
alwaysApply: false
globs:
  - '**/app/api/**/route.ts'
  - '**/services/**'
  - '**/middleware/**'
---

# Security Guidelines

## 1. Input Validation - Validate ทุก Input ฝั่ง Server

```typescript
// ✅ ถูก - validate ด้วย Zod ก่อนใช้งาน
const body = await request.json();
const validatedData = loanCreateSchema.parse(body); // throws if invalid

// ✅ ถูก - validate query params
const filters = Object.fromEntries(searchParams.entries());
const validatedFilters = loanFiltersSchema.parse(filters);

// ❌ ผิด - ใช้ input โดยตรงไม่ validate
const body = await request.json();
await loanService.create(body); // อันตราย!
```

## 2. SQL Injection Prevention

**ใช้ Prisma parameterized queries เสมอ:**

```typescript
// ✅ ถูก - Prisma handles escaping
const user = await prisma.user.findUnique({
  where: { phoneNumber: userInput },
});

// ❌ อันตรายมาก - raw SQL with string interpolation
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE phone = '${userInput}'
`; // SQL Injection vulnerability!

// ✅ ถ้าต้องใช้ raw SQL - ใช้ Prisma.$queryRaw with template literal
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE phone = ${userInput}
`; // Prisma will escape this
```

## 3. Sensitive Data - ห้าม Expose

### ห้าม return sensitive data

```typescript
// ❌ ผิด - return password/pin
return NextResponse.json({ data: user });

// ✅ ถูก - exclude sensitive fields
const { pin, otpSecret, ...safeUser } = user;
return NextResponse.json({ data: safeUser });
```

### ห้าม log sensitive data

```typescript
// ❌ ผิด
console.log('User data:', user); // อาจมี pin/otp

// ✅ ถูก
console.log('User ID:', user.id);
```

## 4. Error Messages - ห้าม Leak System Info

```typescript
// ❌ ผิด - expose internal error details
catch (error: any) {
  return NextResponse.json({
    success: false,
    message: error.message,  // อาจมี stack trace หรือ internal info
    stack: error.stack       // อันตรายมาก!
  });
}

// ✅ ถูก - generic error message
catch (error: any) {
  console.error('[API Error]:', error);  // log ไว้ดู internal
  return NextResponse.json({
    success: false,
    message: 'เกิดข้อผิดพลาด'  // generic message to client
  }, { status: 500 });
}
```

## 5. File Upload Security

```typescript
// ✅ Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('ประเภทไฟล์ไม่ถูกต้อง');
}

// ✅ Validate file size
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('ไฟล์มีขนาดใหญ่เกินไป');
}

// ✅ Generate safe filename
const safeFilename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
```

## 6. ID Validation

```typescript
// ✅ Validate ID exists before operations
async getById(id: string) {
  const entity = await repository.findById(id);
  if (!entity || entity.deletedAt) {
    throw new Error('ไม่พบข้อมูล');
  }
  return entity;
}

// ✅ Always verify ownership for user-specific data
async getByCustomerId(customerId: string, requestingUserId: string) {
  if (customerId !== requestingUserId) {
    throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
  }
  return repository.findByCustomerId(customerId);
}
```

## 7. Rate Limiting (ถ้าจำเป็น)

สำหรับ sensitive endpoints:

```typescript
// ควรใช้ rate limiting สำหรับ:
// - OTP requests
// - PIN verification
// - File uploads
// - AI analysis endpoints
```

## Security Checklist

เมื่อสร้าง API route ใหม่:

- [ ] Validate input ด้วย Zod
- [ ] ไม่ return sensitive data (pin, otpSecret, etc.)
- [ ] Error messages ไม่ leak system info
- [ ] Log errors ฝั่ง server
- [ ] Validate file type และ size สำหรับ uploads
- [ ] ตรวจสอบ ownership ถ้าเป็น user-specific data

## Common Validation Patterns

```typescript
// Phone number
z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง');

// ID Card (Thai)
z.string().length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก');

// PIN (4 digits)
z.string().length(4, 'PIN ต้องมี 4 หลัก').regex(/^[0-9]+$/, 'PIN ต้องเป็นตัวเลข');

// Amount
z.number().positive('จำนวนเงินต้องมากกว่า 0');

// File size
if (file.size > 10 * 1024 * 1024) {
  throw new Error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
}
```
