import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWaitlist() {
  try {
    console.log('🧪 Testing waitlist functionality...');
    
    // Test 1: Create a waitlist entry
    console.log('\n1. Creating a test waitlist entry...');
    const testEntry = await prisma.fitnessWaitlist.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        message: 'Test message',
        programId: 1,
        status: 'WAITING'
      }
    });
    console.log('✅ Created waitlist entry:', testEntry);
    
    // Test 2: Check if we can find the entry
    console.log('\n2. Checking if entry exists...');
    const foundEntry = await prisma.fitnessWaitlist.findUnique({
      where: {
        email_programId: {
          email: 'test@example.com',
          programId: 1
        }
      }
    });
    console.log('✅ Found entry:', foundEntry);
    
    // Test 3: Get all waitlist entries
    console.log('\n3. Getting all waitlist entries...');
    const allEntries = await prisma.fitnessWaitlist.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    console.log('✅ All entries:', allEntries);
    
    // Test 4: Get stats
    console.log('\n4. Getting waitlist stats...');
    const stats = await prisma.fitnessWaitlist.groupBy({
      by: ['programId'],
      _count: {
        id: true
      },
      where: {
        status: "WAITING"
      }
    });
    console.log('✅ Stats:', stats);
    
    // Test 5: Clean up test entry
    console.log('\n5. Cleaning up test entry...');
    await prisma.fitnessWaitlist.delete({
      where: {
        id: testEntry.id
      }
    });
    console.log('✅ Test entry deleted');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWaitlist(); 