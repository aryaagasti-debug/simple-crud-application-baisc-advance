import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
  });

  if (existing) {
    console.log('✅ Admin already exists');
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin Created Successfully');
  console.log(admin);
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
