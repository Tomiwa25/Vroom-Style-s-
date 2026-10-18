import prisma from "../config/database.js";

async function verify() {
  console.log("🔍 Checking PostgreSQL Database Products...");

  const total = await prisma.product.count();
  console.log(`Total Products in DB: ${total}`);

  const products = await prisma.product.findMany({
    orderBy: { externalId: "asc" },
  });

  console.log("\n📦 Products in DB:");
  for (const p of products) {
    const imagesCount = Array.isArray(p.images) ? p.images.length : 0;
    const sizes = Array.isArray(p.sizes) ? p.sizes.join(", ") : "None";
    console.log(
      `- [ID ${p.externalId ?? "null"}] ${p.name} | Cat: ${p.category} | Price: ₦${p.price.toLocaleString()} | Stock: ${p.stock} | Tag: "${p.tag || "N/A"}" | Images: ${imagesCount} | Sizes: [${sizes}]`
    );
  }
}

verify()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
