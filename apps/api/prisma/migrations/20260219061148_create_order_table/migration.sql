/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "order_code" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "order_description" TEXT,
    "current_status" TEXT NOT NULL,
    "estimated_finish_date" TIMESTAMP(3),
    "is_picked_up" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_code_key" ON "Order"("order_code");
