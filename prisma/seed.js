// Import required modules and set up Prisma, S3, etc.
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt';

// Set up __dirname for ES modules.
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
  const products = [...eleganceProducts, ...pumpCoverProducts, ...confidenceProducts, ...availableProducts];
  const fileUrls = new Set();

  for (const product of products) {
    // If translations are provided, use each translation’s imageUrl.
    if (product.translations && Array.isArray(product.translations)) {
      for (const translation of product.translations) {
        if (translation.imageUrl) fileUrls.add(translation.imageUrl);
      }
    } else if (product.imageUrl) {
      fileUrls.add(product.imageUrl);
    }
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

// Helper to check if a URL is valid.
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Seed global sizes.
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

// Seed product categories.
const seedCategories = async () => {
  try {
    const categories = ["Elegance", "Pump Covers", "Confidence", "Available", "Accessories"];
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

// Seed products along with their translations, colors, and sizes.
const seedProducts = async (products) => {
  try {
    for (const product of products) {
      // Use the English translation name for logging if available.
      const productName = product.translations?.find(t => t.language === "en")?.name || product.name;
      console.log(`Processing product: ${productName}`);

      // Upsert the product's category.
      const category = await prisma.category.upsert({
        where: { name: product.category },
        update: {},
        create: { name: product.category }
      });

      // Use provided sizes or default to globalSizes.
      const productSizes = product.sizes?.length ? product.sizes : globalSizes;
      const availableSizes = await prisma.size.findMany({
        where: { size: { in: productSizes.map(s => s.toString()) } }
      });

      await prisma.product.create({
        data: {
          price: product.price,
          stock: product.stock,
          category: { connect: { id: category.id } },
          colors: {
            create: product.colors?.map((color, index) => ({
              colorName: color.colorName || "Default Color",
              imageUrl: isValidUrl(color.image) ? color.image : fallbackImage,
              hoverImage: (color.hoverImage && isValidUrl(color.hoverImage))
                         ? color.hoverImage
                         : fallbackImage,
              position: index
            })) || []
          },
          sizes: {
            create: availableSizes.map(size => ({
              size: { connect: { id: size.id } }
            }))
          },
          translations: {
            create: product.translations?.map(translation => ({
              language: translation.language,
              name: translation.name,
              description: translation.description,
              imageUrl: isValidUrl(translation.imageUrl) ? translation.imageUrl : fallbackImage,
            })) || [
              {
                language: "en",
                name: product.name,
                description: product.description,
                imageUrl: isValidUrl(product.imageUrl) ? product.imageUrl : fallbackImage,
              },
              {
                language: "bg",
                name: product.name,
                description: product.description,
                imageUrl: isValidUrl(product.imageUrl) ? product.imageUrl : fallbackImage,
              }
            ]
          }
        }
      });

      console.log(`✅ Inserted product: ${productName}`);
    }
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error while seeding database:", error.message);
  }
};

const BASE_URL = process.env.IMAGE_BASE_URL || "https://example.com/default-images";

// Updated product arrays including translations in both English and Bulgarian.
const eleganceProducts = [
  {
    id: 1,
    price: 199.0,
    stock: 100,
    category: "Elegance",
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
    ],
    translations: [
      {
        language: "en",
        name: "Modern Turtleneck",
        description:
          "A chic, cropped turtleneck made with sustainable materials. Perfect for elegant evenings or casual outings.",
        imageUrl: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`
      },
      {
        language: "bg",
        name: "Модерен връх с яка",
        description:
          "Шикозна, къса яка, изработена от устойчиви материали. Перфектна за елегантни вечери или ежедневни излизания.",
        imageUrl: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`
      }
    ]
  },
  {
    id: 2,
    price: 79.0,
    stock: 100,
    category: "Elegance",
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
    ],
    translations: [
      {
        language: "en",
        name: "Turtleneck",
        description:
          "Classic turtleneck designed for comfort and warmth, featuring versatile color options.",
        imageUrl: `${BASE_URL}/images/WhiteMTN.webp`
      },
      {
        language: "bg",
        name: "Връх с яка",
        description:
          "Класически връх с яка, проектиран за комфорт и топлина, с разнообразни цветови опции.",
        imageUrl: `${BASE_URL}/images/WhiteMTN.webp`
      }
    ]
  },
  {
    id: 3,
    price: 99.0,
    stock: 100,
    category: "Elegance",
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
    ],
    translations: [
      {
        language: "en",
        name: "Shirt",
        description:
          "A premium shirt with tailored cuts, made from the finest fabrics for a perfect fit.",
        imageUrl: `${BASE_URL}/images/WhiteShirt.webp`
      },
      {
        language: "bg",
        name: "Риза",
        description:
          "Премиум риза с персонализирани кройки, изработена от най-качествените тъкани за перфектно прилепване.",
        imageUrl: `${BASE_URL}/images/WhiteShirt.webp`
      }
    ]
  },
  {
    id: 4,
    price: 49.0,
    stock: 100,
    category: "Elegance",
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
    ],
    translations: [
      {
        language: "en",
        name: "Bamboo T-Shirt",
        description:
          "A stylish and elegant bamboo t-shirt with a unique design. Made from soft, durable bamboo.",
        imageUrl: `${BASE_URL}/images/WhiteBambooT.webp`
      },
      {
        language: "bg",
        name: "Бамбукова тениска",
        description:
          "Стилна и елегантна бамбукова тениска с уникален дизайн. Изработена от меък и издръжлив бамбук.",
        imageUrl: `${BASE_URL}/images/WhiteBambooT.webp`
      }
    ]
  }
];

