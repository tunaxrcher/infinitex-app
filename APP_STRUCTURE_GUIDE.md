# 📖 InfiniteX App Structure Guide

## 🏗️ **โครงสร้างโปรเจคโดยรวม**

```
📁 InfiniteX Architecture:
src/
├── app/                   # Next.js Pages (View Layer)
│   ├── (layout)/         # Main layout group - ครอบทุก UI pages
│   │   ├── (shared)/     # Shared pages - ใช้ร่วมกัน Customer & Agent
│   │   ├── customer/     # Customer-only pages
│   │   ├── agent/        # Agent-only pages
│   │   └── login/        # Public pages
│   ├── page.tsx         # Homepage (root)
│   └── layout.tsx       # Root layout
├── features/             # Business Logic Layer (Domain-driven)
├── shared/              # Infrastructure Layer (Reusable)
├── middleware.ts        # Server-side Security
└── prisma/             # Database Layer
```

### **🎯 ประโยชน์ของ (layout) Organization:**

#### **1. Visual Hierarchy**

- **Clear Grouping:** ทุก UI pages อยู่ใน (layout)/ เดียวกัน
- **Easy Navigation:** เห็น structure ได้ชัดเจน
- **Logical Separation:** แยก UI จาก config files (middleware, etc.)

#### **2. Potential Shared Layout**

```typescript
// อนาคตสามารถเพิ่ม:
app/(layout)/layout.tsx → Layout สำหรับทุกหน้าใน (layout)/
```

#### **3. Clean Root Directory**

```typescript
app/
├── (layout)/          ← ทุก UI pages
├── api/              ← API routes (อนาคต)
├── globals.css       ← Styles
├── layout.tsx        ← Root layout
└── page.tsx          ← Homepage
```

---

## 🏠 **Root Pages**

### **หน้าหลัก (`/`)**

```
URL: infinitex.com/
File: app/page.tsx
Access: ✅ Customer ✅ Agent (ต้อง login)
Component: HomePage
```

**📋 หน้าที่และ Sections:**

- **🎯 Section 1: Banner Carousel**
  - แสดงโฆษณาแบบ slideshow
  - เปลี่ยนอัตโนมัติทุก 5 วินาที
  - มี dots indicator สำหรับเลือก slide

- **⚡ Section 2: Quick Actions**
  - เมนูลัด 3 ปุ่ม แสดงต่างกันตาม user type:
  - **Customer:** ดูบิล/จ่ายบิล | ผลิตภัณฑ์ของฉัน | ติดต่อ
  - **Agent:** ดูบิล/จ่ายบิล | ผลิตภัณฑ์ของลูกค้า | ติดต่อ
  - เชื่อมโยงไปหน้าต่างๆ ตาม user context

- **🎁 Section 3: Privileges Section**
  - แสดงสิทธิพิเศษต่างๆ
  - โปรโมชั่น, ข้อเสนอพิเศษ
  - ของรางวัลที่แลกได้ด้วย Coins

**🎨 Design Features:**

- Gradient background animation ส่วนบน (35vh)
- พื้นหลังขาวส่วนล่าง
- Responsive mobile-first design

---

## 🔐 **Public Routes**

### **หน้า Login (`/login`)**

```
URL: infinitex.com/login
File: app/(layout)/login/page.tsx
Access: ✅ ทุกคน (ไม่ต้อง login)
Component: LoginPage → LoginForm
```

**📋 หน้าที่:**

- **📱 Login Form**
  - กรอกเบอร์โทรศัพท์ (auto-format เป็น 08X-XXX-XXXX)
  - กรอก PIN 4 หลัก (มี show/hide toggle)
  - Validation และ error handling

- **🧪 Demo Accounts**
  - **ลูกค้า:** 081-234-5678 | PIN: 1234
  - **เอเจนต์:** 088-765-4321 | PIN: 1234

- **🔒 Authentication Logic**
  - Mock authentication ด้วย hardcoded users
  - เก็บ user data ใน localStorage + cookies
  - Auto-redirect ตาม user type หลัง login สำเร็จ

**🎨 Design Features:**

