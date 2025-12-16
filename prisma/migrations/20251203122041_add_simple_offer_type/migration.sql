/*
  Warnings:

  - The values [SUPERADIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `discount` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `hasPriceDiscount` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - Made the column `title` on table `offers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productName` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `finalAmount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `price` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `basePrice` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalPrice` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('SIMPLE', 'PERCENTAGE_DISCOUNT', 'FIXED_AMOUNT_DISCOUNT', 'FIXED_PRICE', 'BUY_X_GET_Y', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('SINGLE_PRICE', 'SALE_PRICE', 'WITH_OFFER');

-- CreateEnum
CREATE TYPE "ProductSubtype" AS ENUM ('ALL_SHOES', 'WINTER_BOOTS', 'SNEAKERS', 'PUMPS', 'BALLERINAS', 'LOAFERS', 'SLIPPERS', 'SANDALS', 'ALL_BAGS', 'HAND_BAGS', 'SHOULDER_BAGS', 'CROSSBODY_BAGS', 'CLUTCH_BAGS', 'BACKPACKS', 'WALLETS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "offers" DROP COLUMN "discount",
DROP COLUMN "discountedPrice",
DROP COLUMN "hasPriceDiscount",
DROP COLUMN "images",
DROP COLUMN "originalPrice",
ADD COLUMN     "buyQuantity" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "fixedPrice" DOUBLE PRECISION,
ADD COLUMN     "getQuantity" INTEGER,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "offerType" "OfferType" NOT NULL DEFAULT 'PERCENTAGE_DISCOUNT',
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "color",
DROP COLUMN "size",
ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "variantDetails" TEXT,
ALTER COLUMN "productName" SET NOT NULL,
ALTER COLUMN "variantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "finalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lastUpdatedBy" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "statusHistory" TEXT[];

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "originalPrice",
DROP COLUMN "quantity",
DROP COLUMN "status",
ADD COLUMN     "size" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "type",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category" "ProductType" NOT NULL,
ADD COLUMN     "finalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerId" TEXT,
ADD COLUMN     "offerPrice" DOUBLE PRECISION,
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'SINGLE_PRICE',
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "subcategory" "ProductSubtype";

-- DropEnum
DROP TYPE "ProductStatus";

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_productId_key" ON "wishlists"("userId", "productId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
