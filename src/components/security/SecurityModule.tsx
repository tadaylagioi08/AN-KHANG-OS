import React, { useState, useEffect } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { UserRole, Profile, AuditLog, CompanyVault, CompanyVaultCategory } from '../../types/erp';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Search,
  RefreshCw,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Upload,
  Trash2,
  FolderLock,
  Layers,
  Fingerprint,
  Smartphone,
  Laptop,
  Monitor,
  Database,
  ArrowRight,
} from 'lucide-react';

interface SecurityModuleProps {
  currentRole: UserRole;
  currentUserId: string;
  onDataChanged?: () => void;
  defaultSubTab?: 'audit' | 'bruteforce' | 'sessions' | 'vault';
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({
  currentRole,
  currentUserId,
  onDataChanged,
  defaultSubTab = 'audit',
}) => {
  const [subTab, setSubTab] = useState<'audit' | 'bruteforce' | 'sessions' | 'vault'>(defaultSubTab);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [vaultDocs, setVaultDocs] = useState<CompanyVault[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Search & Filter state for Audit Logs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterCategory, setAuditFilterCategory] = useState<'ALL' | 'ORDERS' | 'WAREHOUSE' | 'SECURITY' | 'EXCEL' | 'VAULT' | 'PERIOD'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Brute-force simulation state
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<string>('salesman_minh');
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>('khangan@2026');

  // Change password / session revocation state
  const [userForPasswordChange, setUserForPasswordChange] = useState<string>('user-sales-01');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Vault upload state
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultCategory, setVaultCategory] = useState<CompanyVaultCategory>('LABOR_CONTRACT');
  const [vaultFileName, setVaultFileName] = useState('');
  const [vaultFileSizeKb, setVaultFileSizeKb] = useState(150);

