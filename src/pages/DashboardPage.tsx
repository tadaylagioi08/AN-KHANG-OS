import React, { useState } from 'react';
import { erpStorage } from '../services/erpStorage';
import { UserRole, Order } from '../types/erp';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Package,
  AlertTriangle,
  ShoppingBag,
  ArrowUpRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Eye,
} from 'lucide-react';

interface DashboardPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onNavigateToTab: (tab: string) => void;
  onOpenOrderDetails?: (order: Order) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentRole,
  currentUserId,
  onNavigateToTab,
}) => {
  const isSalesRep = currentRole === UserRole.ROLE_SALES_REP;

  const orders = erpStorage.getOrders();
  const customers = erpStorage.getCustomers();
  const batches = erpStorage.getBatches();
  const products = erpStorage.getProducts();
  const warehouses = erpStorage.getWarehouses();

  // 1. Metric Calculations
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const activeOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'draft');

  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCogs = completedOrders.reduce((sum, o) => sum + (o.cogs_total || 0), 0);
  const estimatedProfit = Math.max(0, totalRevenue - totalCogs);

  const totalCustomerDebt = customers.reduce((sum, c) => sum + (c.current_debt || 0), 0);
  const pendingOrders = orders.filter(
    (o) =>
      o.status === 'pending_approval' ||
      o.status === 'pending_ceo_discount' ||
      o.status === 'pending_ceo_debt'
  );

  // Stock counts by warehouse for Donut chart
  const khoSiBatches = batches.filter((b) => {
    const wh = warehouses.find((w) => w.id === b.warehouse_id);
    return wh?.code === 'KHO_SI';
  });
  const khoLeBatches = batches.filter((b) => {
    const wh = warehouses.find((w) => w.id === b.warehouse_id);
    return wh?.code === 'KHO_LE';
  });

  const qtyKhoSi = khoSiBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);
  const qtyKhoLe = khoLeBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);
  const totalStockQty = qtyKhoSi + qtyKhoLe;

  const pctKhoSi = totalStockQty > 0 ? Math.round((qtyKhoSi / totalStockQty) * 100) : 65;
  const pctKhoLe = totalStockQty > 0 ? 100 - pctKhoSi : 35;

  // Top revenue items by orders
  const topRevenueOrders = [...orders]
    .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0))
    .slice(0, 5);

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  // Recent 6 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#9f3244]/10 text-[#9f3244] border border-[#9f3244]/20">
            Chờ Duyệt
          </span>
        );
      case 'pending_ceo_discount':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Chờ CEO Duyệt CK
          </span>
        );
      case 'pending_ceo_debt':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Chờ CEO Duyệt Nợ
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã Duyệt
          </span>
        );
      case 'partially_fulfilled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Đã Tách A & B
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Đã Xuất Kho
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Company Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-[#9f3244] via-[#8a2638] to-[#7a2432] text-white">
        {/* Subtle geometric background overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Logo tròn */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl shrink-0">
              <span className="font-black text-2xl tracking-wider">KA</span>
            </div>
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Hệ Thống ERP Nội Bộ Doanh Nghiệp
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Công Ty TNHH Khang An Badminton
              </h1>
              <p className="text-xs sm:text-sm text-white/80 italic font-light">
                "Kết nối đam mê, kiến tạo sân chơi"
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => onNavigateToTab('sales')}
              className="px-4 py-2 rounded-xl bg-white text-[#9f3244] hover:bg-[#fbf8f5] text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-[#9f3244]" />
              <span>Tạo Đơn Hàng</span>
            </button>

            <button
              onClick={() => onNavigateToTab('warehouse')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition border border-white/20 cursor-pointer flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-white" />
              <span>Kho Vận FIFO</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metric Cards (Hàng Thẻ Thống Kê) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu đơn hàng */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-3 hover:border-[#9f3244]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b]">Doanh Thu Đơn Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#1e293b] tracking-tight">
              {formatVND(totalRevenue)}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{activeOrders.length} đơn</span>
              <span>đang lưu hành</span>
            </div>
          </div>
        </div>

        {/* Lợi nhuận ước tính - SALESMAN MASKING RULE */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-3 hover:border-[#9f3244]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b]">Lợi Nhuận Ước Tính</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isSalesRep ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[#94a3b8] tracking-widest font-bold">
                  •••••• Giới hạn quyền
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-medium border border-amber-200">
                  Ẩn giá vốn
                </span>
              </div>
            ) : (
              <div className="text-xl font-bold text-emerald-700 tracking-tight">
                {formatVND(estimatedProfit)}
              </div>
            )}
            <div className="text-[11px] text-[#64748b] mt-0.5">
              {isSalesRep
                ? 'Nhân viên KD không được xem lợi nhuận'
                : `Giá vốn FIFO đã chốt: ${formatVND(totalCogs)}`}
            </div>
          </div>
        </div>

        {/* Công nợ khách hàng */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-3 hover:border-[#9f3244]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b]">Công Nợ Khách Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700 tracking-tight">
              {formatVND(totalCustomerDebt)}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5 flex items-center gap-1">
              <span>Hạn mức tín dụng được duyệt</span>
            </div>
          </div>
        </div>

        {/* Đơn hàng chờ duyệt / Tồn kho cảnh báo */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-3 hover:border-[#9f3244]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b]">Đơn Chờ Duyệt & Tồn Kho</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#1e293b] tracking-tight flex items-center gap-2">
              <span className={pendingOrders.length > 0 ? 'text-[#9f3244]' : 'text-slate-700'}>
                {pendingOrders.length} đơn chờ
              </span>
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              Tổng tồn khả dụng: <strong className="text-[#1e293b]">{totalStockQty} sản phẩm</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chart: Top Doanh Thu Theo Đơn Hàng (Horizontal Bar Chart) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#9f3244]" />
              <h3 className="text-sm font-bold text-[#1e293b]">
                Top Doanh Thu Theo Đơn Hàng
              </h3>
            </div>
            <span className="text-[11px] text-[#64748b]">Đơn vị: VNĐ</span>
          </div>

          <div className="space-y-4 pt-1">
            {topRevenueOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94a3b8]">
                Chưa có đơn hàng nào phát sinh doanh thu.
              </div>
            ) : (
              topRevenueOrders.map((ord, idx) => {
                const maxVal = topRevenueOrders[0]?.total_amount || 1;
                const pct = Math.max(10, Math.round(((ord.total_amount || 0) / maxVal) * 100));
                const cust = customers.find((c) => c.id === ord.customer_id);

                return (
                  <div key={ord.id ? `${ord.id}-${idx}` : `top-ord-${idx}`} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#fbf8f5] text-[#9f3244] font-bold text-[10px] flex items-center justify-center border border-[#eaeaea]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#1e293b]">{ord.order_code}</span>
                        <span className="text-[#64748b] truncate max-w-[140px] sm:max-w-[200px]">
                          ({cust?.name || 'Khách lẻ'})
                        </span>
                      </div>
                      <span className="font-bold text-[#1e293b] font-mono">
                        {formatVND(ord.total_amount)}
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="w-full bg-[#fbf8f5] rounded-full h-2.5 overflow-hidden border border-[#eaeaea]">
                      <div
                        className="bg-gradient-to-r from-[#9f3244] to-[#be4558] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chart: Donut Chart Cơ Cấu Tồn Kho (Kho Sỉ vs Kho Cửa Hàng) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#9f3244]" />
              <h3 className="text-sm font-bold text-[#1e293b]">
                Cơ Cấu Tồn Kho Theo Điểm Lưu
              </h3>
            </div>
            <span className="text-[11px] text-[#64748b]">Tỷ lệ %</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#eaeaea"
                  strokeWidth="3.5"
                />
                {/* Segment 1: Kho Sỉ (#9f3244) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#9f3244"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctKhoSi} ${100 - pctKhoSi}`}
                  strokeDashoffset="0"
                />
                {/* Segment 2: Kho Cửa hàng (#be4558) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#e295a3"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctKhoLe} ${100 - pctKhoLe}`}
                  strokeDashoffset={`-${pctKhoSi}`}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#1e293b] leading-tight">
                  {totalStockQty}
                </span>
                <span className="text-[10px] text-[#64748b]">Sản phẩm</span>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-[#9f3244] shrink-0" />
                <div>
                  <div className="font-bold text-[#1e293b]">Kho Tổng Bán Sỉ (KHO_SI)</div>
                  <div className="text-[#64748b] text-[11px]">
                    {qtyKhoSi} sp ({pctKhoSi}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-[#e295a3] shrink-0" />
                <div>
                  <div className="font-bold text-[#1e293b]">Kho Cửa Hàng Lẻ (KHO_LE)</div>
                  <div className="text-[#64748b] text-[11px]">
                    {qtyKhoLe} sp ({pctKhoLe}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Operations Table */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaeaea] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1e293b]">
              Giao Dịch Đơn Hàng Gần Đây
            </h3>
            <p className="text-xs text-[#64748b]">
              Theo dõi tình trạng duyệt, xuất kho và phân bổ tiền cọc
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('sales')}
            className="text-xs font-semibold text-[#9f3244] hover:text-[#7a2432] flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả đơn hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#fbf8f5] text-[#64748b] font-medium text-[11px]">
                <th className="py-2.5 px-3">Mã Đơn Hàng</th>
                <th className="py-2.5 px-3">Khách Hàng</th>
                <th className="py-2.5 px-3">Kho Xuất</th>
                <th className="py-2.5 px-3">Giá Trị Đơn</th>
                <th className="py-2.5 px-3">Đặt Cọc</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#94a3b8]">
                    Chưa có đơn hàng nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord, idx) => {
                  const cust = customers.find((c) => c.id === ord.customer_id);
                  const wh = warehouses.find((w) => w.id === ord.warehouse_id);

                  return (
                    <tr key={ord.id ? `${ord.id}-${idx}` : `recent-ord-${idx}`} className="hover:bg-[#fbf8f5] transition">
                      <td className="py-2.5 px-3 font-semibold text-[#1e293b] font-mono">
                        {ord.order_code}
                      </td>
                      <td className="py-2.5 px-3 text-[#1e293b]">
                        {cust?.name || 'Khách vãng lai'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#64748b]">
                        {wh?.code || 'KHO_SI'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1e293b] font-mono">
                        {formatVND(ord.total_amount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#64748b]">
                        {formatVND(ord.prepaid_amount)}
                      </td>
                      <td className="py-2.5 px-3">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigateToTab('sales')}
                          className="px-2.5 py-1 rounded-lg bg-[#fbf8f5] hover:bg-[#9f3244]/10 text-[#9f3244] font-semibold text-[11px] transition cursor-pointer"
                        >
                          Chi tiết
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
    </div>
  );
};
