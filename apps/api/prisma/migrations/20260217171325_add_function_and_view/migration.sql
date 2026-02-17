-- Function untuk membuat status update awal ketika order dibuat
CREATE OR REPLACE FUNCTION create_initial_status_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_status_updates (order_id, status, notes)
    VALUES (NEW.id, NEW.current_status, 'Order diterima dan masuk ke sistem');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk otomatis membuat status update ketika order dibuat
CREATE TRIGGER after_order_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_status_update();

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