import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { encrypt } from "../src/utils/cryptoUtils.js";

const prisma = new PrismaClient();
const fallbackImage = "https://example.com/fallback.jpg";

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Global Sizes
const globalSizes = ["S", "M", "L", "XL"];
const seedSizes = async () => {
  try {
    for (const size of globalSizes) {
      await prisma.size.upsert({
        where: { size },
        update: {},
        create: { size },
      });
    }
    console.log("✅ Seeded global sizes:", globalSizes);
  } catch (error) {
    console.error("❌ Error seeding sizes:", error.message);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Nikcho2006", 10);
    const encryptedAddress = encrypt("Lyulin 8, bl.815, vh.A");
    const encryptedPhone = encrypt("0897338635");

    await prisma.user.upsert({
      where: { email: "nrgtrwsales@gmail.com" },
      update: {
        updatedAt: new Date(),
        role: Role.ROOT_ADMIN,
      },
      create: {
        email: "nrgtrwsales@gmail.com",
        password: hashedPassword,
        name: "Nikolay Goranov",
        role: Role.ROOT_ADMIN,
        address: encryptedAddress,
        phone: encryptedPhone,
        isVerified: true,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Seeded/Updated User");
  } catch (error) {
    console.error("❌ Error seeding user:", error.message);
  }
};

// Seed Categories
const seedCategories = async () => {
  try {
    const categories = ["Elegance", "Pump Covers", "Confidence"];
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category },
      });
    }
    console.log("✅ Seeded categories:", categories);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  }
};

