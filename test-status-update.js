import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testStatusUpdate() {
  try {
    console.log("🧪 Testing waitlist status update...");

    // Get the first waitlist entry
    const firstEntry = await prisma.fitnessWaitlist.findFirst();
    if (!firstEntry) {
      console.log(
        "❌ No waitlist entries found. Please create some entries first."
      );
      return;
    }

    console.log("📋 Current entry:", firstEntry);

    // Test updating status to NOTIFIED
    console.log("\n1. Updating status to NOTIFIED...");
    const updatedEntry = await prisma.fitnessWaitlist.update({
      where: { id: firstEntry.id },
      data: { status: "NOTIFIED" }
    });
    console.log("✅ Updated entry:", updatedEntry);

    // Test updating status to CONVERTED
    console.log("\n2. Updating status to CONVERTED...");
    const updatedEntry2 = await prisma.fitnessWaitlist.update({
      where: { id: firstEntry.id },
      data: { status: "CONVERTED" }
    });
    console.log("✅ Updated entry:", updatedEntry2);

    // Test updating status back to WAITING
    console.log("\n3. Updating status back to WAITING...");
    const updatedEntry3 = await prisma.fitnessWaitlist.update({
      where: { id: firstEntry.id },
      data: { status: "WAITING" }
    });
    console.log("✅ Updated entry:", updatedEntry3);

    console.log("\n🎉 All status update tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testStatusUpdate();
