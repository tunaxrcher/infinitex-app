# การแก้ไขปัญหาระบบขอสินเชื่อ

## 1. ปัญหา DigitalOcean Spaces SSL Certificate

## ปัญหาที่พบ
```
Hostname/IP does not match certificate's altnames: Host: infinitex-demo.infinitex-demo.sgp1.digitaloceanspaces.com. is not in the cert's altnames: DNS:*.sgp1.digitaloceanspaces.com, DNS:sgp1.digitaloceanspaces.com
```

## สาเหตุ
ปัญหาเกิดจากการใช้ virtual-hosted-style URL ที่ทำให้เกิด subdomain ที่ไม่ตรงกับ SSL certificate ของ DigitalOcean

## วิธีแก้ไข

### 1. ใช้ Path-Style URLs (แนะนำ)
```typescript
s3ForcePathStyle: true
```

### 2. ปรับ Environment Variables
```env
# ใช้ endpoint หลัก แทน bucket-specific URL
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com

# ไม่ใช้
# DO_SPACES_ENDPOINT=https://infinitex-demo.sgp1.digitaloceanspaces.com
```

### 3. สำหรับ Development (ไม่แนะนำสำหรับ Production)
```typescript
httpOptions: {
  agent: process.env.NODE_ENV === 'development' ? 
    new (require('https').Agent)({ rejectUnauthorized: false }) : 
    undefined
}
```

### 4. ทดสอบการเชื่อมต่อ
```bash
# เรียก API ทดสอบ
curl http://localhost:3000/api/test-storage
```

## การตรวจสอบ
1. ตรวจสอบ logs ใน console
2. ตรวจสอบว่า `s3ForcePathStyle: true` ถูกตั้งค่าแล้ว
3. ตรวจสอบ endpoint URL ใน environment variables
4. ทดสอบด้วย API `/api/test-storage`

## หมายเหตุ
- ระบบจะใช้ fallback เป็น base64 หาก storage upload ล้มเหลว
- AI analysis ยังคงทำงานได้แม้ storage มีปัญหา
- ควรแก้ไขปัญหา storage เพื่อประสิทธิภาพที่ดีขึ้น

---

## 2. ปัญหา Gemini AI Model

### ปัญหาที่พบ
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

### สาเหตุ
- Model `gemini-1.5-flash` อาจไม่พร้อมใช้งานใน API version ปัจจุบัน
- API key อาจไม่มีสิทธิ์เข้าถึง model บางตัว
- Region หรือ availability ของ model

### วิธีแก้ไข

#### 1. ใช้ Model ที่เสถียร
```typescript
// ใช้ model ที่รู้จักว่าใช้งานได้
const modelName = needsVision ? 'gemini-pro-vision' : 'gemini-pro'
```

#### 2. ตรวจสอบ API Key
```env
# ตรวจสอบว่า API key ถูกต้อง
GEMINI_API_KEY=AIzaSyAofGMt2DSd27lHPwN1ykPRSBHTutfMLZc
```

#### 3. ทดสอบ Models ที่พร้อมใช้งาน
```bash
# เรียก API ทดสอบ
curl http://localhost:3000/api/gemini-models
```

#### 4. Fallback Mechanism
ระบบได้เพิ่ม fallback mechanism แล้ว:
- หาก AI analysis ล้มเหลว จะใช้ manual input
- หาก province/amphur search ล้มเหลว จะแสดง modal ให้ผู้ใช้เลือกเอง
- ระบบยังคงทำงานได้แม้ AI มีปัญหา

### การตรวจสอบ
1. ตรวจสอบ console logs สำหรับ AI errors
2. ทดสอบด้วย `/api/gemini-models`
3. ตรวจสอบว่า fallback mechanism ทำงาน
4. ลองอัพโหลดรูปโฉนดและดู modal manual input

### Models ที่แนะนำ
- **Vision Tasks**: `gemini-pro-vision`
- **Text Tasks**: `gemini-pro`
- **Fallback**: Manual input modal
