import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuthorize(nim: string, pass: string) {
  console.log(`Testing login for: ${nim}`)
  
  const user = await prisma.user.findUnique({
    where: { nim },
  })

  if (!user) {
    console.log("User not found")
    return
  }

  console.log("User found:", user.name, "Role:", user.role)

  if (!user.password) {
    console.log("No password in DB")
    return
  }

  const isPasswordValid = await bcrypt.compare(pass, user.password)
  console.log("Password valid:", isPasswordValid)
}

async function main() {
  await testAuthorize("ADM-001", "password123")
  await testAuthorize("H1101221001", "password123")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
