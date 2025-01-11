import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Product 1",
        price: 10,
        imageUrl: "https://via.placeholder.com/150"
      },
      {
        name: "Product 2",
        price: 15,
        imageUrl: "https://via.placeholder.com/150"
      },
      {
        name: "Product 3",
        price: 20,
        imageUrl: "https://via.placeholder.com/150"
      }
    ]
  });
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
