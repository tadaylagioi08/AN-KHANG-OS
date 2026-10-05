import React, { useState } from 'react';
import rawSql from '../sql/khang_an_os_supabase_schema.sql?raw';
import { TABLES_DATA, TableDef } from '../data/schemaData';
import { erpStorage } from '../services/erpStorage';
import { UserRole } from '../types/erp';
import {
  Search,
  Database,
  Key,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Download,
  FileCode,
  Table as TableIcon,
} from 'lucide-react';

export const TableInspector: React.FC = () => {
  const [selectedTableId, setSelectedTableId] = useState<string>('orders');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Compute live row counts across all 18 tables
  const orders = erpStorage.getOrders();
  const orderItemsCount = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  const purchaseOrders = erpStorage.getPurchaseOrders();
  const poItemsCount = purchaseOrders.reduce((sum, p) => sum + (p.items?.length || 0), 0);
  const stockMovements = erpStorage.getStockMovements();
  const movementItemsCount = stockMovements.reduce((sum, m) => sum + (m.items?.length || 0), 0);
  const returnOrders = erpStorage.getReturnOrders();
  const returnItemsCount = returnOrders.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  const tableRowCounts: Record<string, number> = {
    profiles: erpStorage.getProfiles().length,
    warehouses: erpStorage.getWarehouses().length,
    product_categories: erpStorage.getCategories().length,
    products: erpStorage.getProducts().length,
    inventory_batches: erpStorage.getBatches().length,
    customers: erpStorage.getCustomers().length,
    suppliers: erpStorage.getSuppliers().length,
    orders: orders.length,
    order_items: orderItemsCount,
    purchase_orders: purchaseOrders.length,
    purchase_order_items: poItemsCount,
    stock_movements: stockMovements.length,
    stock_movement_items: movementItemsCount,
    company_vault: erpStorage.getVaultDocuments(UserRole.ROLE_CEO).length,
    returns: returnOrders.length,
    return_items: returnItemsCount,
    financial_transactions: erpStorage.getFinancialTransactions().length,
    period_locks: erpStorage.getPeriodLocks().length,
    audit_logs: erpStorage.getAuditLogs().length,
  };

  const categories = [
    { id: 'all', label: 'Tất cả 18 Bảng' },
    { id: 'core', label: 'Hệ Thống & Nhân Sự' },
    { id: 'product_inventory', label: 'Sản Phẩm & Kho FIFO' },
    { id: 'sales_orders', label: 'Bán Hàng & Đơn Tách' },
    { id: 'purchasing', label: 'Mua Hàng & Nhà Cung Cấp' },
    { id: 'finance_audit', label: 'Tài Chính & Kiểm Toán' },
  ];

  const filteredTables = TABLES_DATA.filter((t) => {
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchSearch =
      searchTerm === '' ||
      t.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const activeTable = TABLES_DATA.find((t) => t.id === selectedTableId) || TABLES_DATA[0];

  const handleCopySql = () => {
    navigator.clipboard.writeText(rawSql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([rawSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'khang_an_os_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Category selector & Table filter & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                categoryFilter === c.id
                  ? 'bg-[#9f3244] text-white shadow-xs'
                  : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#f0dfe2]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bảng hoặc cột (vd: unit_cost)..."
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#f0dfe2] rounded-lg text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#9f3244] w-full shadow-xs"
            />
          </div>

          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            title="Sao chép toàn bộ mã SQL"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Đã chép' : 'Copy SQL'}</span>
          </button>

          <button
            onClick={handleDownloadSql}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#fbf5f6] text-[#7a2432] border border-[#f0dfe2] text-xs font-semibold transition cursor-pointer shrink-0"
            title="Tải về file .sql"
          >
            <Download className="w-3.5 h-3.5 text-[#9f3244]" />
            <span className="hidden sm:inline">.sql</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Table List (Left) + Table Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 18 Tables Navigation */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Danh sách 18 Bảng Clean</span>
            <span className="text-[10px] text-[#9f3244] bg-[#9f3244]/10 px-2 py-0.5 rounded font-mono font-bold">
              {filteredTables.length} / 18 Bảng
            </span>
          </div>

          <div className="space-y-1.5">
            {filteredTables.map((t) => {
              const isSelected = t.id === activeTable.id;
              const hasCostSecurity = t.columns.some((c) => c.isSensitiveCost);
              const isVault = t.id === 'company_vault';
              const rowCount = tableRowCounts[t.id] ?? tableRowCounts[t.tableName] ?? 0;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white border-[#9f3244] shadow-sm ring-1 ring-[#9f3244]/20'
                      : 'bg-white/80 border-[#f0dfe2] hover:bg-white hover:border-[#9f3244]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#1e293b] flex items-center gap-2">
                      <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-[#9f3244]' : 'text-[#64748b]'}`} />
                      {t.tableName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#9f3244]/10 text-[#9f3244]">
                        {rowCount} dòng
                      </span>
                      {isVault && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200 font-medium">
                          CEO/Legal
                        </span>
                      )}
                      {hasCostSecurity && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200 font-medium">
                          Ẩn Cost
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b] line-clamp-1 mt-1 font-sans">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Table Inspector Details */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#f0dfe2] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0dfe2] pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#9f3244] font-mono text-lg font-bold">
                    {activeTable.tableName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#fbf5f6] text-[#64748b] border border-[#f0dfe2] font-mono">
                    PostgreSQL 15
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                    RLS Active
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#9f3244]/10 text-[#9f3244] font-mono font-bold">
                    {tableRowCounts[activeTable.id] ?? 0} dòng thực tế
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-[#1e293b] mt-1">
                  {activeTable.displayName}
                </h2>
              </div>

              <div className="text-xs text-[#64748b] font-mono bg-[#fbf5f6] px-3 py-1.5 rounded-lg border border-[#f0dfe2] shrink-0">
                UUID PK · gen_random_uuid()
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              {activeTable.description}
            </p>

            {/* Badges / Security Notices */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#9f3244] bg-[#9f3244]/5 px-2.5 py-1 rounded-lg border border-[#9f3244]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Dummy Data (Bảng sạch 100%, sẵn sàng nhận import Excel)</span>
              </div>

              {activeTable.columns.some((c) => c.isSensitiveCost) && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cột unit_cost được che giấu / ẩn khỏi Nhân viên KD (salesman)</span>
                </div>
              )}

              {activeTable.id === 'company_vault' && (
                <div className="flex items-center gap-1.5 text-[11px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Storage Bucket bí mật private_vault · Chỉ CEO & Legal truy cập</span>
                </div>
              )}
            </div>
          </div>

          {/* Table Columns Specification Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#f0dfe2] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#9f3244]" />
                Cấu Trúc Các Cột ({activeTable.columns.length} Cột)
              </h3>
              <span className="text-[11px] text-[#64748b] font-mono">
                Kiểu dữ liệu & Ràng buộc toàn vẹn
              </span>
            </div>

            <div className="rounded-xl border border-[#f0dfe2] bg-[#fbf5f6]/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f0dfe2] bg-[#fbf5f6] text-[#64748b] font-mono text-[11px]">
                      <th className="py-2.5 px-3">Tên Cột</th>
                      <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                      <th className="py-2.5 px-3">Khóa / Ràng Buộc</th>
                      <th className="py-2.5 px-3">Mô Tả Nghiệp Vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0dfe2] font-mono text-[11px]">
                    {activeTable.columns.map((col) => {
                      return (
                        <tr
                          key={col.name}
                          className={`hover:bg-white transition ${
                            col.isSensitiveCost
                              ? 'bg-amber-50/50'
                              : col.isPrimary
                              ? 'bg-[#9f3244]/5'
                              : ''
                          }`}
                        >
                          {/* Column Name */}
                          <td className="py-2.5 px-3 font-semibold text-[#1e293b]">
                            <div className="flex items-center gap-1.5">
                              {col.isPrimary && <Key className="w-3 h-3 text-[#9f3244]" />}
                              <span>{col.name}</span>
                              {col.isSensitiveCost && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-medium">
                                  Bảo mật
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Data Type */}
                          <td className="py-2.5 px-3 text-[#64748b]">
                            <span className="px-1.5 py-0.5 rounded bg-white text-[#9f3244] border border-[#f0dfe2] font-semibold">
                              {col.type}
                            </span>
                          </td>

                          {/* Constraints & Keys */}
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {col.isPrimary && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#9f3244] text-white font-bold">
                                  PRIMARY KEY
                                </span>
                              )}
                              {col.foreignKey && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-50 text-sky-700 border border-sky-200">
                                  FK → {col.foreignKey.table}.{col.foreignKey.column}
                                </span>
                              )}
                              {col.isUnique && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                                  UNIQUE
                                </span>
                              )}
                              {!col.isNullable && !col.isPrimary && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-[#475569]">
                                  NOT NULL
                                </span>
                              )}
                              {col.defaultValue && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-[#64748b]">
                                  DEF: {col.defaultValue}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-2.5 px-3 text-[#475569] font-sans text-xs">
                            {col.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
