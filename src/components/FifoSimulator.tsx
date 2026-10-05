import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, AlertTriangle, Lock, ArrowRight, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface BatchState {
  id: string;
  batchNumber: string;
  importDate: string;
  unitCost: number;
  initialQty: number;
  remainingQty: number;
  allocatedQty: number;
}

export const FifoSimulator: React.FC = () => {
  const [orderQty, setOrderQty] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(3800000);
  const [prepaidAmount, setPrepaidAmount] = useState<number>(15000000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Initial batches state (Pure FIFO order by importDate)
  const [batches, setBatches] = useState<BatchState[]>([
    {
      id: 'batch-001',
      batchNumber: 'LOT-2026-01-A',
      importDate: '2026-01-10',
      unitCost: 2800000,
      initialQty: 5,
      remainingQty: 5,
      allocatedQty: 0,
    },
    {
      id: 'batch-002',
      batchNumber: 'LOT-2026-02-B',
      importDate: '2026-02-15',
      unitCost: 2900000,
      initialQty: 7,
      remainingQty: 7,
      allocatedQty: 0,
    },
    {
      id: 'batch-003',
      batchNumber: 'LOT-2026-03-C',
      importDate: '2026-03-01',
      unitCost: 3050000,
      initialQty: 4,
      remainingQty: 4,
      allocatedQty: 0,
    },
  ]);

  const totalStockAvailable = batches.reduce((sum, b) => sum + b.remainingQty, 0);

  const resetBatches = () => {
    setBatches([
      { id: 'batch-001', batchNumber: 'LOT-2026-01-A', importDate: '2026-01-10', unitCost: 2800000, initialQty: 5, remainingQty: 5, allocatedQty: 0 },
      { id: 'batch-002', batchNumber: 'LOT-2026-02-B', importDate: '2026-02-15', unitCost: 2900000, initialQty: 7, remainingQty: 7, allocatedQty: 0 },
      { id: 'batch-003', batchNumber: 'LOT-2026-03-C', importDate: '2026-03-01', unitCost: 3050000, initialQty: 4, remainingQty: 4, allocatedQty: 0 },
    ]);
    setSimulationResult(null);
  };

  const runFifoSimulation = () => {
    setIsRunning(true);
    setSimulationResult(null);

    setTimeout(() => {
      let needed = orderQty;
      const updatedBatches = [...batches];
      const allocationDetails: Array<{ batchNumber: string; qty: number; unitCost: number }> = [];
      let totalAllocated = 0;

      // Scan batches FIFO (order by importDate ASC)
      for (let i = 0; i < updatedBatches.length; i++) {
        if (needed <= 0) break;
        const b = updatedBatches[i];
        if (b.remainingQty > 0) {
          const take = Math.min(b.remainingQty, needed);
          b.allocatedQty = take;
          b.remainingQty -= take;
          needed -= take;
          totalAllocated += take;
          allocationDetails.push({
            batchNumber: b.batchNumber,
            qty: take,
            unitCost: b.unitCost,
          });
        }
      }

      setBatches(updatedBatches);

      if (totalAllocated >= orderQty) {
        // Scenario 1: 100% Sufficient stock
        const totalAmount = orderQty * unitPrice;
        setSimulationResult({
          type: 'FULL_FULFILLMENT',
          success: true,
          splitRequired: false,
          totalAllocated,
          totalAmount,
          prepaidAmount,
          allocationDetails,
          orderStatus: 'approved',
          movementCode: 'PXK-DH-2026-001',
          message: 'Kho đủ hàng 100%. Giao dịch khóa SELECT FOR UPDATE thành công, đã trừ kho FIFO theo thứ tự ngày nhập.',
        });
      } else {
        // Scenario 2: Shortage -> Auto-Split Order A & Order B + Pro-rata deposit
        const qtyA = totalAllocated;
        const qtyB = orderQty - totalAllocated;
        const amountA = qtyA * unitPrice;
        const amountB = qtyB * unitPrice;
        const totalAmount = amountA + amountB;

        // Pro-rata deposit calculation
        const depositA = totalAmount > 0 ? Math.round((prepaidAmount * amountA) / totalAmount) : 0;
        const depositB = prepaidAmount - depositA;

        setSimulationResult({
          type: 'SPLIT_ORDER',
          success: true,
          splitRequired: true,
          totalAllocated,
          shortageQty: qtyB,
          allocationDetails,
          originalOrder: {
            code: 'DH-2026-001',
            status: 'partially_fulfilled',
            totalAmount,
          },
          orderA: {
            code: 'DH-2026-001-A',
            qty: qtyA,
            totalAmount: amountA,
            deposit: depositA,
            status: 'approved',
            movementCode: 'PXK-DH-2026-001-A',
            note: 'Đủ hàng - Xuất kho ngay lập tức',
          },
          orderB: {
            code: 'DH-2026-001-B',
            qty: qtyB,
            totalAmount: amountB,
            deposit: depositB,
            status: 'pending_approval',
            note: 'Chờ nhập lô hàng mới từ nhà cung cấp',
          },
          message:
            'TỒN KHO THIẾU. Hệ thống tự động kích hoạt SELECT FOR UPDATE, tách thành Đơn A (xuất ngay) và Đơn B (chờ hàng), tự động chia tỷ lệ tiền cọc theo trị giá.',
        });
      }

      setIsRunning(false);
    }, 600);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title & Architectural Explanation */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Bộ Máy Xử Lý Kho FIFO & Tách Đơn Tự Động
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SELECT FOR UPDATE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chống triệt để hiện tượng Race Condition khi nhiều nhân viên sale cùng chốt đơn cùng một thời điểm
              </p>
            </div>
          </div>

          <button
            onClick={resetBatches}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700 self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Khôi phục kho ban đầu
          </button>
        </div>

        {/* 3 Step Protocol Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              1. Khóa Độc Quyền Dòng
            </div>
            <p className="text-[11px] text-slate-400">
              Thực thi <code className="text-emerald-300 font-mono">SELECT * FROM orders ... FOR UPDATE</code> và <code className="text-emerald-300 font-mono">inventory_batches ... FOR UPDATE</code> để ngăn luồng khác ghi đè.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-855 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Layers className="w-3.5 h-3.5" />
              2. Trừ Kho FIFO Theo Lô Cũ Nhất
            </div>
            <p className="text-[11px] text-slate-400">
              Ưu tiên trừ cạn lô có <code className="text-sky-300 font-mono">import_date ASC</code> trước. Ghi nhận chính xác giá vốn (unit_cost) vào phiếu xuất kho.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              3. Tự Động Tách Đơn A & B
            </div>
            <p className="text-[11px] text-slate-400">
              Nếu thiếu hàng: Tạo Đơn A (xuất ngay) và Đơn B (chờ hàng), tự động chia tỷ lệ cọc pro-rata theo giá trị đơn.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input parameters & Current FIFO Batches in Warehouse */}
        <div className="lg:col-span-6 space-y-5">
          {/* Order Input Form */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Mô Phỏng Đơn Hàng Bán Ra</span>
              <span className="text-[11px] text-slate-400 font-normal">
                SKU: Vợt Cầu Lông Yonex Astrox 77 Pro
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Số lượng đặt mua (Cây)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tồn kho khả dụng: <strong className="text-emerald-400">{totalStockAvailable} cây</strong>
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Đơn giá bán niêm yết
                </label>
                <input
                  type="number"
                  step="50000"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {formatVND(unitPrice)} / cây
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Tiền khách cọc trước
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={prepaidAmount}
                  onChange={(e) => setPrepaidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {formatVND(prepaidAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Tổng giá trị đơn: <strong className="text-white font-mono">{formatVND(orderQty * unitPrice)}</strong>
              </div>

              <button
                onClick={runFifoSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Đang thực thi ACID lock...' : 'Chạy Trừ Kho FIFO'}
              </button>
            </div>
          </div>

          {/* Current Batches in Warehouse Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Danh Sách Lô FIFO Trong Kho (inventory_batches)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Order by import_date ASC
              </span>
            </div>

            <div className="space-y-2">
              {batches.map((b, idx) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border transition-all ${
                    b.allocatedQty > 0
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Lô #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {b.batchNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (Nhập ngày: {b.importDate})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {b.remainingQty} / {b.initialQty} cây
                      </span>
                      {b.allocatedQty > 0 && (
                        <span className="ml-2 text-[10px] font-mono text-amber-400 font-semibold">
                          [Đã xuất: {b.allocatedQty}]
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>
                      Giá vốn nhập: <strong className="text-slate-200 font-mono">{formatVND(b.unitCost)}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ID: {b.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Simulation Output & ACID Transaction Result */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Kết Quả Giao Dịch PL/pgSQL</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                ACID · Serializable Safety
              </span>
            </h3>

            {!simulationResult && (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Nhập số lượng đơn hàng và bấm <strong className="text-amber-400 font-semibold">"Chạy Trừ Kho FIFO"</strong> để quan sát phản ứng của Stored Procedure khi đủ hàng và khi thiếu hàng (tự tách Đơn A & Đơn B).
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => { setOrderQty(8); }}
                    className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    Thử Đủ Hàng (8 cây)
                  </button>
                  <button
                    onClick={() => { setOrderQty(20); }}
                    className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    Thử Thiếu Hàng (20 cây &gt; 16 tồn)
                  </button>
                </div>
              </div>
            )}

            {simulationResult && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    simulationResult.splitRequired
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  {simulationResult.splitRequired ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        simulationResult.splitRequired ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {simulationResult.splitRequired
                        ? 'ĐÃ TÁCH THÀNH 2 ĐƠN HÀNG (ĐƠN A & ĐƠN B)'
                        : 'PHÂN BỔ THÀNH CÔNG 100% - KHÔNG CẦN TÁCH ĐƠN'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {simulationResult.message}
                    </p>
                  </div>
                </div>

                {/* Scenario 1 Output (Full) */}
                {!simulationResult.splitRequired && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mã đơn hàng:</span>
                      <span className="font-mono font-bold text-white">DH-2026-001</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Trạng thái mới:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                        approved
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Phiếu xuất kho:</span>
                      <span className="font-mono text-emerald-400">{simulationResult.movementCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tổng tiền / Tiền cọc:</span>
                      <span className="font-mono text-white">
                        {formatVND(simulationResult.totalAmount)} / cọc {formatVND(simulationResult.prepaidAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Scenario 2 Output (Split into Order A and Order B) */}
                {simulationResult.splitRequired && (
                  <div className="space-y-3">
                    {/* Order A Card */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-300 font-mono">
                            {simulationResult.orderA.code} (ĐƠN A - ĐỦ HÀNG)
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                            {simulationResult.orderA.status}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {simulationResult.orderA.qty} Cây (Xuất ngay)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono pt-1">
                        <div>Trị giá: <strong>{formatVND(simulationResult.orderA.totalAmount)}</strong></div>
                        <div>Cọc phân bổ (Pro-rata): <strong className="text-emerald-300">{formatVND(simulationResult.orderA.deposit)}</strong></div>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Phiếu xuất: <code className="text-emerald-400 font-mono">{simulationResult.orderA.movementCode}</code> · {simulationResult.orderA.note}
                      </div>
                    </div>

                    {/* Order B Card */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            {simulationResult.orderB.code} (ĐƠN B - CHỜ HÀNG)
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                            {simulationResult.orderB.status}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {simulationResult.orderB.qty} Cây (Thiếu hàng)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono pt-1">
                        <div>Trị giá: <strong>{formatVND(simulationResult.orderB.totalAmount)}</strong></div>
                        <div>Cọc phân bổ (Pro-rata): <strong className="text-amber-300">{formatVND(simulationResult.orderB.deposit)}</strong></div>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Liên kết đơn cha: <code className="text-slate-300 font-mono">{simulationResult.originalOrder.code}</code> · {simulationResult.orderB.note}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Log Recorded */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Audit Log ghi nhận bảng orders</span>
                  </div>
                  <span className="text-emerald-400">ACID Committed</span>
                </div>
              </div>
            )}
          </div>

          {/* Stored Procedure Code Excerpt */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-2">
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Đoạn mã cốt lõi chống Race Condition trong fn_allocate_stock_fifo_and_split_order:
            </div>
            <pre className="text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`-- Khóa đơn hàng mục tiêu chống đồng thời
SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

-- Quét và khóa các lô kho theo thứ tự ngày nhập (FIFO)
FOR v_batch IN 
    SELECT * FROM inventory_batches
    WHERE product_id = v_item.product_id
      AND warehouse_id = v_order.warehouse_id
      AND quantity_remaining > 0
    ORDER BY import_date ASC, created_at ASC
    FOR UPDATE
LOOP
    -- Trừ kho từng lô & Ghi nhận giá vốn thực tế
END LOOP;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
