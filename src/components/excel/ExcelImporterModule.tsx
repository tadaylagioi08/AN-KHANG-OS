import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { erpStorage } from '../../services/erpStorage';
import { UserRole } from '../../types/erp';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Table,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';

interface ExcelImporterModuleProps {
  currentRole: UserRole;
  currentUserId: string;
  onDataChanged: () => void;
}

type FileTemplateType = 'products' | 'customers' | 'suppliers' | 'batches' | 'opening_debt';

interface TemplateConfig {
  id: FileTemplateType;
  fileName: string;
  title: string;
  description: string;
  columns: string[];
  sampleData: any[][];
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'products',
    fileName: '1_Danh_muc_san_pham.xlsx',
    title: '1. Danh Mục Sản Phẩm & Trần Chiết Khấu',
    description: 'Mã SP (duy nhất), Tên sản phẩm, Đơn vị tính, Nhóm hàng, Trần chiết khấu %, Giá bán lẻ',
    columns: ['Mã SP', 'Tên Sản Phẩm', 'Đơn Vị Tính', 'Nhóm Hàng', 'Trần Chiết Khấu %', 'Giá Bán Lẻ Đề Xuất'],
    sampleData: [
      ['VOT-AX77PRO', 'Vợt Cầu Lông Yonex Astrox 77 Pro 4U', 'Cây', 'Vợt Cầu Lông Cao Cấp', 15, 3850000],
      ['VOT-100ZZ', 'Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai', 'Cây', 'Vợt Cầu Lông Cao Cấp', 15, 4450000],
      ['CAU-S100', 'Ống Cầu Lông Hải Yến S100 Đỏ (12 Quả)', 'Ống', 'Quả Cầu Lông Thi Đấu', 5, 240000],
      ['GIAY-65Z3', 'Giày Cầu Lông Yonex Power Cushion 65Z3', 'Đôi', 'Giày Cầu Lông Chuyên Dụng', 10, 2690000],
    ],
  },
  {
    id: 'customers',
    fileName: '2_Khach_hang.xlsx',
    title: '2. Danh Sách Khách Hàng / Đại Lý & Hạn Mức Nợ',
    description: 'Mã KH (duy nhất), Tên khách/Đại lý, Số điện thoại, Địa chỉ, Hạn mức công nợ cho phép',
    columns: ['Mã KH', 'Tên Khách Hàng', 'Số Điện Thoại', 'Địa Chỉ', 'Hạn Mức Công Nợ (VNĐ)'],
    sampleData: [
      ['DL-TUAN-HN', 'Đại Lý Cầu Lông Tuấn Sport (Hà Nội)', '0912345678', 'Số 18 Hoàng Cầu - Đống Đa - Hà Nội', 40000000],
      ['DL-VNB-Q10', 'Hệ Thống VNB Sports Chi Nhánh Q10', '0987654321', '17 Hòa Hưng - Phường 12 - Q10 - TP.HCM', 100000000],
      ['KH-LE-ANH', 'Anh Hoàng (Khách VIP Sân Khang An)', '0903112233', 'Sân Cầu Lông Khang An - Tân Bình - TP.HCM', 5000000],
    ],
  },
  {
    id: 'suppliers',
    fileName: '3_Nha_cung_cap.xlsx',
    title: '3. Danh Sách Nhà Cung Cấp',
    description: 'Mã NCC (duy nhất), Tên nhà cung cấp, Mã số thuế, Số điện thoại, Địa chỉ',
    columns: ['Mã NCC', 'Tên Nhà Cung Cấp', 'Mã Số Thuế', 'Số Điện Thoại', 'Địa Chỉ'],
    sampleData: [
      ['NCC-SUNRISE', 'Công Ty TNHH Sunrise Sports (Phân Phối Yonex VN)', '0101234567', '02438889999', 'Sunrise Tower - Cầu Giấy - Hà Nội'],
      ['NCC-HAIYEN', 'Công Ty Thể Thao Hải Yến', '0301122334', '02837776666', 'Bình Tân - TP.HCM'],
    ],
  },
  {
    id: 'batches',
    fileName: '4_Ton_kho_dau_ky_FIFO.xlsx',
    title: '4. Tồn Kho Đầu Kỳ Theo Lô FIFO',
    description: 'Mã SP, Mã Kho (KHO_SI hoặc KHO_LE), Số lượng tồn, Giá vốn nhập, Ngày nhập lô (YYYY-MM-DD)',
    columns: ['Mã SP', 'Mã Kho', 'Số Hiệu Lô', 'Số Lượng Tồn', 'Giá Vốn Nhập (VNĐ)', 'Ngày Nhập Lô'],
    sampleData: [
      ['VOT-AX77PRO', 'KHO_SI', 'LOT-2026-01-A', 5, 2800000, '2026-01-10'],
      ['VOT-AX77PRO', 'KHO_SI', 'LOT-2026-02-B', 7, 2900000, '2026-02-15'],
      ['CAU-S100', 'KHO_SI', 'LOT-CAU-01', 50, 190000, '2026-02-01'],
      ['VOT-100ZZ', 'KHO_SI', 'LOT-100ZZ-01', 4, 3200000, '2026-01-20'],
    ],
  },
  {
    id: 'opening_debt',
    fileName: '5_Cong_no_dau_ky.xlsx',
    title: '5. Số Dư Công Nợ Đầu Kỳ',
    description: 'Mã KH hoặc Mã NCC, Số tiền nợ đầu kỳ (Dương: Nợ phải thu/phải trả)',
    columns: ['Mã Đối Tác (KH hoặc NCC)', 'Tên Đối Tác Tham Khảo', 'Số Dư Nợ Đầu Kỳ (VNĐ)'],
    sampleData: [
      ['DL-TUAN-HN', 'Đại Lý Cầu Lông Tuấn Sport (Hà Nội)', 15000000],
      ['NCC-SUNRISE', 'Công Ty TNHH Sunrise Sports', 35000000],
    ],
  },
];

