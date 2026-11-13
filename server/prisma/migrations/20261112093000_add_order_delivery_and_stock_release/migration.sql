-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeliveryMethod') THEN
        CREATE TYPE "DeliveryMethod" AS ENUM ('PAYSTACK', 'POD');
    END IF;
END $$;

-- AlterTable
ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'PAYSTACK',
    ADD COLUMN IF NOT EXISTS "shippingName"    TEXT,
    ADD COLUMN IF NOT EXISTS "shippingPhone"   TEXT,
    ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT,
    ADD COLUMN IF NOT EXISTS "shippingCity"    TEXT,
    ADD COLUMN IF NOT EXISTS "shippingNotes"   TEXT,
    ADD COLUMN IF NOT EXISTS "stockReleasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_status_paymentStatus_createdAt_idx"
    ON "orders"("status", "paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");

-- Backfill: historical orders that were created under the old
-- "decrement stock at order creation" model have stock that stays reserved
-- forever if they were never paid. Mark already-cancelled orders as
-- stock-released so the sweep doesn't suddenly re-add stock that was never
-- returned in the first place. PAID/DELIVERED orders keep stock reserved.
UPDATE "orders"
SET "stockReleasedAt" = COALESCE("updatedAt", NOW())
WHERE "status" = 'CANCELLED' AND "stockReleasedAt" IS NULL;
