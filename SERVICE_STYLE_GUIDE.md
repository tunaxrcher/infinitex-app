# Service Layer Style Guide

> คู่มือการเขียน Service Layer สำหรับโปรเจค InfiniteX
>
> **หลักการสำคัญ**: Service Layer เป็นชั้นที่จัดการ Business Logic และ orchestrate การทำงานระหว่าง Repositories, External APIs, และ Services อื่นๆ

---

## 📋 Table of Contents

1. [โครงสร้างไฟล์](#โครงสร้างไฟล์)
2. [หลักการพื้นฐาน](#หลักการพื้นฐาน)
3. [Service Structure](#service-structure)
4. [Repository Usage](#repository-usage)
5. [Error Handling](#error-handling)
6. [Function Organization](#function-organization)
7. [Examples](#examples)
8. [Anti-Patterns](#anti-patterns)

---

## โครงสร้างไฟล์

```
src/features/[feature-name]/
├── services/
│   └── server.ts           # Server-side services
├── repositories/
│   └── [model]Repository.ts
├── validations.ts
└── types.ts
```

### ตัวอย่าง:

```
src/features/loan/
├── services/
│   └── server.ts          # loanService
├── repositories/
│   └── loanApplicationRepository.ts
├── validations.ts
└── types.ts
```

---

## หลักการพื้นฐาน

### ✅ DO

1. **ใช้ Repository สำหรับ Database Operations**

   ```typescript
   // ✅ ดี
   import { userRepository } from '@src/features/customer/repositories/userRepository'

   const user = await userRepository.findByPhone(phoneNumber)
   ```

2. **แยก Business Logic ออกเป็น Private Methods**

   ```typescript
   // ✅ ดี
   export const loanService = {
     async submitApplication(data) {
       const user = await this._handleUser(data)
       const application = await this._createApplication(user, data)
       await this._sendNotifications(application)
       return application
     },

     // Private helper methods
     async _handleUser(data) { ... },
     async _createApplication(user, data) { ... },
     async _sendNotifications(application) { ... },
   }
   ```

3. **ใช้ Shared Prisma Instance**

   ```typescript
   // ✅ ดี
   import { prisma } from '@src/shared/lib/db'
   ```

4. **Log ทุกขั้นตอนสำคัญ**

   ```typescript
   // ✅ ดี
   console.log('[ServiceName] Starting operation')
   console.log('[ServiceName] Step 1 completed:', result)
   console.error('[ServiceName] Error occurred:', error)
   ```

5. **Validate Input ที่ API Layer ก่อนส่งเข้า Service**
   ```typescript
   // ใน API Route
   const validatedData = schema.parse(body)
   const result = await service.method(validatedData)
   ```

### ❌ DON'T

1. **ห้ามสร้าง PrismaClient Instance ใหม่**

   ```typescript
   // ❌ ไม่ดี
   const prisma = new PrismaClient()
   ```

2. **ห้าม Direct Prisma Calls (ควรใช้ Repository)**

   ```typescript
   // ❌ ไม่ดี
   const user = await prisma.user.findUnique({ where: { id } })

   // ✅ ดี
   const user = await userRepository.findById(id)
   ```

3. **ห้ามเขียน Function ยาวเกิน 100 บรรทัด**

   ```typescript
   // ❌ ไม่ดี - Function 300 บรรทัด
   async submitApplication() {
     // 300 lines of code...
   }

   // ✅ ดี - แยกเป็น smaller functions
   async submitApplication() {
     const user = await this._handleUser()
     const app = await this._createApp(user)
     return app
   }
   ```

4. **ห้ามรวม Validation Logic ใน Service**

   ```typescript
   // ❌ ไม่ดี
   async create(data) {
     if (!data.email) throw new Error('Email required')
     if (!data.name) throw new Error('Name required')
     // ...
   }

   // ✅ ดี - Validate ที่ API layer ด้วย Zod schema
   ```

---

## Service Structure

### Template

```typescript
// src/features/[feature]/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { [model]Repository } from '../repositories/[model]Repository'
import { type SchemaType } from '../validations'

export const [feature]Service = {
  /**
   * Public method with clear documentation
   * @param data - Input data
   * @returns Result object
   */
  async publicMethod(data: SchemaType) {
    console.log('[ServiceName] Starting operation')

    // Orchestrate operations
    const step1Result = await this._privateHelper1(data)
    const step2Result = await this._privateHelper2(step1Result)

    return {
      success: true,
      data: step2Result,
    }
  },

  /**
   * Private helper method (prefix with _)
   */
  async _privateHelper1(data: any) {
    // Use repository for DB operations
    return await [model]Repository.method(data)
  },

  /**
   * Another private helper
   */
  _privateHelper2(data: any) {
    // Pure business logic
    return data
  },
}
```

---

## Repository Usage

### กฎการใช้งาน

1. **ทุก Database Operations ต้องผ่าน Repository**

```typescript
// ✅ ดี
export const loanService = {
  async getById(id: string) {
    return await loanRepository.findById(id)
  },

  async create(data: CreateSchema) {
    return await loanRepository.create({ data })
  },
}
```

2. **ถ้ายังไม่มี Repository ให้สร้างก่อน**

```typescript
// สร้างไฟล์: src/features/customer/repositories/userRepository.ts
import { prisma } from '@src/shared/lib/db'

export const userRepository = {
  async findByPhone(phoneNumber: string) {
    return await prisma.user.findUnique({
      where: { phoneNumber },
      include: { profile: true },
    })
  },

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    })
  },

  async create(data: any) {
    return await prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        pin: data.pin,
        userType: data.userType,
        profile: { create: {} },
      },
      include: { profile: true },
    })
  },

  async updatePin(id: string, hashedPin: string) {
    return await prisma.user.update({
      where: { id },
      data: { pin: hashedPin },
    })
  },
}
```

3. **Service เรียกใช้ Repository**

```typescript
// ใน loanService
import { userRepository } from '@src/features/customer/repositories/userRepository'

export const loanService = {
  async _handleUser(phoneNumber: string) {
    let user = await userRepository.findByPhone(phoneNumber)

    if (!user) {
      user = await userRepository.create({
        phoneNumber,
        userType: 'CUSTOMER',
      })
    }

    return user
  },
}
```

---

## Error Handling

### Pattern

```typescript
export const myService = {
  async operation(data: any) {
    try {
      console.log('[ServiceName] Starting operation')

      // Operation logic
      const result = await this._doSomething(data)

      console.log('[ServiceName] Operation completed successfully')
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error('[ServiceName] Operation failed:', error)

      // Re-throw with context
      throw new Error(`Failed to perform operation: ${error.message}`)
    }
  },

  async _doSomething(data: any) {
    // Specific error handling
    const record = await repository.find(data.id)
    if (!record) {
      throw new Error('Record not found')
    }
    return record
  },
}
```

### ใน API Route

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.parse(body)

    const result = await myService.operation(validated)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[API] Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

---

## Function Organization

### 1. Single Responsibility

แต่ละ function ควรมีหน้าที่เดียว:

```typescript
// ❌ ไม่ดี - ทำหลายอย่าง
async submitApplication(data) {
  // Create user
  // Validate property
  // Upload images
  // Create application
  // Send notifications
  // 200+ lines...
}

// ✅ ดี - แยกความรับผิดชอบ
async submitApplication(data) {
  const user = await this._handleUser(data)
  const property = await this._validateProperty(data)
  const images = await this._uploadImages(data)
  const app = await this._createApplication(user, property, images)
  await this._notifyStakeholders(app)
  return app
}
```

### 2. Function Size

- **Public methods**: ไม่เกิน 50 บรรทัด
- **Private helpers**: ไม่เกิน 30 บรรทัด
- ถ้าเกิน ให้แยกออกเป็น sub-functions

### 3. Naming Convention

```typescript
// Public methods - camelCase, descriptive
async submitApplication()
async getById()
async updateStatus()

// Private methods - prefix with underscore
async _handleUser()
async _validateProperty()
async _uploadImages()

// Boolean methods - prefix with is/has/can
_isValidData()
_hasRequiredFields()
_canProcess()
```

---

## Examples

### ตัวอย่างที่ดี ✅

```typescript
// src/features/loan/services/server.ts
import { userRepository } from '@src/features/customer/repositories/userRepository'
import { aiService } from '@src/shared/lib/ai-services'
import { prisma } from '@src/shared/lib/db'
import { storage } from '@src/shared/lib/storage'
import 'server-only'

import { loanApplicationRepository } from '../repositories/loanApplicationRepository'
import { type LoanSubmissionSchema } from '../validations'

export const loanService = {
  /**
   * Submit loan application with complete workflow
   */
  async submitApplication(
    data: LoanSubmissionSchema,
    agentId?: string,
    customerId?: string
  ) {
    console.log('[LoanService] Starting submission')

    // Step 1: Handle user creation/authentication
    const user = await this._handleUserCreation(
      data.phoneNumber,
      data.pin,
      customerId,
      agentId
    )

    // Step 2: Process property information
    const propertyInfo = this._extractPropertyInfo(data)

    // Step 3: Create loan application
    const application = await this._createLoanApplication({
      user,
      data,
      propertyInfo,
      agentId,
    })

    // Step 4: Post-submission tasks
    await Promise.all([
      this._createAuditLog(application.id, user.id, agentId),
      this._sendNotifications(application, agentId),
    ])

    console.log('[LoanService] Submission completed:', application.id)

    return {
      loanApplicationId: application.id,
      userId: user.id,
      agentId: agentId || null,
    }
  },

  /**
   * Handle user creation or retrieval
   */
  async _handleUserCreation(
    phoneNumber: string,
    pin?: string,
    customerId?: string,
    agentId?: string
  ) {
    // If logged-in customer, use existing
    if (customerId) {
      const user = await userRepository.findById(customerId)
      if (!user) throw new Error('User not found')
      return user
    }

    // Find or create by phone
    let user = await userRepository.findByPhone(phoneNumber)

    if (!user) {
      // Create new user
      const hashedPin = pin
        ? await this._hashPin(pin)
        : await this._generateDefaultPin(phoneNumber)
      user = await userRepository.create({
        phoneNumber,
        pin: hashedPin,
        userType: 'CUSTOMER',
      })
    } else if (pin) {
      // Update existing user's PIN
      const hashedPin = await this._hashPin(pin)
      await userRepository.updatePin(user.id, hashedPin)
    }

    return user
  },

  /**
   * Extract property information from various sources
   */
  _extractPropertyInfo(data: LoanSubmissionSchema) {
    const { titleDeedData, titleDeedManualData, titleDeedAnalysis } = data

    let info: any = {}

    // From API data
    if (titleDeedData?.result?.[0]) {
      const deed = titleDeedData.result[0]
      info = {
        propertyLocation:
          `${deed.tumbolname || ''} ${deed.amphurname || ''} ${deed.provname || ''}`.trim(),
        propertyArea: `${deed.rai || 0} ไร่ ${deed.ngan || 0} งาน ${deed.wa || 0} ตรว.`,
        landNumber: deed.parcelno || '',
      }
    }

    // Merge manual data
    if (titleDeedManualData) {
      info = {
        ...info,
        propertyLocation:
          info.propertyLocation ||
          `${titleDeedManualData.amName || ''} ${titleDeedManualData.pvName || ''}`.trim(),
        landNumber: info.landNumber || titleDeedManualData.parcelNo,
      }
    }

    return info
  },

  /**
   * Create loan application record
   */
  async _createLoanApplication(params: {
    user: any
    data: LoanSubmissionSchema
    propertyInfo: any
    agentId?: string
  }) {
    const { user, data, propertyInfo, agentId } = params

    return await loanApplicationRepository.createWithFullData({
      customerId: user.id,
      agentId: agentId || null,
      loanType: data.loanType || 'HOUSE_LAND_MORTGAGE',
      status: 'UNDER_REVIEW',
      titleDeedImage: data.titleDeedImageUrl,
      supportingImages: data.supportingImages,
      idCardFrontImage: data.idCardImageUrl,
      requestedAmount: data.requestedLoanAmount,
      maxApprovedAmount: data.loanAmount,
      ownerName: data.ownerName || null,
      ...propertyInfo,
      propertyValue: data.propertyValuation?.estimatedValue,
      submittedAt: new Date(),
    })
  },

  /**
   * Create audit log entry
   */
  async _createAuditLog(
    loanApplicationId: string,
    userId: string,
    agentId?: string
  ) {
    await prisma.auditLog.create({
      data: {
        adminId: agentId || null,
        action: 'LOAN_APPLICATION_SUBMITTED',
        entity: 'LoanApplication',
        entityId: loanApplicationId,
        newData: { userId, agentId },
        ipAddress: 'unknown',
        userAgent: 'unknown',
      },
    })
  },

  /**
   * Send notifications (LINE, Email, etc.)
   */
  async _sendNotifications(application: any, agentId?: string) {
    if (!agentId) return // Only for agent flow

    try {
      // Send LINE notification logic here
      console.log('[LoanService] Notification sent')
    } catch (error) {
      console.error('[LoanService] Notification failed:', error)
      // Don't fail the entire flow
    }
  },

  // Other helper methods
  async _hashPin(pin: string) {
    const bcrypt = await import('bcryptjs')
    return await bcrypt.hash(pin, 10)
  },

  async _generateDefaultPin(phoneNumber: string) {
    const defaultPin = phoneNumber.slice(-4)
    return await this._hashPin(defaultPin)
  },
}
```

---

## Anti-Patterns

### ❌ ห้ามทำ

#### 1. Direct Prisma Calls

```typescript
// ❌ ไม่ดี
export const badService = {
  async getUser(id: string) {
    return await prisma.user.findUnique({ where: { id } })
  },
}

// ✅ ดี
export const goodService = {
  async getUser(id: string) {
    return await userRepository.findById(id)
  },
}
```

#### 2. God Function (Function ที่ใหญ่เกินไป)

```typescript
// ❌ ไม่ดี - 200+ บรรทัด
async submitApplication(data) {
  // User logic (50 lines)
  // Property logic (50 lines)
  // Upload logic (50 lines)
  // Notification logic (50 lines)
}

// ✅ ดี - แยกเป็น smaller functions
async submitApplication(data) {
  const user = await this._handleUser(data)      // 20 lines
  const property = await this._handleProperty(data)  // 20 lines
  const uploads = await this._handleUploads(data)    // 20 lines
  await this._sendNotifications()                    // 20 lines
  return { user, property, uploads }
}
```

#### 3. Mixed Concerns

```typescript
// ❌ ไม่ดี - ปนกันระหว่าง validation, business logic, และ data access
async create(data) {
  if (!data.email) throw new Error('Invalid')  // Validation
  const user = await prisma.user.create({ data })  // Direct DB
  await sendEmail(user.email)  // Side effect
  return user
}

// ✅ ดี - แยกความรับผิดชอบ
// API Layer: Validation
const validated = schema.parse(data)

// Service Layer: Business logic + orchestration
const user = await userRepository.create(validated)
await emailService.sendWelcome(user.email)
```

#### 4. ไม่มี Error Handling

```typescript
// ❌ ไม่ดี
async operation(data) {
  const result = await repository.find(data.id)
  return result.value  // อาจ error ถ้า result เป็น null
}

// ✅ ดี
async operation(data) {
  const result = await repository.find(data.id)
  if (!result) {
    throw new Error('Resource not found')
  }
  return result.value
}
```

#### 5. ไม่มี Logging

```typescript
// ❌ ไม่ดี
async importantOperation(data) {
  const result = await doSomething(data)
  return result
}

// ✅ ดี
async importantOperation(data) {
  console.log('[ServiceName] Starting important operation')
  console.log('[ServiceName] Input:', { dataId: data.id })

  const result = await doSomething(data)

  console.log('[ServiceName] Operation completed:', { resultId: result.id })
  return result
}
```

---

## Checklist

เมื่อเขียน Service ใหม่หรือ Refactor Service เก่า ให้ตรวจสอบ:

- [ ] ใช้ Repository สำหรับทุก Database operations
- [ ] ใช้ `import { prisma } from '@src/shared/lib/db'` แทน `new PrismaClient()`
- [ ] Function แต่ละตัวไม่เกิน 50 บรรทัด (public) หรือ 30 บรรทัด (private)
- [ ] แยก Business Logic ออกเป็น private methods (prefix `_`)
- [ ] มี Error Handling ที่เหมาะสม
- [ ] มี Logging ทุกขั้นตอนสำคัญ
- [ ] มี JSDoc comments สำหรับ public methods
- [ ] ไม่มี Validation Logic (ควรทำที่ API layer)
- [ ] ไม่ mix concerns (แยก responsibilities ชัดเจน)
- [ ] ใช้ TypeScript types จาก validations.ts

---

## สรุป

**Service Layer ที่ดี:**

- ✅ ใช้ Repository เสมอ
- ✅ Functions สั้น กระชับ อ่านง่าย
- ✅ มี Error Handling และ Logging
- ✅ แยก Business Logic ชัดเจน
- ✅ Single Responsibility per Function

**ข้อควรหลีกเลี่ยง:**

- ❌ Direct Prisma calls
- ❌ God functions (200+ lines)
- ❌ Mixed concerns
- ❌ ไม่มี error handling
- ❌ ไม่มี logging

---

**อัพเดทล่าสุด**: 2025-01-04
**เวอร์ชัน**: 1.0.0
