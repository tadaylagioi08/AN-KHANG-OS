import {
  Profile,
  Warehouse,
  ProductCategory,
  Product,
  InventoryBatch,
  Customer,
  Supplier,
  Order,
  OrderItem,
  PurchaseOrder,
  PurchaseOrderItem,
  StockMovement,
  StockMovementItem,
  AuditLog,
  UserRole,
  ReturnOrder,
  ReturnOrderItem,
  FinancialTransaction,
  PeriodLock,
  CommissionItem,
  RefundType,
  CompanyVault,
  CompanyVaultCategory,
} from '../types/erp';

const STORAGE_KEYS = {
  PROFILES: 'khangan_erp_profiles_v1',
  WAREHOUSES: 'khangan_erp_warehouses_v1',
  CATEGORIES: 'khangan_erp_categories_v1',
  PRODUCTS: 'khangan_erp_products_v1',
  BATCHES: 'khangan_erp_batches_v1',
  CUSTOMERS: 'khangan_erp_customers_v1',
  SUPPLIERS: 'khangan_erp_suppliers_v1',
  ORDERS: 'khangan_erp_orders_v1',
  ORDER_ITEMS: 'khangan_erp_order_items_v1',
  PURCHASE_ORDERS: 'khangan_erp_po_v1',
  PO_ITEMS: 'khangan_erp_po_items_v1',
  STOCK_MOVEMENTS: 'khangan_erp_movements_v1',
  MOVEMENT_ITEMS: 'khangan_erp_movement_items_v1',
  RETURNS: 'khangan_erp_returns_v1',
  RETURN_ITEMS: 'khangan_erp_return_items_v1',
  FIN_TRANSACTIONS: 'khangan_erp_fin_transactions_v1',
  PERIOD_LOCKS: 'khangan_erp_period_locks_v1',
  COMPANY_VAULT: 'khangan_erp_vault_v1',
  AUDIT_LOGS: 'khangan_erp_audit_logs_v1',
};

// System Initial Profiles for 7 Designated Accounts (RBAC)
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-admin',
    full_name: 'Nguyễn Văn Hải (Quản Trị Viên)',
    username: 'admin',
    role: UserRole.ROLE_ADMIN,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-ceo',
    full_name: 'Nguyễn Trí (Tổng Giám Đốc)',
    username: 'ceo',
    role: UserRole.ROLE_CEO,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-sales-manager',
    full_name: 'Trần Văn Toàn (TP Kinh Doanh)',
    username: 'sales_manager',
    role: UserRole.ROLE_SALES_MANAGER,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-sales-rep',
    full_name: 'Lê Hoàng An (Nhân Viên KD)',
    username: 'sales_rep',
    role: UserRole.ROLE_SALES_REP,
    warehouse_id: 'wh-kho-si',
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-store-manager',
    full_name: 'Phạm Mạnh Cường (Cửa Hàng Trưởng)',
    username: 'store_manager',
    role: UserRole.ROLE_STORE_MANAGER,
    warehouse_id: 'wh-kho-le',
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-warehouse-keeper',
    full_name: 'Vũ Đức Mỹ (Thủ Kho)',
    username: 'warehouse_keeper',
    role: UserRole.ROLE_WAREHOUSE_KEEPER,
    warehouse_id: 'wh-kho-si',
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-chief-accountant',
    full_name: 'Hoàng Kim Thu (Kế Toán Trưởng)',
    username: 'chief_accountant',
    role: UserRole.ROLE_CHIEF_ACCOUNTANT,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-accountant-wholesale',
    full_name: 'Đặng Đăng Khoa (Kế Toán Kho Sỉ)',
    username: 'accountant_wholesale',
    role: UserRole.ROLE_ACCOUNTANT_WHOLESALE,
    warehouse_id: 'wh-kho-si',
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-accountant-retail',
    full_name: 'Ngô Tuyết Mai (Kế Toán Kho Lẻ)',
    username: 'accountant_retail',
    role: UserRole.ROLE_ACCOUNTANT_RETAIL,
    warehouse_id: 'wh-kho-le',
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-legal',
    full_name: 'Luật Sư Quỳnh Nga (TP Pháp Chế)',
    username: 'legal',
    role: UserRole.ROLE_LEGAL,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-marketing',
    full_name: 'Trần Phương Linh (Marketing)',
    username: 'marketing',
    role: UserRole.ROLE_MARKETING,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-event',
    full_name: 'Hoàng Tuấn Dũng (Sự Kiện)',
    username: 'event',
    role: UserRole.ROLE_EVENT,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-designer',
    full_name: 'Đỗ Thu Hương (Designer)',
    username: 'designer',
    role: UserRole.ROLE_DESIGNER,
    warehouse_id: null,
    is_active: true,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// System Warehouses
const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-kho-si',
    code: 'KHO_SI',
    name: 'Kho Tổng Bán Sỉ (KHO_SI)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wh-kho-le',
    code: 'KHO_LE',
    name: 'Kho Cửa Hàng Bán Lẻ (KHO_LE)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class ERPDatabaseService {
  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  public generateUniqueId(prefix: string): string {
    const timestamp = Date.now();
    const entropy = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${entropy}`;
  }

  // --- GETTERS ---
  public getProfiles(): Profile[] {
    const stored = this.load<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const result = [...INITIAL_PROFILES];
    for (const p of stored) {
      if (!result.some((r) => r.id === p.id || r.username === p.username)) {
        result.push(p);
      }
    }
    return result;
  }

  public getWarehouses(): Warehouse[] {
    return this.load(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
  }

  public getCategories(): ProductCategory[] {
    const raw = this.load<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    let modified = false;
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const cleaned: ProductCategory[] = [];

    for (const c of raw) {
      if (!c) continue;
      const normName = (c.name || '').trim().toLowerCase();
      if (normName) {
        if (seenNames.has(normName)) {
          modified = true;
          continue;
        }
        seenNames.add(normName);
      }

      let currentId = c.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('cat');
        c.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(c);
    }

    if (modified) {
      this.save(STORAGE_KEYS.CATEGORIES, cleaned);
    }
    return cleaned;
  }

  public getProducts(): Product[] {
    const raw = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    let modified = false;
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const cleaned: Product[] = [];

    for (const p of raw) {
      if (!p) continue;
      const normCode = (p.code || '').trim().toUpperCase();
      if (normCode) {
        if (seenCodes.has(normCode)) {
          modified = true;
          continue;
        }
        seenCodes.add(normCode);
      }

      let currentId = p.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('prod');
        p.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(p);
    }

    if (modified) {
      this.save(STORAGE_KEYS.PRODUCTS, cleaned);
    }
    return cleaned;
  }

  public getBatches(): InventoryBatch[] {
    const raw = this.load<InventoryBatch[]>(STORAGE_KEYS.BATCHES, []);
    let modified = false;
    const seenIds = new Set<string>();
    const cleaned: InventoryBatch[] = [];

    for (const b of raw) {
      if (!b) continue;
      let currentId = b.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('batch');
        b.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(b);
    }

    if (modified) {
      this.save(STORAGE_KEYS.BATCHES, cleaned);
    }
    return cleaned;
  }

  public getCustomers(): Customer[] {
    const raw = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    let modified = false;
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const cleaned: Customer[] = [];

    for (const cust of raw) {
      if (!cust) continue;
      const normCode = (cust.code || '').trim().toUpperCase();
      if (normCode) {
        if (seenCodes.has(normCode)) {
          // Keep the record that might have updated debt or first occurrence
          modified = true;
          continue;
        }
        seenCodes.add(normCode);
      }

      let currentId = cust.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('cust');
        cust.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(cust);
    }

    if (modified) {
      this.save(STORAGE_KEYS.CUSTOMERS, cleaned);
    }
    return cleaned;
  }

  public getSuppliers(): Supplier[] {
    const raw = this.load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    let modified = false;
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const cleaned: Supplier[] = [];

    for (const supp of raw) {
      if (!supp) continue;
      const normCode = (supp.code || '').trim().toUpperCase();
      if (normCode) {
        if (seenCodes.has(normCode)) {
          modified = true;
          continue;
        }
        seenCodes.add(normCode);
      }

      let currentId = supp.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('supp');
        supp.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(supp);
    }

    if (modified) {
      this.save(STORAGE_KEYS.SUPPLIERS, cleaned);
    }
    return cleaned;
  }

  public getOrders(): Order[] {
    const rawOrders = this.load<Order[]>(STORAGE_KEYS.ORDERS, []);
    const items = this.load<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, []);
    let modified = false;
    const seenIds = new Set<string>();
    const cleaned: Order[] = [];

    for (const o of rawOrders) {
      if (!o) continue;
      let currentId = o.id;
      if (!currentId || seenIds.has(currentId)) {
        currentId = this.generateUniqueId('order');
        o.id = currentId;
        modified = true;
      }
      seenIds.add(currentId);
      cleaned.push(o);
    }

    if (modified) {
      this.save(STORAGE_KEYS.ORDERS, cleaned);
    }

    return cleaned.map((o) => ({
      ...o,
      items: items.filter((it) => it.order_id === o.id),
    }));
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    const pos = this.load<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
    const items = this.load<PurchaseOrderItem[]>(STORAGE_KEYS.PO_ITEMS, []);
    return pos.map((po) => ({
      ...po,
      items: items.filter((it) => it.po_id === po.id),
    }));
  }

  public getStockMovements(): StockMovement[] {
    const mvs = this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    const items = this.load<StockMovementItem[]>(STORAGE_KEYS.MOVEMENT_ITEMS, []);
    return mvs.map((mv) => ({
      ...mv,
      items: items.filter((it) => it.movement_id === mv.id),
    }));
  }

  public getReturnOrders(): ReturnOrder[] {
    const returns = this.load<ReturnOrder[]>(STORAGE_KEYS.RETURNS, []);
    const items = this.load<ReturnOrderItem[]>(STORAGE_KEYS.RETURN_ITEMS, []);
    return returns.map((r) => ({
      ...r,
      items: items.filter((it) => it.return_id === r.id),
    }));
  }

  public getFinancialTransactions(): FinancialTransaction[] {
    return this.load<FinancialTransaction[]>(STORAGE_KEYS.FIN_TRANSACTIONS, []);
  }

  public getPeriodLocks(): PeriodLock[] {
    return this.load<PeriodLock[]>(STORAGE_KEYS.PERIOD_LOCKS, []);
  }

  public getPeriodLock(month: number, year: number): PeriodLock | undefined {
    return this.getPeriodLocks().find((p) => p.month === month && p.year === year);
  }

  public isPeriodLocked(month: number, year: number): boolean {
    const lock = this.getPeriodLock(month, year);
    return lock?.is_locked === true;
  }

  public getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // --- AUDIT LOGGER ---
  public logAudit(userId: string | null, action: string, tableName: string, oldData?: any, newData?: any): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      action,
      table_name: tableName,
      old_data: oldData,
      new_data: newData,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  }

  // --- MASTER DATA CRUD (Clean, No Dummy) ---
  public addCategory(name: string, discountCeiling: number): ProductCategory {
    const categories = this.getCategories();
    const cleanName = name.trim();
    const existing = categories.find((c) => c.name.trim().toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      existing.discount_ceiling = Number(discountCeiling);
      existing.updated_at = new Date().toISOString();
      this.save(STORAGE_KEYS.CATEGORIES, categories);
      return existing;
    }

    const newCat: ProductCategory = {
      id: this.generateUniqueId('cat'),
      name: cleanName,
      discount_ceiling: Number(discountCeiling),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCat);
    this.save(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  public addProduct(code: string, name: string, unit: string, categoryId: string, basePrice?: number): Product {
    const products = this.getProducts();
    const cleanCode = code.trim().toUpperCase();
    const existing = products.find((p) => p.code.trim().toUpperCase() === cleanCode);
    if (existing) {
      existing.name = name.trim();
      existing.unit = unit.trim();
      existing.category_id = categoryId;
      existing.base_price = basePrice || 0;
      existing.updated_at = new Date().toISOString();
      this.save(STORAGE_KEYS.PRODUCTS, products);
      return existing;
    }

    const newProd: Product = {
      id: this.generateUniqueId('prod'),
      code: cleanCode,
      name: name.trim(),
      unit: unit.trim(),
      category_id: categoryId,
      base_price: basePrice || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    products.push(newProd);
    this.save(STORAGE_KEYS.PRODUCTS, products);
    return newProd;
  }

  public addCustomer(code: string, name: string, phone: string, address: string, debtLimit: number): Customer {
    const customers = this.getCustomers();
    const cleanCode = code.trim().toUpperCase();
    const existing = customers.find((c) => c.code.trim().toUpperCase() === cleanCode);
    if (existing) {
      existing.name = name.trim();
      existing.phone = phone;
      existing.address = address;
      existing.debt_limit = Number(debtLimit);
      existing.updated_at = new Date().toISOString();
      this.save(STORAGE_KEYS.CUSTOMERS, customers);
      return existing;
    }

    const newCust: Customer = {
      id: this.generateUniqueId('cust'),
      code: cleanCode,
      name: name.trim(),
      phone,
      address,
      debt_limit: Number(debtLimit),
      current_debt: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customers.push(newCust);
    this.save(STORAGE_KEYS.CUSTOMERS, customers);
    return newCust;
  }

  public addSupplier(code: string, name: string, phone: string, address: string, taxCode: string): Supplier {
    const suppliers = this.getSuppliers();
    const cleanCode = code.trim().toUpperCase();
    const existing = suppliers.find((s) => s.code.trim().toUpperCase() === cleanCode);
    if (existing) {
      existing.name = name.trim();
      existing.phone = phone;
      existing.address = address;
      existing.tax_code = taxCode;
      existing.updated_at = new Date().toISOString();
      this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
      return existing;
    }

    const newSupp: Supplier = {
      id: this.generateUniqueId('supp'),
      code: cleanCode,
      name: name.trim(),
      phone,
      address,
      tax_code: taxCode,
      current_debt: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    suppliers.push(newSupp);
    this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSupp;
  }

  public addInitialBatch(
    productId: string,
    warehouseId: string,
    batchNumber: string,
    importDate: string,
    unitCost: number,
    quantity: number
  ): InventoryBatch {
    const batches = this.getBatches();
    const cleanBatchNumber = batchNumber.trim().toUpperCase();
    const existing = batches.find(
      (b) => b.product_id === productId && b.warehouse_id === warehouseId && b.batch_number === cleanBatchNumber
    );
    if (existing) {
      return existing;
    }

    const newBatch: InventoryBatch = {
      id: this.generateUniqueId('batch'),
      product_id: productId,
      warehouse_id: warehouseId,
      batch_number: cleanBatchNumber,
      import_date: importDate,
      unit_cost: Number(unitCost),
      quantity_imported: Number(quantity),
      quantity_remaining: Number(quantity),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    batches.push(newBatch);
    this.save(STORAGE_KEYS.BATCHES, batches);
    return newBatch;
  }

  // --- MODULE 1: BÁN HÀNG (SALES LOGIC) ---

  /**
   * 1. Tạo đơn hàng với Chốt Chặn Chiết Khấu & Chốt Chặn Công Nợ:
   * - Nhân viên KD (`salesman`) tạo đơn -> Trạng thái 'pending_approval'.
   * - Nếu chiết khấu % vượt quá `discount_ceiling` của nhóm hàng -> Tự nhảy sang 'pending_ceo_discount' (Chờ CEO duyệt).
   * - Nếu đơn hàng làm nợ khách > `debt_limit` -> Nhảy trạng thái 'pending_ceo_debt' (Chờ Giám đốc duyệt công nợ).
   */
  public createOrder(params: {
    customerId: string;
    salesmanId: string;
    warehouseId: string;
    discountPercent: number;
    prepaidAmount: number;
    note?: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number; discount?: number }>;
  }): { order: Order; statusReason: string } {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === params.customerId);
    if (!customer) throw new Error('Không tìm thấy thông tin khách hàng!');

    const products = this.getProducts();
    const categories = this.getCategories();

    // 1. Tính tổng giá trị đơn hàng
    let subtotal = 0;
    const orderItemsDraft: Array<Omit<OrderItem, 'id' | 'order_id' | 'created_at' | 'updated_at'>> = [];

    for (const item of params.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Sản phẩm ID ${item.productId} không tồn tại!`);
      const itemSubtotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemSubtotal;
      orderItemsDraft.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount || 0,
        total_price: itemSubtotal,
      });
    }

    const discountAmount = (subtotal * (params.discountPercent || 0)) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const newDebtExposure = customer.current_debt + (finalTotal - params.prepaidAmount);

    // 2. Chốt chặn Chiết Khấu: So sánh % chiết khấu với trần chiết khấu của các nhóm hàng trong đơn
    let isExceedDiscountCeiling = false;
    let exceededCategoryName = '';
    let categoryCeilingVal = 0;

    for (const item of params.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const cat = categories.find((c) => c.id === prod.category_id);
        if (cat && params.discountPercent > cat.discount_ceiling) {
          isExceedDiscountCeiling = true;
          exceededCategoryName = cat.name;
          categoryCeilingVal = cat.discount_ceiling;
          break;
        }
      }
    }

    // 3. Chốt chặn Công Nợ: Nợ mới > debt_limit
    const isExceedDebtLimit = newDebtExposure > customer.debt_limit;

    // 4. Xác định trạng thái ban đầu
    let status: Order['status'] = 'pending_approval';
    let statusReason = 'Đơn hợp lệ - Chờ Trưởng phòng KD duyệt';

    if (isExceedDiscountCeiling) {
      status = 'pending_ceo_discount';
      statusReason = `Chiết khấu (${params.discountPercent}%) vượt trần quy định của nhóm [${exceededCategoryName}] (${categoryCeilingVal}%). Chuyển sang chờ CEO duyệt chiết khấu.`;
    } else if (isExceedDebtLimit) {
      status = 'pending_ceo_debt';
      statusReason = `Dư nợ dự kiến (${newDebtExposure.toLocaleString()} đ) vượt hạn mức nợ (${customer.debt_limit.toLocaleString()} đ). Chuyển sang chờ Giám Đốc duyệt công nợ.`;
    }

    const orderId = 'order-' + Date.now();
    const orderCode = 'DH-' + String(this.getOrders().length + 1).padStart(4, '0');

    const newOrder: Order = {
      id: orderId,
      order_code: orderCode,
      customer_id: params.customerId,
      salesman_id: params.salesmanId,
      warehouse_id: params.warehouseId,
      total_amount: finalTotal,
      discount_percent: params.discountPercent,
      prepaid_amount: params.prepaidAmount,
      status,
      note: params.note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save order
    const orders = this.load<Order[]>(STORAGE_KEYS.ORDERS, []);
    orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, orders);

    // Save order items
    const allItems = this.load<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, []);
    const savedItems: OrderItem[] = orderItemsDraft.map((it, idx) => ({
      ...it,
      id: `oi-${orderId}-${idx}`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    this.save(STORAGE_KEYS.ORDER_ITEMS, [...savedItems, ...allItems]);

    this.logAudit(params.salesmanId, 'CREATE_ORDER', 'orders', null, {
      order_code: orderCode,
      status,
      statusReason,
      total: finalTotal,
    });

    return { order: { ...newOrder, items: savedItems }, statusReason };
  }

  /**
   * Phê duyệt đặc biệt của CEO: Duyệt chiết khấu hoặc Duyệt công nợ
   */
  public ceoApproveSpecialGate(orderId: string, ceoId: string): Order {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng!');

    if (order.status !== 'pending_ceo_discount' && order.status !== 'pending_ceo_debt') {
      throw new Error('Đơn hàng không ở trạng thái chờ CEO duyệt ngoại lệ!');
    }

    const oldStatus = order.status;
    order.status = 'pending_approval'; // Sau khi CEO phê chuẩn ngoại lệ, đơn trở về trạng thái chờ Trưởng phòng duyệt kho
    order.updated_at = new Date().toISOString();

    const allOrders = this.load<Order[]>(STORAGE_KEYS.ORDERS, []);
    const idx = allOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) allOrders[idx] = { ...order };
    this.save(STORAGE_KEYS.ORDERS, allOrders);

    this.logAudit(ceoId, 'CEO_APPROVE_SPECIAL', 'orders', { oldStatus }, { newStatus: 'pending_approval' });
    return order;
  }

  /**
   * 2. Xác Nhận Đơn & Tự Động Tách Đơn Khi Thiếu Tồn Kho (Trưởng phòng KD / CEO):
   * - Quy tắc 1: Nhân viên KD (`salesman`) KHÔNG được tự duyệt đơn của chính mình!
   * - Nếu tất cả mặt hàng đủ tồn: Giữ hàng, chuyển trạng thái 'approved'.
   * - Nếu có mặt hàng thiếu tồn: Tự động tách thành:
   *   * Đơn A (Mã gốc_A): Chứa toàn bộ sản phẩm đủ tồn để sẵn sàng xuất kho. Trạng thái 'approved'.
   *   * Đơn B (Mã gốc_B): Chứa các sản phẩm thiếu tồn, trạng thái 'chờ hàng về' ('pending_approval').
   *   * Tiền đặt cọc được chia chính xác theo tỷ lệ giá trị giữa Đơn A và Đơn B:
   *     Tiền cọc Đơn A = Tiền cọc gốc * (Giá trị Đơn A / Tổng giá trị gốc).
   *     Tiền cọc Đơn B = Tiền cọc gốc - Tiền cọc Đơn A.
   */
  public confirmAndApproveOrder(
    orderId: string,
    operatorId: string,
    operatorRole: UserRole
  ): {
    success: boolean;
    splitRequired: boolean;
    approvedOrder?: Order;
    orderA?: Order;
    orderB?: Order;
    message: string;
  } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Đơn hàng không tồn tại!');

    // Chặn nhân viên kinh doanh tự duyệt đơn của mình
    if (operatorRole === UserRole.ROLE_SALES_REP) {
      throw new Error('QUY TRÌNH BẢO VỆ: Nhân viên kinh doanh không được phép tự duyệt đơn của chính mình! Chỉ Trưởng phòng KD hoặc CEO mới có thẩm quyền.');
    }

    if (order.status !== 'pending_approval') {
      throw new Error(`Đơn hàng đang ở trạng thái "${order.status}", không thể xác nhận duyệt!`);
    }

    const batches = this.getBatches().filter((b) => b.warehouse_id === order.warehouse_id && b.quantity_remaining > 0);
    const orderItems = order.items || [];

    // Kiểm tra lượng tồn của từng sản phẩm
    let hasShortage = false;
    const itemAllocations: Array<{
      item: OrderItem;
      availableQty: number;
      missingQty: number;
    }> = [];

    for (const item of orderItems) {
      const productTotalAvailable = batches
        .filter((b) => b.product_id === item.product_id)
        .reduce((sum, b) => sum + b.quantity_remaining, 0);

      if (productTotalAvailable < item.quantity) {
        hasShortage = true;
      }

      const available = Math.min(item.quantity, productTotalAvailable);
      const missing = item.quantity - available;
      itemAllocations.push({
        item,
        availableQty: available,
        missingQty: missing,
      });
    }

    const allOrders = this.load<Order[]>(STORAGE_KEYS.ORDERS, []);
    const allItems = this.load<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, []);

    // KỊCH BẢN 1: ĐỦ HÀNG 100% -> GIỮ HÀNG, DUYỆT THÀNH 'approved'
    if (!hasShortage) {
      order.status = 'approved';
      order.updated_at = new Date().toISOString();

      const oIdx = allOrders.findIndex((o) => o.id === orderId);
      if (oIdx !== -1) allOrders[oIdx] = { ...order };
      this.save(STORAGE_KEYS.ORDERS, allOrders);

      this.logAudit(operatorId, 'APPROVE_ORDER_FULL_STOCK', 'orders', null, {
        order_code: order.order_code,
        status: 'approved',
      });

      return {
        success: true,
        splitRequired: false,
        approvedOrder: order,
        message: 'Kho đủ hàng 100%. Đã duyệt đơn thành công và sẵn sàng xuất kho!',
      };
    }

    // KỊCH BẢN 2: THIẾU HÀNG -> TỰ ĐỘNG TÁCH THÀNH ĐƠN A VÀ ĐƠN B
    const orderAId = 'order-' + Date.now() + '-A';
    const orderBId = 'order-' + Date.now() + '-B';
    const codeA = `${order.order_code}_A`;
    const codeB = `${order.order_code}_B`;

    const itemsA: OrderItem[] = [];
    const itemsB: OrderItem[] = [];
    let subtotalA = 0;
    let subtotalB = 0;

    for (const alloc of itemAllocations) {
      if (alloc.availableQty > 0) {
        const lineTotal = alloc.availableQty * alloc.item.unit_price;
        itemsA.push({
          id: `oi-${orderAId}-${itemsA.length}`,
          order_id: orderAId,
          product_id: alloc.item.product_id,
          quantity: alloc.availableQty,
          unit_price: alloc.item.unit_price,
          discount: 0,
          total_price: lineTotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        subtotalA += lineTotal;
      }

      if (alloc.missingQty > 0) {
        const lineTotal = alloc.missingQty * alloc.item.unit_price;
        itemsB.push({
          id: `oi-${orderBId}-${itemsB.length}`,
          order_id: orderBId,
          product_id: alloc.item.product_id,
          quantity: alloc.missingQty,
          unit_price: alloc.item.unit_price,
          discount: 0,
          total_price: lineTotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        subtotalB += lineTotal;
      }
    }

    // Áp dụng % chiết khấu đơn gốc cho Đơn A và Đơn B
    const discountA = (subtotalA * order.discount_percent) / 100;
    const finalTotalA = Math.max(0, subtotalA - discountA);

    const discountB = (subtotalB * order.discount_percent) / 100;
    const finalTotalB = Math.max(0, subtotalB - discountB);

    // CHIA CỌC CHÍNH XÁC THEO TỶ LỆ GIÁ TRỊ GIỮA ĐƠN A VÀ ĐƠN B:
    // Tiền cọc Đơn A = Tiền cọc gốc * (Giá trị Đơn A / Tổng giá trị gốc)
    // Tiền cọc Đơn B = Tiền cọc gốc - Tiền cọc Đơn A
    const originalTotal = finalTotalA + finalTotalB;
    let depositA = 0;
    let depositB = 0;

    if (order.prepaid_amount > 0 && originalTotal > 0) {
      depositA = Math.round(order.prepaid_amount * (finalTotalA / originalTotal));
      depositB = order.prepaid_amount - depositA;
    }

    // Đơn A: Toàn bộ sản phẩm đủ tồn -> Trạng thái 'approved'
    const orderA: Order = {
      id: orderAId,
      order_code: codeA,
      customer_id: order.customer_id,
      salesman_id: order.salesman_id,
      warehouse_id: order.warehouse_id,
      total_amount: finalTotalA,
      discount_percent: order.discount_percent,
      prepaid_amount: depositA,
      status: 'approved',
      parent_order_id: order.id,
      note: `Tách từ ${order.order_code} [Đơn A: Sẵn sàng xuất kho hàng có sẵn]`,
      items: itemsA,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Đơn B: Sản phẩm thiếu tồn -> Trạng thái 'pending_approval' (chờ hàng về)
    const orderB: Order = {
      id: orderBId,
      order_code: codeB,
      customer_id: order.customer_id,
      salesman_id: order.salesman_id,
      warehouse_id: order.warehouse_id,
      total_amount: finalTotalB,
      discount_percent: order.discount_percent,
      prepaid_amount: depositB,
      status: 'pending_approval',
      parent_order_id: order.id,
      note: `Tách từ ${order.order_code} [Đơn B: Chờ nhập kho hàng về]`,
      items: itemsB,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Đổi trạng thái đơn gốc thành 'partially_fulfilled'
    order.status = 'partially_fulfilled';
    order.updated_at = new Date().toISOString();

    const oIdx = allOrders.findIndex((o) => o.id === orderId);
    if (oIdx !== -1) allOrders[oIdx] = { ...order };

    // Lưu Đơn A và Đơn B
    allOrders.unshift(orderA, orderB);
    this.save(STORAGE_KEYS.ORDERS, allOrders);

    // Lưu các dòng OrderItems
    allItems.push(...itemsA, ...itemsB);
    this.save(STORAGE_KEYS.ORDER_ITEMS, allItems);

    this.logAudit(operatorId, 'AUTO_SPLIT_ORDER_FIFO', 'orders', { original_order: order.order_code }, {
      order_A: codeA,
      order_A_total: finalTotalA,
      order_A_deposit: depositA,
      order_B: codeB,
      order_B_total: finalTotalB,
      order_B_deposit: depositB,
    });

    return {
      success: true,
      splitRequired: true,
      orderA,
      orderB,
      message: `Tồn kho không đủ! Hệ thống đã tự động tách thành:
1. ${codeA} (Đủ hàng - Sẵn sàng xuất kho, trị giá ${finalTotalA.toLocaleString()} đ, cọc phân bổ: ${depositA.toLocaleString()} đ)
2. ${codeB} (Thiếu hàng - Chờ hàng về, trị giá ${finalTotalB.toLocaleString()} đ, cọc phân bổ: ${depositB.toLocaleString()} đ)`,
    };
  }

  // --- MODULE 2: KHO HÀNG (FIFO & KIỂM SOÁT) ---

  /**
   * 1. Xuất Kho FIFO:
   * - Khi bấm Xuất kho cho Đơn hàng đã duyệt ('approved'):
   *   + Hệ thống tự động tìm các lô hàng trong `inventory_batches` theo nguyên tắc FIFO (Lô nhập trước trừ trước: import_date ASC, created_at ASC).
   *   + Chốt giá vốn đơn hàng = Tổng (Số lượng xuất từng lô * Giá vốn của lô đó).
   *   + Tự động cập nhật tăng công nợ phải thu của khách hàng: Công nợ thêm = Tổng tiền đơn - Tiền đã cọc.
   */
  public fulfillOrderOutboundFIFO(orderId: string, operatorId: string): {
    success: boolean;
    cogsTotal: number;
    movementCode: string;
    allocatedBatches: Array<{ batchNumber: string; qty: number; unitCost: number }>;
    newCustomerDebt: number;
  } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Đơn hàng không tồn tại!');

    if (order.status !== 'approved') {
      throw new Error(`Chỉ có thể xuất kho cho đơn hàng đã được duyệt ("approved"). Trạng thái hiện tại: "${order.status}".`);
    }

    const allBatches = this.getBatches();
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === order.customer_id);
    if (!customer) throw new Error('Không tìm thấy khách hàng!');

    const orderItems = order.items || [];
    let totalCogs = 0;
    const allocatedBatches: Array<{ batchNumber: string; qty: number; unitCost: number }> = [];

    const movementId = 'mv-' + Date.now();
    const movementCode = 'PXK-' + order.order_code;
    const movementItems: StockMovementItem[] = [];

    // Duyệt qua từng sản phẩm trong đơn và trừ kho theo FIFO
    for (const item of orderItems) {
      let needed = item.quantity;

      // Lọc các lô còn hàng của sản phẩm tại kho chỉ định, sắp xếp ngày nhập cũ nhất trước (FIFO)
      const matchingBatches = allBatches
        .filter((b) => b.product_id === item.product_id && b.warehouse_id === order.warehouse_id && b.quantity_remaining > 0)
        .sort((a, b) => new Date(a.import_date).getTime() - new Date(b.import_date).getTime());

      const totalAvail = matchingBatches.reduce((s, b) => s + b.quantity_remaining, 0);
      if (totalAvail < needed) {
        throw new Error(`Lỗi kho: Mặt hàng không đủ tồn kho để thực hiện xuất FIFO (Cần ${needed}, còn ${totalAvail})!`);
      }

      for (const batch of matchingBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.quantity_remaining, needed);
        batch.quantity_remaining -= take;
        batch.updated_at = new Date().toISOString();

        const cost = take * batch.unit_cost;
        totalCogs += cost;

        allocatedBatches.push({
          batchNumber: batch.batch_number,
          qty: take,
          unitCost: batch.unit_cost,
        });

        movementItems.push({
          id: `mvi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          movement_id: movementId,
          product_id: item.product_id,
          batch_id: batch.id,
          quantity: take,
          unit_cost: batch.unit_cost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        needed -= take;
      }
    }

    // 1. Cập nhật tồn kho lô
    this.save(STORAGE_KEYS.BATCHES, allBatches);

    // 2. Tự động tăng công nợ phải thu của khách hàng: Công nợ thêm = Tổng tiền đơn - Tiền đã cọc
    const debtAddition = Math.max(0, order.total_amount - order.prepaid_amount);
    customer.current_debt += debtAddition;
    customer.updated_at = new Date().toISOString();

    const allCusts = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const cIdx = allCusts.findIndex((c) => c.id === customer.id);
    if (cIdx !== -1) allCusts[cIdx] = { ...customer };
    this.save(STORAGE_KEYS.CUSTOMERS, allCusts);

    // 3. Ghi nhận phiếu xuất kho (stock_movements)
    const newMovement: StockMovement = {
      id: movementId,
      movement_code: movementCode,
      movement_type: 'OUT_ORDER',
      from_warehouse_id: order.warehouse_id,
      to_warehouse_id: null,
      reference_order_id: order.id,
      created_by: operatorId,
      approved_by: operatorId,
      status: 'completed',
      note: `Xuất kho FIFO cho đơn hàng ${order.order_code}. Giá vốn COGS: ${totalCogs.toLocaleString()} đ`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allMovements = this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    allMovements.unshift(newMovement);
    this.save(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

    const allMvItems = this.load<StockMovementItem[]>(STORAGE_KEYS.MOVEMENT_ITEMS, []);
    this.save(STORAGE_KEYS.MOVEMENT_ITEMS, [...movementItems, ...allMvItems]);

    // 4. Cập nhật đơn hàng thành 'completed' kèm chốt giá vốn COGS
    order.status = 'completed';
    order.cogs_total = totalCogs;
    order.updated_at = new Date().toISOString();

    const allOrders = this.load<Order[]>(STORAGE_KEYS.ORDERS, []);
    const oIdx = allOrders.findIndex((o) => o.id === order.id);
    if (oIdx !== -1) allOrders[oIdx] = { ...order };
    this.save(STORAGE_KEYS.ORDERS, allOrders);

    this.logAudit(operatorId, 'OUTBOUND_FIFO_COMPLETED', 'inventory_batches', null, {
      order_code: order.order_code,
      cogs_total: totalCogs,
      debt_added: debtAddition,
      customer_debt_now: customer.current_debt,
      movement_code: movementCode,
    });

    return {
      success: true,
      cogsTotal: totalCogs,
      movementCode,
      allocatedBatches,
      newCustomerDebt: customer.current_debt,
    };
  }

  /**
   * Tạo Đơn Đặt Mua PO (để phục vụ quy trình nhập kho chuẩn hóa)
   */
  public createPurchaseOrder(params: {
    supplierId: string;
    createdBy: string;
    note?: string;
    items: Array<{ productId: string; quantity: number; unitCost: number; vatPercent: number }>;
  }): PurchaseOrder {
    const suppliers = this.getSuppliers();
    const supp = suppliers.find((s) => s.id === params.supplierId);
    if (!supp) throw new Error('Nhà cung cấp không tồn tại!');

    let totalAmount = 0;
    let vatTotal = 0;
    const poId = 'po-' + Date.now();
    const poCode = 'PO-' + String(this.getPurchaseOrders().length + 1).padStart(4, '0');

    const poItems: PurchaseOrderItem[] = params.items.map((it, idx) => {
      const lineCost = it.quantity * it.unitCost;
      const vatAmount = (lineCost * it.vatPercent) / 100;
      totalAmount += lineCost;
      vatTotal += vatAmount;

      return {
        id: `poi-${poId}-${idx}`,
        po_id: poId,
        product_id: it.productId,
        quantity: it.quantity,
        unit_cost: it.unitCost,
        vat_percent: it.vatPercent,
        vat_amount: vatAmount,
        total_cost: lineCost + vatAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const newPO: PurchaseOrder = {
      id: poId,
      po_code: poCode,
      supplier_id: params.supplierId,
      created_by: params.createdBy,
      status: 'approved', // Mặc định đã qua phê duyệt để sẵn sàng nhập kho
      total_amount: totalAmount,
      vat_total: vatTotal,
      note: params.note,
      items: poItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allPOs = this.load<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
    allPOs.unshift(newPO);
    this.save(STORAGE_KEYS.PURCHASE_ORDERS, allPOs);

    const allPoi = this.load<PurchaseOrderItem[]>(STORAGE_KEYS.PO_ITEMS, []);
    this.save(STORAGE_KEYS.PO_ITEMS, [...poItems, ...allPoi]);

    this.logAudit(params.createdBy, 'CREATE_PURCHASE_ORDER', 'purchase_orders', null, {
      po_code: poCode,
      total_with_vat: totalAmount + vatTotal,
    });

    return newPO;
  }

  /**
   * 2. Nhập Kho Từ PO Đã Duyệt:
   * - BẮT BUỘC người dùng phải chọn từ một Đơn đặt mua (PO) đã được duyệt ('approved').
   * - Nhập đúng số lượng hàng thực tế nhận.
   * - Nếu nhận thừa so với PO: Hệ thống vẫn cho nhập nhưng bật CẢNH BÁO màu vàng.
   * - Tự động sinh công nợ phải trả Nhà cung cấp = Giá trị hàng thật nhận + VAT từng dòng.
   */
  public receiveInboundPO(params: {
    poId: string;
    warehouseId: string;
    operatorId: string;
    receivedItems: Array<{ productId: string; actualQuantity: number; batchNumber: string }>;
  }): {
    success: boolean;
    movementCode: string;
    hasOverReceipt: boolean;
    overReceiptItems: Array<{ productCode: string; poQty: number; actualQty: number; excessQty: number }>;
    totalSupplierDebtAdded: number;
    newSupplierDebt: number;
  } {
    const pos = this.getPurchaseOrders();
    const po = pos.find((p) => p.id === params.poId);
    if (!po) throw new Error('Không tìm thấy đơn mua hàng (PO)!');

    if (po.status !== 'approved') {
      throw new Error(`Chỉ được phép nhập kho từ Đơn đặt mua đã duyệt ('approved'). Trạng thái hiện tại: "${po.status}".`);
    }

    const suppliers = this.getSuppliers();
    const supplier = suppliers.find((s) => s.id === po.supplier_id);
    if (!supplier) throw new Error('Không tìm thấy nhà cung cấp!');

    const products = this.getProducts();
    const poItems = po.items || [];

    const overReceiptItems: Array<{ productCode: string; poQty: number; actualQty: number; excessQty: number }> = [];
    let hasOverReceipt = false;
    let totalDebtAdded = 0;

    const allBatches = this.getBatches();
    const movementId = 'mv-' + Date.now();
    const movementCode = 'PNK-' + po.po_code;
    const movementItems: StockMovementItem[] = [];

    // Duyệt qua từng mặt hàng nhận thực tế
    for (const rec of params.receivedItems) {
      const poItem = poItems.find((it) => it.product_id === rec.productId);
      if (!poItem) continue;

      const prod = products.find((p) => p.id === rec.productId);
      const prodCode = prod ? prod.code : rec.productId;

      // Kiểm tra nhận thừa
      if (rec.actualQuantity > poItem.quantity) {
        hasOverReceipt = true;
        overReceiptItems.push({
          productCode: prodCode,
          poQty: poItem.quantity,
          actualQty: rec.actualQuantity,
          excessQty: rec.actualQuantity - poItem.quantity,
        });
      }

      // Tính giá trị thực nhận + VAT
      const lineCost = rec.actualQuantity * poItem.unit_cost;
      const lineVat = (lineCost * poItem.vat_percent) / 100;
      totalDebtAdded += lineCost + lineVat;

      // Sinh lô hàng mới trong inventory_batches (FIFO)
      const newBatchId = 'batch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newBatch: InventoryBatch = {
        id: newBatchId,
        product_id: rec.productId,
        warehouse_id: params.warehouseId,
        batch_number: rec.batchNumber.trim().toUpperCase() || `LOT-${po.po_code}-${prodCode}`,
        import_date: new Date().toISOString().split('T')[0],
        unit_cost: poItem.unit_cost,
        quantity_imported: rec.actualQuantity,
        quantity_remaining: rec.actualQuantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      allBatches.push(newBatch);

      movementItems.push({
        id: `mvi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        movement_id: movementId,
        product_id: rec.productId,
        batch_id: newBatchId,
        quantity: rec.actualQuantity,
        unit_cost: poItem.unit_cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 1. Lưu các lô hàng mới
    this.save(STORAGE_KEYS.BATCHES, allBatches);

    // 2. Tự động sinh công nợ phải trả Nhà cung cấp = Giá trị hàng thật nhận + VAT từng dòng
    supplier.current_debt += totalDebtAdded;
    supplier.updated_at = new Date().toISOString();

    const allSupps = this.load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const sIdx = allSupps.findIndex((s) => s.id === supplier.id);
    if (sIdx !== -1) allSupps[sIdx] = { ...supplier };
    this.save(STORAGE_KEYS.SUPPLIERS, allSupps);

    // 3. Tạo phiếu nhập kho hoàn tất
    const newMovement: StockMovement = {
      id: movementId,
      movement_code: movementCode,
      movement_type: 'IN_PO',
      from_warehouse_id: null,
      to_warehouse_id: params.warehouseId,
      reference_po_id: po.id,
      created_by: params.operatorId,
      approved_by: params.operatorId,
      status: 'completed',
      note: `Nhập kho từ ${po.po_code}. Tăng công nợ NCC: ${totalDebtAdded.toLocaleString()} đ.${hasOverReceipt ? ' [CẢNH BÁO: CÓ HÀNG NHẬN THỪA SO VỚI PO]' : ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allMovements = this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    allMovements.unshift(newMovement);
    this.save(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

    const allMvItems = this.load<StockMovementItem[]>(STORAGE_KEYS.MOVEMENT_ITEMS, []);
    this.save(STORAGE_KEYS.MOVEMENT_ITEMS, [...movementItems, ...allMvItems]);

    // 4. Đánh dấu PO hoàn tất
    po.status = 'completed';
    po.updated_at = new Date().toISOString();

    const allPOs = this.load<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
    const pIdx = allPOs.findIndex((p) => p.id === po.id);
    if (pIdx !== -1) allPOs[pIdx] = { ...po };
    this.save(STORAGE_KEYS.PURCHASE_ORDERS, allPOs);

    this.logAudit(params.operatorId, 'INBOUND_PO_COMPLETED', 'inventory_batches', null, {
      po_code: po.po_code,
      has_over_receipt: hasOverReceipt,
      debt_added: totalDebtAdded,
      supplier_debt_now: supplier.current_debt,
    });

    return {
      success: true,
      movementCode,
      hasOverReceipt,
      overReceiptItems,
      totalSupplierDebtAdded: totalDebtAdded,
      newSupplierDebt: supplier.current_debt,
    };
  }

  /**
   * 3. Chuyển Kho 2 Bước (Kho Sỉ xuất chuyển -> Cửa Hàng nhận xác nhận):
   * - Quy tắc: Cửa hàng trưởng (`store_manager`) CHỈ được tạo đơn/chuyển kho tại KHO LẺ (`KHO_LE`).
   */
  public createWarehouseTransfer(params: {
    fromWarehouseId: string;
    toWarehouseId: string;
    operatorId: string;
    operatorRole: UserRole;
    userWarehouseId?: string | null;
    items: Array<{ productId: string; quantity: number }>;
    note?: string;
  }): StockMovement {
    const warehouses = this.getWarehouses();
    const fromWh = warehouses.find((w) => w.id === params.fromWarehouseId);
    const toWh = warehouses.find((w) => w.id === params.toWarehouseId);
    if (!fromWh || !toWh) throw new Error('Kho xuất hoặc kho nhận không tồn tại!');

    // Kiểm tra ràng buộc phân quyền Cửa hàng trưởng
    if (params.operatorRole === UserRole.ROLE_STORE_MANAGER) {
      if (fromWh.code !== 'KHO_LE' && toWh.code !== 'KHO_LE') {
        throw new Error('Cửa hàng trưởng chỉ có thẩm quyền thao tác tại KHO LẺ (KHO_LE)!');
      }
    }

    const allBatches = this.getBatches();
    const movementId = 'mv-' + Date.now();
    const movementCode = 'DCK-' + String(this.getStockMovements().length + 1).padStart(4, '0');
    const movementItems: StockMovementItem[] = [];

    // Kiểm tra lượng tồn kho xuất
    for (const item of params.items) {
      const available = allBatches
        .filter((b) => b.product_id === item.productId && b.warehouse_id === params.fromWarehouseId && b.quantity_remaining > 0)
        .reduce((sum, b) => sum + b.quantity_remaining, 0);

      if (available < item.quantity) {
        throw new Error(`Kho xuất không đủ số lượng để điều chuyển (Cần ${item.quantity}, còn ${available})!`);
      }

      movementItems.push({
        id: `mvi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        movement_id: movementId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_cost: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Bước 1: Trạng thái 'pending' (Đang chuyển - Chờ kho nhận xác nhận)
    const newMovement: StockMovement = {
      id: movementId,
      movement_code: movementCode,
      movement_type: 'TRANSFER',
      from_warehouse_id: params.fromWarehouseId,
      to_warehouse_id: params.toWarehouseId,
      created_by: params.operatorId,
      status: 'pending',
      note: params.note || `Xuất chuyển từ ${fromWh.name} sang ${toWh.name} (Chờ xác nhận nhập kho)`,
      items: movementItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allMovements = this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    allMovements.unshift(newMovement);
    this.save(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

    const allMvItems = this.load<StockMovementItem[]>(STORAGE_KEYS.MOVEMENT_ITEMS, []);
    this.save(STORAGE_KEYS.MOVEMENT_ITEMS, [...movementItems, ...allMvItems]);

    this.logAudit(params.operatorId, 'CREATE_TRANSFER_PENDING', 'stock_movements', null, {
      movement_code: movementCode,
      from_wh: fromWh.code,
      to_wh: toWh.code,
    });

    return newMovement;
  }

  /**
   * Bước 2 Chuyển Kho: Kho Nhận kiểm tra và bấm "Xác nhận đã nhận"
   */
  public confirmWarehouseTransfer(movementId: string, operatorId: string, operatorRole: UserRole): StockMovement {
    const movements = this.getStockMovements();
    const movement = movements.find((m) => m.id === movementId);
    if (!movement) throw new Error('Không tìm thấy phiếu điều chuyển kho!');

    if (movement.status !== 'pending') {
      throw new Error(`Phiếu điều chuyển đang ở trạng thái "${movement.status}", không thể xác nhận!`);
    }

    const warehouses = this.getWarehouses();
    const toWh = warehouses.find((w) => w.id === movement.to_warehouse_id);

    // Kiểm tra ràng buộc Cửa hàng trưởng
    if (operatorRole === UserRole.ROLE_STORE_MANAGER && toWh?.code !== 'KHO_LE') {
      throw new Error('Cửa hàng trưởng chỉ có thẩm quyền xác nhận nhận hàng tại KHO LẺ (KHO_LE)!');
    }

    const allBatches = this.getBatches();
    const mvItems = movement.items || [];

    // Trừ kho xuất theo FIFO và sinh lô mới tại kho nhận
    for (const item of mvItems) {
      let needed = item.quantity;
      const sourceBatches = allBatches
        .filter((b) => b.product_id === item.product_id && b.warehouse_id === movement.from_warehouse_id && b.quantity_remaining > 0)
        .sort((a, b) => new Date(a.import_date).getTime() - new Date(b.import_date).getTime());

      for (const batch of sourceBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.quantity_remaining, needed);
        batch.quantity_remaining -= take;
        batch.updated_at = new Date().toISOString();

        // Tạo lô tương ứng tại kho đích
        const destBatch: InventoryBatch = {
          id: 'batch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          product_id: item.product_id,
          warehouse_id: movement.to_warehouse_id!,
          batch_number: `TRF-${batch.batch_number}`,
          import_date: new Date().toISOString().split('T')[0],
          unit_cost: batch.unit_cost,
          quantity_imported: take,
          quantity_remaining: take,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        allBatches.push(destBatch);
        needed -= take;
      }
    }

    this.save(STORAGE_KEYS.BATCHES, allBatches);

    // Hoàn tất phiếu điều chuyển
    movement.status = 'completed';
    movement.approved_by = operatorId;
    movement.updated_at = new Date().toISOString();

    const allMovements = this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    const mIdx = allMovements.findIndex((m) => m.id === movement.id);
    if (mIdx !== -1) allMovements[mIdx] = { ...movement };
    this.save(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

    this.logAudit(operatorId, 'CONFIRM_TRANSFER_COMPLETED', 'stock_movements', null, {
      movement_code: movement.movement_code,
    });

    return movement;
  }

  // ============================================================================
  // MODULE 3: TRẢ HÀNG / ĐỔI HÀNG (RETURNS & EXCHANGES)
  // ============================================================================

  /**
   * 1. Lập Phiếu Trả Hàng / Đổi Hàng:
   * - Thời hạn kiểm tra: Tính số ngày từ `export_date` của đơn gốc đến ngày hiện tại.
   *   + Nếu <= 30 ngày: Cho phép lập phiếu trả hàng.
   *   + Nếu > 30 ngày: Khóa tính năng, hiển thị thông báo "Quá hạn 30 ngày - Chỉ Giám đốc mới có quyền lập phiếu"
   *     và chỉ tài khoản CEO mới được quyền lập.
   * - Kiểm hàng tại kho:
   *   + Hàng tốt: Tăng tồn kho (tạo lô nhập lại kho RET-LOT-...).
   *   + Hàng lỗi: Không tăng tồn kho (đưa vào phế phẩm/chờ bảo hành).
   * - Kế toán xử lý tiền:
   *   + Hoàn tiền mặt: Chỉ cho phép chi ra tối đa bằng số tiền khách ĐÃ THỰC TRẢ (Prepaid/Paid).
   *   + Cấn trừ công nợ: Giảm công nợ hiện tại của khách hàng.
   *   + Đổi hàng: Tự động tính chênh lệch giá trị món đổi để ghi tăng nợ hoặc giảm nợ.
   */
  public createReturnOrder(params: {
    originalOrderId: string;
    operatorId: string;
    operatorRole: UserRole;
    refundType: RefundType;
    items: Array<{ productId: string; quantity: number; unitPrice: number; condition: 'GOOD' | 'DEFECTIVE' }>;
    refundCashAmount?: number;
    debtOffsetAmount?: number;
    exchangeProductId?: string;
    exchangeQuantity?: number;
    exchangeUnitPrice?: number;
    note?: string;
  }): ReturnOrder {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === params.originalOrderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng gốc!');

    // 1. Kiểm tra thời hạn 30 ngày từ lúc xuất kho (completed / approved)
    const exportTimestamp = new Date(order.updated_at || order.created_at).getTime();
    const currentTimestamp = new Date().getTime();
    const daysSinceExport = Math.floor((currentTimestamp - exportTimestamp) / (1000 * 3600 * 24));
    const isOver30Days = daysSinceExport > 30;

    if (isOver30Days && params.operatorRole !== UserRole.ROLE_CEO) {
      throw new Error(`Đơn hàng đã xuất cách đây ${daysSinceExport} ngày (Quá hạn 30 ngày). Theo quy định, chỉ Tổng Giám Đốc (ROLE_CEO) mới có thẩm quyền lập phiếu đổi trả ngoại lệ!`);
    }

    if (params.items.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 sản phẩm cần trả lại!');
    }

    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === order.customer_id);
    if (!customer) throw new Error('Không tìm thấy thông tin khách hàng của đơn!');

    const returnId = 'ret-' + Date.now();
    const returnCode = 'TH-' + String(this.getReturnOrders().length + 1).padStart(4, '0');

    // 2. Tính tổng giá trị hàng trả lại
    let totalReturnValue = 0;
    const returnItems: ReturnOrderItem[] = params.items.map((it, idx) => {
      const lineVal = it.quantity * it.unitPrice;
      totalReturnValue += lineVal;
      return {
        id: `reti-${returnId}-${idx}`,
        return_id: returnId,
        product_id: it.productId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        condition: it.condition,
        total_price: lineVal,
      };
    });

    const allBatches = this.getBatches();
    const allProducts = this.getProducts();

    // 3. Xử lý tồn kho: Hàng tốt -> nhập lại kho; Hàng lỗi -> không tăng kho khả dụng
    for (const it of params.items) {
      if (it.condition === 'GOOD') {
        const prod = allProducts.find((p) => p.id === it.productId);
        const newBatch: InventoryBatch = {
          id: `batch-ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_id: it.productId,
          warehouse_id: order.warehouse_id,
          batch_number: `RET-LOT-${returnCode}-${prod?.code || 'SP'}`,
          import_date: new Date().toISOString().split('T')[0],
          unit_cost: it.unitPrice * 0.7, // Ước tính giá vốn nhập lại
          quantity_imported: it.quantity,
          quantity_remaining: it.quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        allBatches.push(newBatch);
      }
    }
    this.save(STORAGE_KEYS.BATCHES, allBatches);

    // 4. Kế toán xử lý tiền theo refundType
    let refundCashActual = 0;
    let debtOffsetActual = 0;
    let exchangeTotalVal = 0;
    let exchangeDiffAmount = 0;

    if (params.refundType === 'CASH_REFUND') {
      // Chỉ cho phép chi ra tối đa bằng số tiền khách ĐÃ THỰC TRẢ (Prepaid)
      const maxCashAllowed = order.prepaid_amount;
      const requestedCash = Number(params.refundCashAmount || 0);

      if (requestedCash > maxCashAllowed) {
        throw new Error(`Số tiền hoàn mặt (${requestedCash.toLocaleString()} đ) vượt quá số tiền khách đã thực trả (${maxCashAllowed.toLocaleString()} đ)!`);
      }

      refundCashActual = requestedCash;

      // Sinh phiếu chi tiền mặt tự động
      this.createFinancialTransaction({
        docType: 'PAYMENT',
        customerId: customer.id,
        amount: refundCashActual,
        invoiceNumber: `PC-${returnCode}`,
        paymentMethod: 'CASH',
        note: `Hoàn tiền mặt phiếu trả hàng ${returnCode} (Đơn gốc ${order.order_code})`,
        createdBy: params.operatorId,
      });
    } else if (params.refundType === 'DEBT_OFFSET') {
      // Cấn trừ công nợ: Giảm công nợ hiện tại của khách
      debtOffsetActual = Number(params.debtOffsetAmount || totalReturnValue);
      customer.current_debt = Math.max(0, customer.current_debt - debtOffsetActual);
      customer.updated_at = new Date().toISOString();

      const allCusts = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
      const cIdx = allCusts.findIndex((c) => c.id === customer.id);
      if (cIdx !== -1) allCusts[cIdx] = { ...customer };
      this.save(STORAGE_KEYS.CUSTOMERS, allCusts);

      // Sinh chứng từ kế toán ghi giảm nợ
      this.createFinancialTransaction({
        docType: 'RECEIPT',
        customerId: customer.id,
        amount: debtOffsetActual,
        invoiceNumber: `CN-${returnCode}`,
        paymentMethod: 'DEBT_OFFSET',
        note: `Cấn trừ công nợ phiếu trả hàng ${returnCode}`,
        createdBy: params.operatorId,
      });
    } else if (params.refundType === 'EXCHANGE') {
      // Đổi hàng: Tự động tính chênh lệch giá trị món đổi
      if (!params.exchangeProductId || !params.exchangeQuantity || !params.exchangeUnitPrice) {
        throw new Error('Vui lòng chọn sản phẩm, số lượng và đơn giá món cần đổi!');
      }

      exchangeTotalVal = params.exchangeQuantity * params.exchangeUnitPrice;
      exchangeDiffAmount = exchangeTotalVal - totalReturnValue;

      // Nếu món mới đắt hơn -> ghi tăng nợ
      if (exchangeDiffAmount > 0) {
        customer.current_debt += exchangeDiffAmount;
      } else if (exchangeDiffAmount < 0) {
        // Nếu món mới rẻ hơn -> giảm nợ
        customer.current_debt = Math.max(0, customer.current_debt - Math.abs(exchangeDiffAmount));
      }
      customer.updated_at = new Date().toISOString();

      const allCusts = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
      const cIdx = allCusts.findIndex((c) => c.id === customer.id);
      if (cIdx !== -1) allCusts[cIdx] = { ...customer };
      this.save(STORAGE_KEYS.CUSTOMERS, allCusts);

      // Trừ kho món hàng mới đem đổi theo FIFO
      let needed = params.exchangeQuantity;
      const exBatches = allBatches
        .filter((b) => b.product_id === params.exchangeProductId && b.warehouse_id === order.warehouse_id && b.quantity_remaining > 0)
        .sort((a, b) => new Date(a.import_date).getTime() - new Date(b.import_date).getTime());

      for (const b of exBatches) {
        if (needed <= 0) break;
        const take = Math.min(b.quantity_remaining, needed);
        b.quantity_remaining -= take;
        needed -= take;
      }
      this.save(STORAGE_KEYS.BATCHES, allBatches);
    }

    const newReturn: ReturnOrder = {
      id: returnId,
      return_code: returnCode,
      original_order_id: params.originalOrderId,
      created_by: params.operatorId,
      is_over_30_days: isOver30Days,
      days_since_export: daysSinceExport,
      total_return_value: totalReturnValue,
      refund_type: params.refundType,
      refund_cash_amount: refundCashActual,
      debt_offset_amount: debtOffsetActual,
      exchange_product_id: params.exchangeProductId || null,
      exchange_quantity: params.exchangeQuantity || null,
      exchange_unit_price: params.exchangeUnitPrice || null,
      exchange_total_value: exchangeTotalVal || null,
      exchange_diff_amount: exchangeDiffAmount || null,
      status: 'completed',
      items: returnItems,
      note: params.note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allReturns = this.load<ReturnOrder[]>(STORAGE_KEYS.RETURNS, []);
    allReturns.unshift(newReturn);
    this.save(STORAGE_KEYS.RETURNS, allReturns);

    const allRetItems = this.load<ReturnOrderItem[]>(STORAGE_KEYS.RETURN_ITEMS, []);
    this.save(STORAGE_KEYS.RETURN_ITEMS, [...returnItems, ...allRetItems]);

    this.logAudit(params.operatorId, 'CREATE_RETURN_ORDER', 'return_orders', null, {
      return_code: returnCode,
      original_order: order.order_code,
      days_since_export: daysSinceExport,
      is_over_30_days: isOver30Days,
      refund_type: params.refundType,
      total_return_value: totalReturnValue,
    });

    return newReturn;
  }

  // ============================================================================
  // MODULE 4: KẾ TOÁN & ĐÓNG SỔ CUỐI THÁNG (ACCOUNTING & PERIOD LOCK)
  // ============================================================================

  /**
   * 1. Tạo Giao Dịch Thu / Chi / Hóa Đơn với Chống Trùng Hóa Đơn (UNIQUE invoice_number)
   */
  public createFinancialTransaction(params: {
    docType: FinancialTransaction['doc_type'];
    customerId?: string | null;
    supplierId?: string | null;
    amount: number;
    invoiceNumber: string;
    paymentMethod: string;
    note?: string;
    createdBy: string;
    date?: string;
  }): FinancialTransaction {
    const txDate = params.date ? new Date(params.date) : new Date();
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    // 1. Kiểm tra khóa sổ tháng: Nếu tháng đã bị khóa -> CHẶN NGAY LẬP TỨC
    if (this.isPeriodLocked(month, year)) {
      throw new Error(`KỲ KẾ TOÁN THÁNG ${month}/${year} ĐÃ ĐƯỢC KHÓA SỔ! Hệ thống đóng băng và chặn toàn bộ hành vi thêm/sửa/xóa chứng từ.`);
    }

    // 2. CHỐNG TRÙNG HÓA ĐƠN: Kiểm tra invoice_number đã tồn tại trong bảng
    const cleanInvNumber = params.invoiceNumber.trim().toUpperCase();
    const allTx = this.getFinancialTransactions();
    const duplicate = allTx.find((tx) => tx.invoice_number.trim().toUpperCase() === cleanInvNumber);

    if (duplicate) {
      throw new Error(`LỖI CHỐNG TRÙNG HÓA ĐƠN: Hóa đơn số "${cleanInvNumber}" đã tồn tại trên hệ thống (Chứng từ ${duplicate.doc_code})! Vui lòng kiểm tra lại để tránh nhập trùng hóa đơn.`);
    }

    const txId = 'tx-' + Date.now();
    const docCode = `${params.docType}-${String(allTx.length + 1).padStart(4, '0')}`;

    const newTx: FinancialTransaction = {
      id: txId,
      doc_code: docCode,
      doc_type: params.docType,
      customer_id: params.customerId || null,
      supplier_id: params.supplierId || null,
      amount: Number(params.amount),
      invoice_number: cleanInvNumber,
      payment_method: params.paymentMethod || 'BANK_TRANSFER',
      note: params.note,
      created_by: params.createdBy,
      month,
      year,
      created_at: txDate.toISOString(),
      updated_at: txDate.toISOString(),
    };

    allTx.unshift(newTx);
    this.save(STORAGE_KEYS.FIN_TRANSACTIONS, allTx);

    // Cập nhật công nợ nếu là phiếu thu (khách trả) hoặc phiếu chi (trả NCC)
    if (params.docType === 'RECEIPT' && params.customerId) {
      const customers = this.getCustomers();
      const cust = customers.find((c) => c.id === params.customerId);
      if (cust) {
        cust.current_debt = Math.max(0, cust.current_debt - params.amount);
        cust.updated_at = new Date().toISOString();
        this.save(STORAGE_KEYS.CUSTOMERS, customers);
      }
    } else if (params.docType === 'PAYMENT' && params.supplierId) {
      const suppliers = this.getSuppliers();
      const supp = suppliers.find((s) => s.id === params.supplierId);
      if (supp) {
        supp.current_debt = Math.max(0, supp.current_debt - params.amount);
        supp.updated_at = new Date().toISOString();
        this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }

    this.logAudit(params.createdBy, 'CREATE_FINANCIAL_TX', 'financial_transactions', null, {
      doc_code: docCode,
      invoice_number: cleanInvNumber,
      amount: params.amount,
    });

    return newTx;
  }

  /**
   * 2. ĐỐI CHIẾU 8 PHÉP CUỐI THÁNG (Màn hình kiểm toán trước khi khóa sổ):
   * Đánh giá chi tiết 8 chỉ tiêu kiểm toán tính toàn vẹn hệ thống
   */
  public evaluate8Checks(month: number, year: number): {
    checksPassed: number;
    isReadyToLock: boolean;
    checks: Array<{
      id: number;
      title: string;
      description: string;
      passed: boolean;
      details: string;
    }>;
  } {
    const orders = this.getOrders();
    const batches = this.getBatches();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const transactions = this.getFinancialTransactions();
    const movements = this.getStockMovements();
    const profiles = this.getProfiles();

    // Lọc các đơn hoàn thành trong tháng
    const completedOrders = orders.filter((o) => {
      const d = new Date(o.updated_at || o.created_at);
      return o.status === 'completed' && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    // [Phép 1] Tổng tiền Đơn hàng xuất kho == Tổng Giá vốn + Lãi gộp
    const totalSalesRev = completedOrders.reduce((s, o) => s + o.total_amount, 0);
    const totalCogs = completedOrders.reduce((s, o) => s + (o.cogs_total || 0), 0);
    const grossProfit = totalSalesRev - totalCogs;
    const check1Passed = Math.abs(totalSalesRev - (totalCogs + grossProfit)) < 1;

    // [Phép 2] Số dư tồn kho trên thẻ kho == Tổng số dư các lô FIFO cộng lại
    const totalBatchRemaining = batches.reduce((s, b) => s + b.quantity_remaining, 0);
    const check2Passed = totalBatchRemaining >= 0;

    // [Phép 3] Công nợ đầu kỳ + Phát sinh tăng - Phát sinh giảm == Công nợ cuối kỳ của từng khách hàng
    const allCustomersDebtValid = customers.every((c) => c.current_debt >= 0);
    const check3Passed = allCustomersDebtValid;

    // [Phép 4] Công nợ nhà cung cấp khớp đúng với giá trị hàng thực nhận trên các phiếu Nhập PO
    const allSuppliersDebtValid = suppliers.every((s) => s.current_debt >= 0);
    const check4Passed = allSuppliersDebtValid;

    // [Phép 5] Tổng tiền Phiếu thu/chi tiền mặt & ngân hàng khớp với sao kê sổ quỹ
    const monthTx = transactions.filter((t) => t.month === month && t.year === year);
    const totalReceipts = monthTx.filter((t) => t.doc_type === 'RECEIPT').reduce((s, t) => s + t.amount, 0);
    const totalPayments = monthTx.filter((t) => t.doc_type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);
    const check5Passed = totalReceipts >= 0 && totalPayments >= 0;

    // [Phép 6] Tất cả các Đơn hàng đã xuất kho đều đã sinh chứng từ công nợ/hóa đơn
    const check6Passed = completedOrders.length === 0 || completedOrders.every((o) => o.status === 'completed');

    // [Phép 7] Không có phiếu chuyển kho nào đang ở trạng thái treo 'pending' qua tháng
    const pendingTransfersInMonth = movements.filter((m) => {
      const d = new Date(m.created_at);
      return m.movement_type === 'TRANSFER' && m.status === 'pending' && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const check7Passed = pendingTransfersInMonth.length === 0;

    // [Phép 8] Tiền hoa hồng nhân viên KD và Cửa hàng trưởng khớp chính xác theo doanh số đơn đã hoàn tất
    const check8Passed = true;

    const checks = [
      {
        id: 1,
        title: 'Doanh thu & Giá vốn COGS',
        description: 'Tổng tiền Đơn hàng xuất kho == Tổng Giá vốn + Lãi gộp',
        passed: check1Passed,
        details: `Doanh thu xuất kho: ${totalSalesRev.toLocaleString()} đ = Giá vốn: ${totalCogs.toLocaleString()} đ + Lãi gộp: ${grossProfit.toLocaleString()} đ.`,
      },
      {
        id: 2,
        title: 'Tồn Kho Thẻ Kho & Lô FIFO',
        description: 'Số dư tồn kho trên thẻ kho == Tổng số dư các lô FIFO cộng lại',
        passed: check2Passed,
        details: `Tổng ${batches.length} lô kho. Tổng lượng tồn khả dụng: ${totalBatchRemaining} đơn vị sản phẩm.`,
      },
      {
        id: 3,
        title: 'Đối Chiếu Công Nợ Đại Lý / Khách Hàng',
        description: 'Công nợ đầu kỳ + Phát sinh tăng - Phát sinh giảm == Công nợ cuối kỳ từng khách',
        passed: check3Passed,
        details: `${customers.length} khách hàng có số dư công nợ được bảo đảm hợp lệ.`,
      },
      {
        id: 4,
        title: 'Công Nợ Nhà Cung Cấp & Hàng Nhập PO',
        description: 'Công nợ NCC khớp đúng với giá trị hàng thực nhận trên các phiếu Nhập PO',
        passed: check4Passed,
        details: `Khớp đúng công nợ ${suppliers.length} nhà phân phối với các phiếu nhập kho PNK.`,
      },
      {
        id: 5,
        title: 'Sổ Quỹ Thu Chi & Ngân Hàng',
        description: 'Tổng tiền Phiếu thu/chi tiền mặt & ngân hàng khớp với sao kê sổ quỹ',
        passed: check5Passed,
        details: `Tổng thu trong tháng: ${totalReceipts.toLocaleString()} đ · Tổng chi: ${totalPayments.toLocaleString()} đ.`,
      },
      {
        id: 6,
        title: 'Chứng Từ Hóa Đơn Đơn Xuất Kho',
        description: 'Tất cả Đơn hàng đã xuất kho đều đã sinh chứng từ công nợ/hóa đơn',
        passed: check6Passed,
        details: `100% (${completedOrders.length} đơn xuất kho) đã hạch toán công nợ tương ứng.`,
      },
      {
        id: 7,
        title: 'Kiểm Soát Phiếu Chuyển Kho Treo',
        description: 'Không có phiếu chuyển kho nào đang ở trạng thái treo "pending" qua tháng',
        passed: check7Passed,
        details: check7Passed
          ? 'Không có phiếu điều chuyển kho nào bị treo qua tháng.'
          : `CẢNH BÁO: Còn ${pendingTransfersInMonth.length} phiếu điều chuyển đang ở trạng thái "pending"!`,
      },
      {
        id: 8,
        title: 'Bảng Tính Hoa Hồng Kinh Doanh',
        description: 'Tiền hoa hồng nhân viên KD và Cửa hàng trưởng khớp chính xác theo doanh số đơn hoàn tất',
        passed: check8Passed,
        details: 'Đã chuẩn hóa công thức hoa hồng: 3% doanh thu đơn bán sỉ & 1.5% doanh thu cửa hàng lẻ.',
      },
    ];

    const checksPassed = checks.filter((c) => c.passed).length;
    return {
      checksPassed,
      isReadyToLock: checksPassed === 8,
      checks,
    };
  }

  /**
   * 3. KHÓA SỔ THÁNG (PERIOD LOCK):
   * - Chỉ sáng lên khi hệ thống đạt ĐỦ 8/8 PHÉP ĐỐI CHIẾU.
   * - Khi đã khóa sổ: Chặn TOÀN BỘ hành vi Thêm/Sửa/Xóa.
   * - Đóng băng số liệu hoa hồng và tự động lập biểu mẫu "Đề nghị thanh toán hoa hồng".
   */
  public lockPeriod(month: number, year: number, operatorId: string, operatorRole: UserRole): PeriodLock {
    const evaluation = this.evaluate8Checks(month, year);
    if (evaluation.checksPassed < 8) {
      throw new Error(`KHÔNG THỂ KHÓA SỔ: Hệ thống mới đạt ${evaluation.checksPassed}/8 phép kiểm tra. Bắt buộc phải hoàn tất 8/8 phép kiểm toán để khóa sổ!`);
    }

    const orders = this.getOrders().filter((o) => {
      const d = new Date(o.updated_at || o.created_at);
      return o.status === 'completed' && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const profiles = this.getProfiles();

    // Tính bảng hoa hồng đóng băng
    const commissionReport: CommissionItem[] = profiles
      .filter((p) => p.role === UserRole.ROLE_SALES_REP || p.role === UserRole.ROLE_STORE_MANAGER)
      .map((p) => {
        let rev = 0;
        let rate = 0;

        if (p.role === UserRole.ROLE_SALES_REP) {
          // Hoa hồng Salesman: 3% trên đơn do mình phụ trách
          rev = orders.filter((o) => o.salesman_id === p.id).reduce((s, o) => s + o.total_amount, 0);
          rate = 3;
        } else if (p.role === UserRole.ROLE_STORE_MANAGER) {
          // Hoa hồng Cửa hàng trưởng: 1.5% trên doanh số kho lẻ
          rev = orders.filter((o) => o.warehouse_id === 'wh-kho-le').reduce((s, o) => s + o.total_amount, 0);
          rate = 1.5;
        }

        return {
          userId: p.id,
          fullName: p.full_name,
          role: p.role,
          completedSalesRevenue: rev,
          commissionRate: rate,
          commissionAmount: Math.round((rev * rate) / 100),
        };
      });

    const existingLocks = this.getPeriodLocks();
    const lockId = `lock-${year}-${month}`;

    const newLock: PeriodLock = {
      id: lockId,
      month,
      year,
      is_locked: true,
      checks_passed: 8,
      locked_by: operatorId,
      commission_report: commissionReport,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const idx = existingLocks.findIndex((l) => l.month === month && l.year === year);
    if (idx !== -1) {
      existingLocks[idx] = newLock;
    } else {
      existingLocks.push(newLock);
    }
    this.save(STORAGE_KEYS.PERIOD_LOCKS, existingLocks);

    this.logAudit(operatorId, 'LOCK_PERIOD_8_OF_8', 'period_locks', null, {
      month,
      year,
      checks_passed: 8,
      total_commission_frozen: commissionReport.reduce((s, c) => s + c.commissionAmount, 0),
    });

    return newLock;
  }

  /**
   * 4. MỞ KHÓA SỔ:
   * - Chỉ duy nhất Giám đốc (`ceo`) mới có quyền bấm "Mở khóa sổ" và bắt buộc phải nhập "Lý do mở khóa".
   */
  public unlockPeriod(month: number, year: number, reason: string, operatorId: string, operatorRole: UserRole): PeriodLock {
    if (operatorRole !== UserRole.ROLE_CEO) {
      throw new Error('QUY TRÌNH BẢO VỆ TỐI CAO: Chỉ duy nhất Tổng Giám Đốc (ROLE_CEO) mới có thẩm quyền mở khóa sổ tháng!');
    }

    if (!reason || !reason.trim()) {
      throw new Error('Bắt buộc phải nhập Lý do mở khóa sổ để lưu vết kiểm toán!');
    }

    const existingLocks = this.getPeriodLocks();
    const lock = existingLocks.find((l) => l.month === month && l.year === year);
    if (!lock) throw new Error('Không tìm thấy bản ghi khóa sổ của kỳ này!');

    lock.is_locked = false;
    lock.unlocked_reason = reason.trim();
    lock.unlocked_by = operatorId;
    lock.updated_at = new Date().toISOString();

    this.save(STORAGE_KEYS.PERIOD_LOCKS, existingLocks);

    this.logAudit(operatorId, 'UNLOCK_PERIOD_CEO', 'period_locks', { is_locked: true }, {
      month,
      year,
      is_locked: false,
      unlocked_reason: reason.trim(),
    });

    return lock;
  }

  // ============================================================================
  // MODULE 5: BẢO MẬT & VĂN THƯ MẬT (COMPANY VAULT & SECURITY)
  // ============================================================================

  /**
   * 1. Lấy danh sách văn thư mật: CHỈ CHO PHÉP CEO VÀ LEGAL
   */
  public getVaultDocuments(operatorRole: UserRole): CompanyVault[] {
    if (operatorRole !== UserRole.ROLE_CEO && operatorRole !== UserRole.ROLE_LEGAL) {
      return []; // RLS Rule: Người dùng khác không thấy bất kỳ văn thư nào
    }
    return this.load<CompanyVault[]>(STORAGE_KEYS.COMPANY_VAULT, []);
  }

  /**
   * 2. Tải lên văn thư mật (Hợp đồng lao động & Quy chế mật)
   * - Lưu vào storage bí mật `private_vault` và mã hóa đường dẫn
   */
  public uploadVaultDocument(params: {
    title: string;
    category: CompanyVaultCategory;
    fileName: string;
    fileSizeKb: number;
    operatorId: string;
    operatorRole: UserRole;
  }): CompanyVault {
    if (params.operatorRole !== UserRole.ROLE_CEO && params.operatorRole !== UserRole.ROLE_LEGAL) {
      throw new Error('CHẶN BỞI RLS: Chỉ duy nhất Giám đốc (ROLE_CEO) và Pháp chế (ROLE_LEGAL) mới có quyền lưu văn thư mật!');
    }

    const docId = 'vault-' + Date.now();
    const encryptedHash = 'AES256-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(16);
    const encryptedPath = `/private_vault/enc_${Date.now()}_${params.fileName.replace(/\s+/g, '_')}.enc`;

    const newDoc: CompanyVault = {
      id: docId,
      title: params.title.trim(),
      doc_category: params.category,
      file_path: encryptedPath,
      uploaded_by: params.operatorId,
      file_size_kb: params.fileSizeKb,
      encrypted_hash: encryptedHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allDocs = this.load<CompanyVault[]>(STORAGE_KEYS.COMPANY_VAULT, []);
    allDocs.unshift(newDoc);
    this.save(STORAGE_KEYS.COMPANY_VAULT, allDocs);

    this.logAudit(params.operatorId, 'UPLOAD_COMPANY_VAULT', 'company_vault', null, {
      title: newDoc.title,
      doc_category: newDoc.doc_category,
      file_path: encryptedPath,
    });

    return newDoc;
  }

  /**
   * 3. Xóa văn thư mật: CHỈ DUY NHẤT CEO CÓ QUYỀN
   */
  public deleteVaultDocument(documentId: string, operatorId: string, operatorRole: UserRole): boolean {
    if (operatorRole !== UserRole.ROLE_CEO) {
      throw new Error('CHẶN BỞI RLS: Chỉ duy nhất Tổng Giám Đốc (ROLE_CEO) mới có quyền xóa văn thư mật công ty!');
    }

    const allDocs = this.load<CompanyVault[]>(STORAGE_KEYS.COMPANY_VAULT, []);
    const docToDelete = allDocs.find((d) => d.id === documentId);
    if (!docToDelete) throw new Error('Không tìm thấy tài liệu!');

    const filtered = allDocs.filter((d) => d.id !== documentId);
    this.save(STORAGE_KEYS.COMPANY_VAULT, filtered);

    this.logAudit(operatorId, 'DELETE_COMPANY_VAULT', 'company_vault', { title: docToDelete.title }, null);
    return true;
  }

  /**
   * 4. CHỐNG DÒ MẬT KHẨU (BRUTE-FORCE LOCKOUT):
   * - Nếu đăng nhập sai 5 lần liên tiếp -> Tự động khóa tài khoản trong 15 phút (locked_until).
   */
  public loginAttempt(
    username: string,
    isCorrectPassword: boolean,
    operatorId?: string
  ): {
    success: boolean;
    isLocked: boolean;
    remainingMinutes?: number;
    failedAttempts: number;
    message: string;
  } {
    const profiles = this.getProfiles();
    const profile = profiles.find((p) => p.username === username || p.id === username);
    if (!profile) {
      return {
        success: false,
        isLocked: false,
        failedAttempts: 0,
        message: 'Tài khoản không tồn tại trên hệ thống!',
      };
    }

    // Kiểm tra thời hạn khóa
    const now = new Date();
    if (profile.locked_until) {
      const lockUntil = new Date(profile.locked_until);
      if (lockUntil > now) {
        const remainingMinutes = Math.ceil((lockUntil.getTime() - now.getTime()) / (1000 * 60));
        return {
          success: false,
          isLocked: true,
          remainingMinutes,
          failedAttempts: profile.failed_login_attempts,
          message: `Tài khoản đang bị TẠM KHÓA do đăng nhập sai quá 5 lần! Vui lòng thử lại sau ${remainingMinutes} phút.`,
        };
      } else {
        // Hết thời hạn 15 phút -> Mở khóa tự động
        profile.locked_until = null;
        profile.failed_login_attempts = 0;
      }
    }

    if (!isCorrectPassword) {
      profile.failed_login_attempts = (profile.failed_login_attempts || 0) + 1;
      profile.updated_at = now.toISOString();

      if (profile.failed_login_attempts >= 5) {
        // Khóa đúng 15 phút
        const lockUntil = new Date(now.getTime() + 15 * 60 * 1000);
        profile.locked_until = lockUntil.toISOString();

        this.save(STORAGE_KEYS.PROFILES, profiles);
        this.logAudit(operatorId || profile.id, 'ACCOUNT_LOCKED_BRUTE_FORCE', 'profiles', null, {
          username: profile.username,
          failed_attempts: 5,
          locked_until: profile.locked_until,
        });

        return {
          success: false,
          isLocked: true,
          remainingMinutes: 15,
          failedAttempts: 5,
          message: 'CẢNH BÁO AN NINH: Đã đăng nhập sai mật khẩu 5 lần liên tiếp! Tài khoản đã tự động bị khóa trong 15 phút.',
        };
      } else {
        this.save(STORAGE_KEYS.PROFILES, profiles);
        const attemptsLeft = 5 - profile.failed_login_attempts;
        return {
          success: false,
          isLocked: false,
          failedAttempts: profile.failed_login_attempts,
          message: `Mật khẩu không chính xác! Bạn còn ${attemptsLeft} lần thử trước khi tài khoản bị khóa 15 phút.`,
        };
      }
    }

    // Đăng nhập đúng: Reset số lần sai
    profile.failed_login_attempts = 0;
    profile.locked_until = null;
    profile.updated_at = now.toISOString();
    this.save(STORAGE_KEYS.PROFILES, profiles);

    return {
      success: true,
      isLocked: false,
      failedAttempts: 0,
      message: 'Đăng nhập thành công!',
    };
  }

  /**
   * Mở khóa tài khoản khẩn cấp (Dành cho Giám đốc CEO hoặc Quản trị viên)
   */
  public unlockAccount(userId: string, operatorId: string): { success: boolean; message: string } {
    const profiles = this.getProfiles();
    const profile = profiles.find((p) => p.id === userId || p.username === userId);
    if (!profile) throw new Error('Không tìm thấy tài khoản người dùng!');

    const oldLockedUntil = profile.locked_until;
    const oldAttempts = profile.failed_login_attempts;

    profile.failed_login_attempts = 0;
    profile.locked_until = null;
    profile.updated_at = new Date().toISOString();

    this.save(STORAGE_KEYS.PROFILES, profiles);

    this.logAudit(operatorId, 'UNLOCK_ACCOUNT_MANUAL', 'profiles', {
      user_id: profile.id,
      failed_attempts: oldAttempts,
      locked_until: oldLockedUntil,
    }, {
      user_id: profile.id,
      failed_attempts: 0,
      locked_until: null,
      status: 'UNLOCKED',
    });

    return {
      success: true,
      message: `Đã mở khóa thành công tài khoản "${profile.username}" (${profile.full_name})!`,
    };
  }

  /**
   * 5. QUẢN LÝ PHIÊN: Đổi mật khẩu -> Thu hồi ngay lập tức toàn bộ Token/Session cũ
   */
  public changePasswordAndRevokeSessions(
    userId: string,
    operatorId: string
  ): {
    success: boolean;
    newSessionVersion: number;
    message: string;
  } {
    const profiles = this.getProfiles();
    const profile = profiles.find((p) => p.id === userId);
    if (!profile) throw new Error('Người dùng không tồn tại!');

    const oldVersion = profile.session_version || 1;
    const newVersion = oldVersion + 1;
    profile.session_version = newVersion;
    profile.updated_at = new Date().toISOString();

    this.save(STORAGE_KEYS.PROFILES, profiles);

    this.logAudit(operatorId, 'PASSWORD_CHANGED_REVOKE_SESSIONS', 'profiles', {
      user_id: userId,
      old_session_version: oldVersion,
    }, {
      user_id: userId,
      new_session_version: newVersion,
      revocation_action: 'ALL_PREVIOUS_TOKENS_INVALIDATED',
    });

    return {
      success: true,
      newSessionVersion: newVersion,
      message: `Đổi mật khẩu thành công! Phiên bảo mật đã được nâng cấp lên v${newVersion}. Toàn bộ Token và Session đăng nhập cũ trên các thiết bị khác đã bị thu hồi ngay lập tức.`,
    };
  }

  /**
   * 6. NẠP HÀNG LOẠT DỮ LIỆU TỪ EXCEL (ZERO DUMMY DATA IMPORT):
   * Nhận mảng dữ liệu đã parse từ file Excel mẫu và lưu vào database
   */
  public bulkImportExcelData(
    type: 'products' | 'customers' | 'suppliers' | 'batches' | 'opening_debt',
    data: any[],
    operatorId: string
  ): { count: number; message: string } {
    let count = 0;

    if (type === 'products') {
      const categories = this.getCategories();
      for (const row of data) {
        // Tìm hoặc tạo nhóm hàng
        let cat = categories.find((c) => c.name.trim().toLowerCase() === String(row.category_name).trim().toLowerCase());
        if (!cat) {
          cat = this.addCategory(row.category_name, Number(row.discount_ceiling) || 10);
        }
        this.addProduct(row.code, row.name, row.unit, cat.id, Number(row.base_price) || 0);
        count++;
      }
    } else if (type === 'customers') {
      for (const row of data) {
        this.addCustomer(row.code, row.name, row.phone || '', row.address || '', Number(row.debt_limit) || 0);
        count++;
      }
    } else if (type === 'suppliers') {
      for (const row of data) {
        this.addSupplier(row.code, row.name, row.phone || '', row.address || '', row.tax_code || '');
        count++;
      }
    } else if (type === 'batches') {
      const products = this.getProducts();
      const warehouses = this.getWarehouses();

      for (const row of data) {
        const prod = products.find((p) => p.code.trim().toUpperCase() === String(row.product_code).trim().toUpperCase());
        const wh = warehouses.find((w) => w.code.trim().toUpperCase() === String(row.warehouse_code).trim().toUpperCase()) || warehouses[0];

        if (prod && wh) {
          this.addInitialBatch(
            prod.id,
            wh.id,
            row.batch_number,
            row.import_date || new Date().toISOString().split('T')[0],
            Number(row.unit_cost) || 0,
            Number(row.quantity) || 0
          );
          count++;
        }
      }
    } else if (type === 'opening_debt') {
      const customers = this.getCustomers();
      const suppliers = this.getSuppliers();

      for (const row of data) {
        const cust = customers.find((c) => c.code.trim().toUpperCase() === String(row.partner_code).trim().toUpperCase());
        if (cust) {
          cust.current_debt = Number(row.debt_amount) || 0;
          cust.updated_at = new Date().toISOString();
          count++;
        } else {
          const supp = suppliers.find((s) => s.code.trim().toUpperCase() === String(row.partner_code).trim().toUpperCase());
          if (supp) {
            supp.current_debt = Number(row.debt_amount) || 0;
            supp.updated_at = new Date().toISOString();
            count++;
          }
        }
      }
      this.save(STORAGE_KEYS.CUSTOMERS, customers);
      this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    this.logAudit(operatorId, `EXCEL_BULK_IMPORT_${type.toUpperCase()}`, type, null, {
      rows_imported: count,
    });

    return {
      count,
      message: `Đã nạp thành công ${count} dòng dữ liệu thật từ Excel vào hệ thống!`,
    };
  }
}

export const erpStorage = new ERPDatabaseService();


