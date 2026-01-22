import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

async function main() {
  // Get arguments from command line
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npx tsx prisma/generate-user.ts <phoneNumber> <pin>')
    console.log('Example: npx tsx prisma/generate-user.ts 0646267394 7898')
    process.exit(1)
  }

  const phoneNumber = args[0]
  const pin = args[1]

  // Generate cuid for users table
  const userId = createId()
  
  // Generate cuid for user_profiles table
  const userProfileId = createId()
  
  // Hash PIN with bcrypt (same as seed.ts)
  const hashedPin = await bcrypt.hash(pin, 10)

  console.log(`id: ${userId}, phone: ${phoneNumber}, pin: ${hashedPin}, user_profiles_id: ${userProfileId}`)
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
