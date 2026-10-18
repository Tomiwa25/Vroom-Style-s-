import request from "supertest";
import app from "../app.js";
import prisma from "../config/database.js";

async function testApiLive() {
  console.log("🌐 Testing Live Express API against PostgreSQL Database...");

  const res = await request(app).get("/api/products?limit=12");

  console.log(`HTTP Status: ${res.status}`);
  console.log(`Success: ${res.body.success}`);
  console.log(`Total Count: ${res.body.data?.total}`);
  console.log(`Returned Products: ${res.body.data?.products?.length}`);

  if (res.body.data?.products) {
    for (const p of res.body.data.products) {
      console.log(
        `✓ [${p.externalId}] ${p.name} - ₦${p.price.toLocaleString()} (Stock: ${p.stock}, Tag: "${p.tag}", Images: ${p.images.length}, Colors: ${p.colors?.length ?? 0}, Sizes: [${p.sizes.join(", ")}])`
      );
    }
  }

  // Also test /api/health
  const healthRes = await request(app).get("/api/health");
  console.log(`\n🏥 Health Endpoint: ${healthRes.status} -> ${JSON.stringify(healthRes.body)}`);
}

testApiLive()
  .catch((err) => {
    console.error("Test API Live Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
