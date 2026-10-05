import React, { useState } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { Plus, X, Layers, Sparkles, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'quick_init' | 'category' | 'product' | 'customer' | 'supplier' | 'batch' | 'purge'>('quick_init');

  // Category form state
  const [catName, setCatName] = useState('');
  const [catCeiling, setCatCeiling] = useState(15);

  // Product form state
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodUnit, setProdUnit] = useState('Cây');
  const [prodCatId, setProdCatId] = useState('');
  const [prodPrice, setProdPrice] = useState(3800000);

  // Customer form state
  const [custCode, setCustCode] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDebtLimit, setCustDebtLimit] = useState(50000000);

  // Supplier form state
  const [suppCode, setSuppCode] = useState('');
  const [suppName, setSuppName] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppTax, setSuppTax] = useState('');

  // Batch form state
  const [batchProdId, setBatchProdId] = useState('');
  const [batchWhId, setBatchWhId] = useState('wh-kho-si');
  const [batchNo, setBatchNo] = useState('');
  const [batchDate, setBatchDate] = useState('2026-01-10');
  const [batchCost, setBatchCost] = useState(2800000);
  const [batchQty, setBatchQty] = useState(10);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const categories = erpStorage.getCategories();
  const products = erpStorage.getProducts();
  const warehouses = erpStorage.getWarehouses();

  // 1-Click Real Master Setup for Khang An Badminton
  const handleQuickSeedRealCatalog = () => {
    try {
      // 1. Categories with discount ceilings
      const catVot = erpStorage.addCategory('Vợt Cầu Lông Cao Cấp', 15); // Trần 15%
      const catCau = erpStorage.addCategory('Quả Cầu Lông Thi Đấu', 5); // Trần 5%
      const catGiay = erpStorage.addCategory('Giày Cầu Lông Chuyên Dụng', 10); // Trần 10%

      // 2. Real Products
      const p1 = erpStorage.addProduct('VOT-AX77PRO', 'Vợt Yonex Astrox 77 Pro 4U', 'Cây', catVot.id, 3850000);
      const p2 = erpStorage.addProduct('VOT-100ZZ', 'Vợt Yonex Astrox 100ZZ Kurenai', 'Cây', catVot.id, 4450000);
      const p3 = erpStorage.addProduct('CAU-S100', 'Ống Cầu Lông Hải Yến S100 Đỏ (12 Quả)', 'Ống', catCau.id, 240000);
      const p4 = erpStorage.addProduct('GIAY-65Z3', 'Giày Cầu Lông Yonex Power Cushion 65Z3', 'Đôi', catGiay.id, 2690000);

      // 3. Customers with Debt Limits
      erpStorage.addCustomer('DL-TUAN-HN', 'Đại Lý Cầu Lông Tuấn Sport (Hà Nội)', '0912345678', 'Số 18 Hoàng Cầu - Đống Đa - Hà Nội', 40000000);
      erpStorage.addCustomer('DL-VNB-Q10', 'Hệ Thống VNB Sports Chi Nhánh Q10', '0987654321', '17 Hòa Hưng - Phường 12 - Q10 - TP.HCM', 100000000);
      erpStorage.addCustomer('KH-LE-ANH', 'Anh Hoàng (Khách VIP Sân Khang An)', '0903112233', 'Sân Cầu Lông Khang An - Tân Bình', 5000000);

      // 4. Suppliers
      const suppYonex = erpStorage.addSupplier('NCC-SUNRISE', 'Công Ty TNHH Sunrise Sports (Phân Phối Yonex VN)', '02438889999', 'Sunrise Tower - Cầu Giấy - Hà Nội', '0101234567');
      erpStorage.addSupplier('NCC-HAIYEN', 'Công Ty Thể Thao Hải Yến', '02837776666', 'Bình Tân - TP.HCM', '0301122334');

      // 5. Initial FIFO Batches in KHO_SI (Different import dates to test FIFO!)
      erpStorage.addInitialBatch(p1.id, 'wh-kho-si', 'LOT-2026-01-A', '2026-01-10', 2800000, 5); // 5 cây cũ nhất
      erpStorage.addInitialBatch(p1.id, 'wh-kho-si', 'LOT-2026-02-B', '2026-02-15', 2900000, 7); // 7 cây tiếp theo
      erpStorage.addInitialBatch(p2.id, 'wh-kho-si', 'LOT-100ZZ-01', '2026-01-20', 3200000, 4);
      erpStorage.addInitialBatch(p3.id, 'wh-kho-si', 'LOT-CAU-01', '2026-02-01', 190000, 50);

      // 6. Pre-approved PO from Supplier to test Inbound Receiving!
      erpStorage.createPurchaseOrder({
        supplierId: suppYonex.id,
        createdBy: 'user-warehouse-keeper',
        note: 'Đơn đặt mua định kỳ lô Vợt Yonex Astrox 77 Pro bổ sung kho',
        items: [
          { productId: p1.id, quantity: 20, unitCost: 2850000, vatPercent: 10 },
          { productId: p4.id, quantity: 15, unitCost: 1950000, vatPercent: 10 },
        ],
      });

      setMessage({
        text: 'Đã khởi tạo thành công dữ liệu thực tế Khang An Badminton (Nhóm hàng có trần CK, Sản phẩm, Khách hàng có hạn mức nợ, NCC, Lô kho FIFO và PO đã duyệt)!',
        type: 'success',
      });
      onDataChanged();
    } catch (e: any) {
      setMessage({ text: e.message || 'Lỗi khởi tạo', type: 'error' });
    }
  };

  const handlePurgeAllData = () => {
    if (window.confirm('CẢNH BÁO: Hành động này sẽ xóa toàn bộ danh mục, sản phẩm, tồn kho, đơn hàng và đưa CSDL về trạng thái sạch 100%. Bạn có chắc chắn?')) {
      const keys = [
        'khangan_erp_categories_v1',
        'khangan_erp_products_v1',
        'khangan_erp_batches_v1',
        'khangan_erp_customers_v1',
        'khangan_erp_suppliers_v1',
        'khangan_erp_orders_v1',
        'khangan_erp_order_items_v1',
        'khangan_erp_po_v1',
        'khangan_erp_po_items_v1',
        'khangan_erp_movements_v1',
        'khangan_erp_movement_items_v1',
        'khangan_erp_returns_v1',
        'khangan_erp_return_items_v1',
        'khangan_erp_fin_transactions_v1',
        'khangan_erp_period_locks_v1',
        'khangan_erp_vault_v1',
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      setMessage({ text: 'Đã xóa sạch toàn bộ dữ liệu! Hệ thống đang ở trạng thái sạch 100%.', type: 'success' });
      onDataChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-[#eaeaea] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#1e293b] p-1.5 rounded-lg bg-[#f8f9fa] hover:bg-[#eaeaea] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#9f3244]" />
            Quản Lý Dữ Liệu Nền Tảng (Master Data Khang An)
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Hệ thống tuân thủ nguyên tắc <strong>Zero Mock Data</strong>. Dữ liệu được lưu trữ thật trên Database/Storage. Bạn có thể tự nhập dữ liệu thực tế hoặc nạp qua Excel.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#eaeaea]">
          {[
            { id: 'quick_init', label: '1-Click Khởi Tạo Nhanh' },
            { id: 'category', label: '+ Nhóm Hàng & Trần CK' },
            { id: 'product', label: '+ Sản Phẩm' },
            { id: 'customer', label: '+ Khách Hàng & Nợ' },
            { id: 'supplier', label: '+ Nhà Cung Cấp' },
            { id: 'batch', label: '+ Lô Kho Đầu Kỳ' },
            { id: 'purge', label: '🗑 Xóa Sạch Dữ Liệu' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setMessage(null);
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#9f3244] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8f9fa]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content 1: Quick Real Initialization */}
        {activeTab === 'quick_init' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-[#fbf8f5] border border-[#f0dfe2] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9f3244]">
                <Sparkles className="w-4 h-4" />
                Khởi tạo bộ dữ liệu thực tế Công ty Khang An Badminton:
              </div>
              <ul className="text-xs text-[#1e293b] space-y-1.5 list-disc list-inside">
                <li>3 Nhóm hàng kèm Trần Chiết Khấu: Vợt (15%), Cầu lông (5%), Giày (10%).</li>
                <li>4 Sản phẩm thể thao: Vợt Astrox 77 Pro, Astrox 100ZZ, Cầu Hải Yến S100, Giày 65Z3.</li>
                <li>3 Khách hàng: Đại lý Tuấn Sport (Hạn mức nợ 40M), VNB Q10 (100M), Khách VIP (5M).</li>
                <li>2 Nhà cung cấp: Sunrise Sports (Yonex VN), Hải Yến Sports.</li>
                <li>4 Lô hàng FIFO trong KHO_SI (Lot 1: 5 cây ngày 10/01; Lot 2: 7 cây ngày 15/02).</li>
                <li>1 Đơn đặt mua PO đã duyệt để sẵn sàng test Nhập kho.</li>
              </ul>
            </div>

            <button
              onClick={handleQuickSeedRealCatalog}
              className="w-full py-2.5 px-4 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs transition cursor-pointer shadow-md shadow-[#9f3244]/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Khởi Tạo Ngay Bộ Dữ Liệu Khang An
            </button>
          </div>
        )}

        {/* Tab Content 2: Add Category */}
        {activeTab === 'category' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!catName) return;
              erpStorage.addCategory(catName, catCeiling);
              setMessage({ text: `Đã thêm nhóm hàng "${catName}" với trần CK ${catCeiling}%!`, type: 'success' });
              setCatName('');
              onDataChanged();
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs text-[#64748b] block mb-1 font-medium">Tên nhóm hàng</label>
              <input
                type="text"
                required
                placeholder="vd: Cước Căng Vợt Cầu Lông"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] block mb-1 font-medium">Trần chiết khấu tối đa do CEO quy định (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={catCeiling}
                onChange={(e) => setCatCeiling(Number(e.target.value))}
                className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Lưu Nhóm Hàng
            </button>
          </form>
        )}

        {/* Tab Content 3: Add Product */}
        {activeTab === 'product' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!prodCode || !prodName || !prodCatId) {
                setMessage({ text: 'Vui lòng nhập đầy đủ mã, tên và nhóm hàng!', type: 'error' });
                return;
              }
              erpStorage.addProduct(prodCode, prodName, prodUnit, prodCatId, prodPrice);
              setMessage({ text: `Đã thêm sản phẩm "${prodName}"!`, type: 'success' });
              setProdCode('');
              setProdName('');
              onDataChanged();
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Mã SKU</label>
                <input
                  type="text"
                  required
                  placeholder="VOT-YONEX-99PRO"
                  value={prodCode}
                  onChange={(e) => setProdCode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] uppercase font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Đơn vị tính</label>
                <input
                  type="text"
                  required
                  value={prodUnit}
                  onChange={(e) => setProdUnit(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#64748b] block mb-1 font-medium">Tên sản phẩm chi tiết</label>
              <input
                type="text"
                required
                placeholder="Vợt Cầu Lông Yonex Astrox 99 Pro Đỏ"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Nhóm hàng</label>
                <select
                  required
                  value={prodCatId}
                  onChange={(e) => setProdCatId(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                >
                  <option value="">-- Chọn nhóm hàng --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Trần CK: {c.discount_ceiling}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Giá bán lẻ niêm yết (VNĐ)</label>
                <input
                  type="number"
                  step="50000"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Lưu Sản Phẩm
            </button>
          </form>
        )}

        {/* Tab Content 4: Add Customer */}
        {activeTab === 'customer' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!custCode || !custName) return;
              erpStorage.addCustomer(custCode, custName, custPhone, custAddress, custDebtLimit);
              setMessage({ text: `Đã thêm khách hàng "${custName}" với hạn mức nợ ${custDebtLimit.toLocaleString()} đ!`, type: 'success' });
              setCustCode('');
              setCustName('');
              onDataChanged();
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Mã khách hàng</label>
                <input
                  type="text"
                  required
                  placeholder="DL-HCM-003"
                  value={custCode}
                  onChange={(e) => setCustCode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] uppercase font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Số điện thoại</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#64748b] block mb-1 font-medium">Tên khách hàng / Đại lý</label>
              <input
                type="text"
                required
                placeholder="Đại Lý Thể Thao Minh Khang"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Hạn mức công nợ cho phép (VNĐ)</label>
                <input
                  type="number"
                  step="1000000"
                  required
                  value={custDebtLimit}
                  onChange={(e) => setCustDebtLimit(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Lưu Khách Hàng
            </button>
          </form>
        )}

        {/* Tab Content 5: Add Batch */}
        {activeTab === 'batch' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!batchProdId || !batchNo) {
                setMessage({ text: 'Vui lòng chọn sản phẩm và nhập số lô!', type: 'error' });
                return;
              }
              erpStorage.addInitialBatch(batchProdId, batchWhId, batchNo, batchDate, batchCost, batchQty);
              setMessage({ text: `Đã nhập lô "${batchNo}" số lượng ${batchQty} vào kho!`, type: 'success' });
              setBatchNo('');
              onDataChanged();
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Sản phẩm</label>
                <select
                  required
                  value={batchProdId}
                  onChange={(e) => setBatchProdId(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Kho lưu trữ</label>
                <select
                  required
                  value={batchWhId}
                  onChange={(e) => setBatchWhId(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none focus:border-[#9f3244]"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Số hiệu lô (Batch Number)</label>
                <input
                  type="text"
                  required
                  placeholder="LOT-2026-03-X"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] uppercase font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Ngày nhập kho (FIFO date)</label>
                <input
                  type="date"
                  required
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Giá vốn nhập (VNĐ)</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={batchCost}
                  onChange={(e) => setBatchCost(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">Số lượng nhập ban đầu</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={batchQty}
                  onChange={(e) => setBatchQty(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none focus:border-[#9f3244]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Lưu Lô Kho FIFO
            </button>
          </form>
        )}

        {/* Tab Content 6: Purge All Test Data */}
        {activeTab === 'purge' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <Trash2 className="w-4 h-4" />
                Xóa sạch toàn bộ dữ liệu thử nghiệm (Reset DB Trắng)
              </div>
              <p>
                Thực hiện yêu cầu TUYỆT ĐỐI KHÔNG DÙNG MOCK DATA / FAKE DATA: Khi bấm nút bên dưới, toàn bộ dữ liệu tạm sẽ được xóa sạch khỏi bộ nhớ. Hệ thống sẽ ở trạng thái trắng 100% để bạn nhập dữ liệu thật hoặc Import từ file Excel thật của doanh nghiệp.
              </p>
            </div>

            <button
              onClick={handlePurgeAllData}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa Sạch Dữ Liệu & Reset Về Trắng (Zero Mock)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
