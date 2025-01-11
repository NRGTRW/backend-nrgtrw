// Prisma seed file for product data
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const eleganceProducts = [
  {
    id: 1,
    name: "Modern Turtleneck",
    price: 199.0,
    description:
      "A chic, cropped turtleneck made with sustainable materials. Perfect for elegant evenings or casual outings.",
    category: "Elegance",
    imageUrl:
      "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteCroppedTurtuleneck.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteCroppedTurtuleneck.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteCroppedTurtuleneckHover.webp"
      },
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BlackCroppedTurtuleneck.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackCroppedTurtuleneckHover.jpg"
      },
      {
        colorName: "Beige",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BeigeCroppedTurtuleneck.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BeigeCroppedTurtuleneckHover.webp"
      },
      {
        colorName: "Burgundy",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BurgundyCroppedTurtuleneck.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BurgundyCroppedTurtuleneckHover.webp"
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

    imageUrl:
      "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteMTN.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteMTN.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteMTNHover.webp"
      },
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BlackMTN.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackMTNHover.webp"
      },
      {
        colorName: "Beige",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BeigeMTN.jpg",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BeigeMTNHover.webp"
      },
      {
        colorName: "Burgundy",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BurgundyMTN.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BurgundyMTNHover.webp"
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
    imageUrl:
      "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteShirt.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
       colorName:"White",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteShirt.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteShirtHover.jpg"
      },
      {
       colorName:"Grey",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreyShirt.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreyShirtHover.jpg"
      },
      {
       colorName:"Green",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreenShirt.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreenShirtHover.jpg"
      },
      {
       colorName:"Burgundy",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BurgundyShirt.jpg",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BurgundyShirtHover.jpg"
      },
      {
       colorName:"Navy",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/NavyShirt.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/NavyShirtHover.jpg"
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
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteBambooT.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteBambooTHover.jpg"
      },
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BlackBambooT.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackBambooTHover.webp"
      },
      {
        colorName: "Grey",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreyBambooT.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreyBambooTHover.webp"
      },
      {
        colorName: "Green",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreenBambooT.jpg",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreenBambooTHover.webp"
      },
      {
        colorName: "Beige",
        image:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BeigeBambooT.webp",
        hoverImage:
          "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BeigeBambooTHover.webp"
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
      imageUrl:
        "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackSamurai.webp",
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          colorName: "Black",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackSamurai.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackSamuraiHover.webp"
        },
        {
          colorName: "Grey",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreySamurai.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreySamuraiHover.webp"
        },
        {
          colorName: "White",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/WhiteSamurai.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteSamuraiHover.webp"
        },
        {
          colorName: "Brown",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BrownSamurai.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BrownSamuraiHover.webp"
        }
      ]
    },
    {
      id: 6,
      name: "Hoodie",
      price: 79.0,
      description: "Warm, oversized hoodie ideal for cozy days or workouts.",
      category: "Confidence",
      imageUrl:
        "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackHoodie.webp",
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          colorName: "Black",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackHoodie.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackHoodieHover.webp"
        },
        {
          colorName: "Grey",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreyHoodie.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreyHoodieHover.webp"
        },
        {
          colorName: "White",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/WhiteHoodie.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteHoodieHover.webp"
        },
        {
          colorName: "Brown",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BrownHoodie.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BrownHoodieHover.webp"
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
      imageUrl:
        "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackShorts.webp",
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          colorName: "Black",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackShorts.webp",
          hoverImage: "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackShortsHover.webp"
        },
        {
          colorName: "Grey",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/GreyShorts.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreyShortsHover.webp"
        },
        {
          colorName: "White",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/WhiteShorts.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteShortsHover.webp"
        },
        {
          colorName: "Brown",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/DifferentColors/BrownShorts.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BrownShortsHover.webp"
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
      imageUrl:
        "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackT.webp",
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          colorName: "Black",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BlackT.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BlackTHover.webp"
        },
        {
          colorName: "Grey",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/GreyT.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/GreyTHover.webp"
        },
        {
          colorName: "White",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteT.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/WhiteTHover.webp"
        },
        {
          colorName: "Brown",
          image:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/BrownT.webp",
          hoverImage:
            "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/HoverImages/BrownTHover.webp"
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
    imageUrl:
      "https://nrgtrw-images.s3.amazonaws.com/images/BlackSamurai.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=81416e01b35c18ee32a26522b6b2f4b5255581b83af5419a7c950af4cdf78ac5",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/BlackSamurai.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=81416e01b35c18ee32a26522b6b2f4b5255581b83af5419a7c950af4cdf78ac5",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BlackSamuraiHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e77be665af84c70c234d90653429cf8aa78f98cae1c47f3d695bd492305fbf65"
      },
      {
        colorName: "Grey",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/GreySamurai.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c20caa3e32ed85a51d736a3127748e7c91e9f626db4467231695bbb550d5672",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/GreySamuraiHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=ff6a8c0e41b9db38e7bbc8e40d9f41bd18951d4a82086ce4d2cfadd2cff4540c"
      },
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/WhiteSamurai.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=2f6cc436c2ee0f663b7fc4dc4eff861bf2486733a5377aa31d9dfe8b967708db",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/WhiteSamuraiHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=49691f7615a73d46691acde5b21e3e8efd3cf79a44ca8d707c784e3f3e4e031f"
      },
      {
        colorName: "Brown",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/BrownSamurai.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=04319cb4fbac703070e981afaf3bce8ced0a64f7f83f12df60a0e518e0397e87",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BrownSamuraiHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=f733140151d7fa45d977bd363e563b39d94b31d2d8edf759b16159158e0a135d"
      }
    ]
  },
  {
    id: 6,
    name: "Hoodie",
    price: 79.0,
    description: "Warm, oversized hoodie ideal for cozy days or workouts.",
    category: "Confidence",
    imageUrl:
      "https://nrgtrw-images.s3.amazonaws.com/images/BlackHoodie.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3ccbb80f857b82f5b120a879c35643e823ec0b3ca071b7269b3c5d63a309726c",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/BlackHoodie.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3ccbb80f857b82f5b120a879c35643e823ec0b3ca071b7269b3c5d63a309726c",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BlackHoodieHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0b9739e97f59d9a0cccf42c94776073591d3c43a70858c00a179a2890f9772a8"
      },
      {
        colorName: "Grey",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/GreyHoodie.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=031ef2fa211fe3a89b2d20ce49b511ac8976211fc483d20537166afe435f1660",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/GreyHoodieHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=5b6e09ae81794128bf7aa9ba080a321888eb5bcd24faffc35e09bc6230cf4652"
      },
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/WhiteHoodie.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6814d8951387d59b7d4147fe6d8fc9dabffc330c43160b5e096f1098ac00fe93",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/WhiteHoodieHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=fd54da6fdf0d47e2c4d70b336e0008fec9926fc5031e095afc7e6b7d5000e755"
      },
      {
        colorName: "Brown",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/BrownHoodie.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1d7ab10553dfe5e4fa57dee66a7eaebd3a76cf761b87340085beb93e14bce896",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BrownHoodieHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=a9eee710cfc5c464e9ddd5c06204945861b7ac1441f8df3418ef72e30ac655ce"
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
    imageUrl:
      "https://nrgtrw-images.s3.amazonaws.com/images/BlackShorts.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=83766d4f36b591dc5af28e3d4e198d1c72830197fbc1de45af459f870904920d",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/BlackShorts.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=83766d4f36b591dc5af28e3d4e198d1c72830197fbc1de45af459f870904920d",
        hoverImage: "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BlackShortsHover%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=4f06e1a3cfc29058b2dc1fed8c7a8a68fbf90b3c21c408d02205244ae2058ba6"
      },
      {
        colorName: "Grey",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/GreyShorts.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=bcb4254b288cd765d1bfa62dd4661b4a3740a4e9d60e441be89efef4de08f7f2",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/GreyShortsHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1a6e71c722105ac6e1935c33594be6c21ae708094e7a3370ce194de30f4595b3"
      },
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/WhiteShorts.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=f36dc4dd6ccecfe228bb71e36eb343abc9148b000579da4b05631299bfed2968",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/WhiteShortsHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e6fde5237d1684103974545179b0690bc0ce9fb3604ada2452910b8d04d86f48"
      },
      {
        colorName: "Brown",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/DifferentColors/BrownShorts.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0c42341c705db9b98e0b94ec098c92135dee2160d539cf6be89ffe993accdb70",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BrownShortsHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=8f8506dde41b79b73b7404b39ececa4127127ebae5a890a6b1182a64c4fbe022"
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
    imageUrl:
      "https://nrgtrw-images.s3.amazonaws.com/images/BlackT.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=5ad885b3bf047467d937cd4e7448d60244bb14c7ddd08518875a4ea4e3ceafb5",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        colorName: "Black",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/BlackT.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=5ad885b3bf047467d937cd4e7448d60244bb14c7ddd08518875a4ea4e3ceafb5",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BlackTHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=52af8d63891faca9267d735aba4fd5c95796e7d66809b7bfc1d639d1c0471dc1"
      },
      {
        colorName: "Grey",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/GreyT.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e29d0eb02e53bd84ed141cbbcafbb8e8f3b48789c6d51f347454a9c8d21264e7",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/GreyTHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6e2af1c667a9113619699b0b0c28872b1add1ff8407b9fab42bb8bfddd8edf66"
      },
      {
        colorName: "White",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/WhiteT.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1e271c519b0cd1a715a7892713adeb943c678f73fcbd7e3f73ea89d710ef6598",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/WhiteTHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=470de734b4fd0c05020b3ebaac1718fc1cc4f7a399af24041dee4ef9e8d913c8"
      },
      {
        colorName: "Brown",
        image:
          "https://nrgtrw-images.s3.amazonaws.com/images/BrownT.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=a0a72ec8d1aba7b8ae281cdef62613942de58ba9b44211ce57a39c6562039691",
        hoverImage:
          "https://nrgtrw-images.s3.amazonaws.com/HoverImages/BrownTHover.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4MTWIFI4XAG4JSPL%2F20250111%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250111T171439Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=97f9fc10a1dc71581309e608156cad271eb80264b7aa5c8459c25d94142f5c67"
      }
    ]
  }
];

const main = async () => {
  for (const product of eleganceProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        sizes: {
          create: product.sizes.map((size) => ({ size })),
        },
        colors: {
          create: product.colors.map((color) => ({
            colorName: color.colorName || "Default Color", // Add fallback for colorName
            imageUrl: color.image || "https://example.com/placeholder.jpg", // Fallback for undefined imageUrl
            hoverImage: color.hoverImage || "https://example.com/placeholder-hover.jpg", // Fallback for hoverImage
          })),
        },
      },
    });
  }
};


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
