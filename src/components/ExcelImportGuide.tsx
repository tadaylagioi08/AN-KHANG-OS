import React, { useState } from 'react';
import { Layers, Copy, Check, FileSpreadsheet, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { AUDIT_STEPS_8_CHECK } from '../data/schemaData';

export const ExcelImportGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyHeaders = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const importTemplates = [
    {
      id: 'products',
      name: 'Danh Mục Sản Phẩm (products)',
      fileName: 'mau_import_san_pham_khangan.csv',
      headers: 'code,name,unit,category_name',
      description: 'Mã SKU duy nhất, tên sản phẩm cầu lông, đơn vị tính (Cây, Ống, Quả...), tên nhóm hàng tương ứng trong product_categories.',
      sampleRows: [
        'VOT-YONEX-AX77PRO,Vợt Cầu Lông Yonex Astrox 77 Pro,Cây,Vợt Cầu Lông',
        'VOT-VICTOR-TK-RYUGA2,Vợt Cầu Lông Victor Thruster Ryuga II,Cây,Vợt Cầu Lông',
        'CAU-HAIYEN-S100,Ống Cầu Lông Hải Yến S100 Đỏ (12 Quả),Ống,Cầu Lông',
        'GIAY-LINING-HALBERTEC,Giày Cầu Lông Lining Halbertec Pro,Đôi,Giày Thể Thao'
      ]
    },
    {
      id: 'customers',
      name: 'Khách Hàng & Đại Lý (customers)',
      fileName: 'mau_import_khach_hang_khangan.csv',
      headers: 'code,name,phone,address,debt_limit,current_debt',
      description: 'Mã khách hàng, tên đại lý sỉ hoặc khách lẻ, số điện thoại, địa chỉ giao hàng, hạn mức công nợ (VNĐ), dư nợ ban đầu (VNĐ).',
      sampleRows: [
        'DL-HN-001,Đại Lý Cầu Lông Tuấn Sport Hà Nội,0912345678,Số 18 Hoàng Cầu - Đống Đa - HN,200000000,0',
        'DL-HCM-002,Shop Cầu Lông VNB Sports Quận 10,0987654321,17 Hòa Hưng - Phường 12 - Q10 - TP.HCM,150000000,0',
        'KH-LE-001,Nguyễn Văn An (CLB Cầu Lông Khang An),0905112233,Sân cầu lông Kỳ Hòa - Q10,0,0'
      ]
    },
    {
      id: 'suppliers',
      name: 'Nhà Cung Cấp Dụng Cụ (suppliers)',
      fileName: 'mau_import_nha_cung_cap_khangan.csv',
      headers: 'code,name,phone,address,tax_code,current_debt',
      description: 'Mã nhà cung cấp, tên công ty phân phối chính hãng (Yonex Sunrise, Victor VN...), hotline, địa chỉ, mã số thuế và dư nợ phải trả ban đầu.',
      sampleRows: [
        'NCC-SUNRISE-VN,Công Ty TNHH Sunrise Sports (Yonex VN),02438889999,Tòa nhà Sunrise - Cầu Giấy - Hà Nội,0101234567,0',
        'NCC-VICTOR-VN,Công Ty CP Thể Thao Victor Việt Nam,02839998888,Tân Bình - TP. Hồ Chí Minh,0309876543,0',
        'NCC-HAIYEN,Công Ty TNHH Thể Thao Hải Yến,02837776666,Bình Tân - TP. Hồ Chí Minh,0301122334,0'
      ]
    },
    {
      id: 'inventory_batches',
      name: 'Tồn Kho Đầu Kỳ Theo Lô FIFO (inventory_batches)',
      fileName: 'mau_import_lo_kho_dau_ky_fifo.csv',
      headers: 'product_code,warehouse_code,batch_number,import_date,unit_cost,quantity_imported,quantity_remaining',
      description: 'Lô hàng tồn kho ban đầu với ngày nhập (import_date) để thuật toán FIFO phân bổ chính xác ngay khi vận hành hệ thống.',
      sampleRows: [
        'VOT-YONEX-AX77PRO,KHO_SI,LOT-2026-01-A,2026-01-10,2800000,50,50',
        'VOT-YONEX-AX77PRO,KHO_SI,LOT-2026-02-B,2026-02-15,2900000,70,70',
        'CAU-HAIYEN-S100,KHO_SI,LOT-HY-2026-01,2026-01-20,210000,500,500',
        'VOT-YONEX-AX77PRO,KHO_LE,LOT-2026-03-C,2026-03-01,3000000,20,20'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Zero Dummy Data Confirmation Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Cam Kết Cơ Sở Dữ Liệu Sạch 100% (Zero Dummy Data)
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Excel Ready
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Toàn bộ 18 bảng trong file SQL được thiết kế với cấu trúc chuẩn, khóa ngoại, ràng buộc CHECK và khóa duy nhất UNIQUE nhưng <strong>hoàn toàn không có bất kỳ lệnh INSERT dữ liệu mẫu nào</strong>. Điều này đảm bảo khi doanh nghiệp Khang An import dữ liệu thật từ Excel/CSV sẽ không gặp xung đột khóa hoặc sai lệch sổ sách kế toán.
            </p>
          </div>
        </div>
      </div>

      {/* CSV / Excel Header Templates */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Cấu Trúc Cột Mẫu Để Chuẩn Bị File Excel / CSV Import
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-750 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {tpl.name}
                </span>
                <button
                  onClick={() => copyHeaders(tpl.id, tpl.headers)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {copiedKey === tpl.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép Header</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Cột CSV</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-snug">
                {tpl.description}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {tpl.headers}
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Ví dụ định dạng dòng dữ liệu:
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-900 font-mono text-[10px] text-slate-400 space-y-1 overflow-x-auto">
                  {tpl.sampleRows.map((row, i) => (
                    <div key={i} className="whitespace-nowrap">{row}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Step Month Period Lock Specification */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Quy Trình Kiểm Tra 8/8 Bước Khóa Sổ Tháng (period_locks)
            </span>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
              CHECK (checks_passed = 8)
            </span>
          </div>
          <span className="text-xs text-slate-400">Kế Toán Trưởng & CEO Duyệt</span>
        </div>

        <p className="text-xs text-slate-400">
          Trong bảng <code className="text-purple-300 font-mono">period_locks</code>, ràng buộc kiểm tra toàn vẹn kế toán đòi hỏi cờ <code className="text-white font-mono">checks_passed</code> phải đạt đủ 8/8 bước kiểm soát mới cho phép kích hoạt <code className="text-white font-mono">is_locked = true</code> nhằm đảm bảo an toàn tuyệt đối trước khi đóng kỳ tài chính.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {AUDIT_STEPS_8_CHECK.map((s) => (
            <div
              key={s.step}
              className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-200">
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Phụ trách: {s.department}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
