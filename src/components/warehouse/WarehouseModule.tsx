import React, { useState } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { Order, PurchaseOrder, StockMovement, UserRole, InventoryBatch } from '../../types/erp';
import {
  PackageCheck,
  PackagePlus,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  Truck,
  Plus,
} from 'lucide-react';

interface WarehouseModuleProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

export const WarehouseModule: React.FC<WarehouseModuleProps> = ({
  currentRole,
  currentUserId,
  onOpenMasterModal,
}) => {
  const [activeTab, setActiveTab] = useState<'outbound' | 'inbound' | 'transfer' | 'batches'>('outbound');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Data states
  const [orders, setOrders] = useState<Order[]>(erpStorage.getOrders());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(erpStorage.getPurchaseOrders());
  const [movements, setMovements] = useState<StockMovement[]>(erpStorage.getStockMovements());
  const [batches, setBatches] = useState<InventoryBatch[]>(erpStorage.getBatches());

  // Inbound Form States
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [inboundWhId, setInboundWhId] = useState<string>('wh-kho-si');
  const [actualReceivedMap, setActualReceivedMap] = useState<Record<string, { qty: number; batchNo: string }>>({});

  // Transfer Form States
  const [transferFromWh, setTransferFromWh] = useState<string>('wh-kho-si');
  const [transferToWh, setTransferToWh] = useState<string>('wh-kho-le');
  const [transferProdId, setTransferProdId] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNote, setTransferNote] = useState<string>('');

  const refreshData = () => {
    setOrders(erpStorage.getOrders());
    setPurchaseOrders(erpStorage.getPurchaseOrders());
    setMovements(erpStorage.getStockMovements());
    setBatches(erpStorage.getBatches());
  };

  const products = erpStorage.getProducts();
  const customers = erpStorage.getCustomers();
  const suppliers = erpStorage.getSuppliers();
  const warehouses = erpStorage.getWarehouses();

  const isSalesRep = currentRole === UserRole.ROLE_SALES_REP;
  const isStoreManager = currentRole === UserRole.ROLE_STORE_MANAGER;

  const allowedWarehouses = warehouses.filter((w) => !isStoreManager || w.code === 'KHO_LE');

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  // --- SUB-FEATURE 1: XUẤT KHO FIFO CHO ĐƠN ĐÃ DUYỆT ---
  const handleFulfillOrderFIFO = (order: Order) => {
    try {
      const result = erpStorage.fulfillOrderOutboundFIFO(order.id, currentUserId);
      refreshData();

      const allocatedSummary = result.allocatedBatches
        .map((b) => `${b.qty} sp từ Lô ${b.batchNumber} (Giá vốn: ${formatVND(b.unitCost)})`)
        .join(', ');

      setFeedback({
        message: `XUẤT KHO FIFO THÀNH CÔNG [${result.movementCode}]:
- Đã trừ kho theo các lô cũ nhất: ${allocatedSummary}
- Chốt giá vốn đơn hàng (COGS): ${formatVND(result.cogsTotal)}
- Tự động ghi tăng công nợ khách hàng: Thêm ${formatVND(order.total_amount - order.prepaid_amount)} -> Dư nợ mới: ${formatVND(result.newCustomerDebt)}`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi xuất kho', type: 'error' });
    }
  };

  // --- SUB-FEATURE 2: NHẬP KHO TỪ PO ĐÃ DUYỆT ---
  const selectedPO = purchaseOrders.find((p) => p.id === selectedPoId);

  const handleSelectPO = (poId: string) => {
    setSelectedPoId(poId);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po && po.items) {
      const initialMap: Record<string, { qty: number; batchNo: string }> = {};
      po.items.forEach((it) => {
        initialMap[it.product_id] = {
          qty: it.quantity, // Mặc định số lượng thực nhận bằng PO
          batchNo: `LOT-${po.po_code}-${Date.now().toString().slice(-4)}`,
        };
      });
      setActualReceivedMap(initialMap);
    }
  };

  const handleExecuteInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) {
      setFeedback({ message: 'BẮT BUỘC người dùng phải chọn một Đơn đặt mua (PO) đã duyệt!', type: 'error' });
      return;
    }

    try {
      const itemsToReceive = (selectedPO.items || []).map((it) => ({
        productId: it.product_id,
        actualQuantity: Number(actualReceivedMap[it.product_id]?.qty || 0),
        batchNumber: actualReceivedMap[it.product_id]?.batchNo || `LOT-${selectedPO.po_code}`,
      }));

      const res = erpStorage.receiveInboundPO({
        poId: selectedPO.id,
        warehouseId: inboundWhId,
        operatorId: currentUserId,
        receivedItems: itemsToReceive,
      });

      refreshData();
      setSelectedPoId('');

      if (res.hasOverReceipt) {
        const excessInfo = res.overReceiptItems
          .map((x) => `Mã ${x.productCode}: Đặt ${x.poQty}, nhận thực tế ${x.actualQty} (thừa ${x.excessQty})`)
          .join('; ');

        setFeedback({
          message: `NHẬP KHO HOÀN TẤT [${res.movementCode}] - CÓ CẢNH BÁO MÀU VÀNG:
⚠ CẢNH BÁO: Nhận thừa hàng so với PO: ${excessInfo}
- Đã tạo các lô mới trong kho theo giá vốn PO.
- Tự động sinh công nợ phải trả Nhà cung cấp (+${formatVND(res.totalSupplierDebtAdded)}) -> Dư nợ mới: ${formatVND(res.newSupplierDebt)}`,
          type: 'warning',
        });
      } else {
        setFeedback({
          message: `NHẬP KHO THÀNH CÔNG [${res.movementCode}]:
- Đã tạo lô mới theo đúng số lượng thực nhận.
- Tự động sinh công nợ phải trả Nhà cung cấp: +${formatVND(res.totalSupplierDebtAdded)} -> Dư nợ mới: ${formatVND(res.newSupplierDebt)}`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi nhập kho', type: 'error' });
    }
  };

  // --- SUB-FEATURE 3: CHUYỂN KHO 2 BƯỚC ---
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProdId) {
      setFeedback({ message: 'Vui lòng chọn sản phẩm cần chuyển kho!', type: 'error' });
      return;
    }
    if (transferFromWh === transferToWh) {
      setFeedback({ message: 'Kho xuất và kho nhận phải khác nhau!', type: 'error' });
      return;
    }

    try {
      const movement = erpStorage.createWarehouseTransfer({
        fromWarehouseId: transferFromWh,
        toWarehouseId: transferToWh,
        operatorId: currentUserId,
        operatorRole: currentRole,
        items: [{ productId: transferProdId, quantity: transferQty }],
        note: transferNote,
      });

      refreshData();
      setTransferProdId('');
      setTransferQty(1);
      setTransferNote('');

      setFeedback({
        message: `BƯỚC 1 HOÀN TẤT: Đã tạo phiếu xuất chuyển [${movement.movement_code}]. Trạng thái: "pending" (Đang chuyển). Kho nhận cần vào bấm "Xác nhận đã nhận" để hoàn tất.`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi điều chuyển', type: 'error' });
    }
  };

  const handleConfirmTransfer = (movementId: string) => {
    try {
      const res = erpStorage.confirmWarehouseTransfer(movementId, currentUserId, currentRole);
      refreshData();
      setFeedback({
        message: `BƯỚC 2 HOÀN TẤT: Cửa hàng đã kiểm tra và bấm "Xác nhận đã nhận" cho phiếu [${res.movement_code}]. Hàng hóa đã chính thức nhập vào kho đích!`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi xác nhận chuyển kho', type: 'error' });
    }
  };

  // Strict filtering for Store Manager (only allowed KHO_LE)
  const approvedOrders = orders.filter((o) => {
    if (o.status !== 'approved') return false;
    if (isStoreManager) {
      const wh = warehouses.find((w) => w.id === o.warehouse_id);
      return wh?.code === 'KHO_LE';
    }
    return true;
  });

  const visibleBatches = batches.filter((b) => {
    if (isStoreManager) {
      const wh = warehouses.find((w) => w.id === b.warehouse_id);
      return wh?.code === 'KHO_LE';
    }
    return true;
  });

  const approvedPOs = purchaseOrders.filter((p) => p.status === 'approved');
  const pendingTransfers = movements.filter((m) => m.movement_type === 'TRANSFER' && m.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub Navigation */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center font-bold shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e293b]">
                Quản Lý Kho Hàng & Vận Hành FIFO
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Xuất kho trừ lô FIFO tự động · Nhập kho theo PO · Quy trình điều chuyển 2 bước
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'outbound', label: '1. Xuất Kho FIFO', badge: approvedOrders.length },
              { id: 'inbound', label: '2. Nhập Kho Từ PO', badge: approvedPOs.length },
              { id: 'transfer', label: '3. Chuyển Kho 2 Bước', badge: pendingTransfers.length },
              { id: 'batches', label: '4. Tra Cứu Lô FIFO', badge: batches.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFeedback(null);
                }}
                className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#9f3244] text-white shadow-xs'
                    : 'bg-[#f8f9fa] text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#9f3244]/10 text-[#9f3244]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
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
            {feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            ) : feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
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

      {/* --- TAB 1: XUẤT KHO FIFO CHO ĐƠN ĐÃ DUYỆT --- */}
      {activeTab === 'outbound' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#9f3244]" />
              Danh Sách Đơn Hàng Đã Duyệt Chờ Xuất Kho FIFO ({approvedOrders.length})
            </h3>
            <span className="text-[11px] text-[#64748b]">
              Quy tắc: Tự động trừ lô nhập trước (FIFO) & tăng công nợ phải thu của khách
            </span>
          </div>

          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Kho Xuất</th>
                  <th className="py-3 px-4">Mặt Hàng Cần Xuất</th>
                  <th className="py-3 px-4">Giá Trị / Tiền Cọc</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {approvedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94a3b8]">
                      Hiện không có đơn hàng nào ở trạng thái <strong>'approved'</strong> chờ xuất kho.
                      <br />
                      <span className="text-[11px] text-[#64748b]">
                        Vào Module Bán Hàng tạo đơn và xác nhận duyệt để đơn xuất hiện tại đây.
                      </span>
                    </td>
                  </tr>
                ) : (
                  approvedOrders.map((ord) => {
                    const cust = customers.find((c) => c.id === ord.customer_id);
                    const wh = warehouses.find((w) => w.id === ord.warehouse_id);

                    return (
                      <tr key={ord.id} className="hover:bg-[#fbf8f5] transition">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-[#1e293b]">{ord.order_code}</div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            approved
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1e293b]">{cust?.name}</div>
                          <div className="text-[11px] text-[#64748b] font-mono">
                            Dư nợ hiện tại: {formatVND(cust?.current_debt || 0)}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[#64748b]">
                          {wh?.name} ({wh?.code})
                        </td>

                        <td className="py-3 px-4 font-mono text-[#1e293b]">
                          {ord.items?.map((it) => {
                            const p = products.find((prod) => prod.id === it.product_id);
                            return (
                              <div key={it.id} className="text-[11px]">
                                • {p?.code}: <strong>{it.quantity} {p?.unit}</strong>
                              </div>
                            );
                          })}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-[#1e293b] font-bold">{formatVND(ord.total_amount)}</div>
                          <div className="text-[10px] text-sky-700">
                            Đã cọc: {formatVND(ord.prepaid_amount)}
                          </div>
                          <div className="text-[10px] text-amber-700">
                            Ghi nợ thêm: {formatVND(ord.total_amount - ord.prepaid_amount)}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleFulfillOrderFIFO(ord)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <PackageCheck className="w-4 h-4" />
                            Xuất Kho FIFO
                          </button>
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

      {/* --- TAB 2: NHẬP KHO TỪ ĐƠN ĐẶT MUA (PO) --- */}
      {activeTab === 'inbound' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#fbf8f5] border border-[#eaeaea] space-y-1">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-amber-600" />
              Quy Trình Nhập Kho Bắt Buộc Theo Đơn Mua PO Đã Phê Duyệt
            </div>
            <p className="text-xs text-[#64748b]">
              Nhập kho không được tạo tùy tiện mà <strong>bắt buộc phải gắn liền với Đơn đặt mua hàng (PO)</strong> đã được phê duyệt. Hệ thống sẽ so khớp số lượng thực nhận và bật <strong>CẢNH BÁO MÀU VÀNG</strong> nếu nhận thừa.
            </p>
          </div>

          <form onSubmit={handleExecuteInbound} className="p-6 rounded-2xl bg-white border border-[#eaeaea] space-y-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#1e293b] font-bold block mb-1">
                  Chọn Đơn Đặt Mua (PO) Đã Duyệt <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedPoId}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none transition shadow-inner"
                >
                  <option value="">-- Chọn đơn PO đã duyệt --</option>
                  {approvedPOs.map((p) => {
                    const supp = suppliers.find((s) => s.id === p.supplier_id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.po_code} - {supp?.name} (Tổng: {formatVND(p.total_amount + p.vat_total)})
                      </option>
                    );
                  })}
                </select>
                {approvedPOs.length === 0 && (
                  <div className="text-[11px] text-amber-700 mt-1">
                    Chưa có PO nào được duyệt. Bấm nút "Dữ Liệu Nền" để kiểm tra hoặc tạo PO mới.
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-[#1e293b] font-bold block mb-1">
                  Kho Tiếp Nhận Hàng <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={inboundWhId}
                  onChange={(e) => setInboundWhId(e.target.value)}
                  className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none transition shadow-inner"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PO Line Items & Actual Received Inputs */}
            {selectedPO && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center justify-between">
                  <span>Chi Tiết Mặt Hàng Trong {selectedPO.po_code}</span>
                  <span className="text-[11px] text-[#64748b] font-normal">
                    Nhập đúng số lượng thực tế kiểm đếm tại cửa kho
                  </span>
                </div>

                <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                        <th className="py-2.5 px-3">Sản Phẩm</th>
                        <th className="py-2.5 px-3">SL Theo PO</th>
                        <th className="py-2.5 px-3">SL Thực Nhận</th>
                        <th className="py-2.5 px-3">Số Hiệu Lô Nhập (FIFO)</th>
                        <th className="py-2.5 px-3">Giá Vốn Nhập</th>
                        <th className="py-2.5 px-3">Cảnh Báo Kiểm Đếm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaea]">
                      {selectedPO.items?.map((it) => {
                        const prod = products.find((p) => p.id === it.product_id);
                        const actualQty = actualReceivedMap[it.product_id]?.qty ?? it.quantity;
                        const batchNo = actualReceivedMap[it.product_id]?.batchNo ?? '';
                        const isOver = actualQty > it.quantity;

                        return (
                          <tr key={it.id} className="hover:bg-[#fbf8f5]">
                            <td className="py-2 px-3">
                              <div className="font-mono font-bold text-[#1e293b]">{prod?.code}</div>
                              <div className="text-[11px] text-[#64748b]">{prod?.name}</div>
                            </td>

                            <td className="py-2 px-3 font-mono font-bold text-[#1e293b]">
                              {it.quantity} {prod?.unit}
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={actualQty}
                                onChange={(e) =>
                                  setActualReceivedMap({
                                    ...actualReceivedMap,
                                    [it.product_id]: {
                                      qty: Number(e.target.value) || 0,
                                      batchNo,
                                    },
                                  })
                                }
                                className={`w-24 border rounded px-2.5 py-1 text-xs font-mono font-bold focus:outline-none ${
                                  isOver
                                    ? 'border-amber-400 text-amber-700 bg-amber-50'
                                    : 'border-[#eaeaea] bg-[#f8f9fa] text-[#1e293b] focus:bg-white focus:border-[#9f3244]'
                                }`}
                              />
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={batchNo}
                                onChange={(e) =>
                                  setActualReceivedMap({
                                    ...actualReceivedMap,
                                    [it.product_id]: {
                                      qty: actualQty,
                                      batchNo: e.target.value,
                                    },
                                  })
                                }
                                placeholder="LOT-..."
                                className="w-36 bg-[#f8f9fa] border border-[#eaeaea] rounded px-2 py-1 text-xs text-[#1e293b] font-mono uppercase focus:bg-white focus:border-[#9f3244] focus:outline-none"
                              />
                            </td>

                            <td className="py-2 px-3 font-mono">
                              {isSalesRep ? (
                                <span className="text-amber-700 italic">*** (Bảo mật)</span>
                              ) : (
                                <span className="text-[#1e293b]">{formatVND(it.unit_cost)} (+{it.vat_percent}% VAT)</span>
                              )}
                            </td>

                            <td className="py-2 px-3">
                              {isOver ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Nhận Thừa +{actualQty - it.quantity}
                                </span>
                              ) : actualQty === it.quantity ? (
                                <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đủ theo PO
                                </span>
                              ) : (
                                <span className="text-[10px] text-sky-700 font-mono font-medium">
                                  Nhận thiếu ({actualQty}/{it.quantity})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <PackagePlus className="w-4 h-4" />
                    Xác Nhận Nhập Kho & Sinh Lô FIFO
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* --- TAB 3: CHUYỂN KHO 2 BƯỚC --- */}
      {activeTab === 'transfer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Step 1: Create Transfer */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#eaeaea] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#eaeaea] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#9f3244]/10 text-[#9f3244] text-xs font-mono font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                  Bước 1: Kho Sỉ Bấm "Xuất Chuyển" (Tạo Phiếu Pending)
                </h3>
              </div>

              {isStoreManager && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>Phân quyền Cửa hàng trưởng:</strong> Chỉ được phép tạo và nhận hàng tại <strong>KHO LẺ (KHO_LE)</strong>.
                  </span>
                </div>
              )}

              <form onSubmit={handleCreateTransfer} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#64748b] block mb-1">Kho xuất hàng</label>
                    <select
                      value={transferFromWh}
                      onChange={(e) => setTransferFromWh(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#64748b] block mb-1">Kho nhận hàng</label>
                    <select
                      value={transferToWh}
                      onChange={(e) => setTransferToWh(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Mặt hàng cần điều chuyển</label>
                  <select
                    required
                    value={transferProdId}
                    onChange={(e) => setTransferProdId(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map((p) => {
                      const avail = batches
                        .filter((b) => b.product_id === p.id && b.warehouse_id === transferFromWh && b.quantity_remaining > 0)
                        .reduce((s, b) => s + b.quantity_remaining, 0);

                      return (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name} (Tồn kho xuất: {avail} {p.unit})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Số lượng chuyển</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] font-mono focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#64748b] block mb-1">Ghi chú điều chuyển</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Chuyển hàng bổ sung chi nhánh bán lẻ..."
                    className="w-full bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] focus:bg-white focus:border-[#9f3244] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Bấm "Xuất Chuyển" (Gửi Thông Báo)
                </button>
              </form>
            </div>

            {/* Step 2: Confirm Transfer at Destination Warehouse */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#eaeaea] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold flex items-center justify-center border border-emerald-200">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                    Bước 2: Kho Nhận Kiểm Tra & Bấm "Xác Nhận Đã Nhận"
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-700 font-medium">
                  {pendingTransfers.length} phiếu đang chuyển
                </span>
              </div>

              <div className="space-y-3">
                {pendingTransfers.length === 0 ? (
                  <div className="p-8 text-center text-[#94a3b8] text-xs rounded-xl bg-[#fbf8f5] border border-[#eaeaea]">
                    Không có phiếu điều chuyển nào đang ở trạng thái 'pending' chờ xác nhận.
                  </div>
                ) : (
                  pendingTransfers.map((mv) => {
                    const fromW = warehouses.find((w) => w.id === mv.from_warehouse_id);
                    const toW = warehouses.find((w) => w.id === mv.to_warehouse_id);

                    return (
                      <div
                        key={mv.id}
                        className="p-4 rounded-xl bg-[#fbf8f5] border border-[#eaeaea] space-y-3 hover:border-[#9f3244]/40 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#9f3244]">
                              {mv.movement_code}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              Đang trên đường chuyển (pending)
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748b] font-mono">
                            {new Date(mv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-[#1e293b] bg-white p-2 rounded-lg border border-[#eaeaea]">
                          <span className="text-amber-700 font-semibold">{fromW?.code} ({fromW?.name})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                          <span className="text-emerald-700 font-semibold">{toW?.code} ({toW?.name})</span>
                        </div>

                        <div className="text-xs text-[#1e293b] font-mono space-y-1">
                          {mv.items?.map((it) => {
                            const prod = products.find((p) => p.id === it.product_id);
                            return (
                              <div key={it.id}>
                                Mặt hàng: <strong>{prod?.name}</strong> · Số lượng: <strong className="text-[#9f3244]">{it.quantity} {prod?.unit}</strong>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#eaeaea]">
                          <span className="text-[11px] text-[#64748b] italic">
                            {mv.note}
                          </span>

                          <button
                            onClick={() => handleConfirmTransfer(mv.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Xác Nhận Đã Nhận Hàng
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: TRA CỨU LÔ FIFO & TỒN KHO --- */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {/* Store Manager Warning Notice */}
          {isStoreManager && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Phân quyền Cửa Hàng Trưởng (ROLE_STORE_MANAGER):</strong> Đang giới hạn hiển thị duy nhất dữ liệu Kho Cửa Hàng Bán Lẻ (KHO_LE). Quyền truy cập Kho Sỉ (KHO_SI) bị chặn tuyệt đối.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9f3244]" />
              Sổ Chi Tiết Các Lô Kho FIFO (inventory_batches) - {visibleBatches.length} Lô
            </h3>
            {isSalesRep ? (
              <span className="text-xs font-mono text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Chế độ Salesman: Cột Giá Vốn Bị Ẩn Hoàn Toàn (RLS View)
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Eye className="w-3.5 h-3.5 text-emerald-600" /> Chế độ Kế toán / Quản lý: Hiển thị giá vốn nhập
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-3 px-4">Số Hiệu Lô (Batch)</th>
                  <th className="py-3 px-4">Sản Phẩm</th>
                  <th className="py-3 px-4">Kho Lưu Trữ</th>
                  <th className="py-3 px-4">Ngày Nhập (FIFO Priority)</th>
                  <th className="py-3 px-4">Giá Vốn Nhập (unit_cost)</th>
                  <th className="py-3 px-4">SL Ban Đầu</th>
                  <th className="py-3 px-4">SL Tồn Còn Lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {visibleBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#94a3b8]">
                      {isStoreManager
                        ? 'Kho Cửa Hàng Bán Lẻ (KHO_LE) hiện chưa có lô hàng nào. Hãy chuyển kho từ Kho Sỉ sang để có hàng.'
                        : 'Kho hiện chưa có lô hàng nào. Bấm "Dữ Liệu Nền" hoặc nhập kho từ PO để tạo lô FIFO.'}
                    </td>
                  </tr>
                ) : (
                  visibleBatches.map((b, idx) => {
                    const prod = products.find((p) => p.id === b.product_id);
                    const wh = warehouses.find((w) => w.id === b.warehouse_id);

                    return (
                      <tr key={b.id ? `${b.id}-${idx}` : `batch-${idx}`} className="hover:bg-[#fbf8f5] transition font-mono">
                        <td className="py-3 px-4 font-bold text-[#1e293b]">
                          {b.batch_number}
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-[#1e293b]">{prod?.name}</div>
                          <div className="text-[11px] text-[#64748b] font-mono">{prod?.code}</div>
                        </td>

                        <td className="py-3 px-4 text-[#64748b]">
                          {wh?.code} ({wh?.name})
                        </td>

                        <td className="py-3 px-4 text-emerald-700">
                          {b.import_date}
                        </td>

                        <td className="py-3 px-4">
                          {isSalesRep ? (
                            <span className="text-amber-700 italic font-sans text-[11px]">
                              *** (Bảo mật theo RLS)
                            </span>
                          ) : (
                            <span className="text-[#1e293b] font-bold">{formatVND(b.unit_cost)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[#64748b]">
                          {b.quantity_imported} {prod?.unit}
                        </td>

                        <td className="py-3 px-4 font-bold">
                          <span
                            className={
                              b.quantity_remaining > 0
                                ? 'text-emerald-700'
                                : 'text-slate-400 line-through'
                            }
                          >
                            {b.quantity_remaining} {prod?.unit}
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
    </div>
  );
};
