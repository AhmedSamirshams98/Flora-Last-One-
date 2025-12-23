-- CreateTable
CREATE TABLE "home_categories" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "ProductSubtype" NOT NULL,

    CONSTRAINT "home_categories_pkey" PRIMARY KEY ("id")
);
