import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const prisma = new PrismaClient();

const S3_BASE = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";

const fitnessPrograms = [
  {
    title: "Shredded in 6 Weeks",
    description: "Hypertrophy-focused fat loss program with cardio & nutrition add-ons.",
    image: S3_BASE + "shred6.jpg",
    price: 50.00,
  },
  {
    title: "Precision Growth",
    description: "Gain with control. Maintain leanness while adding clean muscle.",
    image: S3_BASE + "precisiongrowth.jpg",
    price: 50.00,
  },
  {
    title: "Aesthetic Push/Pull/Legs",
    description: "Balance, symmetry, and density. Advanced 6-day split.",
    image: S3_BASE + "ppl.jpg",
    price: 50.00,
  }
];

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices for fitness programs...');
  
  for (const program of fitnessPrograms) {
    try {
      // Check if product already exists in database
      const existingProgram = await prisma.fitnessProgram.findFirst({
        where: { title: program.title }
      });
      
      if (!existingProgram) {
        console.log(`❌ Program "${program.title}" not found in database. Please run the seed script first.`);
        continue;
      }
      
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: program.title,
        description: program.description,
        images: [program.image],
        metadata: {
          programId: existingProgram.id.toString(),
          type: 'fitness_program'
        }
      });
      
      console.log(`✅ Created Stripe product: ${stripeProduct.name} (ID: ${stripeProduct.id})`);
      
      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(program.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          programId: existingProgram.id.toString(),
          type: 'fitness_program'
        }
      });
      
      console.log(`✅ Created Stripe price: ${stripePrice.id} for $${program.price}`);
      
      // Update database with real Stripe price ID
      await prisma.fitnessProgram.update({
        where: { id: existingProgram.id },
        data: { stripePriceId: stripePrice.id }
      });
      
      console.log(`✅ Updated database with Stripe price ID: ${stripePrice.id}`);
      
    } catch (error) {
      console.error(`❌ Error setting up "${program.title}":`, error.message);
    }
  }
  
  // Create subscription product and price
  try {
    console.log('\n📦 Setting up fitness subscription...');
    
    const subscriptionProduct = await stripe.products.create({
      name: "NRG Fitness All-Access",
      description: "Access to all fitness programs and future releases",
      metadata: {
        type: 'fitness_subscription'
      }
    });
    
    console.log(`✅ Created subscription product: ${subscriptionProduct.name} (ID: ${subscriptionProduct.id})`);
    
    // Create recurring price (monthly subscription)
    const subscriptionPrice = await stripe.prices.create({
      product: subscriptionProduct.id,
      unit_amount: 2500, // $25.00 per month
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        type: 'fitness_subscription'
      }
    });
    
    console.log(`✅ Created subscription price: ${subscriptionPrice.id} for $25/month`);
    console.log(`\n💡 Update your frontend with this subscription price ID: ${subscriptionPrice.id}`);
    
  } catch (error) {
    console.error('❌ Error setting up subscription:', error.message);
  }
  
  console.log('\n🎉 Stripe setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update the subscription price ID in your frontend code');
  console.log('2. Test the checkout flow with Stripe test cards');
  console.log('3. Set up webhook endpoints for subscription management');
}

setupStripeProducts()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 