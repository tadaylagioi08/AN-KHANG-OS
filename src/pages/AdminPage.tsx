import React, { useState } from 'react';
import rawSql from '../sql/khang_an_os_supabase_schema.sql?raw';
import { TableInspector } from '../components/TableInspector';
import { SqlViewer } from '../components/SqlViewer';
import { FifoSimulator } from '../components/FifoSimulator';
import { RbacMatrix } from '../components/RbacMatrix';
import { SecurityModule } from '../components/security/SecurityModule';
import { UserRole } from '../types/erp';
import { erpStorage } from '../services/erpStorage';
import {
  Settings,
  Database,
  FileCode,
  Cpu,
  ShieldCheck,
  FileText,
  KeyRound,
  Fingerprint,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldAlert,
} from 'lucide-react';

interface AdminPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentRole,
  currentUserId,
  onOpenMasterModal,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'tables' | 'sql' | 'audit' | 'backup' | 'fifo' | 'rbac'>('tables');
  const [isCopied, setIsCopied] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = currentRole === UserRole.ROLE_ADMIN;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white border border-[#eaeaea] shadow-md text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-[#1e293b]">
          KHU VỰC DÀNH RIÊNG CHO QUẢN TRỊ VIÊN HỆ THỐNG (ROLE_ADMIN)
        </h2>
        <p className="text-xs text-[#64748b] leading-relaxed">
          Phân hệ Quản Trị Hệ Thống & CSDL chứa toàn bộ công cụ kỹ thuật (18 Bảng PostgreSQL, Trình xem/Copy mã SQL Supabase, Nhật ký hệ thống Audit Logs, Cấu hình kết nối và Công cụ Sao lưu).
          Để đảm bảo tính toàn vẹn hệ thống và bảo mật, chỉ có tài khoản <strong>Quản Trị Viên (ROLE_ADMIN)</strong> mới có quyền truy cập.
        </p>
      </div>
    );
  }

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

  // Full System Backup Export
  const handleExportSystemBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        system: 'KHANG AN OS - ERP PostgreSQL Database',
        version: 'Enterprise 2026',
        profiles: erpStorage.getProfiles(),
        warehouses: erpStorage.getWarehouses(),
        categories: erpStorage.getCategories(),
        products: erpStorage.getProducts(),
        customers: erpStorage.getCustomers(),
        suppliers: erpStorage.getSuppliers(),
        batches: erpStorage.getBatches(),
        orders: erpStorage.getOrders(),
        purchaseOrders: erpStorage.getPurchaseOrders(),
        movements: erpStorage.getStockMovements(),
        auditLogs: erpStorage.getAuditLogs(),
        financialTransactions: erpStorage.getFinancialTransactions(),
        periodLocks: erpStorage.getPeriodLocks(),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `khang_an_erp_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      erpStorage.logAudit(currentUserId, 'BACKUP_DATABASE_EXPORT', 'all_tables', null, { status: 'success' });
      setBackupFeedback({ message: 'Đã xuất file sao lưu hệ thống toàn vẹn thành công!', type: 'success' });
    } catch (err: any) {
      setBackupFeedback({ message: err.message || 'Lỗi khi sao lưu dữ liệu', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Subtabs */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaeaea] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                Quản Trị Hệ Thống & CSDL Khang An OS
                <span className="text-xs px-2 py-0.5 rounded bg-[#9f3244]/10 text-[#9f3244] font-mono font-bold">
                  ROLE_ADMIN
                </span>
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Kiểm tra 18 bảng CSDL PostgreSQL, Trình xem/Copy mã SQL Supabase, Nhật ký hệ thống và Công cụ Sao lưu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMasterModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#fbf8f5] hover:bg-[#f0dfe2] text-[#9f3244] border border-[#f0dfe2] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dữ Liệu Nền</span>
            </button>

            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#9f3244] hover:bg-[#7a2432] text-white transition cursor-pointer shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Đã chép SQL' : 'Copy SQL'}</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-[#fbf8f5] text-[#7a2432] border border-[#eaeaea] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#9f3244]" />
              <span>.sql</span>
            </button>
          </div>
        </div>

        {/* Admin Subtabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setActiveAdminTab('tables')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'tables'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>18 Bảng CSDL (PostgreSQL)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('sql')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'sql'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Mã SQL Supabase (DDL/DML)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'audit'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Nhật Ký Hệ Thống (Audit Logs)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'backup'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cấu Hình Kết Nối & Sao Lưu</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('fifo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'fifo'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Mô Phỏng ACID FIFO</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('rbac')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'rbac'
                ? 'bg-[#9f3244] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Phân Quyền RBAC 11 Roles</span>
          </button>
        </div>
      </div>

      {backupFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            backupFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{backupFeedback.message}</span>
          <button onClick={() => setBackupFeedback(null)} className="font-bold underline text-xs">
            Đóng
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {activeAdminTab === 'tables' && <TableInspector />}

      {activeAdminTab === 'sql' && (
        <SqlViewer
          sqlContent={rawSql}
          onCopy={handleCopySql}
          isCopied={isCopied}
          onDownload={handleDownloadSql}
        />
      )}

      {activeAdminTab === 'audit' && (
        <SecurityModule
          currentRole={currentRole}
          currentUserId={currentUserId}
          defaultSubTab="audit"
        />
      )}

      {activeAdminTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Connection Status Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e293b]">Trạng Thái Kết Nối PostgreSQL</h3>
                    <p className="text-[11px] text-[#64748b]">Engine lưu trữ phân tán Khang An OS</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HOẠT ĐỘNG
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-[#f8f9fa] p-4 rounded-xl border border-[#eaeaea]">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Database Host:</span>
                  <span className="font-bold text-[#1e293b]">aws-0-ap-southeast-1.pooler.supabase.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Port / Protocol:</span>
                  <span className="font-bold text-[#1e293b]">5432 / PostgreSQL 16.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Isolation Level:</span>
                  <span className="font-bold text-[#9f3244]">READ COMMITTED + FOR UPDATE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Số Bảng Hiện Hữu:</span>
                  <span className="font-bold text-emerald-700">18 Bảng Chuẩn Hóa 3NF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Row-Level Security (RLS):</span>
                  <span className="font-bold text-emerald-700">Đã Kích Hoạt (Enabled)</span>
                </div>
              </div>
            </div>

            {/* System Backup & Restore Tool Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b]">Công Cụ Sao Lưu & Phục Hồi Dữ Liệu</h3>
                  <p className="text-[11px] text-[#64748b]">Snapshot toàn bộ 18 bảng nghiệp vụ</p>
                </div>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed">
                Quản trị viên có thể xuất bản sao lưu toàn vẹn hệ thống định dạng JSON chuẩn (bao gồm danh mục, sản phẩm, tồn kho các lô FIFO, đơn hàng, hóa đơn và nhật ký kiểm toán) để lưu trữ ngoại vi hoặc phục hồi khi có sự cố.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleExportSystemBackup}
                  className="px-4 py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất File Sao Lưu Hệ Thống (.JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'fifo' && <FifoSimulator />}

      {activeAdminTab === 'rbac' && <RbacMatrix />}
    </div>
  );
};

export default AdminPage;
