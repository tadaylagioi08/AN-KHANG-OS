// ============================================================================
// KHANG AN OS - ERP CORE TYPES (MATCHING 18 POSTGRESQL TABLES)
// ============================================================================

export enum UserRole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_CEO = 'ROLE_CEO',
  ROLE_SALES_MANAGER = 'ROLE_SALES_MANAGER',
  ROLE_SALES_REP = 'ROLE_SALES_REP',
  ROLE_STORE_MANAGER = 'ROLE_STORE_MANAGER',
  ROLE_WAREHOUSE_KEEPER = 'ROLE_WAREHOUSE_KEEPER',
  ROLE_CHIEF_ACCOUNTANT = 'ROLE_CHIEF_ACCOUNTANT',
  ROLE_ACCOUNTANT_WHOLESALE = 'ROLE_ACCOUNTANT_WHOLESALE',
  ROLE_ACCOUNTANT_RETAIL = 'ROLE_ACCOUNTANT_RETAIL',
  ROLE_LEGAL = 'ROLE_LEGAL',
  ROLE_MARKETING = 'ROLE_MARKETING',
  ROLE_EVENT = 'ROLE_EVENT',
  ROLE_DESIGNER = 'ROLE_DESIGNER',
}

export type WarehouseCode = 'KHO_SI' | 'KHO_LE';

export type OrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'pending_ceo_discount'
  | 'pending_ceo_debt'
  | 'approved'
  | 'partially_fulfilled'
  | 'completed'
  | 'cancelled';

export type POStatus =
  | 'draft'
  | 'pending_ceo'
  | 'approved'
  | 'completed'
  | 'cancelled';

export type MovementType =
  | 'IN_PO'
  | 'OUT_ORDER'
  | 'TRANSFER'
  | 'STOCKTAKE_ADJUST'
  | 'RETURN_IN';

export type MovementStatus =
  | 'draft'
  | 'pending'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: UserRole;
  warehouse_id?: string | null;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: string | null;
  session_version?: number;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: WarehouseCode;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  discount_ceiling: number; // Trần chiết khấu % do CEO quy định
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  category_id: string;
  base_price?: number; // Giá bán lẻ đề xuất
  created_at: string;
  updated_at: string;
}

export interface InventoryBatch {
  id: string;
  product_id: string;
  warehouse_id: string;
  batch_number: string;
  import_date: string;
  unit_cost: number; // Giá vốn nhập kho
  quantity_imported: number;
  quantity_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  debt_limit: number; // Hạn mức công nợ cho phép
  current_debt: number; // Dư nợ hiện tại
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  current_debt: number; // Công nợ Khang An phải trả
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  salesman_id: string;
  warehouse_id: string;
  total_amount: number;
  discount_percent: number;
  prepaid_amount: number;
  status: OrderStatus;
  parent_order_id?: string | null;
  note?: string;
  cogs_total?: number; // Giá vốn xuất kho thực tế (FIFO)
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  vat_percent: number;
  vat_amount: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_code: string;
  supplier_id: string;
  created_by: string;
  status: POStatus;
  total_amount: number;
  vat_total: number;
  note?: string;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface StockMovementItem {
  id: string;
  movement_id: string;
  product_id: string;
  batch_id?: string | null;
  quantity: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  movement_code: string;
  movement_type: MovementType;
  from_warehouse_id?: string | null;
  to_warehouse_id?: string | null;
  reference_order_id?: string | null;
  reference_po_id?: string | null;
  created_by: string;
  approved_by?: string | null;
  status: MovementStatus;
  note?: string;
  items?: StockMovementItem[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  table_name: string;
  old_data?: any;
  new_data?: any;
  timestamp: string;
}

export type RefundType = 'CASH_REFUND' | 'DEBT_OFFSET' | 'EXCHANGE';

export type ReturnOrderStatus = 'pending_check' | 'completed';

export interface ReturnOrderItem {
  id: string;
  return_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  condition: 'GOOD' | 'DEFECTIVE'; // Hàng tốt -> nhập lại kho; Hàng lỗi -> phế phẩm
  total_price: number;
}

export interface ReturnOrder {
  id: string;
  return_code: string;
  original_order_id: string;
  created_by: string;
  is_over_30_days: boolean;
  days_since_export: number;
  total_return_value: number;
  refund_type: RefundType;
  refund_cash_amount: number;
  debt_offset_amount: number;
  exchange_product_id?: string | null;
  exchange_quantity?: number | null;
  exchange_unit_price?: number | null;
  exchange_total_value?: number | null;
  exchange_diff_amount?: number | null; // > 0: khách phải trả thêm nợ; < 0: cấn trừ giảm nợ
  status: ReturnOrderStatus;
  items?: ReturnOrderItem[];
  note?: string;
  created_at: string;
  updated_at: string;
}

export type FinDocType = 'RECEIPT' | 'PAYMENT' | 'VAT_OUT' | 'VAT_IN';

export interface FinancialTransaction {
  id: string;
  doc_code: string;
  doc_type: FinDocType;
  customer_id?: string | null;
  supplier_id?: string | null;
  amount: number;
  invoice_number: string; // UNIQUE - Chống nhập trùng hóa đơn
  payment_method: string;
  note?: string;
  created_by: string;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionItem {
  userId: string;
  fullName: string;
  role: UserRole;
  completedSalesRevenue: number;
  commissionRate: number; // % hoa hồng
  commissionAmount: number;
}

export interface PeriodLock {
  id: string;
  month: number;
  year: number;
  is_locked: boolean;
  checks_passed: number; // Yêu cầu đạt 8/8 phép kiểm tra
  locked_by?: string | null;
  unlocked_reason?: string | null;
  unlocked_by?: string | null;
  commission_report?: CommissionItem[];
  created_at: string;
  updated_at: string;
}

export type CompanyVaultCategory = 'LABOR_CONTRACT' | 'REGULATION';

export interface CompanyVault {
  id: string;
  title: string;
  doc_category: CompanyVaultCategory;
  file_path: string;
  uploaded_by: string;
  file_size_kb?: number;
  encrypted_hash?: string;
  created_at: string;
  updated_at: string;
}

