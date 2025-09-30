import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in dependency order)
  console.log('🧹 Clearing existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.adminSession.deleteMany()
  await prisma.adminPermission.deleteMany()
  await prisma.admin.deleteMany()

  await prisma.session.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.coinTransaction.deleteMany()
  await prisma.rewardRedemption.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.loanInstallment.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.loanApplication.deleteMany()
  await prisma.agentCustomer.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()

  await prisma.banner.deleteMany()
  await prisma.privilege.deleteMany()
  await prisma.systemConfig.deleteMany()

  // ============================================
  // 1. Create Admin Users
  // ============================================
  console.log('👨‍💼 Creating admin users...')

  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@infinitex.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: new Date(),
    },
  })

  const loanOfficer = await prisma.admin.create({
    data: {
      email: 'loan.officer@infinitex.com',
      password: await bcrypt.hash('loan123', 10),
      firstName: 'Loan',
      lastName: 'Officer',
      role: 'LOAN_OFFICER',
      isActive: true,
    },
  })

  const customerService = await prisma.admin.create({
    data: {
      email: 'support@infinitex.com',
      password: await bcrypt.hash('support123', 10),
      firstName: 'Customer',
      lastName: 'Service',
      role: 'CUSTOMER_SERVICE',
      isActive: true,
    },
  })

  // ============================================
  // 2. Create Admin Permissions
  // ============================================
  console.log('🔑 Creating admin permissions...')

  // Super Admin gets all permissions
  const allPermissions = [
    'VIEW_APPLICATIONS',
    'APPROVE_APPLICATIONS',
    'REJECT_APPLICATIONS',
    'VIEW_LOANS',
    'CREATE_LOANS',
    'UPDATE_LOANS',
    'DELETE_LOANS',
    'VIEW_USERS',
    'CREATE_USERS',
    'UPDATE_USERS',
    'DELETE_USERS',
    'MANAGE_AGENTS',
    'VIEW_PAYMENTS',
    'PROCESS_PAYMENTS',
    'REFUND_PAYMENTS',
    'MANAGE_BANNERS',
    'MANAGE_PRIVILEGES',
    'MANAGE_REWARDS',
    'MANAGE_SYSTEM_CONFIG',
    'VIEW_AUDIT_LOGS',
    'VIEW_REPORTS',
    'EXPORT_DATA',
  ]

  for (const permission of allPermissions) {
    await prisma.adminPermission.create({
      data: {
        adminId: superAdmin.id,
        permission: permission as any,
        grantedBy: superAdmin.id,
      },
    })
  }

  // Loan Officer permissions
  const loanOfficerPermissions = [
    'VIEW_APPLICATIONS',
    'APPROVE_APPLICATIONS',
    'REJECT_APPLICATIONS',
    'VIEW_LOANS',
    'CREATE_LOANS',
    'UPDATE_LOANS',
    'VIEW_USERS',
    'VIEW_PAYMENTS',
    'PROCESS_PAYMENTS',
  ]

  for (const permission of loanOfficerPermissions) {
    await prisma.adminPermission.create({
      data: {
        adminId: loanOfficer.id,
        permission: permission as any,
        grantedBy: superAdmin.id,
      },
    })
  }

  // ============================================
  // 3. Create Test Users (Customers & Agents)
  // ============================================
  console.log('👥 Creating test users...')

  // Create Customers (Extended)
  const customers = []

  const customer1 = await prisma.user.create({
    data: {
      phoneNumber: '0801234567',
      pin: await bcrypt.hash('1234', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      profile: {
        create: {
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          idCardNumber: '1234567890123',
          dateOfBirth: new Date('1985-06-15'),
          email: 'somchai@example.com',
          address:
            '123 หมู่ 1 ตำบลคลองหลวง อำเภอคลองหลวง จังหวัดปทุมธานี 12120',
          coinBalance: 150,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer1)

  const customer2 = await prisma.user.create({
    data: {
      phoneNumber: '0812345678',
      pin: await bcrypt.hash('5678', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      profile: {
        create: {
          firstName: 'สมหญิง',
          lastName: 'รักดี',
          idCardNumber: '1234567890124',
          dateOfBirth: new Date('1990-03-20'),
          email: 'somying@example.com',
          address:
            '456 ซอยลาดพร้าว 15 แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900',
          coinBalance: 75,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer2)

  // Additional customers for testing
  const customer3 = await prisma.user.create({
    data: {
      phoneNumber: '0823456789',
      pin: await bcrypt.hash('1111', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      profile: {
        create: {
          firstName: 'วิชัย',
          lastName: 'สุขใส',
          idCardNumber: '1234567890125',
          dateOfBirth: new Date('1978-11-30'),
          email: 'wichai@example.com',
          address: '789 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
          coinBalance: 320,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer3)

  const customer4 = await prisma.user.create({
    data: {
      phoneNumber: '0834567890',
      pin: await bcrypt.hash('2222', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      profile: {
        create: {
          firstName: 'นภัสสร',
          lastName: 'จันทร์เพ็ญ',
          idCardNumber: '1234567890126',
          dateOfBirth: new Date('1995-02-14'),
          email: 'napatsorn@example.com',
          address:
            '321 ซอยรัชดาภิเษก 18 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer4)

  const customer5 = await prisma.user.create({
    data: {
      phoneNumber: '0845678901',
      pin: await bcrypt.hash('3333', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      profile: {
        create: {
          firstName: 'ประยุทธ',
          lastName: 'มั่นคง',
          idCardNumber: '1234567890127',
          dateOfBirth: new Date('1982-09-05'),
          email: 'prayuth@example.com',
          address: '567 หมู่ 5 ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ 10540',
          coinBalance: 85,
          preferredLanguage: 'th',
          notificationEnabled: false,
        },
      },
    },
  })
  customers.push(customer5)

  const customer6 = await prisma.user.create({
    data: {
      phoneNumber: '0856789012',
      pin: await bcrypt.hash('4444', 10),
      userType: 'CUSTOMER',
      isActive: false, // Inactive customer
      lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      profile: {
        create: {
          firstName: 'สุทธิดา',
          lastName: 'เดินดี',
          idCardNumber: '1234567890128',
          dateOfBirth: new Date('1993-07-22'),
          email: 'sutthida@example.com',
          address:
            '890 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500',
          coinBalance: 25,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer6)

  const customer7 = await prisma.user.create({
    data: {
      phoneNumber: '0867890123',
      pin: await bcrypt.hash('5555', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      profile: {
        create: {
          firstName: 'อรรถพล',
          lastName: 'เก่งการ',
          idCardNumber: '1234567890129',
          dateOfBirth: new Date('1987-12-18'),
          email: 'auttapol@example.com',
          address:
            '456 ซอยอ่อนนุช 17 แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250',
          coinBalance: 200,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer7)

  const customer8 = await prisma.user.create({
    data: {
      phoneNumber: '0878901234',
      pin: await bcrypt.hash('6666', 10),
      userType: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      profile: {
        create: {
          firstName: 'รัตนา',
          lastName: 'สุขสม',
          idCardNumber: '1234567890130',
          dateOfBirth: new Date('1991-04-08'),
          email: 'ratana@example.com',
          address:
            '123 ซอยเพชรบุรี 30 แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400',
          coinBalance: 450,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  customers.push(customer8)

  // Create Agents (Extended)
  const agents = []

  const agent1 = await prisma.user.create({
    data: {
      phoneNumber: '0891234567',
      pin: await bcrypt.hash('9999', 10),
      userType: 'AGENT',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      profile: {
        create: {
          firstName: 'สุรชัย',
          lastName: 'เก่งงาน',
          idCardNumber: '1234567890131',
          dateOfBirth: new Date('1988-12-10'),
          email: 'agent1@infinitex.com',
          address: 'สำนักงานใหญ่ อินฟินิเท็กซ์ ถนนสีลม กรุงเทพมหานคร',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  agents.push(agent1)

  const agent2 = await prisma.user.create({
    data: {
      phoneNumber: '0892345678',
      pin: await bcrypt.hash('8888', 10),
      userType: 'AGENT',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      profile: {
        create: {
          firstName: 'วรรณา',
          lastName: 'ดีเยี่ยม',
          idCardNumber: '1234567890132',
          dateOfBirth: new Date('1992-08-25'),
          email: 'agent2@infinitex.com',
          address: 'สาขาสาทร อินฟินิเท็กซ์ ถนนสาทรใต้ กรุงเทพมหานคร',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  agents.push(agent2)

  const agent3 = await prisma.user.create({
    data: {
      phoneNumber: '0893456789',
      pin: await bcrypt.hash('7777', 10),
      userType: 'AGENT',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      profile: {
        create: {
          firstName: 'ธีระ',
          lastName: 'ประสบผล',
          idCardNumber: '1234567890133',
          dateOfBirth: new Date('1985-03-15'),
          email: 'agent3@infinitex.com',
          address: 'สาขาลาดพร้าว อินฟินิเท็กซ์ ถนนลาดพร้าว กรุงเทพมหานคร',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  agents.push(agent3)

  const agent4 = await prisma.user.create({
    data: {
      phoneNumber: '0894567890',
      pin: await bcrypt.hash('6666', 10),
      userType: 'AGENT',
      isActive: true,
      lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      profile: {
        create: {
          firstName: 'จิรัชญา',
          lastName: 'ทำดี',
          idCardNumber: '1234567890134',
          dateOfBirth: new Date('1990-11-08'),
          email: 'agent4@infinitex.com',
          address: 'สาขาปิ่นเกล้า อินฟินิเท็กซ์ ถนนบรมราชชนนี กรุงเทพมหานคร',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: true,
        },
      },
    },
  })
  agents.push(agent4)

  const agent5 = await prisma.user.create({
    data: {
      phoneNumber: '0895678901',
      pin: await bcrypt.hash('5555', 10),
      userType: 'AGENT',
      isActive: false, // Inactive agent
      lastLoginAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      profile: {
        create: {
          firstName: 'สมเกียรติ',
          lastName: 'หยุดพัก',
          idCardNumber: '1234567890135',
          dateOfBirth: new Date('1987-06-20'),
          email: 'agent5@infinitex.com',
          address: 'สาขาบางนา อินฟินิเท็กซ์ ถนนบางนา กรุงเทพมหานคร',
          coinBalance: 0,
          preferredLanguage: 'th',
          notificationEnabled: false,
        },
      },
    },
  })
  agents.push(agent5)

  // ============================================
  // 4. Create Agent-Customer Relationships
  // ============================================
  console.log('🤝 Creating agent-customer relationships...')

  // Agent 1 (สุรชัย) handles customers 1, 3, 7
  await prisma.agentCustomer.create({
    data: {
      agentId: agent1.id,
      customerId: customer1.id,
      assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      isActive: true,
    },
  })

  await prisma.agentCustomer.create({
    data: {
      agentId: agent1.id,
      customerId: customer3.id,
      assignedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      isActive: true,
    },
  })

  await prisma.agentCustomer.create({
    data: {
      agentId: agent1.id,
      customerId: customer7.id,
      assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isActive: true,
    },
  })

  // Agent 2 (วรรณา) handles customers 2, 4, 8
  await prisma.agentCustomer.create({
    data: {
      agentId: agent2.id,
      customerId: customer2.id,
      assignedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      isActive: true,
    },
  })

  await prisma.agentCustomer.create({
    data: {
      agentId: agent2.id,
      customerId: customer4.id,
      assignedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      isActive: true,
    },
  })

  await prisma.agentCustomer.create({
    data: {
      agentId: agent2.id,
      customerId: customer8.id,
      assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isActive: true,
    },
  })

  // Agent 3 (ธีระ) handles customers 5, 6
  await prisma.agentCustomer.create({
    data: {
      agentId: agent3.id,
      customerId: customer5.id,
      assignedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      isActive: true,
    },
  })

  await prisma.agentCustomer.create({
    data: {
      agentId: agent3.id,
      customerId: customer6.id,
      assignedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      isActive: false, // Customer became inactive
    },
  })

  // Agent 4 (จิรัชญา) - no customers assigned yet (new agent)

  // ============================================
  // 5. Create Loan Applications
  // ============================================
  console.log('📋 Creating loan applications...')

  const loanApplications = []

  // 1. Approved application for customer1 (สมชาย) - จะกลายเป็นสินเชื่อที่ใช้งานอยู่
  const loanApp1 = await prisma.loanApplication.create({
    data: {
      customerId: customer1.id,
      agentId: agent1.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'APPROVED',
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      isNewUser: false,
      submittedByAgent: true,
      titleDeedImage: '/uploads/title-deed-1.jpg',
      titleDeedData: {
        landNumber: 'นส.4ก/12345',
        ownerName: 'นายสมชาย ใจดี',
        area: '50 ตารางวา',
        location: 'ตำบลคลองหลวง อำเภอคลองหลวง จังหวัดปทุมธานี',
      },
      supportingImages: ['/uploads/support-1.jpg', '/uploads/support-2.jpg'],
      requestedAmount: 500000,
      approvedAmount: 450000,
      maxApprovedAmount: 600000,
      propertyType: 'บ้านเดี่ยว',
      propertyValue: 800000,
      propertyArea: '50 ตารางวา',
      propertyLocation: 'ตำบลคลองหลวง อำเภอคลองหลวง จังหวัดปทุมธานี',
      landNumber: 'นส.4ก/12345',
      ownerName: 'นายสมชาย ใจดี',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      reviewedBy: loanOfficer.id,
      reviewNotes:
        'อนุมัติสินเชื่อ 450,000 บาท อัตราดอกเบี้ย 12% ต่อปี ระยะเวลา 36 เดือน',
    },
  })
  loanApplications.push(loanApp1)

  // 2. Under review application for customer2 (สมหญิง)
  const loanApp2 = await prisma.loanApplication.create({
    data: {
      customerId: customer2.id,
      agentId: agent2.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'UNDER_REVIEW',
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      isNewUser: false,
      submittedByAgent: true,
      titleDeedImage: '/uploads/title-deed-2.jpg',
      titleDeedData: {
        landNumber: 'นส.3ข/67890',
        ownerName: 'นางสมหญิง รักดี',
        area: '75 ตารางวา',
        location: 'แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร',
      },
      supportingImages: ['/uploads/support-3.jpg'],
      requestedAmount: 750000,
      maxApprovedAmount: 900000,
      propertyType: 'ทาวน์เฮาส์',
      propertyValue: 1200000,
      propertyArea: '75 ตารางวา',
      propertyLocation: 'แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร',
      landNumber: 'นส.3ข/67890',
      ownerName: 'นางสมหญิง รักดี',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  })
  loanApplications.push(loanApp2)

  // 3. Approved application for customer3 (วิชัย) - กลายเป็นสินเชื่อแล้ว
  const loanApp3 = await prisma.loanApplication.create({
    data: {
      customerId: customer3.id,
      agentId: agent1.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'APPROVED',
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      isNewUser: false,
      submittedByAgent: true,
      titleDeedImage: '/uploads/title-deed-3.jpg',
      titleDeedData: {
        landNumber: 'นส.2ง/11111',
        ownerName: 'นายวิชัย สุขใส',
        area: '120 ตารางวา',
        location: 'แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร',
      },
      supportingImages: ['/uploads/support-4.jpg', '/uploads/support-5.jpg'],
      requestedAmount: 800000,
      approvedAmount: 750000,
      maxApprovedAmount: 900000,
      propertyType: 'บ้านเดี่ยว 2 ชั้น',
      propertyValue: 1500000,
      propertyArea: '120 ตารางวา',
      propertyLocation: 'แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร',
      landNumber: 'นส.2ง/11111',
      ownerName: 'นายวิชัย สุขใส',
      submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      reviewedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      reviewedBy: loanOfficer.id,
      reviewNotes:
        'อนุมัติสินเชื่อ 750,000 บาท อัตราดอกเบี้ย 11.5% ต่อปี ระยะเวลา 48 เดือน',
    },
  })
  loanApplications.push(loanApp3)

  // 4. Rejected application for customer4 (นภัสสร)
  const loanApp4 = await prisma.loanApplication.create({
    data: {
      customerId: customer4.id,
      agentId: agent2.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'REJECTED',
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      isNewUser: false,
      submittedByAgent: true,
      titleDeedImage: '/uploads/title-deed-4.jpg',
      titleDeedData: {
        landNumber: 'นส.1จ/22222',
        ownerName: 'นางนภัสสร จันทร์เพ็ญ',
        area: '35 ตารางวา',
        location: 'แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
      },
      supportingImages: ['/uploads/support-6.jpg'],
      requestedAmount: 600000,
      maxApprovedAmount: 350000,
      propertyType: 'ทาวน์โฮม',
      propertyValue: 450000,
      propertyArea: '35 ตารางวา',
      propertyLocation: 'แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
      landNumber: 'นส.1จ/22222',
      ownerName: 'นางนภัสสร จันทร์เพ็ญ',
      submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      reviewedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      reviewedBy: loanOfficer.id,
      reviewNotes: 'ปฏิเสธ: ราคาประเมินหลักประกันต่ำกว่าจำนวนเงินกู้ที่ร้องขอ',
    },
  })
  loanApplications.push(loanApp4)

  // 5. Submitted application for customer5 (ประยุทธ)
  const loanApp5 = await prisma.loanApplication.create({
    data: {
      customerId: customer5.id,
      agentId: agent3.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'SUBMITTED',
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      isNewUser: false,
      submittedByAgent: true,
      titleDeedImage: '/uploads/title-deed-5.jpg',
      titleDeedData: {
        landNumber: 'นส.5ฟ/33333',
        ownerName: 'นายประยุทธ มั่นคง',
        area: '80 ตารางวา',
        location: 'ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ',
      },
      supportingImages: ['/uploads/support-7.jpg', '/uploads/support-8.jpg'],
      requestedAmount: 650000,
      maxApprovedAmount: 780000,
      propertyType: 'บ้านแฝด',
      propertyValue: 950000,
      propertyArea: '80 ตารางวา',
      propertyLocation: 'ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ',
      landNumber: 'นส.5ฟ/33333',
      ownerName: 'นายประยุทธ มั่นคง',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  })
  loanApplications.push(loanApp5)

  // 6. Draft application for customer7 (อรรถพล)
  const loanApp6 = await prisma.loanApplication.create({
    data: {
      customerId: customer7.id,
      agentId: agent1.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'DRAFT',
      currentStep: 2,
      completedSteps: [1, 2],
      isNewUser: false,
      submittedByAgent: false,
      titleDeedImage: '/uploads/title-deed-6.jpg',
      titleDeedData: {
        landNumber: 'นส.7ห/44444',
        ownerName: 'นายอรรถพล เก่งการ',
        area: '60 ตารางวา',
        location: 'แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร',
      },
      supportingImages: [],
      requestedAmount: 400000,
      maxApprovedAmount: 500000,
      propertyType: 'คอนโดมิเนียม',
      propertyValue: 600000,
      propertyArea: '60 ตารางวา',
      propertyLocation: 'แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร',
      landNumber: 'นส.7ห/44444',
      ownerName: 'นายอรรถพล เก่งการ',
    },
  })
  loanApplications.push(loanApp6)

  // 7. Cancelled application for customer8 (รัตนา)
  const loanApp7 = await prisma.loanApplication.create({
    data: {
      customerId: customer8.id,
      agentId: agent2.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'CANCELLED',
      currentStep: 3,
      completedSteps: [1, 2, 3],
      isNewUser: false,
      submittedByAgent: false,
      titleDeedImage: '/uploads/title-deed-7.jpg',
      titleDeedData: {
        landNumber: 'นส.8ก/55555',
        ownerName: 'นางรัตนา สุขสม',
        area: '45 ตารางวา',
        location: 'แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร',
      },
      supportingImages: ['/uploads/support-9.jpg'],
      requestedAmount: 300000,
      maxApprovedAmount: 400000,
      propertyType: 'อาคารพาณิชย์',
      propertyValue: 500000,
      propertyArea: '45 ตารางวา',
      propertyLocation: 'แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร',
      landNumber: 'นส.8ก/55555',
      ownerName: 'นางรัตนา สุขสม',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      reviewNotes: 'ลูกค้ายกเลิกใบสมัครเอง',
    },
  })
  loanApplications.push(loanApp7)

  // ============================================
  // 6. Create Active Loans
  // ============================================
  console.log('💰 Creating active loans...')

  const loans = []

  // Loan 1: สมชาย (customer1) - สินเชื่อใหม่ ชำระไปแล้ว 2 งวด
  const loan1 = await prisma.loan.create({
    data: {
      loanNumber: 'FX-2024-000001',
      customerId: customer1.id,
      agentId: agent1.id,
      applicationId: loanApp1.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'ACTIVE',
      principalAmount: 450000,
      interestRate: 12.0,
      termMonths: 36,
      monthlyPayment: 14934,
      currentInstallment: 2,
      totalInstallments: 36,
      remainingBalance: 420132,
      nextPaymentDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      contractDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expiryDate: new Date(Date.now() + (36 * 30 - 5) * 24 * 60 * 60 * 1000), // ~3 years from contract
      titleDeedNumber: 'นส.4ก/12345',
      collateralValue: 800000,
      collateralDetails: {
        type: 'บ้านเดี่ยว',
        area: '50 ตารางวา',
        location: 'ตำบลคลองหลวง อำเภอคลองหลวง จังหวัดปทุมธานี',
        estimatedValue: 800000,
      },
    },
  })
  loans.push(loan1)

  // Loan 2: วิชัย (customer3) - สินเชื่อเก่า ชำระไปแล้ว 18 งวด
  const loan2 = await prisma.loan.create({
    data: {
      loanNumber: 'FX-2024-000002',
      customerId: customer3.id,
      agentId: agent1.id,
      applicationId: loanApp3.id,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'ACTIVE',
      principalAmount: 750000,
      interestRate: 11.5,
      termMonths: 48,
      monthlyPayment: 19542,
      currentInstallment: 18,
      totalInstallments: 48,
      remainingBalance: 465000,
      nextPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      contractDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      expiryDate: new Date(Date.now() + (48 * 30 - 40) * 24 * 60 * 60 * 1000), // ~4 years from contract minus 40 days
      titleDeedNumber: 'นส.2ง/11111',
      collateralValue: 1500000,
      collateralDetails: {
        type: 'บ้านเดี่ยว 2 ชั้น',
        area: '120 ตารางวา',
        location: 'แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร',
        estimatedValue: 1500000,
      },
    },
  })
  loans.push(loan2)

  // ============================================
  // 7. Create Loan Installments
  // ============================================
  console.log('📅 Creating loan installments...')

  // Installments for Loan 1 (สมชาย - 36 months)
  const startDate1 = new Date(loan1.contractDate)
  for (let i = 1; i <= 36; i++) {
    const dueDate = new Date(startDate1)
    dueDate.setMonth(dueDate.getMonth() + i)

    const principalAmount = i === 36 ? 420132 : 12000 // Last payment covers remaining
    const interestAmount = i === 36 ? 2934 - (420132 - 12000) : 2934
    const totalAmount = principalAmount + interestAmount

    const isPaid = i <= 2 // First 2 installments are paid

    await prisma.loanInstallment.create({
      data: {
        loanId: loan1.id,
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount,
        isPaid,
        paidDate: isPaid
          ? new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000)
          : null, // Paid 2 days early
        paidAmount: isPaid ? totalAmount : null,
        isLate: false,
      },
    })
  }

  // Installments for Loan 2 (วิชัย - 48 months, already paid 18 installments)
  const startDate2 = new Date(loan2.contractDate)
  for (let i = 1; i <= 48; i++) {
    const dueDate = new Date(startDate2)
    dueDate.setMonth(dueDate.getMonth() + i)

    const principalAmount = i === 48 ? 465000 : 15000 // Last payment covers remaining
    const interestAmount = i === 48 ? 4542 - (465000 - 15000) : 4542
    const totalAmount = principalAmount + interestAmount

    const isPaid = i <= 18 // First 18 installments are paid

    // Some payments were late (installments 5, 12, 16)
    const isLate = isPaid && [5, 12, 16].includes(i)
    const lateDays = isLate ? Math.floor(Math.random() * 10) + 3 : null // 3-12 days late
    const lateFee = isLate ? 500 : null

    await prisma.loanInstallment.create({
      data: {
        loanId: loan2.id,
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount: totalAmount + (lateFee || 0),
        isPaid,
        paidDate: isPaid
          ? isLate
            ? new Date(dueDate.getTime() + lateDays! * 24 * 60 * 60 * 1000)
            : new Date(
                dueDate.getTime() -
                  Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000
              )
          : null,
        paidAmount: isPaid ? totalAmount + (lateFee || 0) : null,
        isLate,
        lateDays,
        lateFee,
      },
    })
  }

  // ============================================
  // 8. Create Payment Records
  // ============================================
  console.log('💳 Creating payment records...')

  // Get paid installments for both loans
  const paidInstallments = await prisma.loanInstallment.findMany({
    where: { isPaid: true },
    orderBy: [{ loanId: 'asc' }, { installmentNumber: 'asc' }],
  })

  const paymentMethods = [
    'QR_CODE',
    'BARCODE',
    'QR_CODE',
    'QR_CODE',
    'BARCODE',
  ] as const

  for (let i = 0; i < paidInstallments.length; i++) {
    const installment = paidInstallments[i]
    const loan = loans.find((l) => l.id === installment.loanId)!
    const customer = installment.loanId === loan1.id ? customer1 : customer3

    await prisma.payment.create({
      data: {
        userId: customer.id,
        loanId: installment.loanId,
        installmentId: installment.id,
        amount: installment.totalAmount,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        status: 'COMPLETED',
        referenceNumber: `PAY-${Date.now() + i}-${installment.installmentNumber}`,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
        qrCode:
          paymentMethods[i % paymentMethods.length] === 'QR_CODE'
            ? `QR-${Math.random().toString(36).substr(2, 12)}`
            : null,
        barcodeNumber:
          paymentMethods[i % paymentMethods.length] === 'BARCODE'
            ? `BC-${Math.random().toString(36).substr(2, 10)}`
            : null,
        dueDate: installment.dueDate,
        paidDate: installment.paidDate,
        principalAmount: installment.principalAmount,
        interestAmount: installment.interestAmount,
        feeAmount: installment.lateFee || 0,
      },
    })
  }

  // ============================================
  // 9. Create Rewards
  // ============================================
  console.log('🎁 Creating rewards...')

  const rewards = [
    {
      name: 'ส่วนลด 7-Eleven 50 บาท',
      description: 'บัตรกำนัลส่วนลด 7-Eleven มูลค่า 50 บาท ใช้ได้ทุกสาขา',
      coinCost: 100,
      imageUrl: '/images/reward-7eleven.png',
      stockCount: 50,
    },
    {
      name: 'บัตรกำนัล Central 200 บาท',
      description: 'บัตรกำนัลห้างเซ็นทรัล มูลค่า 200 บาท',
      coinCost: 400,
      imageUrl: '/images/reward-central.png',
      stockCount: 20,
    },
    {
      name: 'ส่วนลดดอกเบี้ย 0.5%',
      description: 'ส่วนลดดอกเบี้ยสินเชื่อสำหรับงวดถัดไป 0.5%',
      coinCost: 300,
      imageUrl: '/images/reward-interest.png',
      stockCount: null, // unlimited
    },
    {
      name: 'ร่มพับอินฟินิเท็กซ์',
      description: 'ร่มพับสีน้ำเงิน พร้อมโลโก้อินฟินิเท็กซ์',
      coinCost: 150,
      imageUrl: '/images/reward-umbrella.png',
      stockCount: 30,
    },
  ]

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward })
  }

  // ============================================
  // 10. Create Coin Transactions
  // ============================================
  console.log('🪙 Creating coin transactions...')

  // Customer1 (สมชาย) coin history
  await prisma.coinTransaction.create({
    data: {
      userId: customer1.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer1.id,
      type: 'EARNED_ON_TIME_PAYMENT',
      amount: 50,
      description: 'ชำระงวดที่ 1 ตรงเวลา',
      loanId: loan1.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer1.id,
      type: 'EARNED_ON_TIME_PAYMENT',
      amount: 50,
      description: 'ชำระงวดที่ 2 ตรงเวลา',
      loanId: loan1.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  // Customer2 (สมหญิง) coin history
  await prisma.coinTransaction.create({
    data: {
      userId: customer2.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer2.id,
      type: 'EARNED_PROMOTION',
      amount: 25,
      description: 'โปรโมชั่นส่งเอกสารครบถ้วน',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  // Customer3 (วิชัย) coin history - has many transactions due to long loan history
  await prisma.coinTransaction.create({
    data: {
      userId: customer3.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    },
  })

  // On-time payments (16 out of 18 paid installments were on time)
  for (let i = 1; i <= 16; i++) {
    if (![5, 12, 16].includes(i)) {
      // Skip late payments
      await prisma.coinTransaction.create({
        data: {
          userId: customer3.id,
          type: 'EARNED_ON_TIME_PAYMENT',
          amount: 50,
          description: `ชำระงวดที่ ${i} ตรงเวลา`,
          loanId: loan2.id,
          createdAt: new Date(Date.now() - (45 - i * 2) * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  // Daily task rewards for customer3
  await prisma.coinTransaction.create({
    data: {
      userId: customer3.id,
      type: 'EARNED_DAILY_TASK',
      amount: 10,
      description: 'เข้าใช้แอปพลิเคชันต่อเนื่อง 7 วัน',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer3.id,
      type: 'EARNED_DAILY_TASK',
      amount: 20,
      description: 'แนะนำเพื่อนสมัครสมาชิก',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // Customer5 (ประยุทธ) coin history
  await prisma.coinTransaction.create({
    data: {
      userId: customer5.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer5.id,
      type: 'EARNED_PROMOTION',
      amount: 25,
      description: 'โปรโมชั่นส่งเอกสารสินเชื่อครบถ้วน',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer5.id,
      type: 'EARNED_DAILY_TASK',
      amount: 10,
      description: 'เข้าใช้แอปพลิเคชันในวันนี้',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  // Customer7 (อรรถพล) coin history
  await prisma.coinTransaction.create({
    data: {
      userId: customer7.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer7.id,
      type: 'EARNED_PROMOTION',
      amount: 100,
      description: 'โปรโมชั่นสมาชิกใหม่ เริ่มต้นใบสมัครสินเชื่อ',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer7.id,
      type: 'EARNED_DAILY_TASK',
      amount: 25,
      description: 'อัปโหลดเอกสารประกอบใบสมัคร',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer7.id,
      type: 'EARNED_DAILY_TASK',
      amount: 25,
      description: 'กรอกข้อมูลโปรไฟล์ครบถ้วน 100%',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  // Customer8 (รัตนา) coin history - has the most coins
  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_SIGNUP',
      amount: 50,
      description: 'โบนัสสมัครสมาชิกใหม่',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_PROMOTION',
      amount: 200,
      description: 'โปรโมชั่นพิเศษ สมาชิกใหม่ในเดือนแรก',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_DAILY_TASK',
      amount: 50,
      description: 'แนะนำเพื่อน 3 คน เข้าใช้บริการ',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_DAILY_TASK',
      amount: 25,
      description: 'เข้าใช้แอปพลิเคชันต่อเนื่อง 14 วัน',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_PROMOTION',
      amount: 75,
      description: 'โปรโมชั่นรีวิวแอปพลิเคชัน 5 ดาว',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.coinTransaction.create({
    data: {
      userId: customer8.id,
      type: 'EARNED_DAILY_TASK',
      amount: 50,
      description: 'ทำแบบสอบถามความพึงพอใจ',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  })

  // ============================================
  // 11. Create Notifications
  // ============================================
  console.log('🔔 Creating notifications...')

  const notifications = [
    // Customer1 (สมชาย) notifications
    {
      userId: customer1.id,
      type: 'LOAN_APPROVED' as const,
      title: 'สินเชื่อได้รับการอนุมัติ!',
      message:
        'สินเชื่อของคุณมีวงเงิน 450,000 บาท ได้รับการอนุมัติแล้ว อัตราดอกเบี้ย 12% ต่อปี',
      isRead: true,
      readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer1.id,
      type: 'PAYMENT_SUCCESS' as const,
      title: 'ชำระเงินสำเร็จ',
      message:
        'คุณได้ชำระงวดที่ 1 จำนวน 14,934 บาท เรียบร้อยแล้ว ได้รับเหรียญทอง 50 เหรียญ',
      isRead: true,
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer1.id,
      type: 'PAYMENT_SUCCESS' as const,
      title: 'ชำระเงินสำเร็จ',
      message:
        'คุณได้ชำระงวดที่ 2 จำนวน 14,934 บาท เรียบร้อยแล้ว ได้รับเหรียญทอง 50 เหรียญ',
      isRead: true,
      readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer1.id,
      type: 'PAYMENT_DUE' as const,
      title: 'ใกล้ครบกำหนดชำระ',
      message: 'งวดที่ 3 ครบกำหนดชำระในอีก 25 วัน จำนวน 14,934 บาท',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: customer1.id,
      type: 'PROMOTION' as const,
      title: 'โปรโมชั่นพิเศษ!',
      message: 'ลูกค้าที่ชำระตรงเวลา รับส่วนลดดอกเบี้ย 0.5% สำหรับงวดถัดไป',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },

    // Customer2 (สมหญิง) notifications
    {
      userId: customer2.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'เอกสารอยู่ระหว่างการตรวจสอบ',
      message: 'เอกสารของคุณอยู่ระหว่างการตรวจสอบ ระยะเวลา 3-5 วันทำการ',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer2.id,
      type: 'PROMOTION' as const,
      title: 'ได้รับเหรียญทองโบนัส!',
      message: 'คุณได้รับเหรียญทอง 25 เหรียญ จากการส่งเอกสารครบถ้วน',
      isRead: true,
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },

    // Customer3 (วิชัย) notifications
    {
      userId: customer3.id,
      type: 'PAYMENT_DUE' as const,
      title: 'ใกล้ครบกำหนดชำระ',
      message: 'งวดที่ 19 ครบกำหนดชำระในอีก 12 วัน จำนวน 19,542 บาท',
      isRead: true,
      readAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      userId: customer3.id,
      type: 'PROMOTION' as const,
      title: 'ลูกค้าดีเด่น!',
      message: 'คุณเป็นลูกค้าที่ชำระตรงเวลามาตลอด รับสิทธิพิเศษส่วนลดดอกเบี้ย',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },

    // Customer4 (นภัสสร) notifications
    {
      userId: customer4.id,
      type: 'LOAN_REJECTED' as const,
      title: 'ใบสมัครสินเชื่อไม่ผ่านการอนุมัติ',
      message:
        'เนื่องจากราคาประเมินหลักประกันต่ำกว่าจำนวนเงินกู้ที่ร้องขอ กรุณาติดต่อเจ้าหน้าที่เพื่อปรับปรุงเอกสาร',
      isRead: true,
      readAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer4.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'ข้อเสนอใหม่สำหรับคุณ',
      message:
        'เรามีข้อเสนอสินเชื่อใหม่ที่เหมาะสมกับคุณ ติดต่อเจ้าหน้าที่เพื่อรับคำปรึกษา',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },

    // Customer5 (ประยุทธ) notifications
    {
      userId: customer5.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'ใบสมัครได้รับการส่งเรียบร้อย',
      message:
        'ใบสมัครสินเชื่อของคุณได้รับการส่งเรียบร้อยแล้ว กำลังดำเนินการตรวจสอบ',
      isRead: true,
      readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },

    // Customer7 (อรรถพล) notifications
    {
      userId: customer7.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'อัปเดตข้อมูลเพิ่มเติม',
      message: 'กรุณาอัปโหลดเอกสารสนับสนุนเพิ่มเติมเพื่อดำเนินการต่อ',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer7.id,
      type: 'PROMOTION' as const,
      title: 'ได้รับเหรียญทองโบนัส!',
      message: 'คุณได้รับเหรียญทอง 100 เหรียญ จากการเริ่มต้นใบสมัครสินเชื่อ',
      isRead: true,
      readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },

    // Customer8 (รัตนา) notifications
    {
      userId: customer8.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'ยกเลิกใบสมัครสำเร็จ',
      message: 'ใบสมัครสินเชื่อของคุณได้ถูกยกเลิกตามที่ร้องขอ',
      isRead: true,
      readAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer8.id,
      type: 'PROMOTION' as const,
      title: 'ขอบคุณสำหรับรีวิว!',
      message: 'ขอบคุณที่ให้คะแนนรีวิวแอปพลิเคชัน 5 ดาว รับเหรียญทอง 75 เหรียญ',
      isRead: true,
      readAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer8.id,
      type: 'PROMOTION' as const,
      title: 'สมาชิกระดับทอง!',
      message: 'ยินดีด้วย! คุณได้เป็นสมาชิกระดับทองแล้ว รับสิทธิพิเศษมากมาย',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },

    // General system announcements
    {
      userId: customer6.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title: 'บัญชีของคุณถูกระงับชั่วคราว',
      message:
        'เนื่องจากไม่มีการใช้งานเป็นเวลานาน กรุณาติดต่อเจ้าหน้าที่เพื่อเปิดใช้งาน',
      isRead: false,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }

  // ============================================
  // 12. Create Banners
  // ============================================
  console.log('🎯 Creating banners...')

  const banners = [
    {
      title: 'FinX Plus - ดอกเบี้ยพิเศษ 8.99%',
      description: 'สินเชื่อใหม่ล่าสุด ดอกเบี้ยเริ่มต้น 8.99% ต่อปี',
      imageUrl: '/images/finx-banner.png',
      actionUrl: '/customer/loan/new',
      isActive: true,
      sortOrder: 1,
      targetUserTypes: ['CUSTOMER'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      title: 'สมัครใหม่ รับเหรียญทอง 100',
      description: 'ลูกค้าใหม่รับเหรียญทอง 100 เหรียญฟรี!',
      imageUrl: '/fast-approval-financial-banner-modern-design.jpg',
      actionUrl: '/customer/rewards',
      isActive: true,
      sortOrder: 2,
      targetUserTypes: ['CUSTOMER'],
    },
    {
      title: 'เครื่องมือใหม่สำหรับเอเจนต์',
      description: 'ระบบจัดการลูกค้าใหม่ ใช้งานง่าย ประสิทธิภาพสูง',
      imageUrl: '/modern-financial-promotion-banner-cyan-theme.jpg',
      actionUrl: '/agent/dashboard',
      isActive: true,
      sortOrder: 1,
      targetUserTypes: ['AGENT'],
    },
  ]

  for (const banner of banners) {
    await prisma.banner.create({ data: banner })
  }

  // ============================================
  // 13. Create Privileges
  // ============================================
  console.log('✨ Creating privileges...')

  const privileges = [
    {
      title: 'ลูกค้าเก่า - ส่วนลดดอกเบี้ย 1%',
      description:
        'ลูกค้าที่มีสินเชื่ออยู่แล้ว สามารถขอส่วนลดดอกเบี้ย 1% สำหรับสินเชื่อใหม่',
      imageUrl: '/images/privilege-existing-customer.png',
      actionUrl: '/customer/loan/new',
      isActive: true,
      sortOrder: 1,
      targetUserTypes: ['CUSTOMER'],
      requiresLoan: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    {
      title: 'สิทธิพิเศษ VIP',
      description: 'บริการเร่งด่วน อนุมัติภายใน 24 ชั่วโมง',
      imageUrl: '/images/privilege-vip.png',
      actionUrl: '/customer/contact',
      isActive: true,
      sortOrder: 2,
      targetUserTypes: ['CUSTOMER'],
      coinCost: 500,
      requiresLoan: false,
    },
  ]

  for (const privilege of privileges) {
    await prisma.privilege.create({ data: privilege })
  }

  // ============================================
  // 14. Create System Configuration
  // ============================================
  console.log('⚙️ Creating system configuration...')

  const systemConfigs = [
    {
      key: 'MAX_LOAN_AMOUNT',
      value: '2000000',
      description: 'วงเงินสินเชื่อสูงสุด (บาท)',
    },
    {
      key: 'MIN_LOAN_AMOUNT',
      value: '50000',
      description: 'วงเงินสินเชื่อขั้นต่ำ (บาท)',
    },
    {
      key: 'DEFAULT_INTEREST_RATE',
      value: '12.00',
      description: 'อัตราดอกเบี้ยมาตรฐาน (%ต่อปี)',
    },
    {
      key: 'MAX_LOAN_TERM_MONTHS',
      value: '60',
      description: 'ระยะเวลาสินเชื่อสูงสุด (เดือน)',
    },
    {
      key: 'COINS_PER_ON_TIME_PAYMENT',
      value: '50',
      description: 'เหรียญทองที่ได้รับจากการชำระตรงเวลา',
    },
    {
      key: 'SIGNUP_BONUS_COINS',
      value: '50',
      description: 'เหรียญทองโบนัสสมัครสมาชิก',
    },
    {
      key: 'LATE_PAYMENT_FEE_RATE',
      value: '3.00',
      description: 'อัตราค่าปรับชำระล่าช้า (%ต่อเดือน)',
    },
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      description: 'โหมดปิดปรุงระบบ (true/false)',
    },
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({ data: config })
  }

  // ============================================
  // 15. Create Audit Logs
  // ============================================
  console.log('📋 Creating audit logs...')

  await prisma.auditLog.create({
    data: {
      adminId: loanOfficer.id,
      action: 'APPROVE_LOAN',
      entity: 'loan_applications',
      entityId: loanApp1.id,
      oldData: { status: 'UNDER_REVIEW' },
      newData: {
        status: 'APPROVED',
        approvedAmount: 450000,
        reviewNotes:
          'อนุมัติสินเชื่อ 450,000 บาท อัตราดอกเบี้ย 12% ต่อปี ระยะเวลา 36 เดือน',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  await prisma.auditLog.create({
    data: {
      adminId: superAdmin.id,
      action: 'CREATE_ADMIN',
      entity: 'admins',
      entityId: loanOfficer.id,
      newData: {
        email: 'loan.officer@infinitex.com',
        role: 'LOAN_OFFICER',
        firstName: 'Loan',
        lastName: 'Officer',
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary of seeded data:')
  console.log(`- Admins: 3 (1 Super Admin, 1 Loan Officer, 1 Customer Service)`)
  console.log(`- Users: 13 (8 Customers, 5 Agents) - varied activity levels`)
  console.log(`- Agent-Customer Relationships: 8 active assignments`)
  console.log(
    `- Loan Applications: 7 (2 approved, 1 under review, 1 submitted, 1 rejected, 1 draft, 1 cancelled)`
  )
  console.log(
    `- Active Loans: 2 (different stages, one with late payment history)`
  )
  console.log(`- Installments: 84 total (20 paid with varied payment patterns)`)
  console.log(`- Payments: 20 (mixed QR Code & Barcode, some with late fees)`)
  console.log(`- Rewards: 4 (varied cost and type)`)
  console.log(`- Coin Transactions: 25+ (diverse earning patterns)`)
  console.log(`- Notifications: 16 (mixed read/unread status)`)
  console.log(`- Banners: 3 (customer/agent targeting)`)
  console.log(`- Privileges: 2 (different requirements)`)
  console.log(`- System Configs: 8`)
  console.log(`- Audit Logs: 2`)

  console.log('\n🔑 Test Accounts:')
  console.log('--- Admins ---')
  console.log('Super Admin: admin@infinitex.com / admin123')
  console.log('Loan Officer: loan.officer@infinitex.com / loan123')
  console.log('Customer Service: support@infinitex.com / support123')

  console.log('\n--- Customers ---')
  console.log(
    'Customer 1: 0801234567 / PIN: 1234 (สมชาย ใจดี) - มีสินเชื่อใช้งาน'
  )
  console.log('Customer 2: 0812345678 / PIN: 5678 (สมหญิง รักดี) - รออนุมัติ')
  console.log(
    'Customer 3: 0823456789 / PIN: 1111 (วิชัย สุขใส) - สินเชื่อเก่า มีประวัติดี'
  )
  console.log(
    'Customer 4: 0834567890 / PIN: 2222 (นภัสสร จันทร์เพ็ญ) - ใบสมัครถูกปฏิเสธ'
  )
  console.log(
    'Customer 5: 0845678901 / PIN: 3333 (ประยุทธ มั่นคง) - ส่งใบสมัครแล้ว'
  )
  console.log(
    'Customer 6: 0856789012 / PIN: 4444 (สุทธิดา เดินดี) - บัญชีไม่ใช้งาน'
  )
  console.log(
    'Customer 7: 0867890123 / PIN: 5555 (อรรถพล เก่งการ) - ใบสมัครร่าง'
  )
  console.log(
    'Customer 8: 0878901234 / PIN: 6666 (รัตนา สุขสม) - เหรียญทองเยอะ'
  )

  console.log('\n--- Agents ---')
  console.log('Agent 1: 0891234567 / PIN: 9999 (สุรชัย เก่งงาน) - ลูกค้า 3 คน')
  console.log('Agent 2: 0892345678 / PIN: 8888 (วรรณา ดีเยี่ยม) - ลูกค้า 3 คน')
  console.log('Agent 3: 0893456789 / PIN: 7777 (ธีระ ประสบผล) - ลูกค้า 2 คน')
  console.log('Agent 4: 0894567890 / PIN: 6666 (จิรัชญา ทำดี) - เอเจนต์ใหม่')
  console.log('Agent 5: 0895678901 / PIN: 5555 (สมเกียรติ หยุดพัก) - ไม่ใช้งาน')

  console.log('\n🎯 Test Scenarios Available:')
  console.log('✓ ลูกค้าที่มีสินเชื่อใช้งาน (ชำระตรงเวลา vs ชำระล่าช้า)')
  console.log('✓ ใบสมัครในสถานะต่างๆ (อนุมัติ, รออนุมัติ, ปฏิเสธ, ยกเลิก)')
  console.log('✓ ระบบเหรียญทองและของรางวัล')
  console.log('✓ การแจ้งเตือนหลากหลาย')
  console.log('✓ ความสัมพันธ์เอเจนต์-ลูกค้า')
  console.log('✓ ประวัติการชำระเงิน (ตรงเวลา/ล่าช้า)')
  console.log('✓ บัญชีที่ใช้งาน/ไม่ใช้งาน')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
