import dotenv from "dotenv";
import prisma from "../config/database.js";

dotenv.config();

export const catalogSeedData = [
  {
    externalId: 101,
    name: "Contour Silk Midi Dress",
    description: "Sculpted sleeveless silhouette draped in fluid mulberry silk and organic linen. Minimalist jewel neckline with an understated rear vent.",
    price: 56000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Women",
    stock: 15,
    tag: "Atelier Drop",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Oat Sand", hex: "#D9CDBF" },
      { name: "Noir", hex: "#1A1A1A" },
      { name: "Terracotta", hex: "#AB6653" },
    ],
    material: "70% Mulberry Silk, 30% Organic Linen",
    fitGuide: "True to Size",
  },
  {
    externalId: 102,
    name: "Signature Structured Tote",
    description: "Architectural tote handcrafted from Italian vegetable-tanned calfskin. Features reinforced dual handles, protective brass feet, and interior laptop divider.",
    price: 72000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Accessories",
    stock: 8,
    tag: "Bestseller",
    sizes: ["One Size"],
    colors: [
      { name: "Cognac Tan", hex: "#C68642" },
      { name: "Ebony", hex: "#222222" },
      { name: "Olive Sage", hex: "#5B7256" },
    ],
    material: "100% Full-Grain Italian Calfskin Leather",
    fitGuide: "True to Size",
  },
  {
    externalId: 103,
    name: "Arc Ribbed Cashmere Knit",
    description: "Oversized chunky rib crewneck spun from Grade-A Mongolian cashmere and soft merino wool. Generous sleeves with subtle drop-shoulder tailoring.",
    price: 48000,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Knitwear",
    stock: 6,
    tag: "Only 3 Left",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Raw Oatmeal", hex: "#E3DDD2" },
      { name: "Sage Heather", hex: "#7E8E78" },
      { name: "Charcoal", hex: "#3A3A3C" },
    ],
    material: "60% Grade-A Mongolian Cashmere, 40% Merino Wool",
    fitGuide: "True to Size",
  },
  {
    externalId: 104,
    name: "Field Utility Canvas Overshirt",
    description: "Boxy workwear overshirt tailored in heavy Japanese cotton canvas with garment-washed softness. Dual chest flap pockets and horn button closures.",
    price: 64000,
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Outerwear",
    stock: 12,
    tag: "New Edition",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Terracotta Clay", hex: "#B85D43" },
      { name: "Washed Olive", hex: "#4A5844" },
      { name: "Desert Sand", hex: "#C7B299" },
    ],
    material: "100% Japanese Combed Cotton Canvas",
    fitGuide: "True to Size",
  },
  {
    externalId: 105,
    name: "Pleated High-Waisted Trousers",
    description: "High-waisted relaxed trousers featuring sharp double front pleats, clean side slash pockets, and an elongated fluid drape in lightweight wool blend.",
    price: 52000,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Women",
    stock: 9,
    tag: "Trending",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Olive Heather", hex: "#636F57" },
      { name: "Ecru", hex: "#EBE5D8" },
      { name: "Midnight Navy", hex: "#1C2430" },
    ],
    material: "85% Virgin Wool, 15% Silk Crepe",
    fitGuide: "True to Size",
  },
  {
    externalId: 106,
    name: "Atelier Box Calf Penny Loafers",
    description: "Timeless penny loafers meticulously constructed with Goodyear welted leather soles and hand-burnished full-grain box calf leather uppers.",
    price: 85000,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Accessories",
    stock: 4,
    tag: "Low Stock",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: [
      { name: "Nero Black", hex: "#151515" },
      { name: "Deep Burgundy", hex: "#581825" },
    ],
    material: "Hand-Burnished Box Calf Leather, Leather Sole",
    fitGuide: "Runs Large",
  },
  {
    externalId: 107,
    name: "Washed Wool Belted Blazer",
    description: "Double-breasted architectural tailored blazer featuring structured shoulders, clean notch lapels, and a removable self-tie belt.",
    price: 92000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Outerwear",
    stock: 5,
    tag: "Limited Drop",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Camel Sand", hex: "#C2B29D" },
      { name: "Noir Black", hex: "#111111" },
    ],
    material: "100% Biella Washed Virgin Wool",
    fitGuide: "True to Size",
  },
  {
    externalId: 108,
    name: "Minimalist Calfskin Leather Belt",
    description: "Sleek 30mm dress belt crafted from smooth Italian bridle calfskin with a solid brushed brass square buckle.",
    price: 28000,
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Accessories",
    stock: 20,
    tag: "Essential",
    sizes: ["85cm", "90cm", "95cm", "100cm"],
    colors: [
      { name: "Brushed Brass & Black", hex: "#111111" },
      { name: "Caramel Tan", hex: "#C68642" },
    ],
    material: "Full-Grain Bridle Leather, Solid Brass Buckle",
    fitGuide: "True to Size",
  },
  {
    externalId: 109,
    name: "Double-Faced Wool Overcoat",
    description: "Clean unlined winter coat tailored in premium heavyweight wool with hand-stitched split seam construction.",
    price: 115000,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Outerwear",
    stock: 6,
    tag: "Winter Drop",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Charcoal Grey", hex: "#374151" },
      { name: "Classic Camel", hex: "#B49774" },
    ],
    material: "90% Melton Wool, 10% Cashmere",
    fitGuide: "True to Size",
  },
  {
    externalId: 110,
    name: "Fine Gauge Mock-Neck Sweater",
    description: "Seamless knitted mock-neck pullover woven from ultra-fine Australian merino wool with ribbed neck, cuffs, and hem.",
    price: 42000,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Knitwear",
    stock: 14,
    tag: "Bestseller",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Onyx Black", hex: "#09090B" },
      { name: "Ivory Cream", hex: "#FAF9F6" },
    ],
    material: "100% Extra-Fine Merino Wool",
    fitGuide: "True to Size",
  },
  {
    externalId: 111,
    name: "Tailored French Linen Shirt",
    description: "Breathable relaxed-fit button-down cut from pure Normandy flax linen with mother-of-pearl buttons.",
    price: 38000,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Women",
    stock: 11,
    tag: "Summer Edit",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Soft Slate", hex: "#9CA3AF" },
    ],
    material: "100% French Normandy Linen",
    fitGuide: "True to Size",
  },
  {
    externalId: 112,
    name: "Monochrome Silk Twill Scarf",
    description: "Square 70cm neck scarf with hand-rolled hems, printed in an abstract architectural pattern on fluid silk twill.",
    price: 24000,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Accessories",
    stock: 18,
    tag: "New Drop",
    sizes: ["One Size"],
    colors: [
      { name: "Geometric Noir", hex: "#18181B" },
    ],
    material: "100% Mulberry Silk Twill",
    fitGuide: "True to Size",
  },
];

export const seedDatabase = async () => {
  console.log("🌱 Seeding Vroom Style(s) Luxury Catalog with High-Res Unsplash CDN Imagery to PostgreSQL...");

  try {
    let seededCount = 0;

    for (const item of catalogSeedData) {
      await prisma.product.upsert({
        where: {
          externalId: item.externalId,
        },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          images: item.images,
          category: item.category,
          stock: item.stock,
          tag: item.tag,
          sizes: item.sizes,
          colors: item.colors,
          material: item.material,
          fitGuide: item.fitGuide,
          isActive: true,
        },
        create: {
          externalId: item.externalId,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          images: item.images,
          category: item.category,
          stock: item.stock,
          tag: item.tag,
          sizes: item.sizes,
          colors: item.colors,
          material: item.material,
          fitGuide: item.fitGuide,
          isActive: true,
        },
      });
      seededCount++;
    }

    console.log(`✅ Successfully seeded ${seededCount} signature atelier pieces into PostgreSQL!`);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedDatabase();
}
