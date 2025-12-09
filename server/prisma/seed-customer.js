import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCustomers() {
  console.log('🌱 Seeding Customers...');

  // Your dummy data logic here
  await prisma.customer.createMany({
    data: [
      { firstName: 'Amit', lastName: 'Sharma', contactInfo: '9876543210' },
      { firstName: 'Rahul', lastName: 'Verma', contactInfo: '9123456789' },
    ],
    skipDuplicates: true, // Good practice for dummy data
  });
}