- Gradient background
- Loading states
- Error message display
- Mobile-optimized layout

---

## 🤝 **Shared Routes (`(shared)/` - ใช้ร่วมกัน)**

### **🔔 หน้าแจ้งเตือน (`/notifications`)**

```
URL: infinitex.com/notifications
File: app/(layout)/(shared)/notifications/page.tsx
Access: ✅ Customer ✅ Agent
Component: NotificationsPage → NotificationsList
```

**📋 หน้าที่:**

- **📬 Notifications List**
  - รายการแจ้งเตือนทั้งหมด
  - แยกประเภท: Payment due, Loan approved/rejected, System announcements
  - สถานะ read/unread
  - วันที่และเวลา

- **🔔 Notification Types**
  - `PAYMENT_DUE` - แจ้งเตือนการชำระ
  - `LOAN_APPROVED` - สินเชื่ออนุมัติ
  - `LOAN_REJECTED` - สินเชื่อไม่อนุมัติ
  - `SYSTEM_ANNOUNCEMENT` - ประกาศระบบ
  - `PROMOTION` - โปรโมชั่น

**🎨 Design Features:**

- List layout with icons
- Read/unread visual distinction
- Pull-to-refresh (future)

### **⚙️ หน้าเมนูอื่นๆ (`/more`)**

```
URL: infinitex.com/more
Access: ✅ Customer ✅ Agent
Component: MorePage → MoreMenuList
```

**📋 หน้าที่:**

- **👤 User Profile Card**
  - แสดงชื่อ-นามสกุล (จาก Auth Context)
  - เบอร์โทรศัพท์
  - สถานะสมาชิกตั้งแต่เมื่อไหร่
  - **Coin Balance** พร้อมไอคอน
  - **User Type Badge** (ลูกค้า/เอเจนต์)

- **🌙 Theme Toggle**
  - เปลี่ยนระหว่าง Light/Dark mode
  - Switch component พร้อม icon

- **📂 Menu Sections:**

  **บัญชีของฉัน:**
  - โปรไฟล์ (ข้อมูลส่วนตัว, การตั้งค่าบัญชี)
  - InfiniteX Coins (ระบบแต้ม) + Badge "ใหม่"
  - ตั้งค่า (การแจ้งเตือน, ความปลอดภัย)

  **ความช่วยเหลือ:**
  - วิธีการใช้งาน (คู่มือการใช้แอป)
  - ติดต่อเรา (Call Center: 1234)
  - ให้คะแนนแอป (ช่วยปรับปรุงแอป)

  **ข้อมูลทั่วไป:**
  - เงื่อนไขการใช้งาน
  - นโยบายความเป็นส่วนตัว

- **🚪 Logout Section**
  - ปุ่มออกจากระบบ (สีแดง)
  - ลบ localStorage + cookies
  - Redirect ไป `/login`

- **ℹ️ App Information**
  - เวอร์ชันแอป
  - Copyright notice

### **💳 หน้าดูบิล/จ่ายบิล (`/bills`)**

```
URL: infinitex.com/bills
Access: ✅ Customer ✅ Agent
Component: BillsPage → BillsList
```

**📋 หน้าที่:**

- **📄 Bills List**
  - แสดงรายการสินเชื่อที่ต้องจ่าย
  - **ข้อมูลแต่ละบิล:**
    - ชื่อสินเชื่อ: "สินเชื่อจำนองบ้านและโฉนดที่ดิน"
    - งวดที่: เช่น "6/12"
    - ยอดที่ต้องชำระ: เช่น "2,000.50 บาท"
    - วันครบกำหนด: เช่น "ครบกำหนดชำระ 30 กันยา 68"

- **🏷️ สถานะบิล:**
  - **ปกติ** (เขียว) - ยังไม่ครบกำหนด
  - **เกินกำหนด** (แดง) - เกินวันชำระแล้ว
  - **ชำระแล้ว** (เทา) - ชำระเงินเรียบร้อย

- **⚡ Quick Actions:**
  - ปุ่ม "จ่ายบิล" → ไปหน้า `/payment`
  - แสดงยอดรวมที่ต้องชำระ

**🎨 Design Features:**

