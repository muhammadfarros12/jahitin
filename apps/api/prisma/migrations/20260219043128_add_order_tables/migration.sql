-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDER_DITERIMA', 'APPROVAL_SAMPLE', 'MENUNGGU_ANTRIAN', 'PRODUKSI_BERJALAN', 'PENDING', 'QUALITY_CHECK', 'SIAP_DIAMBIL', 'ORDER_SELESAI');

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_code" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "order_description" TEXT NOT NULL,
    "estimated_finished_date" TIMESTAMP(3) NOT NULL,
    "current_status" "OrderStatus" NOT NULL DEFAULT 'ORDER_DITERIMA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_updates" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "order_status_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_issues" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "previous_status" "OrderStatus" NOT NULL,
    "issue_description" TEXT NOT NULL,
    "solution" TEXT,
    "adjust_finished_date" TIMESTAMP(3),
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE INDEX "idx_orders_order_code" ON "orders"("order_code");

-- CreateIndex
CREATE INDEX "idx_orders_current_status" ON "orders"("current_status");

-- CreateIndex
CREATE INDEX "idx_orders_customer_name" ON "orders"("customer_name");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "idx_orders_created_by" ON "orders"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "production_issues_order_id_key" ON "production_issues"("order_id");

-- CreateIndex
CREATE INDEX "idx_production_issues_order_id" ON "production_issues"("order_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_updates" ADD CONSTRAINT "order_status_updates_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_updates" ADD CONSTRAINT "order_status_updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
