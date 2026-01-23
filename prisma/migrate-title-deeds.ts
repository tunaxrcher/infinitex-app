/**
 * Migration Script: Copy data from deprecated LoanApplication fields to TitleDeed
 *
 * This script uses RAW SQL to read old fields that may have been removed from schema
 * but still exist in the database.
 *
 * Run: npx tsx prisma/migrate-title-deeds.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLD_IMAGE_BASE_URL =
  'https://evxspst.sgp1.cdn.digitaloceanspaces.com/uploads/loan_payment_img/'

interface OldApplicationData {
  id: string
  titleDeedImage: string | null
  titleDeedData: string | null
  supportingImages: string | null
  ownerName: string | null
  propertyLocation: string | null
  propertyArea: string | null
  landNumber: string | null
  deedMode: string | null
}

interface TitleDeedData {
  result?: Array<{
    parcelno?: string
    provname?: string
    amphurname?: string
    tumbolname?: string
    rai?: number
    ngan?: number
    wa?: number
    owner_name?: string
    land_type?: string
    parcellat?: string
    parcellon?: string
    pvcode?: string
    amcode?: string
  }>
}

async function migrateTitleDeeds() {
  console.log('🚀 Starting title deed migration (using raw SQL)...\n')

  try {
    // Check if old columns exist
    const columns = await prisma.$queryRaw<Array<{ COLUMN_NAME: string }>>`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'loan_applications' 
      AND COLUMN_NAME IN ('titleDeedImage', 'titleDeedData', 'landNumber', 'propertyArea', 'propertyLocation')
    `
    
    const existingColumns = columns.map(c => c.COLUMN_NAME)
    console.log('📋 Existing old columns:', existingColumns)
    
    if (existingColumns.length === 0) {
      console.log('⚠️  No old columns found! Data may have already been migrated or columns were deleted.')
      console.log('    Please check manually if title_deeds table has data.')
      return
    }

    // Clear existing TitleDeed records
    const deletedCount = await prisma.titleDeed.deleteMany({})
    console.log(`🗑️  Cleared ${deletedCount.count} existing TitleDeed records\n`)

    // Fetch old data using raw SQL
    const applications = await prisma.$queryRaw<OldApplicationData[]>`
      SELECT 
        id,
        titleDeedImage,
        titleDeedData,
        supportingImages,
        ownerName,
        propertyLocation,
        propertyArea,
        landNumber,
        deedMode
      FROM loan_applications
    `

    console.log(`📋 Found ${applications.length} applications to migrate\n`)

    let migratedCount = 0
    let totalDeedsCreated = 0
    let errorCount = 0

    for (const app of applications) {
      try {
        // Parse supportingImages
        let supportingImages: string[] = []
        if (app.supportingImages) {
          try {
            const parsed = JSON.parse(app.supportingImages)
            if (Array.isArray(parsed)) {
              supportingImages = parsed
            }
          } catch {
            supportingImages = []
          }
        }

        // Filter old system images (these are title deed images)
        const oldSystemImages = supportingImages.filter(
          (url) => typeof url === 'string' && url.startsWith(OLD_IMAGE_BASE_URL)
        )

        // Parse landNumber to get deed numbers (split by comma)
        let deedNumbers: string[] = []
        if (app.landNumber) {
          deedNumbers = app.landNumber
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        }

        // Parse titleDeedData
        let titleDeedData: TitleDeedData | null = null
        if (app.titleDeedData) {
          try {
            titleDeedData = JSON.parse(app.titleDeedData)
          } catch {
            titleDeedData = null
          }
        }
        const deedInfo = titleDeedData?.result?.[0]

        // CASE 1: Has new titleDeedImage (not from old system)
        if (
          app.titleDeedImage &&
          !app.titleDeedImage.startsWith(OLD_IMAGE_BASE_URL)
        ) {
          await prisma.titleDeed.create({
            data: {
              applicationId: app.id,
              imageUrl: app.titleDeedImage,
              deedNumber: app.landNumber || deedInfo?.parcelno || undefined,
              provinceName: deedInfo?.provname || undefined,
              amphurName: deedInfo?.amphurname || undefined,
              parcelNo: app.landNumber || deedInfo?.parcelno || undefined,
              landAreaText:
                app.propertyArea ||
                (deedInfo
                  ? `${deedInfo.rai || 0} ไร่ ${deedInfo.ngan || 0} งาน ${deedInfo.wa || 0} ตร.ว.`
                  : undefined),
              ownerName: app.ownerName || deedInfo?.owner_name || undefined,
              landType: deedInfo?.land_type || undefined,
              titleDeedData: titleDeedData
                ? JSON.parse(JSON.stringify(titleDeedData))
                : undefined,
              latitude: deedInfo?.parcellat || undefined,
              longitude: deedInfo?.parcellon || undefined,
              isPrimary: true,
              sortOrder: 0,
            },
          })
          totalDeedsCreated++
          console.log(`✅ ${app.id.substring(0, 15)}... | New image | 1 deed`)
          migratedCount++
          continue
        }

        // CASE 2: Has old system images OR multiple deed numbers
        if (oldSystemImages.length > 0 || deedNumbers.length > 0) {
          const numDeeds = Math.max(
            deedNumbers.length,
            oldSystemImages.length > 0 ? 1 : 0,
            1
          )

          for (let i = 0; i < numDeeds; i++) {
            const deedNumber = deedNumbers[i] || null
            const imageUrl = supportingImages[i] || null

            await prisma.titleDeed.create({
              data: {
                applicationId: app.id,
                imageUrl: imageUrl || undefined,
                deedNumber: deedNumber || undefined,
                parcelNo: deedNumber || undefined,
                provinceName:
                  i === 0 ? deedInfo?.provname || undefined : undefined,
                amphurName:
                  i === 0 ? deedInfo?.amphurname || undefined : undefined,
                landAreaText:
                  i === 0
                    ? app.propertyArea ||
                      (deedInfo
                        ? `${deedInfo.rai || 0} ไร่ ${deedInfo.ngan || 0} งาน ${deedInfo.wa || 0} ตร.ว.`
                        : undefined)
                    : undefined,
                ownerName:
                  app.ownerName ||
                  (i === 0 ? deedInfo?.owner_name : undefined) ||
                  undefined,
                landType:
                  i === 0 ? deedInfo?.land_type || undefined : undefined,
                titleDeedData:
                  i === 0 && titleDeedData
                    ? JSON.parse(JSON.stringify(titleDeedData))
                    : undefined,
                latitude:
                  i === 0 ? deedInfo?.parcellat || undefined : undefined,
                longitude:
                  i === 0 ? deedInfo?.parcellon || undefined : undefined,
                isPrimary: i === 0,
                sortOrder: i,
              },
            })
            totalDeedsCreated++
          }

          // Update remaining supporting images
          const remainingSupportingImages = supportingImages.slice(numDeeds)
          await prisma.$executeRaw`
            UPDATE loan_applications 
            SET supportingImages = ${JSON.stringify(remainingSupportingImages)},
                deedMode = ${numDeeds > 1 ? 'MULTIPLE' : 'SINGLE'}
            WHERE id = ${app.id}
          `

          console.log(
            `✅ ${app.id.substring(0, 15)}... | Old system | ${numDeeds} deed(s)`
          )
          migratedCount++
        }
        // CASE 3: No images but has titleDeedData
        else if (titleDeedData) {
          await prisma.titleDeed.create({
            data: {
              applicationId: app.id,
              provinceName: deedInfo?.provname || undefined,
              amphurName: deedInfo?.amphurname || undefined,
              parcelNo: deedInfo?.parcelno || undefined,
              landAreaText:
                app.propertyArea ||
                (deedInfo
                  ? `${deedInfo.rai || 0} ไร่ ${deedInfo.ngan || 0} งาน ${deedInfo.wa || 0} ตร.ว.`
                  : undefined),
              ownerName: app.ownerName || deedInfo?.owner_name || undefined,
              landType: deedInfo?.land_type || undefined,
              titleDeedData: JSON.parse(JSON.stringify(titleDeedData)),
              latitude: deedInfo?.parcellat || undefined,
              longitude: deedInfo?.parcellon || undefined,
              isPrimary: true,
              sortOrder: 0,
            },
          })
          totalDeedsCreated++
          console.log(`✅ ${app.id.substring(0, 15)}... | Data only | 1 deed`)
          migratedCount++
        }
        // CASE 4: Create placeholder
        else {
          await prisma.titleDeed.create({
            data: {
              applicationId: app.id,
              ownerName: app.ownerName || undefined,
              isPrimary: true,
              sortOrder: 0,
            },
          })
          totalDeedsCreated++
          console.log(`✅ ${app.id.substring(0, 15)}... | Placeholder | 1 deed`)
          migratedCount++
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Error for ${app.id}:`, error)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary:')
    console.log(`  Applications processed: ${migratedCount}`)
    console.log(`  TitleDeed records created: ${totalDeedsCreated}`)
    console.log(`  Errors: ${errorCount}`)
    console.log('='.repeat(60))

    // Verify
    const totalDeeds = await prisma.titleDeed.count()
    const withImage = await prisma.titleDeed.count({
      where: { imageUrl: { not: null } },
    })
    const withData = await prisma.titleDeed.count({
      where: { titleDeedData: { not: null } },
    })
    const withProvince = await prisma.titleDeed.count({
      where: { provinceName: { not: null } },
    })

    console.log(`\n📈 Final state:`)
    console.log(`  Total TitleDeed records: ${totalDeeds}`)
    console.log(`  With imageUrl: ${withImage}`)
    console.log(`  With titleDeedData: ${withData}`)
    console.log(`  With provinceName: ${withProvince}`)

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateTitleDeeds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