// Seed Products
const seedProducts = async (products) => {
  try {
    for (const product of products) {
      console.log(`Processing product: ${product.name}`);

      const category = await prisma.category.upsert({
        where: { name: product.category },
        update: {},
        create: { name: product.category },
      });

      const productSizes = product.sizes?.length ? product.sizes : globalSizes;
      const availableSizes = await prisma.size.findMany({
        where: { size: { in: productSizes.map((s) => s.toString()) } },
      });

      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: isValidUrl(product.imageUrl) ? product.imageUrl : fallbackImage,
          stock: product.stock,
          category: { connect: { id: category.id } },
          colors: {
            create: product.colors?.map((color) => ({
              colorName: color.colorName || "Default Color",
              imageUrl: isValidUrl(color.image) ? color.image : fallbackImage,
              hoverImage: isValidUrl(color.hoverImage) ? color.hoverImage : fallbackImage,
            })) || [],
          },
          sizes: {
            create: availableSizes.map((size) => ({
              size: { connect: { id: size.id } }
            }))
          },
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Inserted product: ${product.name}`);
    }
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error while seeding database:", error.message);
  }
};

const main = async () => {
  console.log("🌱 Seeding database...");
  await seedSizes();
  await seedUsers();
  await seedCategories();

  // Combine only non-empty product arrays
  const products = [...eleganceProducts, ...pumpCoverProducts, ...confidenceProducts];
  await seedProducts(products);

  console.log("🌱 Seeding completed!");
};

// Run Seeder
main()
  .catch((error) => {
    console.error("❌ Unexpected error during seeding:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const BASE_URL =
  process.env.IMAGE_BASE_URL || "https://example.com/default-images";


const eleganceProducts = [
  {
    id: 1,
    name: "Modern Turtleneck",
    price: 199.0,
    description:
      "A chic, cropped turtleneck made with sustainable materials. Perfect for elegant evenings or casual outings.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteCroppedTurtuleneckHover.webp`
      },
      {
        colorName: "Black",
        image: `${BASE_URL}/DifferentColors/BlackCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackCroppedTurtuleneckHover.jpg`
      },
      {
        colorName: "Beige",
        image: `${BASE_URL}/DifferentColors/BeigeCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BeigeCroppedTurtuleneckHover.webp`
      },
      {
        colorName: "Burgundy",
        image: `${BASE_URL}/DifferentColors/BurgundyCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BurgundyCroppedTurtuleneckHover.webp`
      }
    ]
  },
  {
    id: 2,
    name: "Turtleneck",
    price: 79.0,
    description:
      "Classic turtleneck designed for comfort and warmth, featuring versatile color options.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteMTN.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteMTN.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteMTNHover.webp`
      },
      {
        colorName: "Black",
        image: `${BASE_URL}/DifferentColors/BlackMTN.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackMTNHover.webp`
      },
      {
        colorName: "Beige",
        image: `${BASE_URL}/DifferentColors/BeigeMTN.jpg`,
        hoverImage: `${BASE_URL}/HoverImages/BeigeMTNHover.webp`
      },
      {
        colorName: "Burgundy",
        image: `${BASE_URL}/DifferentColors/BurgundyMTN.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BurgundyMTNHover.webp`
      }
    ]
  },
  {
    id: 3,
    name: "Shirt",
    price: 99.0,
    description:
      "A premium shirt with tailored cuts, made from the finest fabrics for a perfect fit.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteShirt.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteShirt.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteShirtHover.jpg`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyShirt.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyShirtHover.jpg`
      },
      {
        colorName: "Green",
        image: `${BASE_URL}/DifferentColors/GreenShirt.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreenShirtHover.jpg`
      },
      {
        colorName: "Burgundy",
        image: `${BASE_URL}/DifferentColors/BurgundyShirt.jpg`,
        hoverImage: `${BASE_URL}/HoverImages/BurgundyShirtHover.jpg`
      },
      {
        colorName: "Navy",
        image: `${BASE_URL}/DifferentColors/NavyShirt.webp`,
        hoverImage: `${BASE_URL}/HoverImages/NavyShirtHover.jpg`
      }
    ]
  },
  {
    id: 4,
    name: "Bamboo T-Shirt",
    price: 49.0,
    description:
      "A stylish and elegant bamboo t-shirt with a unique design. Made from soft, durable bamboo.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteBambooT.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteBambooT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteBambooTHover.jpg`
      },
      {
        colorName: "Black",
        image: `${BASE_URL}/DifferentColors/BlackBambooT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackBambooTHover.webp`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyBambooT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyBambooTHover.webp`
      },
      {
        colorName: "Green",
        image: `${BASE_URL}/DifferentColors/GreenBambooT.jpg`,
        hoverImage: `${BASE_URL}/HoverImages/GreenBambooTHover.webp`
      },
      {
        colorName: "Beige",
        image: `${BASE_URL}/DifferentColors/BeigeBambooT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BeigeBambooTHover.webp`
      }
    ]
  }
];

const pumpCoverProducts = [
  {
    id: 5,
    name: "Samurai Pants",
    price: 199.0,
    description:
      "Sleek Samurai-inspired pants designed for movement and style.",
    category: "Pump Covers",
    imageUrl: `${BASE_URL}/images/BlackSamurai.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackSamuraiHover.webp`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreySamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreySamuraiHover.webp`
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteSamuraiHover.webp`
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownSamuraiHover.webp`
      }
    ]
  },
  {
    id: 6,
    name: "Hoodie",
    price: 79.0,
    description: "Warm, oversized hoodie ideal for cozy days or workouts.",
    category: "Pump Covers",
    imageUrl: `${BASE_URL}/images/BlackHoodie.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackHoodieHover.webp`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyHoodieHover.webp`
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteHoodieHover.webp`
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownHoodieHover.webp`
      }
    ]
  },
  {
    id: 7,
    name: "Shorts",
    price: 99.0,
    description:
      "Comfortable shorts with a premium design, perfect for sports or leisure.",
    category: "Pump Covers",
    imageUrl: `${BASE_URL}/images/BlackShorts.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackShortsHover.webp`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyShortsHover.webp`
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteShortsHover.webp`
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownShortsHover.webp`
      }
    ]
  },
  {
    id: 8,
    name: "T-Shirt",
    price: 49.0,
    description:
      "Casual and versatile T-shirt for everyday wear, available in a variety of colors.",
    category: "Pump Covers",
    imageUrl: `${BASE_URL}/images/BlackT.webp`,
    
    stock: 100,
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackTHover.webp`
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/images/GreyT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyTHover.webp`
      },
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteTHover.webp`
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/images/BrownT.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownTHover.webp`
      }
    ]
  }
];
 const confidenceProducts = [];