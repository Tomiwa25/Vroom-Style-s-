import dotenv from "dotenv";
import prisma from "../config/database.js";

dotenv.config();

export const catalogSeedData = [
  {
    externalId: 101,
    name: "Contour Silk Midi Dress",
    description: "Sculpted sleeveless silhouette draped in fluid mulberry silk and organic linen. Minimalist jewel neckline with an understated rear vent.",
    price: 56000,
    image: "/images/contour-dress.jpg",
    images: ["/images/contour-dress.jpg", "/images/hero.jpg"],
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
    image: "/images/signature-tote.jpg",
    images: ["/images/signature-tote.jpg"],
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
    image: "/images/arc-knit.jpg",
    images: ["/images/arc-knit.jpg"],
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
    image: "/images/field-overshirt.jpg",
    images: ["/images/field-overshirt.jpg"],
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
    image: "/images/pleated-trousers.jpg",
    images: ["/images/pleated-trousers.jpg"],
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
    image: "/images/atelier-loafers.jpg",
    images: ["/images/atelier-loafers.jpg"],
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
    image: "/images/hero.jpg",
    images: ["/images/hero.jpg", "/images/contour-dress.jpg"],
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
    image: "/images/signature-tote.jpg",
    images: ["/images/signature-tote.jpg"],
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
    image: "/images/field-overshirt.jpg",
    images: ["/images/field-overshirt.jpg"],
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
    image: "/images/arc-knit.jpg",
    images: ["/images/arc-knit.jpg"],
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
    image: "/images/contour-dress.jpg",
    images: ["/images/contour-dress.jpg"],
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
    image: "/images/signature-tote.jpg",
    images: ["/images/signature-tote.jpg"],
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
  console.log("🌱 Seeding Vroom Style(s) Luxury Catalog to PostgreSQL...");

  try {
    // Clean up test products that have no externalId
    const orphanProducts = await prisma.product.findMany({
      where: { externalId: null },
      select: { id: true },
    });
    if (orphanProducts.length > 0) {
      const ids = orphanProducts.map((p) => p.id);
      await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
      await prisma.orderItem.deleteMany({ where: { productId: { in: ids } } });
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
    }

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

    console.log(`✅ Successfully seeded ${seededCount} curated fashion & accessory products into PostgreSQL!`);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

// Execute only if executed directly
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedDatabase();
}
