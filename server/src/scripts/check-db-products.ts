import prisma from "../config/database.js";

async function check() {
  try {
    const totalCount = await prisma.product.count();
    console.log("Database connected successfully! Total products in DB:", totalCount);
    
    // Group by category
    const byCategory = await prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
    });
    console.log("Products by category in DB:", byCategory);

    const sharpFridge = await prisma.product.findFirst({
      where: { name: { contains: "Sharp J-Tech" } },
      select: { id: true, name: true, category: true, price: true, image: true, images: true, specs: true },
    });
    console.log("Sharp Fridge from DB:", JSON.stringify(sharpFridge, null, 2));
  } catch (err) {
    console.error("DB check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
