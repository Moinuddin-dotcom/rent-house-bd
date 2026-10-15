import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@renthousebd.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: {
      name: 'Platform Admin',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: Role.ADMIN,
    },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
