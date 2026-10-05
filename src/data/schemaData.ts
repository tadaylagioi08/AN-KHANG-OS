export interface ColumnDef {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
    onDelete: 'CASCADE' | 'RESTRICT' | 'SET NULL';
  };
  checkConstraint?: string;
  description: string;
  isSensitiveCost?: boolean;
}

export interface TableDef {
  id: string;
  tableName: string;
  displayName: string;
  category: 'core' | 'product_inventory' | 'sales_orders' | 'purchasing' | 'finance_audit';
  description: string;
  columns: ColumnDef[];
  indexes: string[];
  rlsRules: string[];
  triggers: string[];
}

export interface RoleDef {
  code: string;
  title: string;
  department: string;
  canViewCost: boolean;
  canAccessVault: boolean;
  description: string;
  permissions: {
    orders: string;
    inventory: string;
    po: string;
    finance: string;
    vault: string;
  };
}

export const USER_ROLES: RoleDef[] = [
  {
    code: 'ROLE_ADMIN',
    title: 'Quản Trị Viên Hệ Thống & CSDL',
    department: 'Ban Công Nghệ & Hệ Thống',
    canViewCost: true,
    canAccessVault: false,
    description: 'Chuyên trách quản trị kỹ thuật: 18 bảng CSDL PostgreSQL, mã nguồn Supabase DDL, nhật ký kiểm toán hệ thống, cấu hình an ninh và công cụ sao lưu dữ liệu.',
    permissions: {
      orders: 'Quản trị CSDL (Xem cấu trúc & Audit)',
      inventory: 'Quản trị CSDL & Kiến trúc lô',
      po: 'Quản trị CSDL',
      finance: 'Quản trị CSDL & Backup',
      vault: 'Bảo mật CSDL (Bị chặn bởi RLS ứng dụng)'
    }
  },
  {
    code: 'ROLE_CEO',
    title: 'Tổng Giám Đốc (CEO)',
    department: 'Ban Giám Đốc',
    canViewCost: true,
    canAccessVault: true,
    description: 'Quyền hạn tối cao toàn hệ thống. Duyệt vượt trần chiết khấu, duyệt đơn vượt hạn mức nợ, xem và tải tài liệu mật trong Company Vault.',
    permissions: {
      orders: 'Toàn quyền duyệt (All status)',
      inventory: 'Toàn quyền & Xem giá vốn',
      po: 'Phê duyệt PO (Duyệt chi)',
      finance: 'Toàn quyền kiểm soát tài chính & Mở khóa sổ',
      vault: 'Xem / Thêm / Xóa tài liệu mật (100%)'
    }
  },
  {
    code: 'ROLE_SALES_MANAGER',
    title: 'Trưởng Phòng Kinh Doanh',
    department: 'Khối Kinh Doanh',
    canViewCost: true,
    canAccessVault: false,
    description: 'Quản lý đội ngũ sale sỉ và lẻ, duyệt chiết khấu trong phạm vi trần định mức, giám sát KPI doanh số.',
    permissions: {
      orders: 'Duyệt đơn trong trần chiết khấu',
      inventory: 'Xem tồn kho & Giá vốn tham khảo',
      po: 'Không có quyền',
      finance: 'Xem công nợ khách hàng',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_SALES_REP',
    title: 'Nhân Viên Kinh Doanh (Sales Rep)',
    department: 'Khối Kinh Doanh',
    canViewCost: false,
    canAccessVault: false,
    description: 'Lên đơn bán hàng, theo dõi giao hàng. BỊ CHẶN TUYỆT ĐỐI KHÔNG ĐƯỢC XEM GIÁ VỐN (unit_cost) qua RLS & View Masking.',
    permissions: {
      orders: 'Tạo đơn mới, xem đơn của mình',
      inventory: 'Chỉ xem số lượng tồn (Ẩn unit_cost)',
      po: 'Bị chặn hoàn toàn (RLS)',
      finance: 'Xem hạn mức nợ khách hàng',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_STORE_MANAGER',
    title: 'Cửa Hàng Trưởng (Store Manager)',
    department: 'Khối Bán Lẻ',
    canViewCost: false,
    canAccessVault: false,
    description: 'Quản lý cửa hàng bán lẻ, kiểm soát tiền mặt trong ca, xuất bán lẻ tại quầy. CHỈ THAO TÁC TRÊN KHO LẺ, CHẶN TUYỆT ĐỐI KHO SỈ.',
    permissions: {
      orders: 'Tạo & Duyệt đơn bán lẻ KHO_LE',
      inventory: 'Xem tồn kho KHO_LE (Ẩn unit_cost)',
      po: 'Đề xuất yêu cầu nhập hàng',
      finance: 'Ghi nhận phiếu thu tiền mặt',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_WAREHOUSE_KEEPER',
    title: 'Thủ Kho (Warehouse Keeper)',
    department: 'Khối Kho Vận',
    canViewCost: false,
    canAccessVault: false,
    description: 'Thực hiện xuất nhập chuyển kho vật lý, quét mã vạch lô FIFO, kiểm đếm hàng.',
    permissions: {
      orders: 'Xem đơn để chuẩn bị đóng gói',
      inventory: 'Thao tác phiếu xuất/nhập/chuyển kho',
      po: 'Nhận hàng PO & tạo lô mới',
      finance: 'Không có quyền',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_CHIEF_ACCOUNTANT',
    title: 'Kế Toán Trưởng (Chief Accountant)',
    department: 'Khối Tài Chính - Kế Toán',
    canViewCost: true,
    canAccessVault: false,
    description: 'Quản trị dòng tiền, kiểm toán chứng từ, khóa sổ tháng (đáp ứng 8/8 bước kiểm tra bắt buộc).',
    permissions: {
      orders: 'Kiểm toán doanh thu, công nợ',
      inventory: 'Toàn quyền kiểm toán kho & giá vốn',
      po: 'Kiểm tra tính hợp lệ thuế VAT',
      finance: 'Toàn quyền thu/chi & Khóa sổ tháng',
      vault: 'Bị chặn bởi RLS (trừ khi CEO ủy quyền)'
    }
  },
  {
    code: 'ROLE_ACCOUNTANT_WHOLESALE',
    title: 'Kế Toán Kho Sỉ (Wholesale Accountant)',
    department: 'Khối Tài Chính - Kế Toán',
    canViewCost: true,
    canAccessVault: false,
    description: 'Theo dõi hợp đồng sỉ, đối chiếu công nợ đại lý phân phối, theo dõi tiến độ cọc.',
    permissions: {
      orders: 'Theo dõi thanh toán & cọc đơn sỉ',
      inventory: 'Xem giá vốn để đối soát lãi gộp',
      po: 'Không có quyền',
      finance: 'Lập phiếu thu/báo nợ đơn sỉ',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_ACCOUNTANT_RETAIL',
    title: 'Kế Toán Kho Lẻ (Retail Accountant)',
    department: 'Khối Tài Chính - Kế Toán',
    canViewCost: true,
    canAccessVault: false,
    description: 'Đối soát doanh thu các chi nhánh showroom, tiền mặt, POS ngân hàng và sàn TMĐT.',
    permissions: {
      orders: 'Kiểm tra doanh thu bán lẻ',
      inventory: 'Đối soát tồn kho bán lẻ KHO_LE',
      po: 'Không có quyền',
      finance: 'Ghi nhận doanh thu bán lẻ hàng ngày',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_LEGAL',
    title: 'Trưởng Phòng Pháp Chế (Legal Officer)',
    department: 'Ban Pháp Chế',
    canViewCost: false,
    canAccessVault: true,
    description: 'Quản lý hợp đồng kinh tế, tranh chấp công nợ, toàn quyền truy cập Company Vault lưu trữ hợp đồng lao động & quy chế mật.',
    permissions: {
      orders: 'Xem hợp đồng & điều khoản pháp lý',
      inventory: 'Không có quyền',
      po: 'Rà soát hợp đồng mua hàng lớn',
      finance: 'Xem hồ sơ tranh chấp nợ xấu',
      vault: 'Toàn quyền SELECT/INSERT trong Company Vault'
    }
  },
  {
    code: 'ROLE_MARKETING',
    title: 'Chuyên Viên Marketing',
    department: 'Khối Marketing',
    canViewCost: false,
    canAccessVault: false,
    description: 'Theo dõi các chương trình khuyến mãi, giá bán lẻ niêm yết của các dòng vợt, giày cầu lông.',
    permissions: {
      orders: 'Xem dữ liệu doanh số phục vụ chiến dịch',
      inventory: 'Xem tồn khả dụng các mã chiến dịch',
      po: 'Không có quyền',
      finance: 'Không có quyền',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_EVENT',
    title: 'Chuyên Viên Sự Kiện (Event)',
    department: 'Khối Marketing - Truyền Thông',
    canViewCost: false,
    canAccessVault: false,
    description: 'Tổ chức các giải đấu cầu lông Khang An Open, mượn xuất nhập dụng cụ thi đấu, tài trợ VĐV.',
    permissions: {
      orders: 'Tạo đơn tài trợ / đơn mẫu',
      inventory: 'Yêu cầu xuất kho dụng cụ giải đấu',
      po: 'Không có quyền',
      finance: 'Không có quyền',
      vault: 'Bị chặn bởi RLS'
    }
  },
  {
    code: 'ROLE_DESIGNER',
    title: 'Thiết Kế Đồ Họa (Designer)',
    department: 'Khối Sáng Tạo',
    canViewCost: false,
    canAccessVault: false,
    description: 'Thiết kế bao bì, hình ảnh sản phẩm vợt, áo đấu, ấn phẩm truyền thông giải đấu.',
    permissions: {
      orders: 'Không có quyền',
      inventory: 'Xem danh mục sản phẩm & thông số kỹ thuật',
      po: 'Không có quyền',
      finance: 'Không có quyền',
      vault: 'Bị chặn bởi RLS'
    }
  }
];

export const TABLES_DATA: TableDef[] = [
  {
    id: 'profiles',
    tableName: 'profiles',
    displayName: '1. profiles (Nhân Sự & 12 Phân Quyền)',
    category: 'core',
    description: 'Hồ sơ người dùng liên kết với auth.users của Supabase, lưu trữ 12 vai trò (roles), chi nhánh kho trực thuộc, cơ chế khóa tài khoản sau các lần đăng nhập sai.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Khóa chính, liên kết 1-1 với auth.users(id) ON DELETE CASCADE' },
      { name: 'full_name', type: 'VARCHAR(255)', isNullable: false, description: 'Họ và tên đầy đủ của nhân sự' },
      { name: 'username', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Tên đăng nhập hệ thống (duy nhất)' },
      { name: 'role', type: 'user_role (ENUM)', isNullable: false, description: 'Vai trò: ceo, sales_manager, salesman, store_manager, warehouse, chief_accountant, accountant_wholesale, accountant_retail, legal, marketing, event, designer' },
      { name: 'warehouse_id', type: 'UUID', isNullable: true, foreignKey: { table: 'warehouses', column: 'id', onDelete: 'SET NULL' }, description: 'Kho phụ trách (nếu có)' },
      { name: 'is_active', type: 'BOOLEAN', isNullable: false, defaultValue: 'true', description: 'Trạng thái hoạt động của tài khoản' },
      { name: 'failed_login_attempts', type: 'INT', isNullable: false, defaultValue: '0', checkConstraint: 'failed_login_attempts >= 0', description: 'Số lần đăng nhập thất bại liên tiếp' },
      { name: 'locked_until', type: 'TIMESTAMPTZ', isNullable: true, description: 'Thời điểm hết hạn khóa tài khoản nếu vượt quá số lần cho phép' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo tài khoản' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật gần nhất qua trigger' }
    ],
    indexes: ['idx_profiles_role ON profiles(role)', 'idx_profiles_warehouse ON profiles(warehouse_id)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Mọi user đã xác thực có thể đọc danh bạ nội bộ', 'Chỉ CEO có quyền cập nhật phân quyền nhân sự'],
    triggers: ['set_profiles_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'warehouses',
    tableName: 'warehouses',
    displayName: '2. warehouses (Hệ Thống Kho Sỉ & Lẻ)',
    category: 'core',
    description: 'Danh mục các kho hàng của Khang An Badminton: KHO_SI (Kho tổng sỉ) và KHO_LE (Kho bán lẻ / chuỗi showroom).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Mã định danh duy nhất của kho' },
      { name: 'code', type: 'VARCHAR(50)', isNullable: false, isUnique: true, checkConstraint: "code IN ('KHO_SI', 'KHO_LE')", description: 'Mã kho theo chuẩn Khang An: KHO_SI hoặc KHO_LE' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Tên kho hiển thị (Kho Tổng Bán Sỉ, Cửa Hàng Bán Lẻ Khang An)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['uq_warehouses_code (UNIQUE)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Tất cả nhân sự xác thực có quyền đọc danh sách kho'],
    triggers: ['set_warehouses_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'product_categories',
    tableName: 'product_categories',
    displayName: '3. product_categories (Nhóm Hàng & Trần Chiết Khấu %)',
    category: 'product_inventory',
    description: 'Phân loại nhóm hàng (Vợt cầu lông, Quả cầu lông, Giày, Quần áo, Phụ kiện, Cước căng...) kèm trần chiết khấu tối đa do Giám Đốc quy định.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính UUID' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, isUnique: true, description: 'Tên nhóm hàng (Vợt cầu lông, Cầu lông, Giày thể thao...)' },
      { name: 'discount_ceiling', type: 'NUMERIC(5, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'discount_ceiling >= 0.00 AND discount_ceiling <= 100.00', description: 'Trần chiết khấu % tối đa do CEO ấn định cho nhóm hàng này' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['uq_product_categories_name (UNIQUE)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Mọi nhân sự có thể đọc thông tin nhóm hàng'],
    triggers: ['set_product_categories_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'products',
    tableName: 'products',
    displayName: '4. products (Danh Mục Sản Phẩm)',
    category: 'product_inventory',
    description: 'Danh mục sản phẩm dụng cụ thể thao cầu lông (mã SKU, tên sản phẩm, đơn vị tính Cái/Cây/Ống/Đôi, nhóm hàng).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính UUID' },
      { name: 'code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã sản phẩm SKU (vd: VOT-YONEX-ASTROX77, CAU-HAIYEN-S100)' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Tên sản phẩm chi tiết' },
      { name: 'unit', type: 'VARCHAR(50)', isNullable: false, description: 'Đơn vị tính chuẩn: Cây, Ống, Quả, Đôi, Cuộn, Cái...' },
      { name: 'category_id', type: 'UUID', isNullable: false, foreignKey: { table: 'product_categories', column: 'id', onDelete: 'RESTRICT' }, description: 'Tham chiếu đến nhóm sản phẩm' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_products_category ON products(category_id)', 'idx_products_code ON products(code)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Cho phép authenticated đọc danh mục sản phẩm'],
    triggers: ['set_products_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'inventory_batches',
    tableName: 'inventory_batches',
    displayName: '5. inventory_batches (Quản Lý Lô Hàng FIFO)',
    category: 'product_inventory',
    description: 'Cốt lõi thuật toán FIFO: Lưu từng lô nhập kho theo ngày nhập (import_date). Cột unit_cost bị ẩn hoàn toàn đối với Salesman qua cơ chế Security View & RLS.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính lô hàng' },
      { name: 'product_id', type: 'UUID', isNullable: false, foreignKey: { table: 'products', column: 'id', onDelete: 'RESTRICT' }, description: 'Sản phẩm tương ứng' },
      { name: 'warehouse_id', type: 'UUID', isNullable: false, foreignKey: { table: 'warehouses', column: 'id', onDelete: 'RESTRICT' }, description: 'Kho chứa lô hàng này' },
      { name: 'batch_number', type: 'VARCHAR(100)', isNullable: false, description: 'Số hiệu lô sản xuất / lô hàng (vd: LOT-2026-001)' },
      { name: 'import_date', type: 'DATE', isNullable: false, description: 'Ngày nhập kho vật lý (tiêu chí sắp xếp FIFO First In First Out)' },
      { name: 'unit_cost', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'unit_cost >= 0', isSensitiveCost: true, description: 'GIÁ VỐN NHẬP (Bảo mật: Salesman KHÔNG ĐƯỢC XEM)' },
      { name: 'quantity_imported', type: 'NUMERIC(12, 2)', isNullable: false, checkConstraint: 'quantity_imported > 0', description: 'Số lượng nhập ban đầu của lô' },
      { name: 'quantity_remaining', type: 'NUMERIC(12, 2)', isNullable: false, checkConstraint: 'quantity_remaining >= 0 AND quantity_remaining <= quantity_imported', description: 'Số lượng tồn còn lại trong lô' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm ghi nhận' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm trừ kho FIFO gần nhất' }
    ],
    indexes: ['idx_batches_fifo_lookup (product_id, warehouse_id, import_date ASC, created_at ASC) WHERE quantity_remaining > 0', 'uq_batch_warehouse_product UNIQUE (warehouse_id, product_id, batch_number)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'v_inventory_batches_secure trả về NULL cho cột unit_cost nếu user là salesman'],
    triggers: ['set_inventory_batches_updated_at (BEFORE UPDATE)', 'audit_batches_changes (AFTER INSERT/UPDATE/DELETE)']
  },
  {
    id: 'customers',
    tableName: 'customers',
    displayName: '6. customers (Khách Hàng & Hạn Mức Công Nợ)',
    category: 'sales_orders',
    description: 'Hồ sơ đại lý sỉ, cửa hàng thể thao, khách bán lẻ kèm hạn mức tín dụng nợ (debt_limit) và dư nợ hiện tại (current_debt).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính khách hàng' },
      { name: 'code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã khách hàng (vd: KH-DL-001, KH-LE-HN01)' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Tên đại lý / khách hàng' },
      { name: 'phone', type: 'VARCHAR(50)', isNullable: true, description: 'Số điện thoại liên hệ' },
      { name: 'address', type: 'TEXT', isNullable: true, description: 'Địa chỉ giao hàng / trụ sở đại lý' },
      { name: 'debt_limit', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'debt_limit >= 0', description: 'Hạn mức công nợ tối đa cho phép mua nợ' },
      { name: 'current_debt', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', description: 'Dư nợ hiện tại (tăng khi giao hàng chưa thanh toán, giảm khi có phiếu thu)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_customers_code ON customers(code)', 'idx_customers_phone ON customers(phone)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Salesman chỉ xem và lập đơn cho khách hàng'],
    triggers: ['set_customers_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'suppliers',
    tableName: 'suppliers',
    displayName: '7. suppliers (Nhà Cung Cấp Hàng Cầu Lông)',
    category: 'purchasing',
    description: 'Nhà phân phối Yonex, Victor, Lining, Hải Yến... quản lý mã số thuế, số điện thoại, công nợ phải trả.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính nhà cung cấp' },
      { name: 'code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã nhà cung cấp (vd: NCC-YONEX-VN, NCC-HAIYEN)' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Tên công ty cung cấp thiết bị cầu lông' },
      { name: 'phone', type: 'VARCHAR(50)', isNullable: true, description: 'Hotline / liên hệ' },
      { name: 'address', type: 'TEXT', isNullable: true, description: 'Địa chỉ nhà cung cấp' },
      { name: 'tax_code', type: 'VARCHAR(50)', isNullable: true, description: 'Mã số thuế doanh nghiệp' },
      { name: 'current_debt', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', description: 'Công nợ Khang An phải trả nhà cung cấp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_suppliers_code ON suppliers(code)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Thủ kho, kế toán, CEO có quyền truy xuất nhà cung cấp'],
    triggers: ['set_suppliers_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'orders',
    tableName: 'orders',
    displayName: '8. orders (Đơn Bán Hàng & Phân Nhánh Tách Đơn)',
    category: 'sales_orders',
    description: 'Quản lý đơn hàng. Tích hợp phân nhánh Đơn A (Đủ hàng xuất ngay) & Đơn B (Chờ hàng) qua trường parent_order_id khi kích hoạt hàm fn_allocate_stock_fifo_and_split_order.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính đơn hàng' },
      { name: 'order_code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã đơn hàng (vd: DH-2026-001, hoặc DH-2026-001-A / B)' },
      { name: 'customer_id', type: 'UUID', isNullable: false, foreignKey: { table: 'customers', column: 'id', onDelete: 'RESTRICT' }, description: 'Khách hàng đặt mua' },
      { name: 'salesman_id', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Nhân viên kinh doanh phụ trách' },
      { name: 'warehouse_id', type: 'UUID', isNullable: false, foreignKey: { table: 'warehouses', column: 'id', onDelete: 'RESTRICT' }, description: 'Kho xuất hàng (KHO_SI hoặc KHO_LE)' },
      { name: 'total_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'total_amount >= 0', description: 'Tổng trị giá đơn hàng sau chiết khấu' },
      { name: 'discount_percent', type: 'NUMERIC(5, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'discount_percent >= 0 AND discount_percent <= 100', description: '% chiết khấu áp dụng cho đơn' },
      { name: 'prepaid_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'prepaid_amount >= 0', description: 'Tiền cọc trước (sẽ tự động chia pro-rata khi tách đơn A và B)' },
      { name: 'status', type: 'order_status_enum', isNullable: false, defaultValue: "'draft'", description: 'draft, pending_approval, pending_ceo_discount, pending_ceo_debt, approved, partially_fulfilled, completed, cancelled' },
      { name: 'parent_order_id', type: 'UUID', isNullable: true, foreignKey: { table: 'orders', column: 'id', onDelete: 'SET NULL' }, description: 'Đơn hàng cha gốc (nếu là đơn con A hoặc B được tách)' },
      { name: 'note', type: 'TEXT', isNullable: true, description: 'Ghi chú đơn hàng' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo đơn' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_orders_customer', 'idx_orders_salesman', 'idx_orders_status', 'idx_orders_parent'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Salesman xem đơn do mình phụ trách', 'Kế toán và CEO xem toàn bộ đơn'],
    triggers: ['set_orders_updated_at (BEFORE UPDATE)', 'audit_orders_changes (AFTER INSERT/UPDATE/DELETE)']
  },
  {
    id: 'order_items',
    tableName: 'order_items',
    displayName: '9. order_items (Chi Tiết Mặt Hàng Trong Đơn)',
    category: 'sales_orders',
    description: 'Danh sách chi tiết các mặt hàng trong đơn: số lượng đặt, đơn giá niêm yết, chiết khấu và thành tiền.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính chi tiết mặt hàng' },
      { name: 'order_id', type: 'UUID', isNullable: false, foreignKey: { table: 'orders', column: 'id', onDelete: 'CASCADE' }, description: 'Mã đơn hàng liên kết' },
      { name: 'product_id', type: 'UUID', isNullable: false, foreignKey: { table: 'products', column: 'id', onDelete: 'RESTRICT' }, description: 'Mặt hàng sản phẩm' },
      { name: 'quantity', type: 'NUMERIC(12, 2)', isNullable: false, checkConstraint: 'quantity > 0', description: 'Số lượng mua' },
      { name: 'unit_price', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'unit_price >= 0', description: 'Đơn giá bán ra' },
      { name: 'discount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'discount >= 0', description: 'Số tiền giảm giá' },
      { name: 'total_price', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'total_price >= 0', description: 'Thành tiền = (quantity * unit_price) - discount' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_order_items_order ON order_items(order_id)', 'idx_order_items_product ON order_items(product_id)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Được đọc bởi người có quyền xem đơn hàng cha'],
    triggers: ['set_order_items_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'purchase_orders',
    tableName: 'purchase_orders',
    displayName: '10. purchase_orders (Đơn Đặt Mua Hàng PO)',
    category: 'purchasing',
    description: 'Đơn đặt mua trang thiết bị cầu lông từ nhà cung cấp (Yonex, Victor...). Trạng thái cần CEO phê duyệt trước khi nhập kho.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính PO' },
      { name: 'po_code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã đơn mua PO (vd: PO-2026-001)' },
      { name: 'supplier_id', type: 'UUID', isNullable: false, foreignKey: { table: 'suppliers', column: 'id', onDelete: 'RESTRICT' }, description: 'Nhà cung cấp tương ứng' },
      { name: 'created_by', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Nhân viên tạo đơn mua' },
      { name: 'status', type: 'po_status_enum', isNullable: false, defaultValue: "'draft'", description: 'draft, pending_ceo, approved, completed, cancelled' },
      { name: 'total_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'total_amount >= 0', description: 'Tổng tiền mua hàng chưa VAT' },
      { name: 'vat_total', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'vat_total >= 0', description: 'Tổng tiền thuế VAT' },
      { name: 'note', type: 'TEXT', isNullable: true, description: 'Ghi chú đơn đặt mua' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_po_supplier ON purchase_orders(supplier_id)', 'idx_po_status ON purchase_orders(status)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'CHẶN TOÀN BỘ SALESMAN truy cập PO qua RLS (NOT is_salesman())'],
    triggers: ['set_purchase_orders_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'purchase_order_items',
    tableName: 'purchase_order_items',
    displayName: '11. purchase_order_items (Chi Tiết Đơn Mua PO)',
    category: 'purchasing',
    description: 'Chứa chi tiết giá vốn nhập (unit_cost) và thuế VAT. Tuyệt đối bị chặn và che đối với Salesman qua RLS và Secure Views.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính chi tiết PO' },
      { name: 'po_id', type: 'UUID', isNullable: false, foreignKey: { table: 'purchase_orders', column: 'id', onDelete: 'CASCADE' }, description: 'Đơn mua hàng liên kết' },
      { name: 'product_id', type: 'UUID', isNullable: false, foreignKey: { table: 'products', column: 'id', onDelete: 'RESTRICT' }, description: 'Mặt hàng nhập' },
      { name: 'quantity', type: 'NUMERIC(12, 2)', isNullable: false, checkConstraint: 'quantity > 0', description: 'Số lượng mua nhập' },
      { name: 'unit_cost', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'unit_cost >= 0', isSensitiveCost: true, description: 'GIÁ VỐN MUA (Chỉ CEO, Kế toán trưởng, Kế toán sỉ được xem)' },
      { name: 'vat_percent', type: 'NUMERIC(5, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'vat_percent >= 0 AND vat_percent <= 100', description: '% Thuế giá trị gia tăng' },
      { name: 'vat_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'vat_amount >= 0', isSensitiveCost: true, description: 'Tiền thuế VAT' },
      { name: 'total_cost', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'total_cost >= 0', isSensitiveCost: true, description: 'Tổng chi phí mua' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_poi_po ON purchase_order_items(po_id)', 'idx_poi_product ON purchase_order_items(product_id)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'CHẶN HOÀN TOÀN SALESMAN không được SELECT vào purchase_order_items', 'View v_purchase_order_items_secure che NULL unit_cost'],
    triggers: ['set_purchase_order_items_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'stock_movements',
    tableName: 'stock_movements',
    displayName: '12. stock_movements (Phiếu Xuất/Nhập/Chuyển/Kiểm Kê)',
    category: 'product_inventory',
    description: 'Lưu trữ toàn bộ biến động kho: Nhập theo PO (IN_PO), Xuất theo đơn (OUT_ORDER), Điều chuyển kho (TRANSFER), Kiểm kê chênh lệch (STOCKTAKE_ADJUST), Khách trả hàng (RETURN_IN).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính phiếu biến động' },
      { name: 'movement_code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã phiếu xuất nhập (vd: PXK-DH001, PNK-PO001)' },
      { name: 'movement_type', type: 'movement_type_enum', isNullable: false, description: 'IN_PO, OUT_ORDER, TRANSFER, STOCKTAKE_ADJUST, RETURN_IN' },
      { name: 'from_warehouse_id', type: 'UUID', isNullable: true, foreignKey: { table: 'warehouses', column: 'id', onDelete: 'RESTRICT' }, description: 'Kho xuất (nếu có)' },
      { name: 'to_warehouse_id', type: 'UUID', isNullable: true, foreignKey: { table: 'warehouses', column: 'id', onDelete: 'RESTRICT' }, description: 'Kho nhận (nếu có)' },
      { name: 'reference_order_id', type: 'UUID', isNullable: true, foreignKey: { table: 'orders', column: 'id', onDelete: 'SET NULL' }, description: 'Đơn hàng bán liên quan' },
      { name: 'reference_po_id', type: 'UUID', isNullable: true, foreignKey: { table: 'purchase_orders', column: 'id', onDelete: 'SET NULL' }, description: 'Đơn mua PO liên quan' },
      { name: 'created_by', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Người tạo phiếu' },
      { name: 'approved_by', type: 'UUID', isNullable: true, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Người phê duyệt xuất/nhập' },
      { name: 'status', type: 'movement_status_enum', isNullable: false, defaultValue: "'draft'", description: 'draft, pending, completed, cancelled' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo phiếu' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm hoàn thành' }
    ],
    indexes: ['idx_movements_type', 'idx_movements_from_wh', 'idx_movements_to_wh'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Thủ kho thao tác xuất nhập chuyển kho', 'Salesman chỉ xem phiếu xuất cho đơn của mình'],
    triggers: ['set_stock_movements_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'stock_movement_items',
    tableName: 'stock_movement_items',
    displayName: '13. stock_movement_items (Chi Tiết Lô Xuất/Nhập)',
    category: 'product_inventory',
    description: 'Chi tiết từng lô FIFO bị trừ hoặc cộng thêm. Cột unit_cost bị che giấu trước Salesman qua View bảo mật v_stock_movement_items_secure.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính dòng xuất nhập lô' },
      { name: 'movement_id', type: 'UUID', isNullable: false, foreignKey: { table: 'stock_movements', column: 'id', onDelete: 'CASCADE' }, description: 'Phiếu biến động kho' },
      { name: 'product_id', type: 'UUID', isNullable: false, foreignKey: { table: 'products', column: 'id', onDelete: 'RESTRICT' }, description: 'Mặt hàng' },
      { name: 'batch_id', type: 'UUID', isNullable: true, foreignKey: { table: 'inventory_batches', column: 'id', onDelete: 'RESTRICT' }, description: 'Lô hàng FIFO cụ thể bị trừ/nhập' },
      { name: 'quantity', type: 'NUMERIC(12, 2)', isNullable: false, checkConstraint: 'quantity > 0', description: 'Số lượng thực xuất/nhập của lô' },
      { name: 'unit_cost', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'unit_cost >= 0', isSensitiveCost: true, description: 'GIÁ VỐN LÔ (Bị che giấu đối với Salesman)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm ghi sổ' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_smi_movement ON stock_movement_items(movement_id)', 'idx_smi_batch ON stock_movement_items(batch_id)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'v_stock_movement_items_secure trả về NULL cho unit_cost nếu role = salesman'],
    triggers: ['set_stock_movement_items_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'return_orders',
    tableName: 'return_orders',
    displayName: '14. return_orders (Phiếu Trả / Đổi Hàng)',
    category: 'sales_orders',
    description: 'Xử lý trả hoặc đổi hàng bảo hành/lỗi từ khách, đánh dấu cờ is_over_30_days, hoàn tiền mặt, cấn trừ công nợ hoặc đổi mã tương đương.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính phiếu trả' },
      { name: 'return_code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã phiếu trả (vd: TH-2026-001)' },
      { name: 'original_order_id', type: 'UUID', isNullable: false, foreignKey: { table: 'orders', column: 'id', onDelete: 'RESTRICT' }, description: 'Đơn hàng gốc bán cho khách' },
      { name: 'created_by', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Người lập phiếu hoàn hàng' },
      { name: 'is_over_30_days', type: 'BOOLEAN', isNullable: false, defaultValue: 'false', description: 'Cờ cảnh báo nếu vượt quá 30 ngày kể từ ngày mua (cần duyệt đặc biệt)' },
      { name: 'total_return_value', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'total_return_value >= 0', description: 'Tổng giá trị hàng nhận lại' },
      { name: 'refund_type', type: 'refund_type_enum', isNullable: false, description: 'CASH_REFUND (Hoàn tiền mặt), DEBT_OFFSET (Cấn trừ nợ), EXCHANGE (Đổi hàng)' },
      { name: 'refund_cash_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'refund_cash_amount >= 0', description: 'Số tiền hoàn lại bằng tiền mặt/chuyển khoản' },
      { name: 'debt_offset_amount', type: 'NUMERIC(15, 2)', isNullable: false, defaultValue: '0.00', checkConstraint: 'debt_offset_amount >= 0', description: 'Số tiền cấn trừ vào công nợ của khách' },
      { name: 'status', type: 'return_order_status_enum', isNullable: false, defaultValue: "'pending_check'", description: 'pending_check, completed' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm hoàn tất' }
    ],
    indexes: ['idx_returns_order ON return_orders(original_order_id)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Kế toán và cửa hàng trưởng xác nhận kiểm tra sản phẩm'],
    triggers: ['set_return_orders_updated_at (BEFORE UPDATE)']
  },
  {
    id: 'financial_transactions',
    tableName: 'financial_transactions',
    displayName: '15. financial_transactions (Thu/Chi & Chống Trùng Hóa Đơn)',
    category: 'finance_audit',
    description: 'Sổ quỹ thu chi, hóa đơn VAT. Có ràng buộc UNIQUE trên invoice_number để chống tuyệt đối việc kế toán vô tình nhập trùng số hóa đơn.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính giao dịch tài chính' },
      { name: 'doc_code', type: 'VARCHAR(100)', isNullable: false, isUnique: true, description: 'Mã chứng từ kế toán (vd: PT-001, PC-001, HDBR-001)' },
      { name: 'doc_type', type: 'fin_doc_type_enum', isNullable: false, description: 'RECEIPT (Phiếu thu), PAYMENT (Phiếu chi), VAT_OUT (Hóa đơn đầu ra), VAT_IN (Hóa đơn đầu vào)' },
      { name: 'customer_id', type: 'UUID', isNullable: true, foreignKey: { table: 'customers', column: 'id', onDelete: 'RESTRICT' }, description: 'Khách hàng (nếu là thu/hóa đơn bán)' },
      { name: 'supplier_id', type: 'UUID', isNullable: true, foreignKey: { table: 'suppliers', column: 'id', onDelete: 'RESTRICT' }, description: 'Nhà cung cấp (nếu là chi mua hàng/hóa đơn đầu vào)' },
      { name: 'amount', type: 'NUMERIC(15, 2)', isNullable: false, checkConstraint: 'amount > 0', description: 'Số tiền giao dịch thực tế' },
      { name: 'invoice_number', type: 'VARCHAR(100)', isNullable: true, isUnique: true, description: 'SỐ HÓA ĐƠN TÀI CHÍNH (UNIQUE - Chống nhập trùng)' },
      { name: 'payment_method', type: 'VARCHAR(50)', isNullable: false, defaultValue: "'BANK_TRANSFER'", description: 'Phương thức: BANK_TRANSFER, CASH, POS, QR_CODE' },
      { name: 'note', type: 'TEXT', isNullable: true, description: 'Diễn giải nội dung thu/chi' },
      { name: 'created_by', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Kế toán lập chứng từ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm ghi sổ kế toán' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['idx_fin_customer', 'idx_fin_supplier', 'idx_fin_invoice ON financial_transactions(invoice_number)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Chỉ khối Tài chính - Kế toán và CEO có quyền thêm sửa'],
    triggers: ['set_financial_transactions_updated_at (BEFORE UPDATE)', 'audit_financial_changes (AFTER INSERT/UPDATE/DELETE)']
  },
  {
    id: 'period_locks',
    tableName: 'period_locks',
    displayName: '16. period_locks (Khóa Sổ Kế Toán Tháng 8/8 Bước)',
    category: 'finance_audit',
    description: 'Khóa sổ kỳ kế toán theo tháng/năm. Ràng buộc checks_passed = 8 mới cho phép is_locked = true. Ngăn chặn việc sửa đổi số liệu quá khứ.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính kỳ khóa sổ' },
      { name: 'month', type: 'INT', isNullable: false, checkConstraint: 'month >= 1 AND month <= 12', description: 'Tháng khóa sổ (1 - 12)' },
      { name: 'year', type: 'INT', isNullable: false, checkConstraint: 'year >= 2020 AND year <= 2100', description: 'Năm tài chính' },
      { name: 'is_locked', type: 'BOOLEAN', isNullable: false, defaultValue: 'false', description: 'Trạng thái khóa sổ (true = đóng băng toàn bộ giao dịch)' },
      { name: 'checks_passed', type: 'INT', isNullable: false, defaultValue: '0', checkConstraint: 'checks_passed >= 0 AND checks_passed <= 8', description: 'Số bước kiểm toán đã pass (YÊU CẦU 8/8 BƯỚC)' },
      { name: 'locked_by', type: 'UUID', isNullable: true, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Kế toán trưởng thực hiện lệnh khóa sổ' },
      { name: 'unlocked_reason', type: 'TEXT', isNullable: true, description: 'Lý do mở khóa sổ nếu có ngoại lệ khẩn cấp' },
      { name: 'unlocked_by', type: 'UUID', isNullable: true, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Tổng Giám Đốc phê chuẩn mở khóa sổ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm tạo' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật' }
    ],
    indexes: ['uq_period_month_year UNIQUE (month, year)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Chỉ Kế toán trưởng và CEO có quyền thao tác khóa sổ'],
    triggers: ['set_period_locks_updated_at (BEFORE UPDATE)', 'audit_period_locks_changes (AFTER INSERT/UPDATE/DELETE)']
  },
  {
    id: 'audit_logs',
    tableName: 'audit_logs',
    displayName: '17. audit_logs (Nhật Ký Kiểm Toán Tự Động)',
    category: 'finance_audit',
    description: 'Lưu vết tự động bằng Trigger cho mọi thao tác INSERT/UPDATE/DELETE quan trọng (đơn hàng, trừ kho, thu chi tài chính, khóa sổ).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính log' },
      { name: 'user_id', type: 'UUID', isNullable: true, foreignKey: { table: 'auth.users', column: 'id', onDelete: 'SET NULL' }, description: 'Người dùng thực hiện hành động' },
      { name: 'action', type: 'VARCHAR(50)', isNullable: false, description: 'Hành động: INSERT, UPDATE, DELETE, ALLOCATE_FIFO_FULL, SPLIT_ORDER_FIFO_SHORTAGE' },
      { name: 'table_name', type: 'VARCHAR(100)', isNullable: false, description: 'Tên bảng bị tác động (orders, inventory_batches, financial_transactions...)' },
      { name: 'old_data', type: 'JSONB', isNullable: true, description: 'Snapshot dữ liệu trước khi thay đổi' },
      { name: 'new_data', type: 'JSONB', isNullable: true, description: 'Snapshot dữ liệu sau khi thay đổi' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm chính xác ghi nhận nhật ký' }
    ],
    indexes: ['idx_audit_table_action ON audit_logs(table_name, action)', 'idx_audit_timestamp ON audit_logs(timestamp DESC)'],
    rlsRules: ['ENABLE ROW LEVEL SECURITY', 'Chỉ CEO và Kế toán trưởng có quyền xem nhật ký kiểm toán. Không ai được UPDATE/DELETE log!'],
    triggers: ['Không có (chỉ nhận dữ liệu từ các trigger hệ thống)']
  },
  {
    id: 'company_vault',
    tableName: 'company_vault',
    displayName: '18. company_vault (Văn Thư Mật - Chỉ CEO & Legal)',
    category: 'core',
    description: 'Khu vực lưu trữ hồ sơ mật pháp lý công ty: Hợp đồng lao động và Quy chế quản trị nội bộ. BẢO VỆ TUYỆT ĐỐI BẰNG RLS: Chỉ CEO và Pháp Chế (legal) có quyền SELECT/INSERT.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false, description: 'Khóa chính văn bản' },
      { name: 'title', type: 'VARCHAR(255)', isNullable: false, description: 'Tiêu đề tài liệu pháp lý / hợp đồng' },
      { name: 'doc_category', type: 'company_vault_category_enum', isNullable: false, description: 'LABOR_CONTRACT (Hợp đồng lao động) hoặc REGULATION (Quy chế nội bộ)' },
      { name: 'file_path', type: 'TEXT', isNullable: false, description: 'Đường dẫn file an toàn trên Supabase Storage bucket riêng tư' },
      { name: 'uploaded_by', type: 'UUID', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'RESTRICT' }, description: 'Người tải lên (chỉ legal hoặc ceo)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm lưu văn thư' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'NOW()', description: 'Thời điểm cập nhật văn bản' }
    ],
    indexes: ['idx_vault_category ON company_vault(doc_category)'],
    rlsRules: [
      'ENABLE ROW LEVEL SECURITY',
      'CHÍNH SÁCH RLS company_vault_ceo_legal_select: USING (is_ceo_or_legal())',
      'CHÍNH SÁCH RLS company_vault_ceo_legal_insert: WITH CHECK (is_ceo_or_legal())',
      'CHÍNH SÁCH RLS company_vault_ceo_delete: Chỉ riêng CEO có quyền xóa tài liệu'
    ],
    triggers: ['set_company_vault_updated_at (BEFORE UPDATE)']
  }
];

export const AUDIT_STEPS_8_CHECK = [
  { step: 1, title: 'Đối chiếu số dư đầu kỳ - cuối kỳ tiền mặt & tiền gửi ngân hàng', department: 'Kế toán ngân hàng' },
  { step: 2, title: 'Đối soát và khóa đối chiếu công nợ đại lý phân phối sỉ', department: 'Kế toán bán sỉ' },
  { step: 3, title: 'Đối soát doanh thu bán lẻ tại các cửa hàng & cổng POS / Chuyển khoản', department: 'Kế toán bán lẻ' },
  { step: 4, title: 'Đối chiếu công nợ phải trả nhà cung cấp (Yonex, Victor, Lining...) và hóa đơn GTGT đầu vào', department: 'Kế toán thanh toán' },
  { step: 5, title: 'Kiểm kê kho vật lý đối ứng số liệu tồn kho FIFO (Thủ kho ký biên bản)', department: 'Thủ kho & Kiểm toán nội bộ' },
  { step: 6, title: 'Kiểm tra và hạch toán toàn bộ giá vốn hàng bán (COGS) theo phương pháp FIFO', department: 'Kế toán giá thành' },
  { step: 7, title: 'Kiểm tra tính liên tục và hợp lệ của hóa đơn tài chính (không trùng lặp invoice_number)', department: 'Kế toán thuế' },
  { step: 8, title: 'Kiểm tra bảng tính trích lập dự phòng giảm giá hàng tồn kho & nợ khó đòi', department: 'Kế toán trưởng phê duyệt' }
];