- Card-based layout
- Status color coding
- Gradient background
- Mobile scrollable list

### **💰 หน้าชำระเงิน (`/payment/*`)**

#### **💳 หน้าหลักชำระเงิน (`/payment`)**

```
URL: infinitex.com/payment
Access: ✅ Customer ✅ Agent
Component: PaymentPage → PaymentMethodSelection
```

**📋 หน้าที่:**

- เลือกช่องทางชำระเงิน
- แสดงยอดเงินที่ต้องชำระ
- ปุ่มเลือก QR Code หรือ Barcode
- รายละเอียดบิลแบบสรุป

#### **📄 หน้ารายละเอียดการชำระ (`/payment/details`)**

```
URL: infinitex.com/payment/details
Access: ✅ Customer ✅ Agent
Component: PaymentDetailsPage → PaymentDetails
```

**📋 หน้าที่:**

- **💰 Payment Breakdown:**
  - เงินต้น: 1,800.00 บาท
  - ดอกเบีย: 150.00 บาท
  - ค่าธรรมเนียม: 50.50 บาท
  - **รวมทั้งสิ้น: 2,000.50 บาท**

- **📊 Payment History:**
  - ประวัติการชำระย้อนหลัง
  - แสดงงวดที่, วันที่, จำนวนเงิน, สถานะ

- **⚡ Payment Actions:**
  - ปุ่ม QR Code → `/payment/qr`
  - ปุ่ม Barcode → `/payment/barcode`

- **ℹ️ Important Info:**
  - ข้อมูลสำคัญเกี่ยวกับการชำระ
  - เวลาทำการธนาคาร
  - ข้อมูลการขอใบเสร็จ

#### **📱 หน้าชำระผ่าน QR (`/payment/qr`)**

```
URL: infinitex.com/payment/qr
Access: ✅ Customer ✅ Agent
Component: QRPaymentPage → QRPayment
```

**📋 หน้าที่:**

- **📱 QR Code Display**
  - แสดงภาพ QR Code ขนาดใหญ่
  - QR Code สำหรับสแกนจ่าย

- **🏦 Bank Details:**
  - ชื่อธนาคาร
  - เลขที่บัญชี
  - ชื่อบัญชี

- **💵 Payment Info:**
  - ยอดเงิน: 2,000.50 บาท
  - วันครบกำหนดชำระ
  - Reference number

#### **📊 หน้าชำระผ่าน Barcode (`/payment/barcode`)**

```
URL: infinitex.com/payment/barcode
Access: ✅ Customer ✅ Agent
Component: BarcodePaymentPage → BarcodePayment
```

**📋 หน้าที่:**

- **📊 Barcode Display**
  - แสดง barcode สำหรับเคาน์เตอร์
  - เลขอ้างอิงการชำระ

- **🏪 Payment Instructions:**
  - วิธีการชำระที่เคาน์เตอร์
  - ธนาคาร/ร้านค้าที่รับชำระ
  - เวลาทำการ

- **💵 Payment Summary:**
  - ยอดเงินที่ต้องชำระ
  - วันครบกำหนด
  - ข้อมูลติดต่อ

---

## 👨‍💼 **Customer Routes (`customer/` - เฉพาะลูกค้า)**

### **📦 หน้าผลิตภัณฑ์ของฉัน (`/customer/products`)**

```
URL: infinitex.com/customer/products
Access: ✅ Customer เท่านั้น
Component: CustomerProductsPage → LoansList
Protection: CustomerRoute Guard
```

**📋 หน้าที่:**

- **📊 Loan Overview Card:**
  - จำนวนสินเชื่อทั้งหมด
  - ยอดคงเหลือรวม
  - สรุปสถานะ

