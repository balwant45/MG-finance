import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedAdmin() {
  console.log('🌱 Seeding Admin...');
  
  const password = 'Fatehpur';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.upsert({
    where: { email: 'admin@mgfinance.com' },
    update: {},
    create: {
      name: 'Manjit Singh',
      email: 'admin@mgfinance.com',
      password: hashedPassword,
    },
  });
}