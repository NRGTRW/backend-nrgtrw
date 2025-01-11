// Prisma seed file for product data
import { PrismaClient } from "@prisma/client";
const BASE_URL = process.env.IMAGE_BASE_URL;
const prisma = new PrismaClient();

export const eleganceProducts = [
  {
    id: 1,
    name: "Modern Turtleneck",
    price: 199.0,
    description:
      "A chic, cropped turtleneck made with sustainable materials. Perfect for elegant evenings or casual outings.",
    category: "Elegance",
    imageUrl: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "White",
        image: `${BASE_URL}/images/WhiteCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteCroppedTurtuleneckHover.webp`,
      },
      {
        colorName: "Black",
        image: `${BASE_URL}/DifferentColors/BlackCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackCroppedTurtuleneckHover.jpg`,
      },
      {
        colorName: "Beige",
        image: `${BASE_URL}/DifferentColors/BeigeCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BeigeCroppedTurtuleneckHover.webp`,
      },
      {
        colorName: "Burgundy",
        image: `${BASE_URL}/DifferentColors/BurgundyCroppedTurtuleneck.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BurgundyCroppedTurtuleneckHover.webp`,
      },
    ],
  },
];

export const pumpCoverProducts = [
  {
    id: 1,
    name: "Samurai Pants",
    price: 199.0,
    description:
      "Sleek Samurai-inspired pants designed for movement and style.",
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackSamurai.webp`,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackSamuraiHover.webp`,
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreySamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreySamuraiHover.webp`,
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteSamuraiHover.webp`,
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownSamurai.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownSamuraiHover.webp`,
      },
    ],
  },
  {
    id: 2,
    name: "Hoodie",
    price: 79.0,
    description: "Warm, oversized hoodie ideal for cozy days or workouts.",
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackHoodie.webp`,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackHoodieHover.webp`,
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyHoodieHover.webp`,
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteHoodieHover.webp`,
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownHoodie.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownHoodieHover.webp`,
      },
    ],
  },
  {
    id: 3,
    name: "Shorts",
    price: 99.0,
    description:
      "Comfortable shorts with a premium design, perfect for sports or leisure.",
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackShorts.webp`,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image: `${BASE_URL}/images/BlackShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BlackShortsHover.webp`,
      },
      {
        colorName: "Grey",
        image: `${BASE_URL}/DifferentColors/GreyShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/GreyShortsHover.webp`,
      },
      {
        colorName: "White",
        image: `${BASE_URL}/DifferentColors/WhiteShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/WhiteShortsHover.webp`,
      },
      {
        colorName: "Brown",
        image: `${BASE_URL}/DifferentColors/BrownShorts.webp`,
        hoverImage: `${BASE_URL}/HoverImages/BrownShortsHover.webp`,
      },
    ],
  },
  {
    id: 4,
    name: "Bamboo T-Shirt",
    price: 49.0,
    description:
      "A stylish and elegant bamboo t-shirt with a unique design. Made from soft, durable bamboo.",
    category: "Elegance",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "White",
        image:
          `${BASE_URL}/images/WhiteBambooT.webp`,
        hoverImage:
          `${BASE_URL}/HoverImages/WhiteBambooTHover.jpg`
      },
      {
        colorName: "Black",
        image:
          `${BASE_URL}/DifferentColors/BlackBambooT.webp`,
        hoverImage:
          `${BASE_URL}/HoverImages/BlackBambooTHover.webp`
      },
      {
        colorName: "Grey",
        image:
          `${BASE_URL}/DifferentColors/GreyBambooT.webp`,
        hoverImage:
          `${BASE_URL}/HoverImages/GreyBambooTHover.webp`
      },
      {
        colorName: "Green",
        image:
          `${BASE_URL}/DifferentColors/GreenBambooT.jpg`,
        hoverImage:
          `${BASE_URL}/HoverImages/GreenBambooTHover.webp`
      },
      {
        colorName: "Beige",
        image:
          `${BASE_URL}/DifferentColors/BeigeBambooT.webp`,
        hoverImage:
          `${BASE_URL}/HoverImages/BeigeBambooTHover.webp`
      }
    ]
  }
];

export const pumpCoversProducts = [
  {
    id: 5,
    name: "Samurai Pants",
    price: 199.0,
    description:
      "Sleek Samurai-inspired pants designed for movement and style.",
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackSamurai.webp`,
    sizes: ["S", "M", "L", "XL"],
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
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackHoodie.webp`,
    sizes: ["S", "M", "L", "XL"],
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
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackShorts.webp`,
    sizes: ["S", "M", "L", "XL"],
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
    category: "Confidence",
    imageUrl: `${BASE_URL}/images/BlackT.webp`,
    sizes: ["S", "M", "L", "XL"],
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
export const confidenceProducts = [
    {
      id: 5,
      name: "Samurai Pants",
      price: 199.0,
      description:
        "Sleek Samurai-inspired pants designed for movement and style.",
      category: "Confidence",
      imageUrl: `${BASE_URL}/images/BlackSamurai.webp`,
      sizes: ["S", "M", "L", "XL"],
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
      category: "Confidence",
      imageUrl: `${BASE_URL}/images/BlackHoodie.webp`,
      sizes: ["S", "M", "L", "XL"],
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
      category: "Confidence",
      imageUrl: `${BASE_URL}/images/BlackShorts.webp`,
      sizes: ["S", "M", "L", "XL"],
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
      category: "Confidence",
      imageUrl: `${BASE_URL}/images/BlackT.webp`,
      sizes: ["S", "M", "L", "XL"],
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

const isValidUrl = (url) => {
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(url);
};

const main = async () => {
  const allProducts = [
    ...eleganceProducts,
    ...pumpCoverProducts,
  ];

  for (const product of allProducts) {
    try {
      console.log(`Processing product: ${product.name}`);
      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          imageUrl: isValidUrl(product.imageUrl)
            ? product.imageUrl
            : "https://example.com/placeholder.jpg", // Fallback for invalid product image
          sizes: {
            create: product.sizes.map((size) => ({ size })),
          },
          colors: {
            create: product.colors.map((color) => ({
              colorName: color.colorName || "Default Color",
              imageUrl: isValidUrl(color.image)
                ? color.image
                : "https://example.com/placeholder.jpg", // Fallback for invalid color image
              hoverImage: isValidUrl(color.hoverImage)
                ? color.hoverImage
                : "https://example.com/placeholder-hover.jpg", // Fallback for invalid hover image
            })),
          },
        },
      });
      console.log(`Inserted product: ${product.name}`);
    } catch (error) {
      console.error(`Failed to insert product: ${product.name}`, error.message);
    }
  }
};

main()
  .catch((e) => {
    console.error("Unexpected error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });