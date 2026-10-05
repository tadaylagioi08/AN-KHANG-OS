-- ============================================================================
-- KHANG AN OS - HỆ THỐNG ERP CÔNG TY TNHH KHANG AN BADMINTON
-- DATABASE SCHEMA: POSTGRESQL (SUPABASE COMPATIBLE)
-- KIẾN TRÚC: ACID TRANSACTIONS, FIFO SELECT FOR UPDATE, ROW LEVEL SECURITY (RLS)
-- QUY TẮC: BẢNG SẠCH 100% - KHÔNG CÓ DỮ LIỆU GIẢ (ZERO DUMMY DATA)
-- TỔNG SỐ BẢNG: 18 BẢNG QUẢN TRỊ TOÀN DIỆN
-- ============================================================================

-- 0. KÍCH HOẠT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU ENUM (CUSTOM ENUM TYPES)
-- ============================================================================

-- 1.1. 12 Vai trò nhân sự trong hệ thống Khang An OS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'ceo',
        'sales_manager',
        'salesman',
        'store_manager',
        'warehouse',
        'chief_accountant',
        'accountant_wholesale',
        'accountant_retail',
        'legal',
        'marketing',
        'event',
        'designer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.2. Trạng thái đơn hàng
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'draft',
        'pending_approval',
        'pending_ceo_discount',
        'pending_ceo_debt',
        'approved',
        'partially_fulfilled',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.3. Trạng thái đơn đặt mua hàng (PO)
DO $$ BEGIN
    CREATE TYPE po_status_enum AS ENUM (
        'draft',
        'pending_ceo',
        'approved',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.4. Loại biến động kho
DO $$ BEGIN
    CREATE TYPE movement_type_enum AS ENUM (
        'IN_PO',
        'OUT_ORDER',
        'TRANSFER',
        'STOCKTAKE_ADJUST',
        'RETURN_IN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.5. Trạng thái phiếu biến động kho
DO $$ BEGIN
    CREATE TYPE movement_status_enum AS ENUM (
        'draft',
        'pending',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.6. Loại hoàn trả / đổi hàng
DO $$ BEGIN
    CREATE TYPE refund_type_enum AS ENUM (
        'CASH_REFUND',
        'DEBT_OFFSET',
        'EXCHANGE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.7. Trạng thái phiếu trả hàng
DO $$ BEGIN
    CREATE TYPE return_order_status_enum AS ENUM (
        'pending_check',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.8. Loại chứng từ tài chính thu chi
DO $$ BEGIN
    CREATE TYPE fin_doc_type_enum AS ENUM (
        'RECEIPT',
        'PAYMENT',
        'VAT_OUT',
        'VAT_IN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.9. Nhóm tài liệu bảo mật công ty
DO $$ BEGIN
    CREATE TYPE company_vault_category_enum AS ENUM (
        'LABOR_CONTRACT',
        'REGULATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. HÀM DÙNG CHUNG CẬP NHẬT UPDATED_AT (AUTOMATIC UPDATED_AT TRIGGER FUNCTION)
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. KHỞI TẠO 18 BẢNG CƠ SỞ DỮ LIỆU (ZERO DUMMY DATA)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BẢNG 2: warehouses (Tạo trước để profiles và các bảng kho tham chiếu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE CHECK (code IN ('KHO_SI', 'KHO_LE')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_warehouses_updated_at
BEFORE UPDATE ON warehouses
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 1: profiles (Liên kết auth.users Supabase, phân quyền 12 Roles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    role user_role NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    failed_login_attempts INT NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_warehouse ON profiles(warehouse_id);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 3: product_categories (Nhóm hàng & Trần chiết khấu % Giám đốc duyệt)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    discount_ceiling NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_ceiling >= 0.00 AND discount_ceiling <= 100.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_product_categories_updated_at
BEFORE UPDATE ON product_categories
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 4: products (Danh mục sản phẩm cầu lông)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- Cái, Cây, Cuộn, Hộp, Ống, Đôi...
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 5: inventory_batches (Quản lý Lô FIFO - First In First Out)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    batch_number VARCHAR(100) NOT NULL,
    import_date DATE NOT NULL,
    unit_cost NUMERIC(15, 2) NOT NULL CHECK (unit_cost >= 0),
    quantity_imported NUMERIC(12, 2) NOT NULL CHECK (quantity_imported > 0),
    quantity_remaining NUMERIC(12, 2) NOT NULL CHECK (quantity_remaining >= 0 AND quantity_remaining <= quantity_imported),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_batch_warehouse_product UNIQUE (warehouse_id, product_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_fifo_lookup 
ON inventory_batches (product_id, warehouse_id, import_date ASC, created_at ASC) 
WHERE quantity_remaining > 0;

CREATE TRIGGER set_inventory_batches_updated_at
BEFORE UPDATE ON inventory_batches
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 6: customers (Khách hàng & Hạn mức công nợ)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    debt_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (debt_limit >= 0),
    current_debt NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE TRIGGER set_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 7: suppliers (Nhà cung cấp)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    tax_code VARCHAR(50),
    current_debt NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);

CREATE TRIGGER set_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 8: orders (Đơn hàng bán ra & Tự động chia nhánh Đơn A / Đơn B)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    salesman_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    prepaid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (prepaid_amount >= 0),
    status order_status_enum NOT NULL DEFAULT 'draft',
    parent_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesman ON orders(salesman_id);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_parent ON orders(parent_order_id);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 9: order_items (Chi tiết từng món trong đơn bán)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total_price NUMERIC(15, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE TRIGGER set_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 10: purchase_orders (Đơn đặt mua hàng từ nhà cung cấp - PO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_code VARCHAR(100) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status po_status_enum NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    vat_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (vat_total >= 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

CREATE TRIGGER set_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 11: purchase_order_items (Chi tiết mặt hàng trong đơn mua PO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(15, 2) NOT NULL CHECK (unit_cost >= 0),
    vat_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (vat_percent >= 0 AND vat_percent <= 100),
    vat_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (vat_amount >= 0),
    total_cost NUMERIC(15, 2) NOT NULL CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poi_po ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_poi_product ON purchase_order_items(product_id);

CREATE TRIGGER set_purchase_order_items_updated_at
BEFORE UPDATE ON purchase_order_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 12: stock_movements (Xuất / Nhập / Chuyển kho / Kiểm kê)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_code VARCHAR(100) NOT NULL UNIQUE,
    movement_type movement_type_enum NOT NULL,
    from_warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT,
    to_warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT,
    reference_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    reference_po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    status movement_status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_from_wh ON stock_movements(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_to_wh ON stock_movements(to_warehouse_id);

CREATE TRIGGER set_stock_movements_updated_at
BEFORE UPDATE ON stock_movements
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 13: stock_movement_items (Chi tiết từng lô hàng trong phiếu điều chuyển)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id UUID NOT NULL REFERENCES stock_movements(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(15, 2) NOT NULL CHECK (unit_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smi_movement ON stock_movement_items(movement_id);
CREATE INDEX IF NOT EXISTS idx_smi_batch ON stock_movement_items(batch_id);

CREATE TRIGGER set_stock_movement_items_updated_at
BEFORE UPDATE ON stock_movement_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 14: return_orders (Phiếu đổi / trả hàng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS return_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_code VARCHAR(100) NOT NULL UNIQUE,
    original_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    is_over_30_days BOOLEAN NOT NULL DEFAULT false,
    total_return_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_return_value >= 0),
    refund_type refund_type_enum NOT NULL,
    refund_cash_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (refund_cash_amount >= 0),
    debt_offset_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (debt_offset_amount >= 0),
    status return_order_status_enum NOT NULL DEFAULT 'pending_check',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order ON return_orders(original_order_id);

CREATE TRIGGER set_return_orders_updated_at
BEFORE UPDATE ON return_orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 15: financial_transactions (Thu / Chi / Hóa đơn - UNIQUE Chống Trùng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_code VARCHAR(100) NOT NULL UNIQUE,
    doc_type fin_doc_type_enum NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    invoice_number VARCHAR(100) UNIQUE, -- UNIQUE chống nhập trùng hóa đơn tài chính
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    note TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_customer ON financial_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_fin_supplier ON financial_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fin_invoice ON financial_transactions(invoice_number);

CREATE TRIGGER set_financial_transactions_updated_at
BEFORE UPDATE ON financial_transactions
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 16: period_locks (Khóa sổ tháng - Kế toán trưởng duyệt 8/8 bước)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS period_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    is_locked BOOLEAN NOT NULL DEFAULT false,
    checks_passed INT NOT NULL DEFAULT 0 CHECK (checks_passed >= 0 AND checks_passed <= 8), -- Phải đạt 8/8 bước kiểm tra
    locked_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    unlocked_reason TEXT,
    unlocked_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_period_month_year UNIQUE (month, year)
);

CREATE TRIGGER set_period_locks_updated_at
BEFORE UPDATE ON period_locks
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- BẢNG 17: audit_logs (Nhật ký kiểm toán hệ thống ERP)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table_action ON audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ----------------------------------------------------------------------------
-- BẢNG 18: company_vault (Lưu văn thư mật - Hợp đồng lao động & Quy chế)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    doc_category company_vault_category_enum NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_category ON company_vault(doc_category);

CREATE TRIGGER set_company_vault_updated_at
BEFORE UPDATE ON company_vault
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- 4. HÀM PHÂN QUYỀN HỖ TRỢ RLS (SECURITY DEFINER HELPER FUNCTIONS)
-- ============================================================================

-- Lấy vai trò (role) của người dùng hiện tại từ session auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role
    FROM profiles
    WHERE id = auth.uid()
      AND is_active = true;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Kiểm tra xem user hiện tại có phải là Salesman hay không
CREATE OR REPLACE FUNCTION is_salesman()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_current_user_role() = 'salesman'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Kiểm tra xem user hiện tại có quyền xem bảo mật pháp lý văn thư (CEO hoặc Legal)
CREATE OR REPLACE FUNCTION is_ceo_or_legal()
RETURNS BOOLEAN AS $$
DECLARE
    v_role user_role;
BEGIN
    v_role := get_current_user_role();
    RETURN (v_role IN ('ceo'::user_role, 'legal'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) - CẤU HÌNH BẢO MẬT DÒNG
-- ============================================================================

-- BẬT RLS CHO TẤT CẢ 18 BẢNG
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_vault ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- CHÍNH SÁCH 1: BẢO MẬT company_vault (CHỈ CHO PHÉP CEO VÀ LEGAL)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "company_vault_ceo_legal_select" ON company_vault;
CREATE POLICY "company_vault_ceo_legal_select" ON company_vault
FOR SELECT TO authenticated
USING (
    is_ceo_or_legal()
);

DROP POLICY IF EXISTS "company_vault_ceo_legal_insert" ON company_vault;
CREATE POLICY "company_vault_ceo_legal_insert" ON company_vault
FOR INSERT TO authenticated
WITH CHECK (
    is_ceo_or_legal()
);

DROP POLICY IF EXISTS "company_vault_ceo_legal_update" ON company_vault;
CREATE POLICY "company_vault_ceo_legal_update" ON company_vault
FOR UPDATE TO authenticated
USING (
    is_ceo_or_legal()
)
WITH CHECK (
    is_ceo_or_legal()
);

DROP POLICY IF EXISTS "company_vault_ceo_delete" ON company_vault;
CREATE POLICY "company_vault_ceo_delete" ON company_vault
FOR DELETE TO authenticated
USING (
    get_current_user_role() = 'ceo'::user_role
);

-- ----------------------------------------------------------------------------
-- CHÍNH SÁCH 2: CHE GIẤU GIÁ VỐN (unit_cost) ĐỐI VỚI SALESMAN
-- Triển khai qua 2 tầng bảo vệ:
-- Tầng A: RLS chặn Salesman truy cập vào purchase_order_items (Đơn mua hàng)
-- Tầng B: VIEW Bảo mật Động (Dynamic Masking View) che giấu unit_cost thành NULL
-- ----------------------------------------------------------------------------

-- Chặn Salesman xem purchase_orders & purchase_order_items
DROP POLICY IF EXISTS "po_hide_from_salesman" ON purchase_orders;
CREATE POLICY "po_hide_from_salesman" ON purchase_orders
FOR SELECT TO authenticated
USING (
    NOT is_salesman()
);

DROP POLICY IF EXISTS "poi_hide_from_salesman" ON purchase_order_items;
CREATE POLICY "poi_hide_from_salesman" ON purchase_order_items
FOR SELECT TO authenticated
USING (
    NOT is_salesman()
);

-- Chính sách cơ bản cho các bảng dùng chung
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;
CREATE POLICY "authenticated_read_profiles" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_warehouses" ON warehouses;
CREATE POLICY "authenticated_read_warehouses" ON warehouses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_categories" ON product_categories;
CREATE POLICY "authenticated_read_categories" ON product_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_products" ON products;
CREATE POLICY "authenticated_read_products" ON products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_customers" ON customers;
CREATE POLICY "authenticated_read_customers" ON customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_batches" ON inventory_batches;
CREATE POLICY "authenticated_read_batches" ON inventory_batches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_orders" ON orders;
CREATE POLICY "authenticated_read_orders" ON orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_order_items" ON order_items;
CREATE POLICY "authenticated_read_order_items" ON order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_stock_movements" ON stock_movements;
CREATE POLICY "authenticated_read_stock_movements" ON stock_movements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_stock_movement_items" ON stock_movement_items;
CREATE POLICY "authenticated_read_stock_movement_items" ON stock_movement_items FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 6. VIEWS BẢO MẬT CHE GIÁ VỐN (DYNAMIC COLUMN-MASKING VIEWS CHO SALESMAN)
-- ============================================================================

-- 6.1. View xem lô hàng: Nếu user là salesman thì unit_cost trả về NULL
CREATE OR REPLACE VIEW v_inventory_batches_secure WITH (security_barrier = true) AS
SELECT 
    id,
    product_id,
    warehouse_id,
    batch_number,
    import_date,
    CASE 
        WHEN is_salesman() THEN NULL 
        ELSE unit_cost 
    END AS unit_cost,
    quantity_imported,
    quantity_remaining,
    created_at,
    updated_at
FROM inventory_batches;

-- 6.2. View biến động kho: Che giá vốn đối với salesman
CREATE OR REPLACE VIEW v_stock_movement_items_secure WITH (security_barrier = true) AS
SELECT 
    id,
    movement_id,
    product_id,
    batch_id,
    quantity,
    CASE 
        WHEN is_salesman() THEN NULL 
        ELSE unit_cost 
    END AS unit_cost,
    created_at,
    updated_at
FROM stock_movement_items;

-- 6.3. View đơn đặt mua: Che toàn bộ giá vốn đối với salesman
CREATE OR REPLACE VIEW v_purchase_order_items_secure WITH (security_barrier = true) AS
SELECT 
    id,
    po_id,
    product_id,
    quantity,
    CASE 
        WHEN is_salesman() THEN NULL 
        ELSE unit_cost 
    END AS unit_cost,
    vat_percent,
    CASE 
        WHEN is_salesman() THEN NULL 
        ELSE vat_amount 
    END AS vat_amount,
    CASE 
        WHEN is_salesman() THEN NULL 
        ELSE total_cost 
    END AS total_cost,
    created_at,
    updated_at
FROM purchase_order_items;

-- ============================================================================
-- 7. LOGIC KHO & ĐƠN HÀNG: FIFO VỚI "SELECT ... FOR UPDATE" & TỰ ĐỘNG TÁCH ĐƠN
-- Đơn A: Đủ hàng (Approved / Ready to Fulfill)
-- Đơn B: Chờ hàng (Pending Approval / Backorder)
-- Chia tỷ lệ tiền cọc (pro-rata prepaid_amount) chống Race Condition
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_allocate_stock_fifo_and_split_order(
    p_order_id UUID,
    p_operator_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_batch RECORD;
    v_needed_qty NUMERIC(12, 2);
    v_alloc_qty NUMERIC(12, 2);
    v_total_available_for_item NUMERIC(12, 2);
    
    v_has_shortage BOOLEAN := false;
    v_total_amount_A NUMERIC(15, 2) := 0;
    v_total_amount_B NUMERIC(15, 2) := 0;
    v_deposit_A NUMERIC(15, 2) := 0;
    v_deposit_B NUMERIC(15, 2) := 0;
    
    v_order_A_id UUID;
    v_order_B_id UUID;
    v_movement_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Khóa đơn hàng mục tiêu chống đồng thời (Anti Race Condition)
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Đơn hàng ID % không tồn tại trong hệ thống', p_order_id;
    END IF;

    IF v_order.status NOT IN ('draft', 'pending_approval') THEN
        RAISE EXCEPTION 'Đơn hàng đang ở trạng thái "%", không thể xuất kho', v_order.status;
    END IF;

    -- 2. Kiểm tra tổng thể tồn kho theo từng dòng hàng trước khi phân bổ
    FOR v_item IN 
        SELECT oi.*, p.code AS product_code, p.name AS product_name
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = p_order_id
    LOOP
        SELECT COALESCE(SUM(quantity_remaining), 0)
        INTO v_total_available_for_item
        FROM inventory_batches
        WHERE product_id = v_item.product_id
          AND warehouse_id = v_order.warehouse_id
          AND quantity_remaining > 0;

        IF v_total_available_for_item < v_item.quantity THEN
            v_has_shortage := true;
        END IF;
    END LOOP;

    -- 3. KỊCH BẢN 1: ĐỦ HÀNG 100% - TRỪ KHO FIFO VỚI "SELECT ... FOR UPDATE"
    IF NOT v_has_shortage THEN
        -- Tạo phiếu xuất kho OUT_ORDER
        INSERT INTO stock_movements (
            movement_code,
            movement_type,
            from_warehouse_id,
            reference_order_id,
            created_by,
            status
        ) VALUES (
            'PXK-' || v_order.order_code,
            'OUT_ORDER',
            v_order.warehouse_id,
            v_order.id,
            COALESCE(p_operator_id, v_order.salesman_id),
            'completed'
        ) RETURNING id INTO v_movement_id;

        -- Duyệt từng sản phẩm và khóa các lô FIFO cũ nhất trước
        FOR v_item IN 
            SELECT * FROM order_items WHERE order_id = p_order_id
        LOOP
            v_needed_qty := v_item.quantity;

            FOR v_batch IN 
                SELECT * 
                FROM inventory_batches
                WHERE product_id = v_item.product_id
                  AND warehouse_id = v_order.warehouse_id
                  AND quantity_remaining > 0
                ORDER BY import_date ASC, created_at ASC
                FOR UPDATE
            LOOP
                EXIT WHEN v_needed_qty <= 0;

                IF v_batch.quantity_remaining >= v_needed_qty THEN
                    v_alloc_qty := v_needed_qty;
                ELSE
                    v_alloc_qty := v_batch.quantity_remaining;
                END IF;

                -- Trừ kho lô
                UPDATE inventory_batches
                SET quantity_remaining = quantity_remaining - v_alloc_qty
                WHERE id = v_batch.id;

                -- Ghi nhận chi tiết xuất kho
                INSERT INTO stock_movement_items (
                    movement_id,
                    product_id,
                    batch_id,
                    quantity,
                    unit_cost
                ) VALUES (
                    v_movement_id,
                    v_item.product_id,
                    v_batch.id,
                    v_alloc_qty,
                    v_batch.unit_cost
                );

                v_needed_qty := v_needed_qty - v_alloc_qty;
            END LOOP;
        END LOOP;

        -- Cập nhật trạng thái đơn gốc thành 'approved'
        UPDATE orders
        SET status = 'approved'
        WHERE id = p_order_id;

        -- Ghi nhật ký kiểm toán
        INSERT INTO audit_logs (user_id, action, table_name, new_data)
        VALUES (
            p_operator_id,
            'ALLOCATE_FIFO_FULL',
            'orders',
            jsonb_build_object(
                'order_id', p_order_id,
                'status', 'approved',
                'movement_id', v_movement_id
            )
        );

        v_result := jsonb_build_object(
            'success', true,
            'split_required', false,
            'order_id', p_order_id,
            'status', 'approved',
            'movement_id', v_movement_id,
            'message', 'Đã phân bổ 100% kho FIFO và duyệt đơn thành công.'
        );

    -- 4. KỊCH BẢN 2: THIẾU HÀNG - TỰ ĐỘNG TÁCH ĐƠN (ĐƠN A ĐỦ HÀNG, ĐƠN B CHỜ HÀNG)
    ELSE
        -- 4.1. Tạo Đơn A (Đủ hàng)
        INSERT INTO orders (
            order_code,
            customer_id,
            salesman_id,
            warehouse_id,
            total_amount,
            discount_percent,
            prepaid_amount,
            status,
            parent_order_id,
            note
        ) VALUES (
            v_order.order_code || '-A',
            v_order.customer_id,
            v_order.salesman_id,
            v_order.warehouse_id,
            0,
            v_order.discount_percent,
            0,
            'approved',
            v_order.id,
            'Tự động tách từ ' || v_order.order_code || ' [Đơn A: Xuất ngay hàng có sẵn]'
        ) RETURNING id INTO v_order_A_id;

        -- 4.2. Tạo Đơn B (Chờ hàng)
        INSERT INTO orders (
            order_code,
            customer_id,
            salesman_id,
            warehouse_id,
            total_amount,
            discount_percent,
            prepaid_amount,
            status,
            parent_order_id,
            note
        ) VALUES (
            v_order.order_code || '-B',
            v_order.customer_id,
            v_order.salesman_id,
            v_order.warehouse_id,
            0,
            v_order.discount_percent,
            0,
            'pending_approval',
            v_order.id,
            'Tự động tách từ ' || v_order.order_code || ' [Đơn B: Chờ nhập kho lô mới]'
        ) RETURNING id INTO v_order_B_id;

        -- Tạo phiếu xuất kho cho Đơn A
        INSERT INTO stock_movements (
            movement_code,
            movement_type,
            from_warehouse_id,
            reference_order_id,
            created_by,
            status
        ) VALUES (
            'PXK-' || v_order.order_code || '-A',
            'OUT_ORDER',
            v_order.warehouse_id,
            v_order_A_id,
            COALESCE(p_operator_id, v_order.salesman_id),
            'completed'
        ) RETURNING id INTO v_movement_id;

        -- 4.3. Phân bổ hàng theo từng dòng đơn và bóc tách Đơn A & B
        FOR v_item IN 
            SELECT * FROM order_items WHERE order_id = p_order_id
        LOOP
            v_needed_qty := v_item.quantity;
            v_alloc_qty := 0;

            -- Khóa các lô còn hàng theo FIFO
            FOR v_batch IN 
                SELECT * 
                FROM inventory_batches
                WHERE product_id = v_item.product_id
                  AND warehouse_id = v_order.warehouse_id
                  AND quantity_remaining > 0
                ORDER BY import_date ASC, created_at ASC
                FOR UPDATE
            LOOP
                EXIT WHEN v_needed_qty <= 0;

                DECLARE
                    v_take NUMERIC(12, 2);
                BEGIN
                    IF v_batch.quantity_remaining >= v_needed_qty THEN
                        v_take := v_needed_qty;
                    ELSE
                        v_take := v_batch.quantity_remaining;
                    END IF;

                    -- Trừ kho lô
                    UPDATE inventory_batches
                    SET quantity_remaining = quantity_remaining - v_take
                    WHERE id = v_batch.id;

                    -- Ghi chi tiết xuất kho
                    INSERT INTO stock_movement_items (
                        movement_id,
                        product_id,
                        batch_id,
                        quantity,
                        unit_cost
                    ) VALUES (
                        v_movement_id,
                        v_item.product_id,
                        v_batch.id,
                        v_take,
                        v_batch.unit_cost
                    );

                    v_alloc_qty := v_alloc_qty + v_take;
                    v_needed_qty := v_needed_qty - v_take;
                END;
            END LOOP;

            -- Nếu có lượng hàng phân bổ được -> Chèn vào order_items của Đơn A
            IF v_alloc_qty > 0 THEN
                DECLARE
                    v_price_A NUMERIC(15, 2) := ROUND((v_alloc_qty * v_item.unit_price) - (v_item.discount * (v_alloc_qty / v_item.quantity)), 2);
                BEGIN
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, discount, total_price
                    ) VALUES (
                        v_order_A_id,
                        v_item.product_id,
                        v_alloc_qty,
                        v_item.unit_price,
                        ROUND(v_item.discount * (v_alloc_qty / v_item.quantity), 2),
                        v_price_A
                    );
                    v_total_amount_A := v_total_amount_A + v_price_A;
                END;
            END IF;

            -- Lượng hàng còn thiếu (v_needed_qty) -> Chèn vào order_items của Đơn B
            IF v_needed_qty > 0 THEN
                DECLARE
                    v_price_B NUMERIC(15, 2) := ROUND((v_needed_qty * v_item.unit_price) - (v_item.discount * (v_needed_qty / v_item.quantity)), 2);
                BEGIN
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, discount, total_price
                    ) VALUES (
                        v_order_B_id,
                        v_item.product_id,
                        v_needed_qty,
                        v_item.unit_price,
                        ROUND(v_item.discount * (v_needed_qty / v_item.quantity), 2),
                        v_price_B
                    );
                    v_total_amount_B := v_total_amount_B + v_price_B;
                END;
            END IF;
        END LOOP;

        -- 4.4. Chia tỷ lệ tiền cọc (pro-rata prepaid_amount)
        IF v_order.prepaid_amount > 0 AND (v_total_amount_A + v_total_amount_B) > 0 THEN
            v_deposit_A := ROUND(v_order.prepaid_amount * (v_total_amount_A / (v_total_amount_A + v_total_amount_B)), 2);
            v_deposit_B := v_order.prepaid_amount - v_deposit_A;
        ELSE
            v_deposit_A := 0;
            v_deposit_B := 0;
        END IF;

        -- Cập nhật tổng tiền và cọc cho Đơn A
        UPDATE orders
        SET total_amount = v_total_amount_A,
            prepaid_amount = v_deposit_A
        WHERE id = v_order_A_id;

        -- Cập nhật tổng tiền và cọc cho Đơn B
        UPDATE orders
        SET total_amount = v_total_amount_B,
            prepaid_amount = v_deposit_B
        WHERE id = v_order_B_id;

        -- Cập nhật đơn gốc thành 'partially_fulfilled'
        UPDATE orders
        SET status = 'partially_fulfilled'
        WHERE id = p_order_id;

        -- Ghi nhật ký kiểm toán tách đơn
        INSERT INTO audit_logs (user_id, action, table_name, new_data)
        VALUES (
            p_operator_id,
            'SPLIT_ORDER_FIFO_SHORTAGE',
            'orders',
            jsonb_build_object(
                'original_order_id', p_order_id,
                'order_A_id', v_order_A_id,
                'order_A_amount', v_total_amount_A,
                'order_A_deposit', v_deposit_A,
                'order_B_id', v_order_B_id,
                'order_B_amount', v_total_amount_B,
                'order_B_deposit', v_deposit_B
            )
        );

        v_result := jsonb_build_object(
            'success', true,
            'split_required', true,
            'original_order_id', p_order_id,
            'order_A', jsonb_build_object(
                'id', v_order_A_id,
                'code', v_order.order_code || '-A',
                'total_amount', v_total_amount_A,
                'prepaid_amount', v_deposit_A,
                'status', 'approved'
            ),
            'order_B', jsonb_build_object(
                'id', v_order_B_id,
                'code', v_order.order_code || '-B',
                'total_amount', v_total_amount_B,
                'prepaid_amount', v_deposit_B,
                'status', 'pending_approval'
            ),
            'message', 'Kho không đủ hàng. Đã dùng SELECT FOR UPDATE khóa kho, tách thành Đơn A (xuất ngay) và Đơn B (chờ hàng), chia đều cọc theo tỷ lệ trị giá.'
        );
    END IF;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Lỗi giao dịch trừ kho FIFO Khang An OS: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. TRIGGER TỰ ĐỘNG GHI NHẬT KÝ KIỂM TOÁN (AUDIT LOG TRIGGER)
-- Tự động ghi nhận dữ liệu cũ/mới vào audit_logs khi có thay đổi quan trọng
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_audit_log_capture()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        old_data,
        new_data,
        timestamp
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_capture();

CREATE TRIGGER audit_batches_changes
AFTER INSERT OR UPDATE OR DELETE ON inventory_batches
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_capture();

CREATE TRIGGER audit_financial_changes
AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_capture();

CREATE TRIGGER audit_period_locks_changes
AFTER INSERT OR UPDATE OR DELETE ON period_locks
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_capture();

-- ============================================================================
-- HOÀN TẤT SCHEMA CƠ SỞ DỮ LIỆU KHANG AN OS (CLEAN 100% - NO DUMMY DATA)
-- ============================================================================