  // Reload all security data
  const loadData = () => {
    const profs = erpStorage.getProfiles();
    setProfiles(profs);
    const logs = erpStorage.getAuditLogs();
    setAuditLogs(logs);
    const docs = erpStorage.getVaultDocuments(currentRole);
    setVaultDocs(docs);
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Check if role is authorized for Vault
  const isVaultAuthorized = currentRole === UserRole.ROLE_CEO || currentRole === UserRole.ROLE_LEGAL;

  // Handle Brute-force login attempt simulation
  const handleTestLogin = (isCorrect: boolean) => {
    setFeedback(null);
    try {
      const res = erpStorage.loginAttempt(selectedUserForLogin, isCorrect, currentUserId);
      loadData();
      if (onDataChanged) onDataChanged();

      if (res.isLocked) {
        setFeedback({
          message: res.message,
          type: 'error',
        });
      } else if (res.success) {
        setFeedback({
          message: res.message,
          type: 'success',
        });
      } else {
        setFeedback({
          message: res.message,
          type: 'warning',
        });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi kiểm tra đăng nhập', type: 'error' });
    }
  };

  // Manual Unlock by CEO
  const handleManualUnlock = (userId: string) => {
    try {
      const res = erpStorage.unlockAccount(userId, currentUserId);
      loadData();
      if (onDataChanged) onDataChanged();
      setFeedback({ message: res.message, type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  // Handle Change Password & Revoke All Old Sessions
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setFeedback({ message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ message: 'Mật khẩu xác nhận không khớp!', type: 'error' });
      return;
    }

    try {
      const res = erpStorage.changePasswordAndRevokeSessions(userForPasswordChange, currentUserId);
      loadData();
      if (onDataChanged) onDataChanged();
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({
        message: res.message,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi đổi mật khẩu', type: 'error' });
    }
  };

  // Handle Vault Document Upload
  const handleUploadVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim()) {
      setFeedback({ message: 'Vui lòng nhập tên/tiêu đề văn thư!', type: 'error' });
      return;
    }
    const fileName = vaultFileName.trim() || `scan_doc_${Date.now()}.pdf`;

    try {
      const doc = erpStorage.uploadVaultDocument({
        title: vaultTitle.trim(),
        category: vaultCategory,
        fileName,
        fileSizeKb: vaultFileSizeKb,
        operatorId: currentUserId,
        operatorRole: currentRole,
      });

      loadData();
      if (onDataChanged) onDataChanged();
      setVaultTitle('');
      setVaultFileName('');
      setFeedback({
        message: `Đã lưu văn thư mật "${doc.title}" vào Storage Bucket "private_vault" với đường dẫn mã hóa an toàn!`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi tải lên văn thư', type: 'error' });
    }
  };

  // Handle Vault Delete (CEO only)
  const handleDeleteVault = (id: string, title: string) => {
    if (currentRole !== UserRole.ROLE_CEO) {
      setFeedback({ message: 'Chỉ Giám đốc (CEO) mới có quyền xóa văn thư mật!', type: 'error' });
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa văn thư mật "${title}" khỏi hệ thống?`)) return;

    try {
      erpStorage.deleteVaultDocument(id, currentUserId, currentRole);
      loadData();
      if (onDataChanged) onDataChanged();
      setFeedback({ message: `Đã xóa văn thư "${title}" thành công.`, type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    // Search query
    const searchMatch =
      !auditSearch ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.table_name.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.user_id && log.user_id.toLowerCase().includes(auditSearch.toLowerCase())) ||
      JSON.stringify(log.new_data || {}).toLowerCase().includes(auditSearch.toLowerCase());

    if (!searchMatch) return false;

    // Category filter
    if (auditFilterCategory === 'ALL') return true;
    if (auditFilterCategory === 'ORDERS') return log.table_name === 'orders' || log.table_name === 'order_items';
    if (auditFilterCategory === 'WAREHOUSE') return log.table_name === 'inventory_batches' || log.table_name === 'stock_movements';
    if (auditFilterCategory === 'SECURITY') return log.action.includes('LOCK') || log.action.includes('PASSWORD') || log.action.includes('SECURITY') || log.table_name === 'profiles';
    if (auditFilterCategory === 'EXCEL') return log.action.includes('EXCEL');
    if (auditFilterCategory === 'VAULT') return log.table_name === 'company_vault';
    if (auditFilterCategory === 'PERIOD') return log.table_name === 'period_locks' || log.action.includes('PERIOD');

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs Navigation */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-700 text-white shadow-lg shadow-sky-950">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Bảo Mật Hệ Thống & Nhật Ký Kiểm Toán (Audit Log)
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  RLS & Security Core
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chống brute-force 5 lần khóa 15p · Thu hồi phiên khi đổi mật khẩu · Ngăn lưu văn thư (Chỉ Legal & CEO) · Ghi vết 100% thay đổi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium cursor-pointer border border-slate-700 transition"
              title="Làm mới số liệu"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'audit'
                ? 'bg-slate-800 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Nhật Ký Kiểm Toán (Audit Log)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-sky-500/20 text-sky-300">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('bruteforce')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'bruteforce'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Chống Dò Mật Khẩu (Khóa 15 Phút)</span>
          </button>

          <button
            onClick={() => setSubTab('sessions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'sessions'
                ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Quản Lý Phiên & Thu Hồi Token</span>
          </button>

          {/* VĂN THƯ MẬT: CHỈ HIỂN THỊ KHI ROLE LÀ LEGAL HOẶC CEO THEO YÊU CẦU ĐỀ BÀI */}
          {isVaultAuthorized ? (
            <button
              onClick={() => setSubTab('vault')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                subTab === 'vault'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
              }`}
            >
              <FolderLock className="w-4 h-4 text-emerald-400" />
              <span>Lưu Văn Thư Mật (Private Vault)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300">
                {vaultDocs.length}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-850 text-slate-600 text-xs cursor-not-allowed select-none" title="Chỉ Giám Đốc (CEO) và Pháp Chế (Legal) mới có quyền truy cập menu Lưu Văn Thư Mật">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="line-through">Lưu Văn Thư</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-600 font-mono">Bị ẩn bởi RLS</span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            )}
            <div className="whitespace-pre-line leading-relaxed">{feedback.message}</div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-mono px-2 py-0.5 rounded cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 1: AUDIT LOGS EXPLORER                                             */}
      {/* ========================================================================= */}
      {subTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Nhật Ký Hệ Thống (Audit Log - Bất Biến & Tự Động)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mọi hành động Thêm, Sửa, Xóa, Phê duyệt, Khóa sổ, Import Excel đều được ghi nhận với giá trị cũ (old) và giá trị mới (new)
              </p>
            </div>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'ORDERS', label: 'Đơn hàng' },
                { id: 'WAREHOUSE', label: 'Kho & FIFO' },
                { id: 'SECURITY', label: 'Bảo mật / Khóa' },
                { id: 'EXCEL', label: 'Excel Import' },
                { id: 'VAULT', label: 'Văn thư' },
                { id: 'PERIOD', label: 'Khóa sổ' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAuditFilterCategory(f.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                    auditFilterCategory === f.id
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo hành động, tên bảng, người dùng, hoặc nội dung dữ liệu thay đổi..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Thời Gian</th>
                    <th className="py-2.5 px-3">Người Thực Hiện</th>
                    <th className="py-2.5 px-3">Hành Động (Action)</th>
                    <th className="py-2.5 px-3">Bảng Tác Động</th>
                    <th className="py-2.5 px-3 text-right">Chi Tiết Thay Đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Chưa có bản ghi nhật ký kiểm toán phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      const date = new Date(log.timestamp);
                      const formattedTime = `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;

                      return (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-slate-900/50 transition">
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {formattedTime}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              <span className="font-semibold text-sky-400">
                                {log.user_id || 'SYSTEM_CRON'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-amber-500/20">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                {log.table_name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline underline-offset-2"
                              >
                                {isExpanded ? 'Ẩn Diff' : 'Xem Diff (Old/New)'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded JSON Diff Row */}
                          {isExpanded && (
                            <tr className="bg-slate-900/90 border-b border-slate-800">
                              <td colSpan={5} className="p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Old Value */}
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                                      GIÁ TRỊ CŨ (OLD DATA):
                                    </div>
                                    <pre className="p-3 rounded-lg bg-slate-950 border border-rose-500/20 text-rose-200 text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                                      {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'null (Bản ghi mới được tạo)'}
                                    </pre>
                                  </div>

                                  {/* New Value */}
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                      GIÁ TRỊ MỚI (NEW DATA):
                                    </div>
                                    <pre className="p-3 rounded-lg bg-slate-950 border border-emerald-500/20 text-emerald-200 text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                                      {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'null (Bản ghi đã bị xóa)'}
                                    </pre>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: CHỐNG DÒ MẬT KHẨU (BRUTE-FORCE LOCK 15 MINS)                    */}
      {/* ========================================================================= */}
      {subTab === 'bruteforce' && (
        <div className="space-y-6">
          {/* Status & Architecture Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Ngưỡng Chống Dò Mật Khẩu
              </div>
              <div className="text-lg font-bold text-white font-mono">5 Lần Sai Liên Tiếp</div>
              <div className="text-[11px] text-slate-400">Tự động kích hoạt khóa tài khoản chống Brute-Force</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Thời Gian Tạm Khóa (locked_until)
              </div>
              <div className="text-lg font-bold text-amber-300 font-mono">15 Phút Khóa Cứng</div>
              <div className="text-[11px] text-slate-400">Lưu trực tiếp trường `locked_until` trong PostgreSQL</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-sky-400" />
                Cơ Chế Mở Khóa Khẩn Cấp
              </div>
              <div className="text-lg font-bold text-sky-300 font-mono">CEO Override & Hết Giờ</div>
              <div className="text-[11px] text-slate-400">Tự mở sau 15 phút hoặc Giám đốc CEO mở thủ công</div>
            </div>
          </div>

          {/* Interactive Testing Sandbox */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                  Mô Phỏng Đăng Nhập & Kiểm Thử Khóa Tự Động 15 Phút
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chọn tài khoản để kiểm tra: thử đăng nhập sai 5 lần để quan sát cơ chế tự động khóa và ghi log
                </p>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Thao tác với tư cách: {currentRole.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Chọn Tài Khoản Kiểm Thử</label>
                <select
                  value={selectedUserForLogin}
                  onChange={(e) => setSelectedUserForLogin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.username}>
                      {p.username} - {p.full_name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Mật Khẩu Thử Nghiệm</label>
                <input
                  type="text"
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Nhập mật khẩu..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleTestLogin(false)}
                  className="flex-1 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-950 flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Thử Sai (Failed Attempt)
                </button>

                <button
                  onClick={() => handleTestLogin(true)}
                  className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Thử Đúng (Success)
                </button>
              </div>
            </div>
          </div>

          {/* Accounts Security Status Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                Danh Sách Tài Khoản & Trạng Thái Bảo Mật Hiện Tại (Bảng `profiles`)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{profiles.length} tài khoản</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Tài Khoản (Username)</th>
                    <th className="py-2.5 px-3">Họ Tên</th>
                    <th className="py-2.5 px-3">Vai Trò (Role)</th>
                    <th className="py-2.5 px-3 text-center">Số Lần Nhập Sai</th>
                    <th className="py-2.5 px-3">Trạng Thái Khóa (locked_until)</th>
                    <th className="py-2.5 px-3 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {profiles.map((p) => {
                    const isLocked = Boolean(p.locked_until && new Date(p.locked_until) > new Date());
                    const remainingMin = isLocked && p.locked_until
                      ? Math.ceil((new Date(p.locked_until).getTime() - Date.now()) / (1000 * 60))
                      : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-3 font-bold text-white">
                          {p.username}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.full_name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-sky-300 border border-slate-700">
                            {p.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              (p.failed_login_attempts || 0) >= 5
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : (p.failed_login_attempts || 0) > 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'text-slate-400'
                            }`}
                          >
                            {p.failed_login_attempts || 0} / 5
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <Lock className="w-3 h-3 text-rose-400" />
                              ĐANG KHÓA ({remainingMin} phút còn lại)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Hoạt động bình thường
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isLocked ? (
                            <button
                              onClick={() => handleManualUnlock(p.id)}
                              className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 ml-auto"
                              title="Giám đốc hoặc Quản trị viên mở khóa tài khoản"
                            >
                              <Unlock className="w-3 h-3" />
                              Mở Khóa Ngay
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: QUẢN LÝ PHIÊN & THU HỒI TOKEN                                  */}
      {/* ========================================================================= */}
      {subTab === 'sessions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Quản Lý Phiên (Session Management) & Thu Hồi Token Đăng Nhập Cũ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Khi người dùng đổi mật khẩu: Ngay lập tức thu hồi toàn bộ Token/Session đăng nhập cũ trên các thiết bị khác bằng cách tăng `session_version`
              </p>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tài Khoản Đổi Mật Khẩu</label>
                <select
                  value={userForPasswordChange}
                  onChange={(e) => setUserForPasswordChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.username}) - Phiên hiện tại: v{p.session_version || 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mật Khẩu Mới</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Xác Nhận Mật Khẩu Mới</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-950 cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Đổi Mật Khẩu & Thu Hồi Toàn Bộ Token Phiên Cũ
              </button>
            </form>
          </div>

          {/* Active Device Sessions Visual Simulation */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-sky-400" />
              Mô Phỏng Trạng Thái Phiên Thiết Bị (Device Sessions)
            </h3>
            <p className="text-xs text-slate-400">
              Kiểm tra cơ chế vô hiệu hóa phiên: Khi `session_version` thay đổi, các JWT Token chứa phiên cũ trên thiết bị khác sẽ bị từ chối lập tức.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    Web Admin (Thiết Bị Này)
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Trình duyệt: Chrome / Desktop</div>
                  <div>IP: 118.69.182.xx (Việt Nam)</div>
                  <div className="font-mono text-emerald-400">Phiên: Khớp session_version</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    App Di Động (Khang An Mobile)
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                    Token
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Thiết bị: iPhone 15 Pro Max</div>
                  <div>IP: 14.161.22.xx (4G Viettel)</div>
                  <div className="text-slate-500">Tự động logout nếu đổi mật khẩu</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <Monitor className="w-4 h-4 text-amber-400" />
                    Máy Bán Hàng POS (KHO_LE)
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Store Terminal
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Cửa hàng bán lẻ Khang An</div>
                  <div>IP: 115.78.10.xx (FPT Store)</div>
                  <div className="text-slate-500">Yêu cầu đăng nhập lại sau khi thu hồi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: LƯU VĂN THƯ MẬT (COMPANY VAULT)                                 */}
      {/* ========================================================================= */}
      {subTab === 'vault' && (
        <div className="space-y-6">
          {!isVaultAuthorized ? (
            /* RLS 403 Forbidden Screen */
            <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-300">
                  TRUY CẬP BỊ TỪ CHỐI BỞI POSTGRESQL ROW LEVEL SECURITY (RLS)
                </h3>
                <p className="text-xs text-rose-200/80 max-w-xl mx-auto">
                  Menu <strong>"Lưu văn thư mật"</strong> và Storage Bucket <code>private_vault</code> được thiết kế theo chính sách bảo mật tối cao: chỉ duy nhất <strong>Pháp Chế (legal)</strong> và <strong>Giám Đốc (ceo)</strong> mới có quyền truy cập.
                </p>
                <p className="text-xs text-slate-400 pt-2 font-mono">
                  Vai trò hiện tại của bạn: <span className="text-white font-bold">{currentRole.toUpperCase()}</span>. Vui lòng chuyển vai trò sang CEO hoặc Legal trên thanh điều hướng để xem văn thư.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Document Upload Box */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FolderLock className="w-4 h-4 text-emerald-400" />
                      Lưu Trữ Văn Thư Mật (Storage Bucket: `private_vault`)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toàn bộ file scan được mã hóa đường dẫn và lưu trữ an toàn trong bucket bí mật, chỉ CEO và Legal xem được
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AES-256 Encrypted
                  </span>
                </div>

                <form onSubmit={handleUploadVault} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300">Tiêu Đề Văn Thư Scan *</label>
                      <input
                        type="text"
                        placeholder="VD: Hợp đồng lao động Trưởng phòng KD 2026, Quy chế thưởng phạt..."
                        value={vaultTitle}
                        onChange={(e) => setVaultTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Phân Loại Văn Thư *</label>
                      <select
                        value={vaultCategory}
                        onChange={(e) => setVaultCategory(e.target.value as CompanyVaultCategory)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="LABOR_CONTRACT">Hợp Đồng Lao Động (LABOR_CONTRACT)</option>
                        <option value="REGULATION">Quy Chế Mật Nội Bộ (REGULATION)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Chọn File Scan Upload (PDF, PNG, JPG)</label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVaultFileName(file.name);
                            setVaultFileSizeKb(Math.round(file.size / 1024));
                          }
                        }}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Mã Hóa & Lưu Vào `private_vault`
                    </button>
                  </div>
                </form>
              </div>

              {/* Vault Documents List */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderLock className="w-4 h-4 text-emerald-400" />
                    Danh Mục Văn Thư Mật Đang Lưu Trữ ({vaultDocs.length} tài liệu)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Bucket: `private_vault`</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Tiêu Đề Văn Thư</th>
                        <th className="py-2.5 px-3">Phân Loại</th>
                        <th className="py-2.5 px-3">Đường Dẫn Mã Hóa (Encrypted Path)</th>
                        <th className="py-2.5 px-3">Mã Băm (Hash)</th>
                        <th className="py-2.5 px-3">Người Tải Lên</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {vaultDocs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            Chưa có văn thư mật nào trong Storage Bucket `private_vault`.
                          </td>
                        </tr>
                      ) : (
                        vaultDocs.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-2.5 px-3 font-semibold text-white">
                              {doc.title}
                              <div className="text-[10px] text-slate-500">
                                {doc.file_size_kb || 150} KB · {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  doc.doc_category === 'LABOR_CONTRACT'
                                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {doc.doc_category === 'LABOR_CONTRACT' ? 'Hợp Đồng Lao Động' : 'Quy Chế Mật'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400 truncate max-w-xs font-mono text-[11px]" title={doc.file_path}>
                              {doc.file_path}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                              {doc.encrypted_hash || 'AES256-SECURE'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {doc.uploaded_by}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {currentRole === UserRole.ROLE_CEO ? (
                                <button
                                  onClick={() => handleDeleteVault(doc.id, doc.title)}
                                  className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Chỉ CEO mới có quyền xóa văn thư"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">Chỉ đọc (Legal)</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
