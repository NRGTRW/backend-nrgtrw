import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Add products
    await prisma.product.createMany({
        data: [
            { name: 'Product 1', price: 10.0, imageUrl: 'https://example.com/product1.jpg' },
            { name: 'Product 2', price: 15.0, imageUrl: 'https://example.com/product2.jpg' },
            { name: 'Product 3', price: 20.0, imageUrl: 'https://example.com/product3.jpg' },
        ],
    });
    console.log('Database seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