- **💳 Individual Loan Cards:**
  - **ข้อมูลพื้นฐาน:**
    - ชื่อสินเชื่อ: "สินเชื่อจำนองบ้านและโฉนดที่ดิน"
    - เลขที่สัญญา: LN001234567
    - สถานะ: ปกติ/เกินกำหนด/รออนุมัติ/ไม่อนุมัติ

  - **Progress Tracking:**
    - งวดปัจจุบัน: 6/12
    - Progress bar แสดงเปอร์เซ็นต์
    - ยอดชำระรายเดือน: 2,000.50 บาท
    - ยอดคงเหลือ: 12,000.00 บาท

  - **Payment Status:**
    - วันครบกำหนดชำระ
    - จำนวนวันเหลือ/เกิน
    - สีสถานะ (เขียว=ปกติ, แดง=เกิน, เหลือง=รออนุมัติ)

- **🎬 Interactive Features:**
  - **Expandable Cards** - กดดูรายละเอียดเพิ่มเติม
  - **Quick Actions:**
    - ปุ่ม "ชำระเงิน" → `/payment?loanId={id}`
    - ปุ่ม "ดูรายละเอียด" → `/customer/products/{id}`

- **➕ FloatingActionButton:**
  - ขอสินเชื่อเพิ่ม → `/customer/apply`
  - ตำแหน่งล่างขวา, สีฟ้า

**💡 Special Cases:**

- **ไม่อนุมัติ:** แสดงเหตุผล + ปุ่ม "ยื่นใหม่"
- **รออนุมัติ:** แสดงสถานะรอ + เวลาโดยประมาณ

### **📝 หน้าขอสินเชื่อ (`/customer/apply`)**

```
URL: infinitex.com/customer/apply
Access: ✅ Customer เท่านั้น
Component: CustomerApplyPage → LoanApplicationFlow
Protection: CustomerRoute Guard
```

**📋 หน้าที่:**

- **📊 Progress Header:**
  - แสดงขั้นตอนปัจจุบัน (X/Y steps)
  - Progress bar
  - คำอธิบายขั้นตอน

- **🔄 Multi-Step Flow:**

  **Login แล้ว (4 Steps):**
  1. **Step 1: อัพโหลดโฉนดที่ดิน**
     - Upload หรือถ่ายรูปโฉนด
     - AI processing (mock) แสดงข้อมูลโฉนด
     - ตรวจสอบข้อมูล: ชื่อเจ้าของ, เลขที่ดิน, ขนาดพื้นที่, ที่ตั้ง

  2. **Step 2: อัพโหลดรูปประกอบ**
     - อัพโหลดได้หลายรูป (multiple files)
     - รูปภายนอก/ภายในบ้าน, สภาพแวดล้อม

  3. **Step 3: กำหนดวงเงิน**
     - วงเงินที่ระบบประเมินให้ (จาก AI)
     - ลูกค้าสามารถปรับยอดที่ต้องการได้
     - ปุ่มยืนยันเพื่อดำเนินการต่อ

  4. **Step 4: รออนุมัติ**
     - แสดงสถานะ "รออนุมัติ"
     - ข้อมูลการติดต่อ
     - เวลาโดยประมาณในการพิจารณา

  **ไม่ได้ Login (6 Steps):**
  - เพิ่ม Step: อัพโหลดบัตรประชาชน
  - เพิ่ม Step: ใส่เบอร์โทร + PIN 4 หลัก

**🎨 Design Features:**

- Step-by-step wizard UI
- File upload with drag & drop
- Camera integration
- Form validation
- Loading states สำหรับ AI processing

### **📄 หน้ารายละเอียดสินเชื่อ (`/customer/products/[id]`)**

```
URL: infinitex.com/customer/products/123
Access: ✅ Customer เท่านั้น
Component: CustomerProductDetailPage
Protection: CustomerRoute Guard
```

**📋 หน้าที่:**

- **📊 Loan Overview:**
  - ข้อมูลสัญญาครบถ้วน
  - เงื่อนไขการกู้ยื่น
  - อัตราดอกเบีย, ระยะเวลา

- **📅 Payment Schedule:**
  - ตารางการชำระรายงวด
  - ประวัติการชำระ
  - งวดถัดไปและยอดเงิน

- **📑 Documents:**
  - ดาวน์โหลดสัญญา
  - เอกสารที่เกี่ยวข้อง
  - ใบเสร็จรับเงิน

**🎨 Design Features:**

- Detailed card layout
- Downloadable documents
- Payment timeline
- Mobile-optimized tables

