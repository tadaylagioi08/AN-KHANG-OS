import React, { useState } from 'react';
import rawSql from '../sql/khang_an_os_supabase_schema.sql?raw';
import { TableInspector } from '../components/TableInspector';
import { SqlViewer } from '../components/SqlViewer';
import { FifoSimulator } from '../components/FifoSimulator';
import { RbacMatrix } from '../components/RbacMatrix';
import { erpStorage } from '../services/erpStorage';
import { UserRole } from '../types/erp';
import {
  Database,
  FileCode,
  Cpu,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Layers,
  Table,
} from 'lucide-react';

interface DatabaseInspectorPageProps {
  initialSubTab?: 'schema' | 'sql' | 'fifo' | 'rbac';
}

const DatabaseInspectorPage: React.FC<DatabaseInspectorPageProps> = ({ initialSubTab = 'schema' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'sql' | 'fifo' | 'rbac'>(initialSubTab);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Live row count overview across tables
  const liveStats = {
    profiles: erpStorage.getProfiles().length,
    warehouses: erpStorage.getWarehouses().length,
    categories: erpStorage.getCategories().length,
    products: erpStorage.getProducts().length,
    batches: erpStorage.getBatches().length,
    customers: erpStorage.getCustomers().length,
    suppliers: erpStorage.getSuppliers().length,
    orders: erpStorage.getOrders().length,
    purchaseOrders: erpStorage.getPurchaseOrders().length,
    stockMovements: erpStorage.getStockMovements().length,
    returns: erpStorage.getReturnOrders().length,
    transactions: erpStorage.getFinancialTransactions().length,
    periodLocks: erpStorage.getPeriodLocks().length,
    vault: erpStorage.getVaultDocuments(UserRole.ROLE_CEO).length,
    auditLogs: erpStorage.getAuditLogs().length,
  };

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions & Live Row Counters */}
      <div className="p-6 rounded-2xl bg-white border border-[#f0dfe2] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0dfe2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1e293b]">
                  Kiến Trúc Cơ Sở Dữ Liệu PostgreSQL & Supabase
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#9f3244]/10 text-[#9f3244] border border-[#9f3244]/20 font-mono">
                  18 Bảng Clean
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                100% Zero Dummy Data · UUID Primary Keys · SELECT FOR UPDATE FIFO · Row-Level Security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Đã Chép Schema' : 'Copy SQL Schema'}</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf5f6] text-[#7a2432] border border-[#f0dfe2] text-xs font-semibold transition cursor-pointer"
              title="Tải file khang_an_os_supabase_schema.sql"
            >
              <Download className="w-4 h-4 text-[#9f3244]" />
              <span>Download .sql</span>
            </button>
          </div>
        </div>

        {/* Live Rows Badge Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 text-center font-mono">
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">products</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.products} dòng</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">inventory_batches</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.batches} lô</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">customers</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.customers} khách</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">orders</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.orders} đơn</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">purchase_orders</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.purchaseOrders} PO</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">stock_movements</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.stockMovements} phiếu</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">company_vault</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.vault} văn thư</div>
          </div>
          <div className="p-2 rounded-lg bg-[#fbf5f6] border border-[#f0dfe2]">
            <div className="text-[10px] text-[#64748b]">audit_logs</div>
            <div className="text-xs font-bold text-[#9f3244]">{liveStats.auditLogs} log</div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-[#f0dfe2] pt-3">
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'schema'
                ? 'bg-[#9f3244] text-white shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#f0dfe2] hover:bg-[#fbf5f6]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>18 Bảng CSDL (PostgreSQL)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'sql'
                ? 'bg-[#9f3244] text-white shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#f0dfe2] hover:bg-[#fbf5f6]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Mã SQL (Supabase)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fifo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'fifo'
                ? 'bg-[#9f3244] text-white shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#f0dfe2] hover:bg-[#fbf5f6]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Mô Phỏng FIFO (ACID Lock)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'rbac'
                ? 'bg-[#9f3244] text-white shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#f0dfe2] hover:bg-[#fbf5f6]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>12 Roles & RLS Matrix</span>
          </button>
        </div>
      </div>

      {/* Subtab Content View */}
      {activeSubTab === 'schema' && <TableInspector />}

      {activeSubTab === 'sql' && (
        <SqlViewer
          sqlContent={rawSql}
          onCopy={handleCopySql}
          isCopied={isCopied}
          onDownload={handleDownloadSql}
        />
      )}

      {activeSubTab === 'fifo' && <FifoSimulator />}

      {activeSubTab === 'rbac' && <RbacMatrix />}
    </div>
  );
};

export default DatabaseInspectorPage;
