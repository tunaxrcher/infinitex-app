import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('Usage: npx tsx prisma/generate-admin.ts <username> <pass>')
    console.log('Example: npx tsx prisma/generate-admin.ts jojo 1412')
    process.exit(1)
  }

  const username = args[0]
  const pass = args[1]

  const adminId = createId()
  const email = username.includes('@') ? username : `${username}@infinitex.com`

  const hashedPassword = await bcrypt.hash(pass, 10)

  console.log(
    `id: ${adminId}, email: ${email}, password: ${hashedPassword}, firstName: ${username}, lastName: Admin, role: LOAN_OFFICER`
  )
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
