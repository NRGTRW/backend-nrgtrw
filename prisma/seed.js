// Import from the CommonJS module using default import and destructuring.
import pkg from '@prisma/client';
const { PrismaClient, Role } = pkg;
import bcrypt from "bcrypt";
import { encrypt } from "../src/utils/cryptoUtils.js";
import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Set up __dirname in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 configuration (ensure these environment variables are set).
const bucketName = process.env.AWS_S3_BUCKET_NAME;
if (!bucketName) {
  console.error("AWS_S3_BUCKET_NAME environment variable not set.");
  process.exit(1);
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper: extract the S3 key from a full URL.
function extractS3Key(url) {
  const baseUrl = process.env.IMAGE_BASE_URL || "https://example.com/default-images";
  if (url.startsWith(baseUrl)) {
    return url.slice(baseUrl.length).replace(/^\/+/, '');
  } else {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.replace(/^\/+/, '');
  }
}

// Check if an object exists in S3.
async function fileExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (error) {
    if (error.$metadata && error.$metadata.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

// Upload a local file to S3.
async function uploadFile(key, filePath) {
  try {
    const fileContent = await fs.promises.readFile(filePath);
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
    }));
    console.log(`Uploaded ${key} to S3.`);
  } catch (error) {
    console.error(`Error uploading ${key}:`, error.message);
  }
}

// Before seeding, ensure that all image files (from products and their colors) exist in S3.
async function seedS3Files() {
  const products = [...eleganceProducts, ...pumpCoverProducts, ...confidenceProducts];
  const fileUrls = new Set();

  for (const product of products) {
    if (product.imageUrl) fileUrls.add(product.imageUrl);
    if (product.colors && Array.isArray(product.colors)) {
      for (const color of product.colors) {
        if (color.image) fileUrls.add(color.image);
        if (color.hoverImage) fileUrls.add(color.hoverImage);
      }
    }
  }

  for (const url of fileUrls) {
    const key = extractS3Key(url);
    const localFilePath = path.join(__dirname, "public", key);
    try {
      const exists = await fileExists(key);
      if (!exists) {
        console.log(`File ${key} not found in S3. Uploading from ${localFilePath}...`);
        await uploadFile(key, localFilePath);
      } else {
        console.log(`File ${key} already exists in S3.`);
      }
    } catch (error) {
      console.error(`Error processing file ${key}:`, error.message);
    }
  }
}

// ------------------------
// Prisma seeding functions
// ------------------------
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

const globalSizes = ["S", "M", "L", "XL"];
const seedSizes = async () => {
  try {
    for (const size of globalSizes) {
      await prisma.size.upsert({
        where: { size },
        update: {},
        create: { size }
      });
    }
    console.log("✅ Seeded global sizes:", globalSizes);
  } catch (error) {
    console.error("❌ Error seeding sizes:", error.message);
  }
};

const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash( process.env.EMAIL_PASSWORD, 10);
    const encryptedAddress = encrypt("Lyulin 8, bl.815, vh.A");
    const encryptedPhone = encrypt("0897338635");

    await prisma.user.upsert({
      where: { email: process.env.EMAIL_USER },
      update: {
        updatedAt: new Date()
      },
      create: {
        email: process.env.EMAIL_USER,
        password: hashedPassword,
        name: "Nikolay Goranov",
        role: Role.ROOT_ADMIN,  // Now seeding with an explicit role.
        address: encryptedAddress,
        phone: encryptedPhone,
        isVerified: true,
        updatedAt: new Date()
      }
    });

    console.log("✅ Seeded/Updated User");
  } catch (error) {
    console.error("❌ Error seeding user:", error.message);
  }
};

const seedCategories = async () => {
  try {
    const categories = ["Elegance", "Pump Covers", "Confidence"];
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category }
      });
    }
    console.log("✅ Seeded categories:", categories);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  }
};

const seedProducts = async (products) => {
  try {
    for (const product of products) {
      console.log(`Processing product: ${product.name}`);

      // Upsert the product's category.
      const category = await prisma.category.upsert({
        where: { name: product.category },
        update: {},
        create: { name: product.category }
      });

      // Use product.sizes (if provided) or default to globalSizes.
      const productSizes = product.sizes?.length ? product.sizes : globalSizes;
      const availableSizes = await prisma.size.findMany({
        where: { size: { in: productSizes.map(s => s.toString()) } }
      });

      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: isValidUrl(product.imageUrl) ? product.imageUrl : fallbackImage,
          stock: product.stock,
          category: { connect: { id: category.id } },
          // Create colors using the field "colors" (note: we now also set "position").
          colors: {
            create: product.colors?.map((color, index) => ({
              colorName: color.colorName || "Default Color",
              imageUrl: isValidUrl(color.image) ? color.image : fallbackImage,
              hoverImage: (color.hoverImage && isValidUrl(color.hoverImage))
                         ? color.hoverImage
                         : fallbackImage,
              position: index  // Explicitly setting the position (index) for each color.
            })) || []
          },
          // Create ProductSize entries using the field "sizes".
          sizes: {
            create: availableSizes.map(size => ({
              size: { connect: { id: size.id } }
            }))
          }
        }
      });

      console.log(`✅ Inserted product: ${product.name}`);
    }
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error while seeding database:", error.message);
  }
};


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


const main = async () => {
  console.log("🌱 Seeding database...");

  // First, ensure that all image files are in S3.
  await seedS3Files();
  // Seed sizes, users, and categories.
  await seedSizes();
  await seedUsers();
  await seedCategories();

  // Combine and seed products.
  const products = [
    ...eleganceProducts,
    ...pumpCoverProducts,
    ...confidenceProducts
  ];
  await seedProducts(products);

  console.log("🌱 Seeding completed!");
};

main()
  .catch((error) => {
    console.error("❌ Unexpected error during seeding:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });