-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('PAYSTACK', 'POD');

-- AlterTable
ALTER TABLE "orders"
    ADD COLUMN "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'PAYSTACK',
    ADD COLUMN "shippingName"    TEXT,
    ADD COLUMN "shippingPhone"   TEXT,
    ADD COLUMN "shippingAddress" TEXT,
    ADD COLUMN "shippingCity"    TEXT,
    ADD COLUMN "shippingNotes"   TEXT,
    ADD COLUMN "stockReleasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_status_paymentStatus_createdAt_idx"
    ON "orders"("status", "paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- Backfill: historical orders that were created under the old
-- "decrement stock at order creation" model have stock that stays reserved
-- forever if they were never paid. Mark already-cancelled orders as
-- stock-released so the sweep doesn't suddenly re-add stock that was never
-- returned in the first place. PAID/DELIVERED orders keep stock reserved.
UPDATE "orders"
SET "stockReleasedAt" = COALESCE("updatedAt", NOW())
WHERE "status" = 'CANCELLED';
