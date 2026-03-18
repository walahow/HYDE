import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findUnique({
    where: { nim: "ADM-001" },
    select: {
      nim: true,
      password: true,
      role: true
    }
  })
  console.log(JSON.stringify(admin, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
