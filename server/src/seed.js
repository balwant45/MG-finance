import { prisma } from "./db/pisma";
import bcrypt from "bcryptjs"

async function main() {
    const password='balwant123';
    const salt=await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(password, salt);

    const user=await prisma.user.create({
        data:{
            name:'ballu singh',
            email:'admin@mgfinance.com',
            password: hashedPassword,
    }
    })
    console.log('admin user created',user)
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });