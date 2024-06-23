-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "mobile" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_mobile_key" ON "Customer"("mobile");
