import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seed-admin.js';       // Import function 1
import { seedCustomers } from './seed-customers.js'; // Import function 2

const prisma = new PrismaClient();

async function main() {
  // Run them in order
  await seedAdmin();
  await seedCustomers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });