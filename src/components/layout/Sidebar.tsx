import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  CircleDollarSign,
  FolderLock,
  Settings,
  Upload,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types/erp';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  currentUserName: string;
  currentUserRoleTitle: string;
  onOpenExcelImport: () => void;
  onLogoutOrSwitch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  currentUserName,
  currentUserRoleTitle,
  onOpenExcelImport,
  onLogoutOrSwitch,
}) => {
  const isAdmin = currentRole === UserRole.ROLE_ADMIN;

  // Navigation menu items according to strict RBAC specifications
  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      roles: [
        UserRole.ROLE_CEO,
        UserRole.ROLE_SALES_MANAGER,
        UserRole.ROLE_SALES_REP,
        UserRole.ROLE_STORE_MANAGER,
        UserRole.ROLE_WAREHOUSE_KEEPER,
        UserRole.ROLE_CHIEF_ACCOUNTANT,
        UserRole.ROLE_ACCOUNTANT_WHOLESALE,
        UserRole.ROLE_ACCOUNTANT_RETAIL,
        UserRole.ROLE_LEGAL,
        UserRole.ROLE_MARKETING,
        UserRole.ROLE_EVENT,
        UserRole.ROLE_DESIGNER,
      ],
    },
    {
      id: 'customers',
      label: 'Khách hàng & Đối tác',
      icon: Users,
      roles: [
        UserRole.ROLE_CEO,
        UserRole.ROLE_SALES_MANAGER,
        UserRole.ROLE_SALES_REP,
        UserRole.ROLE_CHIEF_ACCOUNTANT,
        UserRole.ROLE_ACCOUNTANT_WHOLESALE,
        UserRole.ROLE_ACCOUNTANT_RETAIL,
      ],
    },
    {
      id: 'sales',
      label: 'Đơn hàng & Bán hàng',
      icon: ShoppingBag,
      badge: 'Tách A/B',
      roles: [
        UserRole.ROLE_CEO,
        UserRole.ROLE_SALES_MANAGER,
        UserRole.ROLE_SALES_REP,
        UserRole.ROLE_STORE_MANAGER,
        UserRole.ROLE_ACCOUNTANT_WHOLESALE,
        UserRole.ROLE_ACCOUNTANT_RETAIL,
      ],
    },
    {
      id: 'warehouse',
      label: 'Kho hàng & FIFO',
      icon: Package,
      badge: 'FIFO',
      roles: [
        UserRole.ROLE_CEO,
        UserRole.ROLE_SALES_MANAGER,
        UserRole.ROLE_STORE_MANAGER,
        UserRole.ROLE_WAREHOUSE_KEEPER,
        UserRole.ROLE_CHIEF_ACCOUNTANT,
        UserRole.ROLE_ACCOUNTANT_WHOLESALE,
        UserRole.ROLE_ACCOUNTANT_RETAIL,
      ],
    },
    {
      id: 'accounting',
      label: 'Tài chính & Sổ quỹ',
      icon: CircleDollarSign,
      badge: '8 Phép',
      roles: [
        UserRole.ROLE_CEO,
        UserRole.ROLE_CHIEF_ACCOUNTANT,
        UserRole.ROLE_ACCOUNTANT_WHOLESALE,
        UserRole.ROLE_ACCOUNTANT_RETAIL,
      ],
    },
    {
      id: 'vault',
      label: 'Văn bản & Hợp đồng',
      icon: FolderLock,
      badge: 'Bảo mật',
      roles: [UserRole.ROLE_CEO, UserRole.ROLE_LEGAL],
    },
    // Technical Admin Menu: ONLY for ROLE_ADMIN (completely hidden from ROLE_CEO and others)
    {
      id: 'admin',
      label: 'Quản Trị Hệ Thống & CSDL',
      icon: Settings,
      badge: 'ADMIN',
      roles: [UserRole.ROLE_ADMIN],
    },
  ];

  // If ROLE_ADMIN: ONLY display technical menu; otherwise filter by user role
  const menuItems = isAdmin
    ? allMenuItems.filter((m) => m.id === 'admin')
    : allMenuItems.filter((m) => m.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-gradient-to-b from-[#9f3244] to-[#7a2432] text-white flex flex-col shrink-0 min-h-screen shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white text-[#9f3244] flex items-center justify-center font-black text-lg tracking-wider shadow-md shrink-0 border-2 border-white/20">
          KA
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
            KHANG AN OS
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          </div>
          <div className="text-[11px] text-white/70 font-light truncate">
            Internal Enterprise ERP
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
          Phân Hệ Quản Trị
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white text-[#9f3244] font-bold shadow-md shadow-black/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#9f3244]' : 'text-white/80'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#9f3244]/15 text-[#9f3244]'
                      : 'bg-white/15 text-white/90'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar Actions */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-black/10">
        <button
          onClick={onOpenExcelImport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/15"
          title="Nạp 5 file Excel mẫu không dữ liệu giả"
        >
          <Upload className="w-3.5 h-3.5 text-white" />
          <span>Import Excel Thật</span>
        </button>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-white/20 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-white truncate">{currentUserName}</div>
              <div className="text-[10px] text-white/60 truncate">{currentUserRoleTitle}</div>
            </div>
          </div>

          <button
            onClick={onLogoutOrSwitch}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
            title="Chuyển đổi tài khoản / Vai trò"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
