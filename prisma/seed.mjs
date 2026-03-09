import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  
  const emails = ['manager1@gmail.com', 'manager2@gmail.com']

  for (const email of emails) {
    const existing = await prisma.managerWhitelist.findUnique({
      where: { email },
    })

    if (!existing) {
      await prisma.managerWhitelist.create({
        data: {
          email,
          isRegistered: false,
        },
      })
      console.log(`Added ${email} to manager whitelist.`)
    } else {
      console.log(`${email} is already in the manager whitelist.`)
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
