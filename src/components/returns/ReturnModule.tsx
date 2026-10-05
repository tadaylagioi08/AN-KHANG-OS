import React, { useState } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { Order, ReturnOrder, UserRole, Product, Customer, RefundType } from '../../types/erp';
import {
  RotateCcw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Eye,
  CreditCard,
  DollarSign,
  RefreshCw,
  Sparkles,
  Package,
} from 'lucide-react';

interface ReturnModuleProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

export const ReturnModule: React.FC<ReturnModuleProps> = ({
  currentRole,
  currentUserId,
  onOpenMasterModal,
}) => {
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>(erpStorage.getReturnOrders());
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [refundType, setRefundType] = useState<RefundType>('DEBT_OFFSET');
  const [refundCashAmount, setRefundCashAmount] = useState<number>(0);
  const [debtOffsetAmount, setDebtOffsetAmount] = useState<number>(0);

  // Exchange states
  const [exchangeProductId, setExchangeProductId] = useState<string>('');
  const [exchangeQuantity, setExchangeQuantity] = useState<number>(1);
  const [exchangeUnitPrice, setExchangeUnitPrice] = useState<number>(0);
  const [returnNote, setReturnNote] = useState<string>('');

  // Selected items to return: map of productId -> { returnQty: number, condition: 'GOOD' | 'DEFECTIVE', unitPrice: number }
  const [returnItemsMap, setReturnItemsMap] = useState<
    Record<string, { returnQty: number; condition: 'GOOD' | 'DEFECTIVE'; unitPrice: number }>
  >({});

  const refreshData = () => {
    setReturnOrders(erpStorage.getReturnOrders());
  };

  const orders = erpStorage.getOrders();
  const products = erpStorage.getProducts();
  const customers = erpStorage.getCustomers();

  // Completed or approved orders that have goods fulfilled
  const eligibleOrders = orders.filter((o) => o.status === 'completed' || o.status === 'approved');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedCustomer = selectedOrder ? customers.find((c) => c.id === selectedOrder.customer_id) : null;

  // Calculate days since export
  let daysSinceExport = 0;
  let isOver30Days = false;
  if (selectedOrder) {
    const exportTime = new Date(selectedOrder.updated_at || selectedOrder.created_at).getTime();
    daysSinceExport = Math.floor((new Date().getTime() - exportTime) / (1000 * 3600 * 24));
    isOver30Days = daysSinceExport > 30;
  }

  const isCeo = currentRole === UserRole.ROLE_CEO;
  const canCreateForSelectedOrder = !isOver30Days || isCeo;

  // Select order handler
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord && ord.items) {
      const initialItems: Record<string, { returnQty: number; condition: 'GOOD' | 'DEFECTIVE'; unitPrice: number }> = {};
      ord.items.forEach((it) => {
        initialItems[it.product_id] = {
          returnQty: it.quantity,
          condition: 'GOOD',
          unitPrice: it.unit_price,
        };
      });
      setReturnItemsMap(initialItems);

      // Default calculation for debt offset and cash
      const initialTotal = ord.items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
      setDebtOffsetAmount(initialTotal);
      setRefundCashAmount(Math.min(initialTotal, ord.prepaid_amount));
    }
  };

  // Total value of return items
  const totalReturnValue = Object.entries(returnItemsMap).reduce((sum, [, item]) => {
    return sum + (item.returnQty > 0 ? item.returnQty * item.unitPrice : 0);
  }, 0);

  // Exchange difference calculation
  const exchangeTotalValue = exchangeProductId ? exchangeQuantity * exchangeUnitPrice : 0;
  const exchangeDiff = exchangeTotalValue - totalReturnValue;

  const handleSaveReturnOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) {
      setFeedback({ message: 'Vui lòng chọn đơn hàng gốc!', type: 'error' });
      return;
    }

    if (isOver30Days && !isCeo) {
      setFeedback({
        message: `Đơn hàng đã xuất quá 30 ngày (${daysSinceExport} ngày). Theo quy định, chỉ Tổng Giám Đốc (CEO) mới có quyền lập phiếu!`,
        type: 'error',
      });
      return;
    }

    const itemsToSubmit = Object.entries(returnItemsMap)
      .filter(([, v]) => v.returnQty > 0)
      .map(([prodId, v]) => ({
        productId: prodId,
        quantity: v.returnQty,
        unitPrice: v.unitPrice,
        condition: v.condition,
      }));

    if (itemsToSubmit.length === 0) {
      setFeedback({ message: 'Vui lòng chọn số lượng ít nhất 1 mặt hàng cần trả lại!', type: 'error' });
      return;
    }

    try {
      const res = erpStorage.createReturnOrder({
        originalOrderId: selectedOrder.id,
        operatorId: currentUserId,
        operatorRole: currentRole,
        refundType,
        items: itemsToSubmit,
        refundCashAmount: refundType === 'CASH_REFUND' ? refundCashAmount : 0,
        debtOffsetAmount: refundType === 'DEBT_OFFSET' ? debtOffsetAmount : 0,
        exchangeProductId: refundType === 'EXCHANGE' ? exchangeProductId : undefined,
        exchangeQuantity: refundType === 'EXCHANGE' ? exchangeQuantity : undefined,
        exchangeUnitPrice: refundType === 'EXCHANGE' ? exchangeUnitPrice : undefined,
        note: returnNote,
      });

      refreshData();
      setIsCreating(false);
      setSelectedOrderId('');

      setFeedback({
        message: `LẬP PHIẾU ĐỔI TRẢ THÀNH CÔNG [${res.return_code}]:
- Giá trị hàng trả: ${totalReturnValue.toLocaleString()} đ (${isOver30Days ? 'Được CEO duyệt ngoại lệ >30 ngày' : 'Trong hạn 30 ngày'})
- Tồn kho: Hàng tốt đã tạo lô tái nhập kho, Hàng lỗi được tách riêng phế phẩm.
- Kế toán: ${
          refundType === 'CASH_REFUND'
            ? `Đã hoàn tiền mặt: ${res.refund_cash_amount.toLocaleString()} đ (không vượt cọc)`
            : refundType === 'DEBT_OFFSET'
            ? `Đã cấn trừ giảm công nợ khách: -${res.debt_offset_amount.toLocaleString()} đ`
            : `Đổi hàng: Chênh lệch ${res.exchange_diff_amount! > 0 ? '+' : ''}${res.exchange_diff_amount?.toLocaleString()} đ đã điều chỉnh vào công nợ.`
        }`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi lập phiếu đổi trả', type: 'error' });
    }
  };

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-lg shadow-rose-950">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Module Trả Hàng / Đổi Hàng (Returns & Exchanges)
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Vai trò: {currentRole}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kiểm soát thời hạn 30 ngày · Phân loại Hàng tốt / Hàng lỗi · Hoàn tiền mặt & Cấn trừ nợ
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Đóng form' : 'Lập Phiếu Trả / Đổi Hàng'}
          </button>
        </div>

        {/* 3 Core Rules Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
            <div className="font-semibold text-rose-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              1. Chốt Chặn Thời Hạn 30 Ngày
            </div>
            <p className="text-slate-400 text-[11px]">
              Tính từ ngày xuất kho. Nếu &gt; 30 ngày: Khóa tính năng đối với nhân viên, chỉ tài khoản CEO mới có quyền lập phiếu ngoại lệ.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              2. Kiểm Hàng: Hàng Tốt vs Hàng Lỗi
            </div>
            <p className="text-slate-400 text-[11px]">
              Hàng tốt được tạo lô tái nhập kho. Hàng lỗi đưa vào khu vực phế phẩm, không ghi tăng tồn kho bán buôn.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              3. Kế Toán Xử Lý Tiền Chặt Chẽ
            </div>
            <p className="text-slate-400 text-[11px]">
              Hoàn tiền mặt tối đa bằng số tiền khách đã thực trả. Cấn trừ nợ giảm dư nợ. Đổi hàng tự tính chênh lệch tăng/giảm nợ.
            </p>
          </div>
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

      {/* FORM LẬP PHIẾU ĐỔI TRẢ */}
      {isCreating && (
        <form
          onSubmit={handleSaveReturnOrder}
          className="p-6 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Lập Phiếu Đổi / Trả Hàng Mới
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Người thao tác: {currentUserId} ({currentRole})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Chọn Đơn Hàng Gốc Cần Đổi / Trả <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => handleSelectOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">-- Chọn đơn hàng đã xuất --</option>
                {eligibleOrders.map((o) => {
                  const cust = customers.find((c) => c.id === o.customer_id);
                  const exportTime = new Date(o.updated_at || o.created_at).getTime();
                  const days = Math.floor((new Date().getTime() - exportTime) / (1000 * 3600 * 24));
                  return (
                    <option key={o.id} value={o.id}>
                      {o.order_code} - {cust?.name} (Xuất cách đây {days} ngày - Trị giá {formatVND(o.total_amount)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Phương Thức Xử Lý Tiền & Đổi Hàng <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DEBT_OFFSET', label: 'Cấn Trừ Nợ' },
                  { id: 'CASH_REFUND', label: 'Hoàn Tiền Mặt' },
                  { id: 'EXCHANGE', label: 'Đổi Hàng Khác' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRefundType(m.id as any)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                      refundType === m.id
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 30 DAYS CHECK RESULT BANNER */}
          {selectedOrder && (
            <div
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                isOver30Days
                  ? isCeo
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-start gap-2.5 text-xs">
                {isOver30Days ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                )}
                <div>
                  <div className="font-bold">
                    {isOver30Days
                      ? `ĐƠN HÀNG ĐÃ XUẤT CÁCH ĐÂY ${daysSinceExport} NGÀY (> 30 NGÀY)`
                      : `ĐƠN HÀNG TRONG HẠN QUY ĐỊNH (${daysSinceExport} NGÀY <= 30 NGÀY)`}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">
                    {isOver30Days ? (
                      isCeo ? (
                        <span>
                          ✓ Bạn đang đăng nhập với tư cách <strong>Tổng Giám Đốc (CEO)</strong>: Được phép duyệt ngoại lệ lập phiếu đổi trả sau 30 ngày.
                        </span>
                      ) : (
                        <span>
                          🔒 <strong>KHÓA TÍNH NĂNG:</strong> Quá hạn 30 ngày - Chỉ Giám đốc mới có quyền lập phiếu! Vui lòng chuyển vai trò sang CEO để thao tác.
                        </span>
                      )
                    ) : (
                      'Đơn hàng hợp lệ trong thời hạn bảo hành / đổi trả 30 ngày của Khang An Badminton.'
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-mono shrink-0">
                <div>Khách: <strong>{selectedCustomer?.name}</strong></div>
                <div>Đã cọc/trả: <strong className="text-sky-300">{formatVND(selectedOrder.prepaid_amount)}</strong></div>
              </div>
            </div>
          )}

          {/* ITEM INSPECTION TABLE (GOOD VS DEFECTIVE) */}
          {selectedOrder && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                <span>Kiểm Hàng Tại Cửa Kho & Phân Loại Chất Lượng</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Hàng tốt: Tạo lô tái nhập kho · Hàng lỗi: Chuyển phế phẩm
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Sản Phẩm Đơn Gốc</th>
                      <th className="py-2.5 px-3">Đơn Giá Bán</th>
                      <th className="py-2.5 px-3">Số Lượng Trả</th>
                      <th className="py-2.5 px-3">Phân Loại Kiểm Hàng Tại Kho</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền Trả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {selectedOrder.items?.map((it) => {
                      const prod = products.find((p) => p.id === it.product_id);
                      const currentVal = returnItemsMap[it.product_id] || {
                        returnQty: 0,
                        condition: 'GOOD',
                        unitPrice: it.unit_price,
                      };

                      return (
                        <tr key={it.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3">
                            <div className="font-mono font-bold text-white">{prod?.code}</div>
                            <div className="text-[11px] text-slate-400">{prod?.name}</div>
                            <div className="text-[10px] text-slate-500">Đã mua trong đơn: {it.quantity} {prod?.unit}</div>
                          </td>

                          <td className="py-2 px-3 font-mono text-slate-300">
                            {formatVND(it.unit_price)}
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              max={it.quantity}
                              value={currentVal.returnQty}
                              onChange={(e) =>
                                setReturnItemsMap({
                                  ...returnItemsMap,
                                  [it.product_id]: {
                                    ...currentVal,
                                    returnQty: Math.min(it.quantity, Math.max(0, Number(e.target.value) || 0)),
                                  },
                                })
                              }
                              className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono font-bold"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                <input
                                  type="radio"
                                  name={`cond-${it.product_id}`}
                                  checked={currentVal.condition === 'GOOD'}
                                  onChange={() =>
                                    setReturnItemsMap({
                                      ...returnItemsMap,
                                      [it.product_id]: { ...currentVal, condition: 'GOOD' },
                                    })
                                  }
                                  className="text-emerald-500"
                                />
                                <span className="text-emerald-400 font-semibold">Hàng tốt (Tái nhập kho)</span>
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                <input
                                  type="radio"
                                  name={`cond-${it.product_id}`}
                                  checked={currentVal.condition === 'DEFECTIVE'}
                                  onChange={() =>
                                    setReturnItemsMap({
                                      ...returnItemsMap,
                                      [it.product_id]: { ...currentVal, condition: 'DEFECTIVE' },
                                    })
                                  }
                                  className="text-rose-400"
                                />
                                <span className="text-rose-400 font-semibold">Hàng lỗi (Phế phẩm)</span>
                              </label>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-400">
                            {formatVND(currentVal.returnQty * it.unit_price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FINANCIAL RESOLUTION INPUTS ACCORDING TO REFUND TYPE */}
          {selectedOrder && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">
                Xử Lý Tiền & Công Nợ: {refundType === 'CASH_REFUND' ? 'Hoàn Tiền Mặt' : refundType === 'DEBT_OFFSET' ? 'Cấn Trừ Công Nợ' : 'Đổi Sản Phẩm Khác'}
              </div>

              {/* 1. CASH REFUND: Max cash <= customer actually paid */}
              {refundType === 'CASH_REFUND' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-start gap-2">
                    <DollarSign className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Quy tắc hoàn tiền mặt:</strong> Chỉ cho phép chi ra tối đa bằng số tiền khách <strong>ĐÃ THỰC TRẢ</strong> ({formatVND(selectedOrder.prepaid_amount)}).
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Số tiền mặt hoàn lại (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        max={selectedOrder.prepaid_amount}
                        value={refundCashAmount}
                        onChange={(e) => setRefundCashAmount(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Tối đa cho phép: {formatVND(selectedOrder.prepaid_amount)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono space-y-1">
                      <div className="text-slate-400">Tổng giá trị hàng trả: <strong className="text-white">{formatVND(totalReturnValue)}</strong></div>
                      <div className="text-slate-400">Tiền chi từ quỹ: <strong className="text-rose-400">{formatVND(refundCashAmount)}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DEBT OFFSET */}
              {refundType === 'DEBT_OFFSET' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Số tiền cấn trừ vào công nợ (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        value={debtOffsetAmount}
                        onChange={(e) => setDebtOffsetAmount(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono space-y-1">
                      <div className="text-slate-400">Dư nợ hiện tại của khách: <strong className="text-amber-400">{formatVND(selectedCustomer?.current_debt || 0)}</strong></div>
                      <div className="text-slate-400">
                        Dư nợ sau khi cấn trừ: <strong className="text-emerald-400">{formatVND(Math.max(0, (selectedCustomer?.current_debt || 0) - debtOffsetAmount))}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. EXCHANGE */}
              {refundType === 'EXCHANGE' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
                    Tự động tính chênh lệch: Nếu món mới đắt hơn → ghi <strong>TĂNG NỢ</strong>; nếu món mới rẻ hơn → ghi <strong>GIẢM NỢ</strong>.
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Chọn sản phẩm đổi mới</label>
                      <select
                        required
                        value={exchangeProductId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          setExchangeProductId(pid);
                          const p = products.find((pr) => pr.id === pid);
                          if (p) setExchangeUnitPrice(p.base_price || 3800000);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
                      >
                        <option value="">-- Chọn món đổi --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Số lượng đổi</label>
                      <input
                        type="number"
                        min="1"
                        value={exchangeQuantity}
                        onChange={(e) => setExchangeQuantity(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Đơn giá món đổi</label>
                      <input
                        type="number"
                        step="50000"
                        value={exchangeUnitPrice}
                        onChange={(e) => setExchangeUnitPrice(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  {exchangeProductId && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Giá trị món đem trả:</span>
                        <span className="text-white">{formatVND(totalReturnValue)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Giá trị món đổi mới ({exchangeQuantity} sp):</span>
                        <span className="text-white">{formatVND(exchangeTotalValue)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-850">
                        <span>Chênh lệch công nợ:</span>
                        <span className={exchangeDiff >= 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {exchangeDiff >= 0 ? `+${formatVND(exchangeDiff)} (Tăng nợ)` : `-${formatVND(Math.abs(exchangeDiff))} (Giảm nợ)`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ghi chú phiếu đổi trả</label>
                <input
                  type="text"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Khách đổi sang cây vợt khác do trọng lượng chưa phù hợp..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canCreateForSelectedOrder}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-950 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Hoàn Tất Lập Phiếu Đổi / Trả
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH CÁC PHIẾU ĐỔI TRẢ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            Lịch Sử Các Phiếu Đổi / Trả Hàng ({returnOrders.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Hàng tốt tái nhập kho · Hàng lỗi phế phẩm
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Mã Phiếu</th>
                <th className="py-3 px-4">Đơn Gốc</th>
                <th className="py-3 px-4">Thời Hạn & Điều Kiện</th>
                <th className="py-3 px-4">Giá Trị Trả Lại</th>
                <th className="py-3 px-4">Xử Lý Tiền & Đổi Hàng</th>
                <th className="py-3 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {returnOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Chưa có phiếu trả hàng nào được tạo.
                  </td>
                </tr>
              ) : (
                returnOrders.map((ret) => {
                  const ord = orders.find((o) => o.id === ret.original_order_id);
                  const cust = ord ? customers.find((c) => c.id === ord.customer_id) : null;

                  return (
                    <tr key={ret.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {ret.return_code}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {new Date(ret.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-emerald-400 font-semibold">{ord?.order_code}</div>
                        <div className="text-[11px] text-slate-300">{cust?.name}</div>
                      </td>

                      <td className="py-3 px-4">
                        {ret.is_over_30_days ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Quá 30 ngày ({ret.days_since_export} ngày) - CEO Duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Trong hạn ({ret.days_since_export} ngày)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        {formatVND(ret.total_return_value)}
                      </td>

                      <td className="py-3 px-4">
                        {ret.refund_type === 'CASH_REFUND' && (
                          <span className="text-[11px] text-sky-400 font-mono">
                            Hoàn mặt: {formatVND(ret.refund_cash_amount)}
                          </span>
                        )}
                        {ret.refund_type === 'DEBT_OFFSET' && (
                          <span className="text-[11px] text-emerald-400 font-mono">
                            Cấn trừ nợ: -{formatVND(ret.debt_offset_amount)}
                          </span>
                        )}
                        {ret.refund_type === 'EXCHANGE' && (
                          <span className="text-[11px] text-purple-400 font-mono">
                            Đổi hàng (Lệch: {ret.exchange_diff_amount! > 0 ? '+' : ''}{formatVND(ret.exchange_diff_amount || 0)})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReturn(ret)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* DETAIL MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedReturn(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xs cursor-pointer p-1"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-mono text-rose-400">
                Phiếu Đổi Trả {selectedReturn.return_code}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Đơn gốc: {orders.find((o) => o.id === selectedReturn.original_order_id)?.order_code} · {selectedReturn.is_over_30_days ? 'Được CEO duyệt ngoại lệ' : 'Trong hạn 30 ngày'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mặt Hàng Trả Lại & Tình Trạng
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs font-mono">
                {selectedReturn.items?.map((it) => {
                  const p = products.find((pr) => pr.id === it.product_id);
                  return (
                    <div key={it.id} className="flex items-center justify-between border-b border-slate-900 pb-1.5 last:border-none">
                      <div>
                        <div className="font-bold text-white">{p?.name || it.product_id}</div>
                        <div className="text-[10px] text-slate-400">
                          {it.quantity} {p?.unit} × {formatVND(it.unit_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            it.condition === 'GOOD'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {it.condition === 'GOOD' ? 'Hàng Tốt (Đã Tái Nhập Kho)' : 'Hàng Lỗi (Phế Phẩm)'}
                        </span>
                        <div className="text-rose-400 font-bold mt-0.5">{formatVND(it.total_price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Tổng giá trị hàng nhận lại:</span>
                <span className="text-white font-bold">{formatVND(selectedReturn.total_return_value)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phương thức hoàn:</span>
                <span className="text-amber-400 font-bold">{selectedReturn.refund_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
