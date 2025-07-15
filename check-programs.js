import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPrograms() {
  try {
    const programs = await prisma.fitnessProgram.findMany();
    console.log('Current fitness programs:');
    programs.forEach(p => {
      console.log(`- ${p.title} (ID: ${p.id}, Active: ${p.isActive}, Price: $${p.price})`);
      console.log(`  Description: ${p.description.substring(0, 100)}...`);
      console.log(`  PDF URL: ${p.pdfUrl}`);
      console.log(`  Image: ${p.image}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrograms(); 