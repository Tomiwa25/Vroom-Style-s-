-- CreateTable
CREATE TABLE IF NOT EXISTS "product_generation_jobs" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalRequested" INTEGER NOT NULL,
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seed" INTEGER,
    "includeVariations" BOOLEAN NOT NULL DEFAULT true,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "sku" TEXT,
    ADD COLUMN IF NOT EXISTS "slug" TEXT,
    ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
    ADD COLUMN IF NOT EXISTS "brand" TEXT,
    ADD COLUMN IF NOT EXISTS "tag" TEXT,
    ADD COLUMN IF NOT EXISTS "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "colors" JSONB,
    ADD COLUMN IF NOT EXISTS "material" TEXT,
    ADD COLUMN IF NOT EXISTS "fitGuide" TEXT,
    ADD COLUMN IF NOT EXISTS "specs" JSONB,
    ADD COLUMN IF NOT EXISTS "dimensions" JSONB,
    ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "sellerType" TEXT DEFAULT '1P',
    ADD COLUMN IF NOT EXISTS "sellerName" TEXT,
    ADD COLUMN IF NOT EXISTS "sellerRating" INTEGER,
    ADD COLUMN IF NOT EXISTS "isFulfilledByVroom" BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS "warranty" TEXT,
    ADD COLUMN IF NOT EXISTS "bundledIncentive" TEXT,
    ADD COLUMN IF NOT EXISTS "isPodEligible" BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS "podTerms" TEXT,
    ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER,
    ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "jobId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_isDemo_idx" ON "products"("isDemo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_jobId_idx" ON "products"("jobId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_isActive_createdAt_idx" ON "products"("isActive", "createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_jobId_fkey'
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "product_generation_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

