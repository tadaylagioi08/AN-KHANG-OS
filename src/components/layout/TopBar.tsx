import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  Clock,
  Menu,
} from 'lucide-react';
import { UserRole } from '../../types/erp';
import { DesignatedUser, DESIGNATED_USERS } from '../Header';

interface TopBarProps {
  currentUser: DesignatedUser;
  onUserChange: (user: DesignatedUser) => void;
  onOpenMasterModal: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onUserChange,
  onOpenMasterModal,
  onToggleSidebar,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date in Vietnamese format
  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-[#eaeaea] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left: Mobile hamburger & Smart search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8f9fa] transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm khách hàng, SKU, đơn hàng, chứng từ..."
            className="w-full bg-[#f8f9fa] hover:bg-[#fbf8f5] focus:bg-white border border-[#eaeaea] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#9f3244] focus:ring-1 focus:ring-[#9f3244]/20 transition shadow-inner"
          />
        </div>
      </div>

      {/* Right: Date, Master Data, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fbf8f5] text-[#64748b] text-[11px] font-medium border border-[#eaeaea]">
          <Clock className="w-3.5 h-3.5 text-[#9f3244]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Master Data button */}
        <button
          onClick={onOpenMasterModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#fbf8f5] hover:bg-[#f0dfe2] text-[#9f3244] border border-[#f0dfe2] transition cursor-pointer"
          title="Khởi tạo hoặc cập nhật Sản phẩm, Danh mục, Khách hàng"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#9f3244]" />
          <span>Dữ Liệu Nền</span>
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white hover:bg-[#fbf8f5] border border-[#eaeaea] transition cursor-pointer shadow-xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#9f3244] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#1e293b] leading-tight">
                {currentUser.label}
              </div>
              <div className="text-[10px] text-[#9f3244] font-medium flex items-center gap-1">
                <span>{currentUser.badge}</span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#eaeaea] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-[#eaeaea]">
                <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  Chuyển Đổi Tài Khoản / Vai Trò (RBAC)
                </div>
                <div className="text-[11px] text-[#64748b] mt-0.5">
                  Chọn nhân sự để kiểm thử phân quyền 11 vai trò chuẩn kỹ thuật
                </div>
              </div>

              <div className="py-1 max-h-80 overflow-y-auto">
                {DESIGNATED_USERS.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserChange(user);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-[#fbf8f5] transition cursor-pointer ${
                        isSelected ? 'bg-[#9f3244]/5 border-l-3 border-[#9f3244]' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#9f3244] text-white'
                            : 'bg-[#f8f9fa] text-[#64748b] border border-[#eaeaea]'
                        }`}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className={`text-xs font-bold ${isSelected ? 'text-[#9f3244]' : 'text-[#1e293b]'}`}>
                          {user.label}
                        </div>
                        <div className="text-[10px] text-[#64748b] truncate mt-0.5">
                          {user.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
