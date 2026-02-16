-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDER_DITERIMA', 'APPROVAL_SAMPLE', 'MENUNGGU_ANTRIAN', 'PRODUKSI_BERJALAN', 'PENDING', 'QUALITY_CHECK', 'SIAP_DIAMBIL', 'ORDER_SELESAI');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

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
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_updates" ADD CONSTRAINT "order_status_updates_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_updates" ADD CONSTRAINT "order_status_updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Function untuk generate order code unik
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Format: JAH + YYMMDD + RANDOM 3 digit (contoh: JAH240214001)
        new_code := 'JAH' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        SELECT EXISTS(SELECT 1 FROM orders WHERE order_code = new_code) INTO exists_check;
        
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function untuk membuat status update awal ketika order dibuat
CREATE OR REPLACE FUNCTION create_initial_status_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_status_updates (order_id, status, notes)
    VALUES (NEW.id, NEW.current_status, 'Order diterima dan masuk ke sistem');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk update current_status di orders ketika ada status update baru
CREATE OR REPLACE FUNCTION update_order_current_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET current_status = NEW.status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk otomatis membuat status update ketika order dibuat
CREATE TRIGGER after_order_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_status_update();

-- Trigger untuk update current_status di orders ketika ada status update baru
CREATE TRIGGER after_status_update_insert
    AFTER INSERT ON order_status_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_order_current_status();

-- ============================================
-- VIEWS
-- ============================================

-- View untuk dashboard admin (summary order dengan info pending)
CREATE VIEW order_dashboard AS
SELECT 
    o.id,
    o.order_code,
    o.customer_name,
    o.order_description,
    o.current_status,
    o.estimated_finished_date,
    o.created_at,
    o.updated_at,
    CASE 
        WHEN o.current_status = 'PENDING'::"OrderStatus" THEN true 
        ELSE false 
    END as has_pending_status,
    pi.adjust_finished_date as pending_adjusted_date,
    pi.issue_description as pending_issue,
    pi.solution as pending_solution
FROM orders o
LEFT JOIN production_issues pi ON o.id = pi.order_id;

-- View untuk public tracking (data yang ditampilkan ke pelanggan)
CREATE VIEW order_tracking_public AS
SELECT 
    o.id,
    o.order_code,
    o.customer_name,
    o.order_description,
    o.current_status,
    o.estimated_finished_date,
    o.created_at,
    CASE 
        WHEN o.current_status = 'PENDING'::"OrderStatus" THEN true 
        ELSE false 
    END as has_pending_status,
    pi.adjust_finished_date as pending_adjusted_date,
    pi.issue_description as pending_issue,
    pi.solution as pending_solution
FROM orders o
LEFT JOIN production_issues pi ON o.id = pi.order_id;

-- View untuk timeline order (digabung dengan data status updates dan user info)
CREATE VIEW order_timeline AS
SELECT 
    osu.id as update_id,
    o.order_code,
    o.customer_name,
    osu.order_id,
    osu.status,
    osu.notes,
    osu.created_at as status_update_time,
    osu.created_by,
    u.username as created_by_username
FROM order_status_updates osu
JOIN orders o ON osu.order_id = o.id
LEFT JOIN users u ON osu.created_by = u.id
ORDER BY osu.created_at DESC;