import React, { useState } from 'react';
import { erpStorage } from '../services/erpStorage';
import { Customer, Supplier, UserRole } from '../types/erp';
import {
  Users,
  Building,
  Plus,
  Search,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CustomersPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  currentRole,
  currentUserId,
  onOpenMasterModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(erpStorage.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(erpStorage.getSuppliers());

  // Form states for adding customer
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [custCode, setCustCode] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDebtLimit, setCustDebtLimit] = useState<number>(30000000);

  // Form states for adding supplier
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [suppCode, setSuppCode] = useState('');
  const [suppName, setSuppName] = useState('');
  const [suppTaxCode, setSuppTaxCode] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppAddress, setSuppAddress] = useState('');

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const refreshData = () => {
    setCustomers(erpStorage.getCustomers());
    setSuppliers(erpStorage.getSuppliers());
  };

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custCode.trim() || !custName.trim()) {
      setFeedback({ message: 'Vui lòng điền đủ Mã KH và Tên khách hàng!', type: 'error' });
      return;
    }

    try {
      erpStorage.addCustomer(custCode, custName, custPhone, custAddress, custDebtLimit);
      refreshData();
      setIsAddingCustomer(false);
      setCustCode('');
      setCustName('');
      setCustPhone('');
      setCustAddress('');
      setFeedback({ message: `Đã thêm khách hàng/đại lý "${custName}" thành công!`, type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi thêm khách hàng', type: 'error' });
    }
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppCode.trim() || !suppName.trim()) {
      setFeedback({ message: 'Vui lòng điền đủ Mã NCC và Tên nhà cung cấp!', type: 'error' });
      return;
    }

    try {
      erpStorage.addSupplier(suppCode, suppName, suppPhone, suppAddress, suppTaxCode);
      refreshData();
      setIsAddingSupplier(false);
      setSuppCode('');
      setSuppName('');
      setSuppTaxCode('');
      setSuppPhone('');
      setSuppAddress('');
      setFeedback({ message: `Đã thêm nhà cung cấp "${suppName}" thành công!`, type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi thêm NCC', type: 'error' });
    }
  };

  // Filtered lists
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tax_code && s.tax_code.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header and Toggle */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaeaea] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1e293b]">
              Quản Lý Khách Hàng & Đối Tác
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Hạn mức công nợ · Thông tin đại lý bán lẻ · Nhà cung cấp thiết bị cầu lông
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'customers' ? (
              <button
                onClick={() => setIsAddingCustomer(true)}
                className="px-4 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Khách Hàng / Đại Lý</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddingSupplier(true)}
                className="px-4 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhà Cung Cấp</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('customers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'customers'
                  ? 'bg-[#9f3244] text-white shadow-xs'
                  : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Khách Hàng & Đại Lý ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('suppliers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'suppliers'
                  ? 'bg-[#9f3244] text-white shadow-xs'
                  : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Nhà Cung Cấp ({suppliers.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#9f3244]"
            />
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            Đóng
          </button>
        </div>
      )}

      {/* Add Customer Modal/Form */}
      {isAddingCustomer && (
        <div className="p-6 rounded-2xl bg-white border border-[#9f3244]/30 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
            <h3 className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9f3244]" />
              Thêm Khách Hàng / Đại Lý Mới
            </h3>
            <button
              onClick={() => setIsAddingCustomer(false)}
              className="text-xs text-[#64748b] hover:text-[#1e293b] cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Mã Khách Hàng *</label>
                <input
                  type="text"
                  placeholder="VD: DL-TUAN-HN"
                  value={custCode}
                  onChange={(e) => setCustCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Tên Khách Hàng / Đại Lý *</label>
                <input
                  type="text"
                  placeholder="VD: Đại Lý Cầu Lông Tuấn Sport"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  placeholder="0912345678"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  placeholder="Quận/Huyện, Tỉnh/TP..."
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Hạn Mức Công Nợ (VNĐ)</label>
                <input
                  type="number"
                  step="5000000"
                  value={custDebtLimit}
                  onChange={(e) => setCustDebtLimit(Number(e.target.value) || 0)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#64748b] text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Lưu Khách Hàng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Modal/Form */}
      {isAddingSupplier && (
        <div className="p-6 rounded-2xl bg-white border border-[#9f3244]/30 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
            <h3 className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#9f3244]" />
              Thêm Nhà Cung Cấp Mới
            </h3>
            <button
              onClick={() => setIsAddingSupplier(false)}
              className="text-xs text-[#64748b] hover:text-[#1e293b] cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Mã NCC *</label>
                <input
                  type="text"
                  placeholder="VD: NCC-SUNRISE"
                  value={suppCode}
                  onChange={(e) => setSuppCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Tên Nhà Cung Cấp *</label>
                <input
                  type="text"
                  placeholder="VD: Công Ty TNHH Sunrise Sports"
                  value={suppName}
                  onChange={(e) => setSuppName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Mã Số Thuế</label>
                <input
                  type="text"
                  placeholder="0101234567"
                  value={suppTaxCode}
                  onChange={(e) => setSuppTaxCode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  placeholder="02438889999"
                  value={suppPhone}
                  onChange={(e) => setSuppPhone(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1e293b] block mb-1">Địa Chỉ Trụ Sở</label>
                <input
                  type="text"
                  placeholder="Tòa nhà, Đường, Quận/Huyện..."
                  value={suppAddress}
                  onChange={(e) => setSuppAddress(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSupplier(false)}
                className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#64748b] text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Lưu Nhà Cung Cấp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table View */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs">
        {activeSubTab === 'customers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-2.5 px-3">Mã KH</th>
                  <th className="py-2.5 px-3">Tên Khách Hàng / Đại Lý</th>
                  <th className="py-2.5 px-3">Số Điện Thoại</th>
                  <th className="py-2.5 px-3">Địa Chỉ</th>
                  <th className="py-2.5 px-3">Hạn Mức Nợ</th>
                  <th className="py-2.5 px-3 text-right">Dư Nợ Hiện Tại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#94a3b8]">
                      Chưa có khách hàng nào phù hợp bộ lọc. Bấm "Thêm Khách Hàng" hoặc "Import Excel".
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust, idx) => {
                    const isOverLimit = cust.current_debt > cust.debt_limit;
                    return (
                      <tr key={cust.id ? `${cust.id}-${idx}` : `cust-${idx}`} className="hover:bg-[#fbf8f5] transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1e293b]">
                          {cust.code}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1e293b]">
                          {cust.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#64748b]">
                          {cust.phone || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748b] truncate max-w-xs">
                          {cust.address || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#1e293b]">
                          {formatVND(cust.debt_limit)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span className={isOverLimit ? 'text-rose-600' : 'text-amber-700'}>
                            {formatVND(cust.current_debt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-2.5 px-3">Mã NCC</th>
                  <th className="py-2.5 px-3">Tên Nhà Cung Cấp</th>
                  <th className="py-2.5 px-3">Mã Số Thuế</th>
                  <th className="py-2.5 px-3">Số Điện Thoại</th>
                  <th className="py-2.5 px-3">Địa Chỉ</th>
                  <th className="py-2.5 px-3 text-right">Công Nợ Khang An Phải Trả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#94a3b8]">
                      Chưa có nhà cung cấp nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supp, idx) => {
                    return (
                      <tr key={supp.id ? `${supp.id}-${idx}` : `supp-${idx}`} className="hover:bg-[#fbf8f5] transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1e293b]">
                          {supp.code}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1e293b]">
                          {supp.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#64748b]">
                          {supp.tax_code || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#64748b]">
                          {supp.phone || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748b] truncate max-w-xs">
                          {supp.address || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#9f3244]">
                          {formatVND(supp.current_debt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