export const ExcelImporterModule: React.FC<ExcelImporterModuleProps> = ({
  currentRole,
  currentUserId,
  onDataChanged,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FileTemplateType>('products');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileNameUploaded, setFileNameUploaded] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const activeTemplateConfig = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  // 1-Click Generate & Download Real .xlsx File
  const handleDownloadTemplate = (config: TemplateConfig) => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [config.columns, ...config.sampleData];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu Khang An');
      XLSX.writeFile(wb, config.fileName);
      setFeedback({
        message: `Đã tải xuống file mẫu "${config.fileName}". Bạn có thể chỉnh sửa số liệu và upload lại trực tiếp.`,
        type: 'success',
      });
    } catch (e: any) {
      setFeedback({ message: 'Lỗi khi tạo file Excel mẫu: ' + e.message, type: 'error' });
    }
  };

  // Upload and Read Excel directly in browser using SheetJS (XLSX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileNameUploaded(file.name);
    setFeedback(null);
    setValidationErrors([]);
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length < 2) {
          setValidationErrors(['File Excel rỗng hoặc không có dòng dữ liệu hợp lệ!']);
          return;
        }

        // Validate headers and rows
        const headers = rawJson[0].map((h: any) => String(h || '').trim());
        const dataRows = rawJson.slice(1).filter((r) => r.length > 0 && r.some((cell) => cell !== undefined && cell !== ''));

        const errors: string[] = [];
        const validated: any[] = [];
        const seenCodes = new Set<string>();

        dataRows.forEach((row, idx) => {
          const rowNum = idx + 2; // Excel row numbering starts at 1, header is row 1
          if (selectedTemplate === 'products') {
            const code = String(row[0] || '').trim().toUpperCase();
            const name = String(row[1] || '').trim();
            const unit = String(row[2] || '').trim() || 'Cây';
            const catName = String(row[3] || '').trim();
            const discountCeiling = Number(row[4]) || 15;
            const basePrice = Number(row[5]) || 0;

            if (!code) errors.push(`Dòng ${rowNum}: Thiếu Mã SP!`);
            if (!name) errors.push(`Dòng ${rowNum}: Thiếu Tên sản phẩm!`);
            if (!catName) errors.push(`Dòng ${rowNum}: Thiếu Nhóm hàng!`);
            if (seenCodes.has(code)) errors.push(`Dòng ${rowNum}: Trùng Mã SP "${code}" trong file!`);
            seenCodes.add(code);

            validated.push({ code, name, unit, category_name: catName, discount_ceiling: discountCeiling, base_price: basePrice });
          } else if (selectedTemplate === 'customers') {
            const code = String(row[0] || '').trim().toUpperCase();
            const name = String(row[1] || '').trim();
            const phone = String(row[2] || '').trim();
            const address = String(row[3] || '').trim();
            const debtLimit = Number(row[4]) || 0;

            if (!code) errors.push(`Dòng ${rowNum}: Thiếu Mã KH!`);
            if (!name) errors.push(`Dòng ${rowNum}: Thiếu Tên khách hàng!`);
            if (seenCodes.has(code)) errors.push(`Dòng ${rowNum}: Trùng Mã KH "${code}" trong file!`);
            seenCodes.add(code);

            validated.push({ code, name, phone, address, debt_limit: debtLimit });
          } else if (selectedTemplate === 'suppliers') {
            const code = String(row[0] || '').trim().toUpperCase();
            const name = String(row[1] || '').trim();
            const taxCode = String(row[2] || '').trim();
            const phone = String(row[3] || '').trim();
            const address = String(row[4] || '').trim();

            if (!code) errors.push(`Dòng ${rowNum}: Thiếu Mã NCC!`);
            if (!name) errors.push(`Dòng ${rowNum}: Thiếu Tên nhà cung cấp!`);
            if (seenCodes.has(code)) errors.push(`Dòng ${rowNum}: Trùng Mã NCC "${code}" trong file!`);
            seenCodes.add(code);

            validated.push({ code, name, tax_code: taxCode, phone, address });
          } else if (selectedTemplate === 'batches') {
            const prodCode = String(row[0] || '').trim().toUpperCase();
            const whCode = String(row[1] || '').trim().toUpperCase() || 'KHO_SI';
            const batchNo = String(row[2] || '').trim().toUpperCase() || `LOT-${Date.now().toString().slice(-4)}`;
            const qty = Number(row[3]) || 0;
            const unitCost = Number(row[4]) || 0;
            const importDate = String(row[5] || '').trim() || new Date().toISOString().split('T')[0];

            if (!prodCode) errors.push(`Dòng ${rowNum}: Thiếu Mã SP!`);
            if (qty <= 0) errors.push(`Dòng ${rowNum}: Số lượng tồn phải > 0!`);
            if (unitCost < 0) errors.push(`Dòng ${rowNum}: Giá vốn nhập không được âm!`);

            validated.push({ product_code: prodCode, warehouse_code: whCode, batch_number: batchNo, quantity: qty, unit_cost: unitCost, import_date: importDate });
          } else if (selectedTemplate === 'opening_debt') {
            const partnerCode = String(row[0] || '').trim().toUpperCase();
            const partnerName = String(row[1] || '').trim();
            const debtAmount = Number(row[2]) || 0;

            if (!partnerCode) errors.push(`Dòng ${rowNum}: Thiếu Mã đối tác (Mã KH hoặc Mã NCC)!`);
            validated.push({ partner_code: partnerCode, partner_name: partnerName, debt_amount: debtAmount });
          }
        });

        setValidationErrors(errors);
        setParsedRows(validated);

        if (errors.length > 0) {
          setFeedback({
            message: `Phát hiện ${errors.length} lỗi tính hợp lệ dữ liệu. Vui lòng kiểm tra danh sách chi tiết các dòng bên dưới trước khi lưu!`,
            type: 'error',
          });
        } else {
          setFeedback({
            message: `Đã đọc và xác thực thành công ${validated.length} dòng dữ liệu từ file "${file.name}". Sẵn sàng nạp vào hệ thống.`,
            type: 'success',
          });
        }
      } catch (err: any) {
        setFeedback({ message: 'Lỗi định dạng file Excel: ' + err.message, type: 'error' });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Import into Database
  const handleCommitImport = () => {
    if (parsedRows.length === 0 || validationErrors.length > 0) return;

    try {
      const res = erpStorage.bulkImportExcelData(selectedTemplate, parsedRows, currentUserId);
      setFeedback({
        message: `${res.message} (Đã ghi nhật ký kiểm toán hệ thống)`,
        type: 'success',
      });
      setParsedRows([]);
      setFileNameUploaded('');
      onDataChanged();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lỗi khi nạp dữ liệu vào cơ sở dữ liệu', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-950">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Khởi Tạo Dữ Liệu Thật Từ Excel (Zero Dummy Data)
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SheetJS XLSX Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Đọc trực tiếp file Excel trên trình duyệt · Kiểm tra tính hợp lệ từng dòng · Nạp dữ liệu sạch vào CSDL Khang An
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadTemplate(activeTemplateConfig)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Tải File Mẫu (.xlsx)
            </button>
          </div>
        </div>

        {/* 5 Template Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setParsedRows([]);
                setValidationErrors([]);
                setFeedback(null);
                setFileNameUploaded('');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                selectedTemplate === tpl.id
                  ? 'bg-slate-850 border-emerald-500/50 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="font-mono text-xs font-bold truncate text-emerald-400">
                {tpl.fileName}
              </div>
              <div className="text-[11px] font-semibold line-clamp-1">{tpl.title}</div>
            </button>
          ))}
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
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
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

      {/* Active Template Upload Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              {activeTemplateConfig.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu trúc cột: <span className="font-mono text-emerald-300">{activeTemplateConfig.columns.join(' | ')}</span>
            </p>
          </div>

          <button
            onClick={() => handleDownloadTemplate(activeTemplateConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Tải mẫu {activeTemplateConfig.fileName}
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-950/60 transition space-y-3">
          <Upload className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <label className="text-sm font-bold text-white cursor-pointer hover:text-emerald-300 transition">
              Bấm để chọn file Excel (.xlsx, .xls, .csv)
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-500">
              Hệ thống sử dụng thư viện SheetJS để giải mã trực tiếp trên trình duyệt, không gửi file qua bên thứ ba
            </p>
          </div>

          {fileNameUploaded && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-mono border border-emerald-500/20">
              <FileCheck className="w-3.5 h-3.5" />
              Đã nạp file: <strong>{fileNameUploaded}</strong>
            </div>
          )}
        </div>

        {/* Validation Errors List (If any) */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-2">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Chi Tiết Lỗi Dữ Liệu Cần Sửa ({validationErrors.length} lỗi):
            </div>
            <ul className="text-xs text-rose-200 font-mono space-y-1 max-h-40 overflow-y-auto pl-4 list-disc">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && validationErrors.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
              <span>Xem Trước Dữ Liệu Hợp Lệ ({parsedRows.length} Dòng)</span>
              <span className="text-[11px] text-emerald-400 font-mono">✓ 100% Valid</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">#</th>
                    {Object.keys(parsedRows[0]).map((key) => (
                      <th key={key} className="py-2.5 px-3">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      {Object.values(row).map((val: any, cidx) => (
                        <td key={cidx} className="py-2 px-3 text-slate-300">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Hiển thị tối đa 10 dòng đầu xem trước (Tổng số: {parsedRows.length} dòng).
              </span>

              <button
                onClick={handleCommitImport}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 cursor-pointer flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Xác Nhận Nạp Vào CSDL Khang An OS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
