import React from 'react';
import {
  Database,
  ShieldCheck,
  Copy,
  Check,
  Download,
  FileText,
  Cpu,
  Lock,
  ShoppingBag,
  Truck,
  User,
  Sparkles,
  Layers,
  RotateCcw,
  FileSpreadsheet,
  FolderLock,
  Upload,
} from 'lucide-react';
import { UserRole } from '../types/erp';

export interface DesignatedUser {
  id: string;
  username: string;
  role: UserRole;
  label: string;
  badge: string;
}

export const DESIGNATED_USERS: DesignatedUser[] = [
  { id: 'user-admin', username: 'admin', role: UserRole.ROLE_ADMIN, label: 'Hải — Quản Trị Hệ Thống', badge: 'ROLE_ADMIN · Quản trị CSDL' },
  { id: 'user-ceo', username: 'ceo', role: UserRole.ROLE_CEO, label: 'Trí — Tổng Giám Đốc', badge: 'ROLE_CEO · Toàn quyền' },
  { id: 'user-sales-manager', username: 'sales_manager', role: UserRole.ROLE_SALES_MANAGER, label: 'Toàn — TP Kinh Doanh', badge: 'ROLE_SALES_MANAGER · Duyệt đơn' },
  { id: 'user-sales-rep', username: 'sales_rep', role: UserRole.ROLE_SALES_REP, label: 'An — Kinh Doanh', badge: 'ROLE_SALES_REP · Ẩn giá vốn' },
  { id: 'user-store-manager', username: 'store_manager', role: UserRole.ROLE_STORE_MANAGER, label: 'Cường — Cửa Hàng Trưởng', badge: 'ROLE_STORE_MANAGER · Chỉ Kho Lẻ' },
  { id: 'user-warehouse-keeper', username: 'warehouse_keeper', role: UserRole.ROLE_WAREHOUSE_KEEPER, label: 'My — Thủ kho', badge: 'ROLE_WAREHOUSE_KEEPER · Xuất FIFO' },
  { id: 'user-chief-accountant', username: 'chief_accountant', role: UserRole.ROLE_CHIEF_ACCOUNTANT, label: 'Thu — Kế Toán Trưởng', badge: 'ROLE_CHIEF_ACCOUNTANT · 8 Phép Kiểm' },
  { id: 'user-accountant-wholesale', username: 'accountant_wholesale', role: UserRole.ROLE_ACCOUNTANT_WHOLESALE, label: 'Khoa — Kế Toán Kho Sỉ', badge: 'ROLE_ACCOUNTANT_WHOLESALE · Kế toán Sỉ' },
  { id: 'user-accountant-retail', username: 'accountant_retail', role: UserRole.ROLE_ACCOUNTANT_RETAIL, label: 'Mai — Kế Toán Kho Lẻ', badge: 'ROLE_ACCOUNTANT_RETAIL · Kế toán Lẻ' },
  { id: 'user-legal', username: 'legal', role: UserRole.ROLE_LEGAL, label: 'Nga — TP Pháp Chế', badge: 'ROLE_LEGAL · Lưu văn thư' },
  { id: 'user-marketing', username: 'marketing', role: UserRole.ROLE_MARKETING, label: 'Linh — Marketing', badge: 'ROLE_MARKETING · Marketing' },
  { id: 'user-event', username: 'event', role: UserRole.ROLE_EVENT, label: 'Dũng — Sự Kiện', badge: 'ROLE_EVENT · Sự kiện' },
  { id: 'user-designer', username: 'designer', role: UserRole.ROLE_DESIGNER, label: 'Hương — Thiết Kế', badge: 'ROLE_DESIGNER · Thiết kế' },
];

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  currentUserId: string;
  onUserChange: (user: DesignatedUser) => void;
  onCopySql: () => void;
  isCopied: boolean;
  onDownloadSql: () => void;
  onOpenMasterModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  currentUserId,
  onUserChange,
  onCopySql,
  isCopied,
  onDownloadSql,
  onOpenMasterModal,
}) => {
  const isVaultAuthorized = currentRole === UserRole.ROLE_CEO || currentRole === UserRole.ROLE_LEGAL;

  const tabs = [
    { id: 'sales', label: 'Bán Hàng', icon: ShoppingBag, badge: 'Tách Đơn A/B' },
    { id: 'warehouse', label: 'Kho Hàng', icon: Truck, badge: 'FIFO & 2 Bước' },
    { id: 'returns', label: 'Trả / Đổi Hàng', icon: RotateCcw, badge: 'Hạn 30 Ngày' },
    { id: 'accounting', label: 'Kế Toán & Khóa Sổ', icon: FileSpreadsheet, badge: '8 Phép Kiểm' },
    { id: 'excel', label: 'Import Excel', icon: Upload, badge: '5 Mẫu Thật' },
    { id: 'security', label: 'Bảo Mật & Audit', icon: ShieldCheck, badge: 'Khóa 15 Phút' },
    ...(isVaultAuthorized
      ? [{ id: 'vault', label: 'Lưu Văn Thư', icon: FolderLock, badge: 'private_vault' }]
      : []),
    { id: 'schema', label: '18 Bảng CSDL', icon: Database, badge: 'PostgreSQL' },
    { id: 'sql', label: 'Mã SQL', icon: FileText, badge: 'Supabase' },
    { id: 'fifo', label: 'Mô Phỏng FIFO', icon: Cpu, badge: 'ACID Lock' },
    { id: 'rbac', label: '12 Roles & RLS', icon: Lock, badge: 'Bảo Mật' },
  ];

  const activeUser = DESIGNATED_USERS.find((u) => u.id === currentUserId || u.role === currentRole) || DESIGNATED_USERS[0];

  return (
    <header className="border-b border-[#f0dfe2] bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9f3244] flex items-center justify-center shadow-md shadow-[#9f3244]/20 text-white font-black text-lg tracking-wider shrink-0">
              KA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-[#1e293b] flex items-center gap-2">
                  KHANG AN OS
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#9f3244]/10 text-[#9f3244] border border-[#9f3244]/20 font-mono">
                    ERP Core
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Công ty TNHH Khang An Badminton · Hệ thống Quản trị Bán hàng, Kho FIFO & Tài chính
              </p>
            </div>
          </div>

          {/* Role Switcher & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            {/* Active User / Role Selector */}
            <div className="flex items-center gap-1.5 bg-[#fbf5f6] p-1 rounded-xl border border-[#f0dfe2]">
              <User className="w-3.5 h-3.5 text-[#9f3244] ml-1.5 shrink-0" />
              <span className="text-[11px] text-[#64748b] hidden sm:inline font-medium">Tài khoản:</span>
              <select
                value={activeUser.id}
                onChange={(e) => {
                  const found = DESIGNATED_USERS.find((u) => u.id === e.target.value);
                  if (found) onUserChange(found);
                }}
                className="bg-white border border-[#f0dfe2] text-[#1e293b] text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#9f3244] cursor-pointer shadow-xs"
              >
                {DESIGNATED_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Master Data Modal Trigger */}
            <button
              onClick={onOpenMasterModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#fbf5f6] hover:bg-[#f0dfe2] text-[#9f3244] border border-[#f0dfe2] transition cursor-pointer"
              title="Khởi tạo hoặc bổ sung Sản phẩm, Khách hàng, Lô kho FIFO"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9f3244]" />
              <span>Dữ Liệu Nền</span>
            </button>

            {/* Copy / Download SQL Buttons */}
            <button
              onClick={onCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#9f3244] hover:bg-[#7a2432] text-white transition cursor-pointer shadow-sm"
              title="Sao chép toàn bộ mã SQL PostgreSQL cho Supabase"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Đã chép SQL' : 'Copy SQL'}
            </button>

            <button
              onClick={onDownloadSql}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-[#fbf5f6] text-[#7a2432] border border-[#f0dfe2] transition cursor-pointer hidden sm:flex"
              title="Tải về file .sql"
            >
              <Download className="w-3.5 h-3.5 text-[#9f3244]" />
              .sql
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-[#f0dfe2] pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#9f3244] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#fbf5f6]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#9f3244]'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#9f3244]/10 text-[#9f3244]'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
