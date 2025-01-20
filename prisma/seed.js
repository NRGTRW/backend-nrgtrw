import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const BASE_URL =
  process.env.IMAGE_BASE_URL || "https://example.com/default-images";
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

const eleganceProducts = [
  {
    id: 1,
    name: "Modern Turtleneck",
    price: 199.0,
    description:
      "A chic, cropped turtleneck made with sustainable materials. Perfect for elegant evenings or casual outings.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`,
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
    sizes: ["S", "M", "L", "XL"],
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
//  const confidenceProducts = [
//     {
//       id: 5,
//       name: "Samurai Pants",
//       price: 199.0,
//       description:
//         "Sleek Samurai-inspired pants designed for movement and style.",
//       category: "Confidence",
//       imageUrl: `${BASE_URL}/images/BlackSamurai.webp`,
// sizes: ["S", "M", "L", "XL"],
// stock: 100,
//       colors: [
//         {
//           colorName: "Black",
//           image: `${BASE_URL}/images/BlackSamurai.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BlackSamuraiHover.webp`
//         },
//         {
//           colorName: "Grey",
//           image: `${BASE_URL}/DifferentColors/GreySamurai.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/GreySamuraiHover.webp`
//         },
//         {
//           colorName: "White",
//           image: `${BASE_URL}/DifferentColors/WhiteSamurai.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/WhiteSamuraiHover.webp`
//         },
//         {
//           colorName: "Brown",
//           image: `${BASE_URL}/DifferentColors/BrownSamurai.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BrownSamuraiHover.webp`
//         }
//       ]
//     },
//     {
//       id: 6,
//       name: "Hoodie",
//       price: 79.0,
//       description: "Warm, oversized hoodie ideal for cozy days or workouts.",
//       category: "Confidence",
//       imageUrl: `${BASE_URL}/images/BlackHoodie.webp`,
//   sizes: ["S", "M", "L", "XL"],
// stock: 100,
//       colors: [
//         {
//           colorName: "Black",
//           image: `${BASE_URL}/images/BlackHoodie.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BlackHoodieHover.webp`
//         },
//         {
//           colorName: "Grey",
//           image: `${BASE_URL}/DifferentColors/GreyHoodie.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/GreyHoodieHover.webp`
//         },
//         {
//           colorName: "White",
//           image: `${BASE_URL}/DifferentColors/WhiteHoodie.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/WhiteHoodieHover.webp`
//         },
//         {
//           colorName: "Brown",
//           image: `${BASE_URL}/DifferentColors/BrownHoodie.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BrownHoodieHover.webp`
//         }
//       ]
//     },
//     {
//       id: 7,
//       name: "Shorts",
//       price: 99.0,
//       description:
//         "Comfortable shorts with a premium design, perfect for sports or leisure.",
//       category: "Confidence",
//       imageUrl: `${BASE_URL}/images/BlackShorts.webp`,
//   sizes: ["S", "M", "L", "XL"],
// stock: 100,
//       colors: [
//         {
//           colorName: "Black",
//           image: `${BASE_URL}/images/BlackShorts.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BlackShortsHover(1).webp`
//         },
//         {
//           colorName: "Grey",
//           image: `${BASE_URL}/DifferentColors/GreyShorts.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/GreyShortsHover.webp`
//         },
//         {
//           colorName: "White",
//           image: `${BASE_URL}/DifferentColors/WhiteShorts.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/WhiteShortsHover.webp`
//         },
//         {
//           colorName: "Brown",
//           image: `${BASE_URL}/DifferentColors/BrownShorts.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BrownShortsHover.webp`
//         }
//       ]
//     },
//     {
//       id: 8,
//       name: "T-Shirt",
//       price: 49.0,
//       description:
//         "Casual and versatile T-shirt for everyday wear, available in a variety of colors.",
//       category: "Confidence",
//       imageUrl: `${BASE_URL}/images/BlackT.webp`,
//   sizes: ["S", "M", "L", "XL"],
// stock: 100,
//       colors: [
//         {
//           colorName: "Black",
//           image: `${BASE_URL}/images/BlackT.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BlackTHover.webp`
//         },
//         {
//           colorName: "Grey",
//           image: `${BASE_URL}/images/GreyT.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/GreyTHover.webp`
//         },
//         {
//           colorName: "White",
//           image: `${BASE_URL}/images/WhiteT.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/WhiteTHover.webp`
//         },
//         {
//           colorName: "Brown",
//           image: `${BASE_URL}/images/BrownT.webp`,
//           hoverImage: `${BASE_URL}/HoverImages/BrownTHover.webp`
//         }
//       ]
//     }
//   ];

const seedDatabase = async () => {
  const allProducts = [...eleganceProducts, ...pumpCoverProducts]; // Combine all product arrays

  try {
    for (const product of allProducts) {
      console.log(`Processing product: ${product.name}`);

      // Ensure sizes and colors exist before attempting to create them
      const sizesData = product.sizes
        ? product.sizes.map((size) => ({ size }))
        : [];
      const colorsData = product.colors
        ? product.colors.map((color) => ({
            colorName: color.colorName || "Default Color", // Fallback for color name
            imageUrl: isValidUrl(color.image) ? color.image : fallbackImage, // Validate image URL
            hoverImage: isValidUrl(color.hoverImage) ? color.hoverImage : fallbackImage, // Validate hover image URL
          }))
        : [];

      // Create product entry
      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: isValidUrl(product.imageUrl) ? product.imageUrl : fallbackImage,
          stock: product.stock,
          Category: {
            connectOrCreate: {
              where: { name: product.category }, // Match by unique field
              create: { name: product.category }, // Create if not found
            },
          },
          sizes: {
            create: sizesData,
          },
          colors: {
            create: colorsData,
          },
        },
      });
      console.log(`Inserted product: ${product.name}`);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error while seeding database:", error.message);
    if (error.meta) console.error("Meta Information:", error.meta);
  } finally {
    await prisma.$disconnect();
  }
};
const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10); // Use bcrypt for password hashing

  const user = await prisma.user.create({
    data: {
      email: "testuser@example.com",
      password: hashedPassword,
      name: "Test",
      // lastName: "User",
    },
  });

  console.log(`Created user: ${user.email}`);
};

seedUsers();


seedDatabase().catch((error) => {
  console.error("Unexpected error:", error.message);
  process.exit(1);
});
