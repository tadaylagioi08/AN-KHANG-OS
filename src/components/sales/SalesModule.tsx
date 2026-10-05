import React, { useState } from 'react';
import { erpStorage } from '../../services/erpStorage';
import { Order, UserRole, Product, Customer } from '../../types/erp';
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Eye,
  FileText,
  UserCheck,
  Percent,
  CreditCard,
  Building,
  Split,
  ChevronDown,
} from 'lucide-react';

interface SalesModuleProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  currentRole,
  currentUserId,
  onOpenMasterModal,
}) => {
  const [orders, setOrders] = useState<Order[]>(erpStorage.getOrders());
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [splitResultModal, setSplitResultModal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('wh-kho-si');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [prepaidAmount, setPrepaidAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([]);

  const refreshOrders = () => {
    setOrders(erpStorage.getOrders());
  };

  const customers = erpStorage.getCustomers();
  const products = erpStorage.getProducts();
  const categories = erpStorage.getCategories();
  const warehouses = erpStorage.getWarehouses();
  const batches = erpStorage.getBatches();

  // Add Item to Cart
  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const existing = cartItems.find((it) => it.productId === productId);
    if (existing) {
      setCartItems(cartItems.map((it) => (it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it)));
    } else {
      setCartItems([...cartItems, { productId, quantity: 1, unitPrice: prod.base_price || 3800000 }]);
    }
  };

  const handleUpdateItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((it) => it.productId !== productId));
    } else {
      setCartItems(cartItems.map((it) => (it.productId === productId ? { ...it, quantity } : it)));
    }
  };

  const handleUpdateItemPrice = (productId: string, unitPrice: number) => {
    setCartItems(cartItems.map((it) => (it.productId === productId ? { ...it, unitPrice } : it)));
  };

  // Calculations for Order Creation Preview
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const rawSubtotal = cartItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const discountTotal = (rawSubtotal * discountPercent) / 100;
  const estimatedTotal = Math.max(0, rawSubtotal - discountTotal);
  const estimatedDebtAfterOrder = selectedCustomer ? selectedCustomer.current_debt + (estimatedTotal - prepaidAmount) : 0;

  // Real-time Gate Indicators
  const isDebtExceeded = selectedCustomer && estimatedDebtAfterOrder > selectedCustomer.debt_limit;
  
  let isDiscountCeilingExceeded = false;
  let ceilingWarningInfo = '';
  for (const item of cartItems) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      const cat = categories.find((c) => c.id === prod.category_id);
      if (cat && discountPercent > cat.discount_ceiling) {
        isDiscountCeilingExceeded = true;
        ceilingWarningInfo = `Vượt trần nhóm "${cat.name}" (Trần ${cat.discount_ceiling}% < Đang nhập ${discountPercent}%)`;
        break;
      }
    }
  }

  // Handle Create Order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFeedback({ message: 'Vui lòng chọn khách hàng!', type: 'error' });
      return;
    }
    if (cartItems.length === 0) {
      setFeedback({ message: 'Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng!', type: 'error' });
      return;
    }

    try {
      const { order, statusReason } = erpStorage.createOrder({
        customerId,
        salesmanId: currentUserId,
        warehouseId,
        discountPercent,
        prepaidAmount,
        note,
        items: cartItems,
      });

      setFeedback({
        message: `Tạo đơn ${order.order_code} thành công! [Trạng thái: ${order.status}] - ${statusReason}`,
        type: 'success',
      });
      setIsCreating(false);
      setCartItems([]);
      setDiscountPercent(0);
      setPrepaidAmount(0);
      setNote('');
      refreshOrders();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi tạo đơn', type: 'error' });
    }
  };

  // Handle Confirm / Approve Order (With Auto-Split Logic)
  const handleConfirmOrder = (order: Order) => {
    try {
      const result = erpStorage.confirmAndApproveOrder(order.id, currentUserId, currentRole);
      refreshOrders();

      if (result.splitRequired) {
        setSplitResultModal(result);
        setFeedback({
          message: result.message,
          type: 'warning',
        });
      } else {
        setFeedback({
          message: result.message,
          type: 'success',
        });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi duyệt đơn', type: 'error' });
    }
  };

  // Handle CEO Override
  const handleCeoApproveSpecial = (orderId: string) => {
    try {
      erpStorage.ceoApproveSpecialGate(orderId, currentUserId);
      setFeedback({
        message: 'CEO đã phê chuẩn duyệt ngoại lệ! Đơn chuyển về trạng thái Chờ Trưởng phòng duyệt tồn kho.',
        type: 'success',
      });
      refreshOrders();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Chờ Trưởng Phòng Duyệt
          </span>
        );
      case 'pending_ceo_discount':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
            <Percent className="w-3 h-3" /> Chờ CEO Duyệt Chiết Khấu
          </span>
        );
      case 'pending_ceo_debt':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold">
            <CreditCard className="w-3 h-3" /> Chờ CEO Duyệt Nợ
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Đã Duyệt (Chờ Xuất Kho)
          </span>
        );
      case 'partially_fulfilled':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Split className="w-3 h-3" /> Đã Tách Đơn A & B
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đã Hoàn Thành (Xuất Kho Xong)
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e293b]">
                Quản Lý Đơn Hàng & Bán Hàng
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Luồng tạo đơn, xét duyệt công nợ/chiết khấu và tự động phân bổ tách đơn A/B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Đóng Form' : 'Tạo Đơn Hàng Mới'}</span>
            </button>
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
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            )}
            <div className="whitespace-pre-line">{feedback.message}</div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-mono px-2 py-0.5 rounded cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* CREATE ORDER DRAWER / FORM */}
      {isCreating && (
        <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-md space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
            <h3 className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#9f3244]" />
              Lập Đơn Bán Hàng Mới
            </h3>
            <span className="text-xs text-[#64748b] font-mono">
              Người lập: {currentUserId} ({currentRole})
            </span>
          </div>

          <form onSubmit={handleSaveOrder} className="space-y-5">
            {/* Customer & Warehouse Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">
                  Khách Hàng / Đại Lý <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none transition shadow-inner"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c, idx) => (
                    <option key={c.id ? `${c.id}-${idx}` : `cust-${idx}`} value={c.id}>
                      {c.code} - {c.name} (Nợ: {c.current_debt.toLocaleString()} / Hạn mức: {c.debt_limit.toLocaleString()} đ)
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div className="text-[11px] text-[#64748b] mt-1 font-mono">
                    Hạn mức nợ: <strong className="text-[#1e293b]">{formatVND(selectedCustomer.debt_limit)}</strong> · Dư nợ hiện tại: <strong className="text-amber-600">{formatVND(selectedCustomer.current_debt)}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">
                  Kho Xuất Hàng <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none transition shadow-inner"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b] block mb-1 font-medium">
                  Tiền Khách Đặt Cọc Trước (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={prepaidAmount}
                  onChange={(e) => setPrepaidAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none transition shadow-inner"
                />
                <span className="text-[10px] text-[#94a3b8] mt-1 block">
                  Sẽ chia theo tỷ lệ nếu đơn bị tách thành Đơn A & B
                </span>
              </div>
            </div>

            {/* Product Selector to Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#1e293b] font-bold uppercase tracking-wider">
                  Mặt Hàng Trong Đơn ({cartItems.length})
                </label>
                <span className="text-[11px] text-[#64748b]">
                  Chọn sản phẩm bên dưới để thêm vào đơn
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  const availableStock = batches
                    .filter((b) => b.product_id === p.id && b.warehouse_id === warehouseId && b.quantity_remaining > 0)
                    .reduce((sum, b) => sum + b.quantity_remaining, 0);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItem(p.id)}
                      className="px-3 py-2 rounded-xl bg-[#f8f9fa] hover:bg-[#fbf8f5] border border-[#eaeaea] hover:border-[#9f3244]/40 text-left transition shrink-0 cursor-pointer space-y-0.5 shadow-xs"
                    >
                      <div className="font-mono text-xs font-bold text-[#9f3244] flex items-center gap-1.5">
                        <Plus className="w-3 h-3" /> {p.code}
                      </div>
                      <div className="text-[11px] text-[#1e293b] font-medium line-clamp-1 max-w-[180px]">{p.name}</div>
                      <div className="text-[10px] text-[#64748b] flex items-center justify-between">
                        <span>Tồn: <strong className={availableStock > 0 ? 'text-[#1e293b]' : 'text-rose-500'}>{availableStock} {p.unit}</strong></span>
                        <span className="text-amber-700 ml-2">Trần CK: {cat?.discount_ceiling || 0}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cart Items Table */}
              {cartItems.length > 0 && (
                <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                        <th className="py-2.5 px-3">Sản Phẩm</th>
                        <th className="py-2.5 px-3">Tồn Kho Hiện Tại</th>
                        <th className="py-2.5 px-3">Số Lượng Đặt</th>
                        <th className="py-2.5 px-3">Đơn Giá (VNĐ)</th>
                        <th className="py-2.5 px-3">Thành Tiền</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaea]">
                      {cartItems.map((item) => {
                        const prod = products.find((p) => p.id === item.productId);
                        const cat = categories.find((c) => c.id === prod?.category_id);
                        const availableStock = batches
                          .filter((b) => b.product_id === item.productId && b.warehouse_id === warehouseId && b.quantity_remaining > 0)
                          .reduce((sum, b) => sum + b.quantity_remaining, 0);
                        const isShort = availableStock < item.quantity;

                        return (
                          <tr key={item.productId} className="hover:bg-[#fbf8f5]">
                            <td className="py-2 px-3">
                              <div className="font-mono font-bold text-[#1e293b]">{prod?.code}</div>
                              <div className="text-[11px] text-[#64748b]">{prod?.name}</div>
                              <div className="text-[10px] text-amber-700 font-medium">
                                Nhóm: {cat?.name} (Trần CK: {cat?.discount_ceiling}%)
                              </div>
                            </td>

                            <td className="py-2 px-3 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isShort
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {availableStock} {prod?.unit}
                              </span>
                              {isShort && (
                                <div className="text-[10px] text-rose-600 mt-0.5">
                                  Thiếu {item.quantity - availableStock} (Sẽ tự động tách Đơn B)
                                </div>
                              )}
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemQty(item.productId, Number(e.target.value))}
                                className="w-20 bg-[#f8f9fa] border border-[#eaeaea] rounded px-2 py-1 text-xs text-[#1e293b] font-mono focus:bg-white focus:border-[#9f3244] focus:outline-none"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="50000"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItemPrice(item.productId, Number(e.target.value))}
                                className="w-28 bg-[#f8f9fa] border border-[#eaeaea] rounded px-2 py-1 text-xs text-[#1e293b] font-mono focus:bg-white focus:border-[#9f3244] focus:outline-none"
                              />
                            </td>

                            <td className="py-2 px-3 font-mono font-bold text-[#9f3244]">
                              {formatVND(item.quantity * item.unitPrice)}
                            </td>

                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(item.productId, 0)}
                                className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Discount Percent & Calculation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#1e293b] font-medium flex items-center justify-between">
                    <span>% Chiết Khấu Toàn Đơn</span>
                    {isDiscountCeilingExceeded && (
                      <span className="text-[11px] text-amber-700 font-mono flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {ceilingWarningInfo}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                    className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-mono focus:outline-none transition shadow-inner"
                  />
                  <span className="text-[10px] text-[#64748b] mt-1 block">
                    Nếu chiết khấu &gt; trần nhóm hàng, đơn sẽ chuyển trạng thái <strong>'pending_ceo_discount'</strong>
                  </span>
                </div>

                <div>
                  <label className="text-xs text-[#1e293b] font-medium block mb-1">Ghi chú đơn hàng</label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Giao hàng trước 16h, đóng gói thùng carton..."
                    className="w-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-[#eaeaea] focus:border-[#9f3244] rounded-xl px-3 py-2 text-xs text-[#1e293b] focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Real-time Gate Analysis Card */}
              <div className="p-4 rounded-xl bg-[#fbf8f5] border border-[#eaeaea] space-y-2.5">
                <div className="text-xs font-bold text-[#1e293b] uppercase tracking-wider border-b border-[#eaeaea] pb-2">
                  Phân Tích Nghiệp Vụ Chốt Chặn
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#64748b]">
                    <span>Tổng tiền hàng (chưa CK):</span>
                    <span className="text-[#1e293b]">{formatVND(rawSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>Tiền chiết khấu ({discountPercent}%):</span>
                    <span className="text-amber-700">- {formatVND(discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#1e293b] font-bold text-sm pt-1 border-t border-[#eaeaea]">
                    <span>Tổng thanh toán:</span>
                    <span className="text-[#9f3244]">{formatVND(estimatedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b] text-[11px]">
                    <span>Tiền đặt cọc trước:</span>
                    <span className="text-sky-700">{formatVND(prepaidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b] text-[11px]">
                    <span>Nợ khách sau đơn này:</span>
                    <span className={isDebtExceeded ? 'text-rose-600 font-bold' : 'text-[#1e293b]'}>
                      {formatVND(estimatedDebtAfterOrder)}
                    </span>
                  </div>
                </div>

                {/* Gate Warning Banners */}
                {isDiscountCeilingExceeded && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong>CẢNH BÁO CHIẾT KHẤU:</strong> Chiết khấu {discountPercent}% vượt trần cho phép! Đơn hàng sẽ tự động nhảy sang trạng thái <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">pending_ceo_discount</code> và cần Giám Đốc duyệt.
                    </div>
                  </div>
                )}

                {isDebtExceeded && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <strong>CẢNH BÁO CÔNG NỢ:</strong> Tổng nợ dự kiến ({formatVND(estimatedDebtAfterOrder)}) vượt hạn mức ({formatVND(selectedCustomer?.debt_limit || 0)})! Đơn hàng sẽ tự động nhảy sang trạng thái <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">pending_ceo_debt</code>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#eaeaea]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#64748b] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Hoàn Tất Tạo Đơn Bán Hàng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER TABS & ORDER LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả đơn' },
              { id: 'pending_approval', label: 'Chờ duyệt' },
              { id: 'pending_ceo_discount', label: 'Chờ CEO duyệt CK' },
              { id: 'pending_ceo_debt', label: 'Chờ CEO duyệt Nợ' },
              { id: 'approved', label: 'Đã duyệt (Sẵn sàng xuất)' },
              { id: 'partially_fulfilled', label: 'Đã tách A & B' },
              { id: 'completed', label: 'Đã hoàn thành' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === f.id
                    ? 'bg-[#9f3244] text-white shadow-xs'
                    : 'bg-white text-[#64748b] hover:text-[#1e293b] border border-[#eaeaea]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#64748b] font-mono shrink-0">
            {filteredOrders.length} đơn hàng
          </span>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Kho Xuất</th>
                  <th className="py-3 px-4">Tổng Tiền / Tiền Cọc</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác Phê Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#94a3b8]">
                      Chưa có đơn hàng nào trong mục này. Bấm <strong>"Tạo Đơn Hàng Mới"</strong> để lập đơn.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const cust = customers.find((c) => c.id === ord.customer_id);
                    const wh = warehouses.find((w) => w.id === ord.warehouse_id);

                    // Permission gates
                    const isSalesRep = currentRole === UserRole.ROLE_SALES_REP;
                    const isManagerOrCeo = currentRole === UserRole.ROLE_SALES_MANAGER || currentRole === UserRole.ROLE_CEO;
                    const isCeo = currentRole === UserRole.ROLE_CEO;

                    return (
                      <tr key={ord.id} className="hover:bg-[#fbf8f5] transition">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-[#1e293b] flex items-center gap-1.5">
                            {ord.order_code}
                            {ord.parent_order_id && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-medium border border-purple-200">
                                Con
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#94a3b8]">
                            {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1e293b]">{cust?.name || 'Khách vãng lai'}</div>
                          <div className="text-[11px] text-[#64748b] font-mono">
                            Mã: {cust?.code} · Dư nợ: {formatVND(cust?.current_debt || 0)}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[#64748b]">
                          {wh?.code || 'KHO_SI'}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-[#9f3244]">{formatVND(ord.total_amount)}</div>
                          <div className="text-[10px] text-[#64748b]">
                            Cọc: <strong className="text-[#1e293b]">{formatVND(ord.prepaid_amount)}</strong> (CK: {ord.discount_percent}%)
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(ord.status)}
                          {ord.note && (
                            <div className="text-[10px] text-[#64748b] mt-1 line-clamp-1 italic">
                              "{ord.note}"
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Detailed View */}
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-[#fbf8f5] hover:bg-[#eaeaea] text-[#64748b] hover:text-[#1e293b] transition cursor-pointer"
                              title="Xem chi tiết đơn"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* RULE 1: SALESMAN CANNOT APPROVE HIS OWN ORDER */}
                            {ord.status === 'pending_approval' && isSalesRep && (
                              <span
                                className="text-[10px] text-[#94a3b8] bg-[#f8f9fa] px-2 py-1 rounded border border-[#eaeaea] italic"
                                title="Nhân viên kinh doanh không được tự duyệt đơn của chính mình"
                              >
                                Chờ TP Duyệt
                              </span>
                            )}

                            {/* SALES MANAGER / CEO APPROVAL BUTTON (WITH AUTO-SPLIT LOGIC) */}
                            {ord.status === 'pending_approval' && isManagerOrCeo && (
                              <button
                                onClick={() => handleConfirmOrder(ord)}
                                className="px-3 py-1 rounded-lg bg-[#9f3244] hover:bg-[#7a2432] text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Duyệt & Tách Đơn</span>
                              </button>
                            )}

                            {/* CEO SPECIAL OVERRIDE FOR DISCOUNT OR DEBT GATE */}
                            {(ord.status === 'pending_ceo_discount' || ord.status === 'pending_ceo_debt') && (
                              <>
                                {isCeo ? (
                                  <button
                                    onClick={() => handleCeoApproveSpecial(ord.id)}
                                    className="px-3 py-1 rounded-lg bg-[#7a2432] hover:bg-[#9f3244] text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>CEO Duyệt</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#7a2432] bg-amber-50 px-2 py-1 rounded border border-amber-200 italic font-medium">
                                    Chờ CEO Duyệt
                                  </span>
                                )}
                              </>
                            )}

                            {/* If already approved */}
                            {ord.status === 'approved' && (
                              <span className="text-[10px] text-emerald-700 font-mono font-medium">
                                Sẵn sàng xuất kho
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AUTO-SPLIT RESULT MODAL */}
      {splitResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Split className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  ĐÃ TỰ ĐỘNG TÁCH THÀNH ĐƠN A & ĐƠN B (THIẾU KHO)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Do một số mặt hàng không đủ tồn kho, hệ thống đã tự động chia nhỏ đơn và phân bổ tiền cọc chính xác theo tỷ lệ giá trị:
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Order A Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-300">
                    {splitResultModal.orderA.order_code} (ĐƠN A - ĐỦ HÀNG)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                    approved (Xuất kho ngay)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="text-slate-300">
                    Trị giá đơn: <strong>{formatVND(splitResultModal.orderA.total_amount)}</strong>
                  </div>
                  <div className="text-emerald-400">
                    Cọc phân bổ (Pro-rata): <strong>{formatVND(splitResultModal.orderA.prepaid_amount)}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {splitResultModal.orderA.items?.length} dòng mặt hàng có sẵn trong kho.
                </div>
              </div>

              {/* Order B Card */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {splitResultModal.orderB.order_code} (ĐƠN B - THIẾU HÀNG)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                    chờ hàng về
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="text-slate-300">
                    Trị giá đơn: <strong>{formatVND(splitResultModal.orderB.total_amount)}</strong>
                  </div>
                  <div className="text-amber-400">
                    Cọc phân bổ (Pro-rata): <strong>{formatVND(splitResultModal.orderB.prepaid_amount)}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {splitResultModal.orderB.items?.length} dòng mặt hàng thiếu tồn kho.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSplitResultModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#eaeaea] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#1e293b] text-sm cursor-pointer p-1 rounded-lg hover:bg-[#f8f9fa] transition"
            >
              ✕
            </button>

            <div className="border-b border-[#eaeaea] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-[#9f3244]">
                  {selectedOrder.order_code}
                </span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <p className="text-xs text-[#64748b] mt-1">
                Tạo lúc: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                Mặt Hàng Chi Tiết ({selectedOrder.items?.length || 0})
              </h4>
              <div className="rounded-xl border border-[#eaeaea] bg-[#fbf8f5] p-3 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
                {selectedOrder.items?.map((it) => {
                  const prod = products.find((p) => p.id === it.product_id);
                  return (
                    <div key={it.id} className="flex items-center justify-between border-b border-[#eaeaea] pb-1.5 last:border-none">
                      <div>
                        <div className="font-bold text-[#1e293b]">{prod?.name || it.product_id}</div>
                        <div className="text-[10px] text-[#64748b]">Mã: {prod?.code} · {it.quantity} {prod?.unit} × {formatVND(it.unit_price)}</div>
                      </div>
                      <div className="font-bold text-[#9f3244]">
                        {formatVND(it.total_price)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#eaeaea] space-y-1 text-xs font-mono">
              <div className="flex justify-between text-[#64748b]">
                <span>Tổng giá trị đơn:</span>
                <span className="text-[#1e293b] font-bold">{formatVND(selectedOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Tiền cọc trước:</span>
                <span className="text-sky-700 font-bold">{formatVND(selectedOrder.prepaid_amount)}</span>
              </div>
              {selectedOrder.cogs_total && selectedOrder.cogs_total > 0 && currentRole !== UserRole.ROLE_SALES_REP && (
                <div className="flex justify-between text-amber-700 pt-1 border-t border-[#eaeaea] font-semibold">
                  <span>Giá vốn COGS (FIFO):</span>
                  <span>{formatVND(selectedOrder.cogs_total)}</span>
                </div>
              )}
            </div>

            {selectedOrder.note && (
              <div className="text-xs text-[#64748b] italic bg-[#fbf8f5] p-2.5 rounded-lg border border-[#eaeaea]">
                Ghi chú: {selectedOrder.note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
