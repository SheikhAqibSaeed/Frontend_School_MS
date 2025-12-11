import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample classes
  const class1 = await prisma.class.upsert({
    where: { id: 'class-1' },
    update: {},
    create: {
      id: 'class-1',
      name: 'Class 1',
      level: 1,
      capacity: 30,
      isActive: true,
    },
  });

  const class10 = await prisma.class.upsert({
    where: { id: 'class-10' },
    update: {},
    create: {
      id: 'class-10',
      name: 'Class 10',
      level: 10,
      capacity: 40,
      isActive: true,
    },
  });

  console.log('Created classes');

  // Create sections
  const sectionA = await prisma.section.upsert({
    where: { id: 'section-10a' },
    update: {},
    create: {
      id: 'section-10a',
      name: 'A',
      classId: class10.id,
      capacity: 40,
      isActive: true,
    },
  });

  console.log('Created sections');

  // Create subjects
  const mathSubject = await prisma.subject.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Mathematics subject',
      isActive: true,
    },
  });

  const englishSubject = await prisma.subject.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'English',
      code: 'ENG',
      description: 'English Language',
      isActive: true,
    },
  });

  console.log('Created subjects');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

