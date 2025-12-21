/*
  Warnings:

  - You are about to drop the column `colorHex` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_code_key";

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "subtitleEn" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "colorHex",
DROP COLUMN "size",
ADD COLUMN     "code" TEXT NOT NULL DEFAULT 'TEMP_CODE',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "products" DROP COLUMN "code",
DROP COLUMN "description",
DROP COLUMN "image",
DROP COLUMN "size";

-- CreateTable
CREATE TABLE "marquees" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "textEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marquees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReelVideo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ReelVideo_pkey" PRIMARY KEY ("id")
);
