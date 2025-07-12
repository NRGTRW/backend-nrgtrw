import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const S3_BASE = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";

const fitnessPrograms = [
  {
    title: "Shredded in 6 Weeks",
    description: "Hypertrophy-focused fat loss program with cardio & nutrition add-ons.",
    image: S3_BASE + "shred6.jpg",
    video: S3_BASE + "shred6.mp4",
    pdfUrl: S3_BASE + "pdfs/shred6.pdf",
    price: 50.00,
    stripePriceId: "price_xxx_shred6", // TODO: Replace with real Stripe price ID
    isActive: true
  },
  {
    title: "Precision Growth",
    description: "Gain with control. Maintain leanness while adding clean muscle.",
    image: S3_BASE + "precisiongrowth.jpg",
    video: S3_BASE + "precisiongrowth.mp4",
    pdfUrl: S3_BASE + "pdfs/precisiongrowth.pdf",
    price: 50.00,
    stripePriceId: "price_xxx_precision", // TODO: Replace with real Stripe price ID
    isActive: true
  },
  {
    title: "Aesthetic Push/Pull/Legs",
    description: "Balance, symmetry, and density. Advanced 6-day split.",
    image: S3_BASE + "ppl.jpg",
    video: S3_BASE + "ppl.mp4",
    pdfUrl: S3_BASE + "pdfs/ppl.pdf",
    price: 50.00,
    stripePriceId: "price_xxx_ppl", // TODO: Replace with real Stripe price ID
    isActive: true
  }
];

async function main() {
  console.log('🌱 Seeding fitness programs...');
  
  for (const program of fitnessPrograms) {
    const existingProgram = await prisma.fitnessProgram.findFirst({
      where: { title: program.title }
    });
    
    if (existingProgram) {
      console.log(`Program "${program.title}" already exists, skipping...`);
      continue;
    }
    
    const createdProgram = await prisma.fitnessProgram.create({
      data: program
    });
    
    console.log(`✅ Created fitness program: ${createdProgram.title}`);
  }
  
  console.log('🎉 Fitness programs seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding fitness programs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 