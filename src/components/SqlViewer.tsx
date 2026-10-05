import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, Search, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SqlViewerProps {
  sqlContent: string;
  onCopy: () => void;
  isCopied: boolean;
  onDownload: () => void;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({
  sqlContent,
  onCopy,
  isCopied,
  onDownload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<'all' | 'enums' | 'tables' | 'rls' | 'fifo' | 'triggers'>('all');

  // Filter sections if requested
  const filteredSql = useMemo(() => {
    if (filterSection === 'all') return sqlContent;
    
    const lines = sqlContent.split('\n');
    if (filterSection === 'enums') {
      const start = lines.findIndex(l => l.includes('1. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU ENUM'));
      const end = lines.findIndex(l => l.includes('2. HÀM DÙNG CHUNG CẬP NHẬT UPDATED_AT'));
      return lines.slice(start, end).join('\n');
    }
    if (filterSection === 'tables') {
      const start = lines.findIndex(l => l.includes('3. KHỞI TẠO 18 BẢNG CƠ SỞ DỮ LIỆU'));
      const end = lines.findIndex(l => l.includes('4. HÀM PHÂN QUYỀN HỖ TRỢ RLS'));
      return lines.slice(start, end).join('\n');
    }
    if (filterSection === 'rls') {
      const start = lines.findIndex(l => l.includes('4. HÀM PHÂN QUYỀN HỖ TRỢ RLS'));
      const end = lines.findIndex(l => l.includes('7. LOGIC KHO & ĐƠN HÀNG: FIFO'));
      return lines.slice(start, end).join('\n');
    }
    if (filterSection === 'fifo') {
      const start = lines.findIndex(l => l.includes('7. LOGIC KHO & ĐƠN HÀNG: FIFO'));
      const end = lines.findIndex(l => l.includes('8. TRIGGER TỰ ĐỘNG GHI NHẬT KÝ KIỂM TOÁN'));
      return lines.slice(start, end).join('\n');
    }
    if (filterSection === 'triggers') {
      const start = lines.findIndex(l => l.includes('8. TRIGGER TỰ ĐỘNG GHI NHẬT KÝ KIỂM TOÁN'));
      return lines.slice(start).join('\n');
    }
    return sqlContent;
  }, [sqlContent, filterSection]);

  const lineCount = useMemo(() => filteredSql.split('\n').length, [filteredSql]);

  return (
    <div className="space-y-4">
      {/* Top Banner Notice: Zero Dummy Data Guarantee */}
      <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Bộ Mã Nguồn SQL Thuần Chuẩn Supabase / PostgreSQL
              <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% Sạch - Không Dữ Liệu Rác
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chứa đầy đủ cấu trúc 18 bảng, kiểu ENUM, khóa ngoại, kiểm tra ràng buộc, hàm phân quyền RLS, che giá vốn cho Salesman và hàm FIFO trừ kho khóa chống tranh chấp <code className="text-emerald-300 font-mono">SELECT ... FOR UPDATE</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Đã sao chép' : 'Sao chép mã'}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Tải .sql
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium mr-1 shrink-0">Lọc phần:</span>
          {(
            [
              { id: 'all', label: 'Toàn bộ SQL' },
              { id: 'enums', label: '1. Kiểu ENUM' },
              { id: 'tables', label: '2. 18 Bảng' },
              { id: 'rls', label: '3. RLS & Che Giá Vốn' },
              { id: 'fifo', label: '4. FIFO SELECT FOR UPDATE' },
              { id: 'triggers', label: '5. Audit Trigger' },
            ] as const
          ).map((sec) => (
            <button
              key={sec.id}
              onClick={() => setFilterSection(sec.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition whitespace-nowrap cursor-pointer ${
                filterSection === sec.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm cú pháp SQL..."
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
          />
        </div>
      </div>

      {/* SQL Code Block with Line Numbers */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">khang_an_os_supabase_schema.sql</span>
            <span className="text-slate-600">·</span>
            <span>{lineCount} dòng</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">PostgreSQL 15+ / Supabase</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Dán vào Supabase: Dashboard &gt; SQL Editor &gt; New Query &gt; Run
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[640px] p-4 text-xs font-mono leading-relaxed selection:bg-emerald-500/30">
          <pre className="text-slate-300">
            {filteredSql.split('\n').map((line, idx) => {
              const isMatch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());
              const isComment = line.trim().startsWith('--');
              const isCreate = line.includes('CREATE TABLE') || line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE TYPE');
              const isConstraint = line.includes('PRIMARY KEY') || line.includes('REFERENCES') || line.includes('CHECK') || line.includes('UNIQUE');
              const isRls = line.includes('ROW LEVEL SECURITY') || line.includes('CREATE POLICY');
              const isLock = line.includes('FOR UPDATE');

              return (
                <div
                  key={idx}
                  className={`flex items-start hover:bg-slate-900/40 px-1 py-0.5 rounded ${
                    isMatch ? 'bg-amber-500/20 text-amber-200' : ''
                  }`}
                >
                  <span className="w-12 text-slate-600 select-none text-right pr-4 shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span
                    className={`flex-1 whitespace-pre ${
                      isComment
                        ? 'text-slate-500 italic'
                        : isCreate
                        ? 'text-teal-400 font-semibold'
                        : isLock
                        ? 'text-amber-400 font-bold bg-amber-500/10 px-1 rounded'
                        : isRls
                        ? 'text-purple-400'
                        : isConstraint
                        ? 'text-sky-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
