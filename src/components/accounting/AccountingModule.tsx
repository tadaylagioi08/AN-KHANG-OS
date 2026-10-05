import React, { useState } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { FinancialTransaction, PeriodLock, UserRole, FinDocType } from '../../types/erp';
import {
  FileSpreadsheet,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  DollarSign,
  CreditCard,
  FileCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

interface AccountingModuleProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({
  currentRole,
  currentUserId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit_lock' | 'transactions'>('audit_lock');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(erpStorage.getFinancialTransactions());
  const [periodLocks, setPeriodLocks] = useState<PeriodLock[]>(erpStorage.getPeriodLocks());

  // Transaction form states
  const [isAddingTx, setIsAddingTx] = useState<boolean>(false);
  const [docType, setDocType] = useState<FinDocType>('RECEIPT');
  const [customerId, setCustomerId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [txAmount, setTxAmount] = useState<number>(10000000);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [txNote, setTxNote] = useState<string>('');

  // Unlock modal states
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [unlockReason, setUnlockReason] = useState<string>('');

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const refreshData = () => {
    setTransactions(erpStorage.getFinancialTransactions());
    setPeriodLocks(erpStorage.getPeriodLocks());
  };

  const customers = erpStorage.getCustomers();
  const suppliers = erpStorage.getSuppliers();

  // Active Month Lock Status
  const currentPeriodLock = periodLocks.find((l) => l.month === selectedMonth && l.year === selectedYear);
  const isCurrentMonthLocked = currentPeriodLock?.is_locked === true;

  // 8 Checks Evaluation
  const auditEvaluation = erpStorage.evaluate8Checks(selectedMonth, selectedYear);

  const isCeo = currentRole === UserRole.ROLE_CEO;
  const isChiefAccountant = currentRole === UserRole.ROLE_CHIEF_ACCOUNTANT;

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  // Handle Save Transaction with Anti-Duplicate Check
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setFeedback({ message: 'Vui lòng nhập Số hóa đơn tài chính!', type: 'error' });
      return;
    }

    try {
      const newTx = erpStorage.createFinancialTransaction({
        docType,
        customerId: customerId || null,
        supplierId: supplierId || null,
        amount: txAmount,
        invoiceNumber,
        paymentMethod,
        note: txNote,
        createdBy: currentUserId,
      });

      refreshData();
      setIsAddingTx(false);
      setInvoiceNumber('');
      setTxNote('');
      setFeedback({
        message: `ĐÃ LẬP CHỨNG TỪ THÀNH CÔNG [${newTx.doc_code}]: Số hóa đơn "${newTx.invoice_number}" hợp lệ (Không trùng lặp). Đã ghi nhận sổ kế toán!`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi thêm chứng từ', type: 'error' });
    }
  };

  // Handle Period Lock (Requires 8/8 checks passed)
  const handleExecuteLock = () => {
    try {
      const lock = erpStorage.lockPeriod(selectedMonth, selectedYear, currentUserId, currentRole);
      refreshData();
      setFeedback({
        message: `ĐÃ KHÓA SỔ THÀNH CÔNG KỲ THÁNG ${selectedMonth}/${selectedYear} (ĐẠT 8/8 PHÉP ĐỐI CHIẾU):
- Hệ thống đóng băng và chặn toàn bộ hành vi thêm/sửa/xóa mọi chứng từ và kho thuộc tháng này.
- Đã đóng băng số liệu hoa hồng kinh doanh và sinh biểu mẫu "Đề nghị thanh toán hoa hồng".`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  // Handle Period Unlock (CEO Only)
  const handleExecuteUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockReason.trim()) {
      setFeedback({ message: 'Bắt buộc phải nhập Lý do mở khóa sổ để lưu vết kiểm toán!', type: 'error' });
      return;
    }

    try {
      erpStorage.unlockPeriod(selectedMonth, selectedYear, unlockReason, currentUserId, currentRole);
      refreshData();
      setIsUnlockModalOpen(false);
      setUnlockReason('');
      setFeedback({
        message: `TỔNG GIÁM ĐỐC ĐÃ MỞ KHÓA SỔ THÁNG ${selectedMonth}/${selectedYear}! Lý do lưu vết: "${unlockReason}".`,
        type: 'warning',
      });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 text-white shadow-lg shadow-purple-950">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Module Kế Toán & Khóa Sổ Cuối Tháng
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Vai trò: {currentRole}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chống trùng hóa đơn tài chính · Đối chiếu 8 phép kiểm toán · Khóa sổ đóng băng hoa hồng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Year Selector */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Calendar className="w-4 h-4 text-purple-400 ml-1" />
              <span className="text-slate-400">Kỳ khóa sổ:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-bold"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-bold"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-1 bg-[#f8f9fa] p-1 rounded-xl border border-[#eaeaea]">
              <button
                onClick={() => setActiveSubTab('audit_lock')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer ${
                  activeSubTab === 'audit_lock'
                    ? 'bg-[#9f3244] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Kiểm Toán 8 Phép
              </button>
              <button
                onClick={() => setActiveSubTab('transactions')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer ${
                  activeSubTab === 'transactions'
                    ? 'bg-[#9f3244] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Sổ Thu Chi & Hóa Đơn
              </button>
            </div>
          </div>
        </div>

        {/* Lock Status Alert */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isCurrentMonthLocked
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCurrentMonthLocked ? <Lock className="w-5 h-5 text-rose-600 shrink-0" /> : <Unlock className="w-5 h-5 text-emerald-600 shrink-0" />}
            <div>
              <span className="font-bold">
                {isCurrentMonthLocked
                  ? `KỲ THÁNG ${selectedMonth}/${selectedYear} ĐÃ KHÓA SỔ BỞI KẾ TOÁN TRƯỞNG`
                  : `KỲ THÁNG ${selectedMonth}/${selectedYear} ĐANG MỞ (Chưa Khóa Sổ)`}
              </span>
              <div className="text-[11px] opacity-80 mt-0.5">
                {isCurrentMonthLocked
                  ? `Đã kích hoạt đóng băng toàn bộ giao dịch. Chỉ CEO mới có quyền mở khóa sổ.`
                  : `Hệ thống đạt ${auditEvaluation.checksPassed}/8 phép kiểm toán. Cần đạt 8/8 để mở quyền khóa sổ.`}
              </div>
            </div>
          </div>

          <div>
            {isCurrentMonthLocked ? (
              isCeo ? (
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  CEO Mở Khóa Sổ
                </button>
              ) : (
                <span className="text-[11px] text-[#64748b] italic">
                  Chỉ CEO có quyền mở khóa
                </span>
              )
            ) : (
              <button
                onClick={handleExecuteLock}
                disabled={!auditEvaluation.isReadyToLock}
                className="px-4 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                KHÓA SỔ THÁNG {selectedMonth} (Yêu cầu 8/8)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedback.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            )}
            <div className="whitespace-pre-line leading-relaxed">{feedback.message}</div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-mono px-2 py-0.5 rounded cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* --- SUB-TAB 1: KIỂM TOÁN 8 PHÉP & KHÓA SỔ THÁNG --- */}
      {activeSubTab === 'audit_lock' && (
        <div className="space-y-6">
          {/* 8 Checks Checklist Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#9f3244]" />
                  Màn Hình Kiểm Toán: Đối Chiếu 8 Phép Cuối Tháng (Tháng {selectedMonth}/{selectedYear})
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Ràng buộc toàn vẹn kế toán: Đạt đủ 8/8 tiêu chí đối soát thì nút <strong>"KHÓA SỔ THÁNG"</strong> mới sáng lên.
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-bold font-mono px-3 py-1 rounded-xl border ${
                    auditEvaluation.checksPassed === 8
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {auditEvaluation.checksPassed} / 8 Đạt Chuẩn
                </span>
              </div>
            </div>

            {/* The 8 Check Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditEvaluation.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-3.5 rounded-xl border transition ${
                    chk.passed
                      ? 'bg-[#fbf8f5] border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-[#1e293b]">
                      <span className="w-5 h-5 rounded-full bg-[#f8f9fa] text-[#64748b] text-[10px] font-mono flex items-center justify-center shrink-0 border border-[#eaeaea]">
                        {chk.id}
                      </span>
                      <span>{chk.title}</span>
                    </div>

                    {chk.passed ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ĐẠT CHUẨN
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-rose-700 flex items-center gap-1 shrink-0">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> CHƯA KHỚP
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#64748b] mt-1">{chk.description}</p>
                  <div className="text-[10px] text-[#94a3b8] font-mono mt-1 pt-1 border-t border-[#eaeaea]">
                    Chi tiết: {chk.details}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMMISSION PAYMENT REQUEST FORM (FREEZED UPON LOCK) */}
          {currentPeriodLock && currentPeriodLock.commission_report && (
            <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#1e293b] uppercase tracking-wider">
                    Biểu Mẫu: Đề Nghị Thanh Toán Hoa Hồng (Kỳ Tháng {selectedMonth}/{selectedYear})
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded border border-purple-200 font-semibold">
                  Đã Đóng Băng Số Liệu (Locked)
                </span>
              </div>

              <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-mono text-[11px]">
                      <th className="py-2.5 px-3">Nhân Sự</th>
                      <th className="py-2.5 px-3">Vị Trí</th>
                      <th className="py-2.5 px-3">Doanh Số Đơn Hoàn Tất</th>
                      <th className="py-2.5 px-3">% Hoa Hồng</th>
                      <th className="py-2.5 px-3 text-right">Tiền Hoa Hồng Đề Nghị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {currentPeriodLock.commission_report.map((comm) => (
                      <tr key={comm.userId} className="hover:bg-[#fbf8f5]">
                        <td className="py-2.5 px-3 font-semibold text-[#1e293b]">
                          {comm.fullName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#64748b]">
                          {comm.role}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#1e293b]">
                          {formatVND(comm.completedSalesRevenue)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">
                          {comm.commissionRate}%
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-right">
                          {formatVND(comm.commissionAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#eaeaea] bg-[#fbf8f5] font-bold text-xs">
                      <td colSpan={4} className="py-2.5 px-3 text-[#64748b] text-right uppercase">
                        Tổng Tiền Hoa Hồng Kỳ Này:
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 text-right text-sm">
                        {formatVND(
                          currentPeriodLock.commission_report.reduce((s, c) => s + c.commissionAmount, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-[11px] text-[#64748b] italic">
                * Bảng hoa hồng đã được phê duyệt và đóng băng tự động. Kế toán trưởng lập phiếu chi chuyển khoản theo danh sách trên.
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUB-TAB 2: SỔ THU CHI & CHỐNG TRÙNG HÓA ĐƠN --- */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#9f3244]" />
              Sổ Chứng Từ Thu / Chi / Hóa Đơn ({transactions.length} Chứng từ)
            </h3>

            <button
              onClick={() => setIsAddingTx(!isAddingTx)}
              disabled={isCurrentMonthLocked}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isAddingTx ? 'Đóng form' : 'Lập Chứng Từ Mới'}
            </button>
          </div>

          {/* Form Lập Chứng Từ Thu Chi với Chống Trùng Hóa Đơn */}
          {isAddingTx && (
            <form
              onSubmit={handleSaveTransaction}
              className="p-5 rounded-2xl bg-white border border-[#eaeaea] space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2.5">
                <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                  Lập Chứng Từ Kế Toán & Kiểm Tra Trùng Hóa Đơn
                </span>
                <span className="text-[11px] text-[#9f3244] font-mono font-bold">
                  UNIQUE (invoice_number)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Loại chứng từ</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as FinDocType)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  >
                    <option value="RECEIPT">RECEIPT (Phiếu Thu Tiền)</option>
                    <option value="PAYMENT">PAYMENT (Phiếu Chi Tiền)</option>
                    <option value="VAT_OUT">VAT_OUT (Hóa Đơn Đầu Ra)</option>
                    <option value="VAT_IN">VAT_IN (Hóa Đơn Đầu Vào)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">
                    Số Hóa Đơn / Mã Chứng Từ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vd: HDBR-2026-001 hoặc HDV-00123"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] font-mono uppercase font-bold focus:outline-none focus:bg-white focus:border-[#9f3244]"
                  />
                  <span className="text-[10px] text-amber-700 mt-1 block">
                    Cơ chế chống trùng: Hệ thống sẽ chặn ngay nếu số hóa đơn này đã tồn tại!
                  </span>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Số tiền giao dịch (VNĐ)</label>
                  <input
                    type="number"
                    min="1000"
                    step="50000"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] font-mono font-bold focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Khách hàng liên quan (nếu có)</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  >
                    <option value="">-- Không chọn --</option>
                    {customers.map((c, idx) => (
                      <option key={c.id ? `${c.id}-${idx}` : `cust-${idx}`} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Nhà cung cấp liên quan (nếu có)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  >
                    <option value="">-- Không chọn --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Phương thức thanh toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Chuyển Khoản Ngân Hàng</option>
                    <option value="CASH">Tiền Mặt</option>
                    <option value="POS">Quẹt Thẻ POS</option>
                    <option value="QR_CODE">VietQR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1">Diễn giải nội dung chứng từ</label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="Khách hàng thanh toán tiền cọc đơn sỉ..."
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTx(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#64748b] text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Lưu Chứng Từ
                </button>
              </div>
            </form>
          )}

          {/* Transactions Table */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-3 px-4">Mã Chứng Từ</th>
                  <th className="py-3 px-4">Loại Chứng Từ</th>
                  <th className="py-3 px-4">Số Hóa Đơn (UNIQUE)</th>
                  <th className="py-3 px-4">Đối Tượng</th>
                  <th className="py-3 px-4">Phương Thức</th>
                  <th className="py-3 px-4 text-right">Số Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94a3b8]">
                      Chưa có chứng từ nào được ghi nhận. Bấm <strong>"Lập Chứng Từ Mới"</strong> để ghi sổ.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const cust = customers.find((c) => c.id === tx.customer_id);
                    const supp = suppliers.find((s) => s.id === tx.supplier_id);

                    return (
                      <tr key={tx.id} className="hover:bg-[#fbf8f5] transition font-mono">
                        <td className="py-3 px-4 font-bold text-[#1e293b]">
                          {tx.doc_code}
                          <div className="text-[10px] text-[#64748b] font-normal font-sans">
                            {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.doc_type === 'RECEIPT'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tx.doc_type === 'PAYMENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {tx.doc_type}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-amber-700">
                          {tx.invoice_number}
                        </td>

                        <td className="py-3 px-4 font-sans text-[#1e293b]">
                          {cust ? cust.name : supp ? supp.name : '—'}
                          {tx.note && <div className="text-[10px] text-[#64748b] italic">"{tx.note}"</div>}
                        </td>

                        <td className="py-3 px-4 text-[#64748b]">
                          {tx.payment_method}
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-[#1e293b]">
                          <span className={tx.doc_type === 'RECEIPT' ? 'text-emerald-700' : 'text-[#1e293b]'}>
                            {formatVND(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CEO UNLOCK MODAL */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleExecuteUnlock}
            className="bg-white border border-[#eaeaea] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1e293b]">
                  CEO Mở Khóa Sổ Tháng {selectedMonth}/{selectedYear}
                </h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Hành động này sẽ được ghi vào <strong>audit_logs</strong>. Bắt buộc phải nhập lý do mở khóa sổ theo quy chuẩn quản trị.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#1e293b] font-bold block mb-1">
                Lý Do Mở Khóa Sổ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Điều chỉnh hóa đơn thuế GTGT theo biên bản kiểm tra quyết toán..."
                className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:bg-white focus:border-[#9f3244]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#eaeaea]">
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#64748b] text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Xác Nhận Mở Khóa Sổ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