---

## 👩‍💼 **Agent Routes (`agent/` - เฉพาะเอเจนต์)**

### **👥 หน้าลูกค้าของเอเจนต์ (`/agent/customers`)**

```
URL: infinitex.com/agent/customers
Access: ✅ Agent เท่านั้น
Component: AgentCustomersPage → AgentCustomersList
Protection: AgentRoute Guard
```

**📋 หน้าที่:**

- **📊 Customer Overview:**
  - จำนวนลูกค้าทั้งหมด
  - ยอดคงเหลือรวมของลูกค้าทั้งหมด

- **👤 Customer Cards:**
  - **ข้อมูลลูกค้า:**
    - ชื่อ-นามสกุล: นายสมชาย ใจดี
    - เบอร์โทรศัพท์: 081-234-5678
    - จำนวนสินเชื่อ: 2 รายการ
    - ยอดคงเหลือรวม: 33,000.00 บาท

- **🔍 Expandable Loan Details:**
  - **แต่ละสินเชื่อของลูกค้า:**
    - ชื่อสินเชื่อ + เลขสัญญา
    - สถานะ (ปกติ/เกินกำหนด/รออนุมัติ)
    - Progress bar งวดปัจจุบัน
    - ยอดชำระรายเดือน + ยอดคงเหลือ
    - วันครบกำหนดชำระ

- **⚡ Customer Actions:**
  - **ดูบิลลูกค้า** → `/payment?customerId={id}`
  - **ดูรายละเอียด** → `/agent/customers/{id}`

- **🎯 Special Status Handling:**
  - **เกินกำหนด:** แสดงจำนวนวันเกิน, ปุ่ม "ดูบิลเกินกำหนด"
  - **รออนุมัติ:** แสดง status pending
  - **ปกติ:** แสดง progress และ payment actions

- **➕ FloatingActionButton:**
  - ขอสินเชื่อให้ลูกค้า → `/agent/apply`

**🎨 Design Features:**

- Customer-focused layout
- Multi-loan view per customer
- Status-based color coding
- Expandable details

### **📋 หน้าขอสินเชื่อให้ลูกค้า (`/agent/apply`)**

```
URL: infinitex.com/agent/apply
Access: ✅ Agent เท่านั้น
Component: AgentApplyPage → AgentLoanApplicationFlow
Protection: AgentRoute Guard
```

**📋 หน้าที่:**

- **📊 Progress Header:**
  - แสดงขั้นตอนปัจจุบัน (X/7 steps)
  - Progress bar
  - แสดงชื่อลูกค้าที่เลือกตลอด process

- **🔄 Agent-Specific 7-Step Flow:**
  1. **Step 1: เลือกลูกค้า**
     - **Existing Customers:**
       - ค้นหาจากชื่อหรือเบอร์โทร
       - แสดงข้อมูล: ชื่อ, เบอร์, จำนวนสินเชื่อ, สถานะ
       - เลือกลูกค้าเดิม
     - **New Customer:**
       - เพิ่มลูกค้าใหม่
       - กรอกชื่อ-นามสกุล + เบอร์โทร
       - Auto-format เบอร์โทร

  2. **Step 2: อัพโหลดโฉนดที่ดิน** (เหมือน customer)
  3. **Step 3: อัพโหลดรูปประกอบ** (เหมือน customer)
  4. **Step 4: อัพโหลดบัตรประชาชน** (ของลูกค้า)
  5. **Step 5: กำหนดวงเงิน** (เอเจนต์กำหนดให้ลูกค้า)
  6. **Step 6: ยืนยันเบอร์โทร + PIN** (สร้าง account ให้ลูกค้า)
  7. **Step 7: รออนุมัติ** (ส่งไป Admin system)

**🎨 Design Features:**

- Customer context throughout flow
- Search and selection UI
- Same visual design as customer flow
- Agent-specific workflows

---

## 🎯 **การจัดกลุ่มและหน้าที่หลัก**

### **📱 Bottom Navigation Structure:**

#### **Customer Navigation:**