const pumpCoverProducts = [
  {
    id: 5,
    price: 199.0,
    stock: 100,
    category: "Pump Covers",
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
    ],
    translations: [
      {
        language: "en",
        name: "Samurai Pants",
        description:
          "Sleek Samurai-inspired pants designed for movement and style.",
        imageUrl: `${BASE_URL}/images/BlackSamurai.webp`
      },
      {
        language: "bg",
        name: "Самурайски панталони",
        description:
          "Стилни панталони, вдъхновени от самурай, създадени за движение и стил.",
        imageUrl: `${BASE_URL}/images/BlackSamurai.webp`
      }
    ]
  },
  {
    id: 6,
    price: 79.0,
    stock: 100,
    category: "Pump Covers",
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
    ],
    translations: [
      {
        language: "en",
        name: "Hoodie",
        description:
          "Warm, oversized hoodie ideal for cozy days or workouts.",
        imageUrl: `${BASE_URL}/images/BlackHoodie.webp`
      },
      {
        language: "bg",
        name: "Суичър",
        description:
          "Топъл, оувърсайз суичър, идеален за уютни дни или тренировки.",
        imageUrl: `${BASE_URL}/images/BlackHoodie.webp`
      }
    ]
  },
  {
    id: 7,
    price: 99.0,
    stock: 100,
    category: "Pump Covers",
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
    ],
    translations: [
      {
        language: "en",
        name: "Shorts",
        description:
          "Comfortable shorts with a premium design, perfect for sports or leisure.",
        imageUrl: `${BASE_URL}/images/BlackShorts.webp`
      },
      {
        language: "bg",
        name: "Шорти",
        description:
          "Удобни шорти с премиум дизайн, идеални за спорт или отдих.",
        imageUrl: `${BASE_URL}/images/BlackShorts.webp`
      }
    ]
  },
  {
    id: 8,
    price: 49.0,
    stock: 100,
    category: "Pump Covers",
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
    ],
    translations: [
      {
        language: "en",
        name: "T-Shirt",
        description:
          "Casual and versatile T-shirt for everyday wear, available in a variety of colors.",
        imageUrl: `${BASE_URL}/images/BlackT.webp`
      },
      {
        language: "bg",
        name: "Тениска",
        description:
          "Ежедневна и универсална тениска, налична в разнообразие от цветове.",
        imageUrl: `${BASE_URL}/images/BlackT.webp`
      }
    ]
  }
];

const confidenceProducts = []; // Add products here if needed

const availableProducts = [
  {
    id: 14,
    price: 50.0,
    stock: 100,
    category: "Available",
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/Reflection Layer.jpg`,
        hoverImage: `${BASE_URL}/images/Reflection Layer.jpg`
      },
      {
        colorName: "Back",
        image: `${BASE_URL}/images/Reflection Layer_back.webp`,
        hoverImage: `${BASE_URL}/images/Reflection Layer_back.webp`
      },
      {
        colorName: "Material",
        image: `${BASE_URL}/images/Reflection Layer_upclose.webp`,
        hoverImage: `${BASE_URL}/images/Reflection Layer_upclose.webp`
      },
      {
        colorName: "Legit",
        image: `${BASE_URL}/images/gym-mirror-tee-1.jpg`,
        hoverImage: `${BASE_URL}/images/gym-mirror-tee-1.jpg`
      },
    ],
    translations: [
      {
        language: "en",
        name: "Reflection Layer",
        description:
          "Make a bold impression with this oversized streetwear tee. Soft cotton blend, fearless graphics – ideal for both grind time and chill time.",
        imageUrl: `${BASE_URL}/images/Reflection Layer.jpg`,
      },
      {
        language: "bg",
        name: "Reflection Layer",
        description:
          "Направете смело впечатление с тази оувърсайз тениска със смели графики. Мека памучна смес – идеална както за тренировки, така и за почивка.",
        imageUrl: `${BASE_URL}/images/Reflection Layer.jpg`,
      },
    ]
  }
];

// Seed a root admin user if not exists
async function seedRootAdmin() {
  const email = process.env.EMAIL_USER || 'root@admin.com';
  const password = process.env.EMAIL_PASSWORD || 'RootAdmin123!'; // Change after first login
  const name = process.env.ROOT_ADMIN_NAME || 'Root Admin';
  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ROOT_ADMIN',
        isVerified: true
      }
    });
    console.log(`✅ Seeded root admin: ${email} / ${password}`);
  } else {
    console.log(`ℹ️ Root admin already exists: ${email}`);
  }
}

// Main seeding function.
const main = async () => {
  console.log("🌱 Seeding products only...");
  await seedRootAdmin();
  // Ensure all product image files are in S3.
  await seedS3Files();
  // Seed sizes and categories (required for products).
  await seedSizes();
  await seedCategories();

  // Combine and seed products.
  const products = [
    ...eleganceProducts,
    ...pumpCoverProducts,
    ...confidenceProducts,
    ...availableProducts
  ];
  await seedProducts(products);

  console.log("🌱 Product seeding completed!");
};

main()
  .catch((error) => {
    console.error("❌ Unexpected error during seeding:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