1. **หน้าหลัก** → `/`
2. **ผลิตภัณฑ์ของฉัน** → `/customer/products`
3. **แจ้งเตือน** → `/notifications`
4. **เมนูอื่น ๆ** → `/more`

#### **Agent Navigation:**

1. **หน้าหลัก** → `/`
2. **ผลิตภัณฑ์ของลูกค้า** → `/agent/customers`
3. **แจ้งเตือน** → `/notifications`
4. **เมนูอื่น ๆ** → `/more`

### **🔄 User Journey Examples:**

#### **Customer Journey - ชำระบิล:**

```
Login → Homepage → Quick Action "ดูบิล" → /bills →
เลือกบิล → /payment → เลือก QR → /payment/qr → ชำระเสร็จ
```

#### **Customer Journey - ขอสินเชื่อ:**

```
Login → /customer/products → FloatingActionButton →
/customer/apply → 4 steps → รออนุมัติ
```

#### **Agent Journey - ขอสินเชื่อให้ลูกค้า:**

```
Login → /agent/customers → FloatingActionButton →
/agent/apply → เลือกลูกค้า → 6 steps → รออนุมัติ
```

### **🔐 Security & Access Control:**

#### **Route Protection Levels:**

- **PublicRoute:** `/login` - ไม่ต้อง authentication
- **RouteGuard:** Shared routes - ต้อง login แต่ไม่จำกัด user type
- **CustomerRoute:** Customer routes - เฉพาะ CUSTOMER เท่านั้น
- **AgentRoute:** Agent routes - เฉพาะ AGENT เท่านั้น

#### **Middleware Protection:**

- **Server-side validation** ก่อน page load
- **Automatic redirects** ตาม user type
- **Cookie-based authentication** รองรับ SSR

### **🎨 UI/UX Consistency:**

#### **Shared Design Elements:**

- **MobileHeader** - ทุกหน้ามี header เหมือนกัน
- **BottomNavigation** - navigation bar ที่เหมือนกัน (แต่เมนูต่างกัน)
- **Card Layout** - ใช้ Card components ทั่วทั้งแอป
- **Color Theme** - Primary #00FFFF ตลอดทั้งระบบ
- **Loading States** - Spinner และ loading text เหมือนกัน
- **Error Handling** - Error boundary และ error messages

#### **Mobile-First Features:**

- **Responsive Design** - mobile-container class
- **Touch-Friendly** - ปุ่มขนาดเหมาะสม
- **Gradient Backgrounds** - สวยงามบน mobile
- **Safe Area Support** - รองรับ notch และ edge screens

---

## 📊 **Data Flow และ State Management**

### **Authentication Flow:**

```
Login Form → AuthContext → localStorage + cookies →
Middleware validation → RouteGuard → Page render
```

### **Page Data Flow:**

```
Page Component → Feature Component →
Mock Data (ปัจจุบัน) / API calls (อนาคต) →
UI Render
```

### **Navigation Flow:**

```
User Action → Router.push() → Middleware check →
Route Guard → Component render → BottomNavigation update
```

---

## 🚀 **Summary & Next Steps**

### **📋 Current Page Count:**

- **Shared Pages:** 6 หน้า (notifications, more, bills, payment + sub-pages)
- **Customer Pages:** 3 หน้า (products, apply, product-detail)
- **Agent Pages:** 2 หน้า (customers, apply)
- **Public Pages:** 2 หน้า (homepage, login)
- **Total: 13 หน้าหลัก** + sub-pages

### **✅ Ready for Development:**

- ทุกหน้ามี clear purpose และ responsibility
- Route structure ชัดเจนและ scalable
- Security layers ครบถ้วน
- UI consistency maintained
- Error handling และ loading states พร้อม

### **🎯 Next Phase - API Development:**

เมื่อเขียนระบบต่อ แนะนำเริ่มจาก:

1. **Authentication APIs** - Real login/logout
2. **Loan Application APIs** - Save form data
3. **Payment APIs** - Generate QR/Barcode
4. **File Upload APIs** - Document processing
5. **Notification APIs** - Real-time updates

**โครงสร้างนี้พร้อม support การพัฒนาในทุกด้านแล้วครับ!** ✨

---
