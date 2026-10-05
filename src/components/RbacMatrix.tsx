import React, { useState } from 'react';
import { USER_ROLES, RoleDef } from '../data/schemaData';
import { ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, UserCheck, CheckCircle2, XCircle } from 'lucide-react';

export const RbacMatrix: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('ROLE_SALES_REP');

  const currentRole = USER_ROLES.find((r) => r.code === selectedRole) || USER_ROLES[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ma Trận Phân Quyền 12 Roles & Row Level Security (RLS)
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PostgreSQL RLS
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kiểm soát truy cập tới từng dòng (Row Level) và bảo vệ an ninh giá vốn (Column Masking)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Chọn vai trò kiểm thử:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-950 border border-slate-750 text-emerald-400 text-xs font-mono font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {USER_ROLES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} - {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2 Critical Security Guarantees Required by User */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1: company_vault */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                1. Bảo Mật company_vault (Văn Thư Mật)
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                RLS Enforcement
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Quy tắc bắt buộc: Ngăn chặn tuyệt đối mọi user, <strong>CHỈ DUY NHẤT</strong> vai trò <code className="text-purple-300 font-mono font-bold">ceo</code> và <code className="text-purple-300 font-mono font-bold">legal</code> có quyền SELECT/INSERT.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Trạng thái vai trò hiện tại ({currentRole.code}):</span>
              {currentRole.canAccessVault ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CHO PHÉP TRUY CẬP (CEO / LEGAL)
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-400" /> BỊ CHẶN BỞI RLS (0 ROWS)
                </span>
              )}
            </div>
          </div>

          {/* Rule 2: unit_cost hiding */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                2. Bảo Mật Giá Vốn (unit_cost) Đối Với Salesman
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                Dynamic Masking View
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Quy tắc bắt buộc: Nhân viên kinh doanh (<code className="text-amber-300 font-mono font-bold">salesman</code>) không được xem cột <code className="text-amber-300 font-mono">unit_cost</code> trong bất kỳ bảng nào.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Hiển thị giá vốn cho ({currentRole.code}):</span>
              {currentRole.canViewCost ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Eye className="w-4 h-4 text-emerald-400" /> HIỂN THỊ ĐỦ GIÁ VỐN
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <EyeOff className="w-4 h-4 text-amber-400" /> BỊ CHE GIẤU THÀNH NULL
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Live Query View for Active Role */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Mô Phỏng Thực Thi Truy Vấn Với Phiên Của Vai Trò: <span className="text-emerald-400 font-mono">{currentRole.code} ({currentRole.title})</span></span>
          <span className="text-[11px] text-slate-400 font-mono">
            auth.uid() = {currentRole.code}-uuid-001
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Query 1: SELECT * FROM v_inventory_batches_secure */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-850 pb-2">
              <span className="text-sky-300">SELECT * FROM v_inventory_batches_secure;</span>
              <span className="text-[10px] text-slate-500">Security Barrier View</span>
            </div>

            <div className="overflow-x-auto text-[11px] font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-850">
                    <th className="py-1">batch_number</th>
                    <th className="py-1">import_date</th>
                    <th className="py-1 text-amber-300">unit_cost</th>
                    <th className="py-1">qty_remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  <tr>
                    <td className="py-1.5 font-bold">LOT-2026-01-A</td>
                    <td className="py-1.5">2026-01-10</td>
                    <td className="py-1.5 font-bold">
                      {currentRole.canViewCost ? (
                        <span className="text-emerald-400">2.800.000 đ</span>
                      ) : (
                        <span className="text-amber-400 bg-amber-500/10 px-1 rounded">NULL</span>
                      )}
                    </td>
                    <td className="py-1.5 text-slate-200">5 Cây</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold">LOT-2026-02-B</td>
                    <td className="py-1.5">2026-02-15</td>
                    <td className="py-1.5 font-bold">
                      {currentRole.canViewCost ? (
                        <span className="text-emerald-400">2.900.000 đ</span>
                      ) : (
                        <span className="text-amber-400 bg-amber-500/10 px-1 rounded">NULL</span>
                      )}
                    </td>
                    <td className="py-1.5 text-slate-200">7 Cây</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-slate-400 pt-1">
              {currentRole.canViewCost
                ? '✓ Vai trò có quyền kiểm toán tài chính - hiển thị nguyên bản unit_cost.'
                : '🔒 RLS & Security View tự động trả về NULL cho cột unit_cost đối với nhân viên kinh doanh.'}
            </p>
          </div>

          {/* Query 2: SELECT * FROM company_vault */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-850 pb-2">
              <span className="text-purple-300">SELECT * FROM company_vault;</span>
              <span className="text-[10px] text-slate-500">Row Level Security</span>
            </div>

            {currentRole.canAccessVault ? (
              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-850">
                      <th className="py-1">title</th>
                      <th className="py-1">category</th>
                      <th className="py-1">file_path</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="py-1.5 font-bold text-white">HDLD-2026-CEO.pdf</td>
                      <td className="py-1.5 text-purple-400">LABOR_CONTRACT</td>
                      <td className="py-1.5 text-slate-400">/vault/contracts/hdld-ceo.enc</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-white">QUY-CHE-LUONG-THUONG.pdf</td>
                      <td className="py-1.5 text-purple-400">REGULATION</td>
                      <td className="py-1.5 text-slate-400">/vault/regulations/qc-2026.enc</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-rose-400 text-xs font-mono bg-rose-500/5 rounded-lg border border-rose-500/20">
                <XCircle className="w-6 h-6 mx-auto mb-1 text-rose-400" />
                <div>0 ROWS RETURNED (ACCESS DENIED BY RLS)</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Chính sách `company_vault_ceo_legal_select` từ chối phiên truy cập của {currentRole.code}.
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-400 pt-1">
              {currentRole.canAccessVault
                ? '✓ Quyền hạn cấp cao (CEO / Legal) cho phép xem văn thư mật pháp lý.'
                : '🔒 RLS ngăn chặn triệt để. Mọi yêu cầu truy vấn từ người dùng không phải CEO hoặc Legal đều trả về rỗng.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive 12-Role Permissions Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Bảng Tổng Hợp Quyền Hạn Chi Tiết 12 Roles (Khang An OS)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">12 Vai Trò Tiêu Chuẩn</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Mã Role</th>
                <th className="py-3 px-4">Tên Vai Trò</th>
                <th className="py-3 px-4">Phòng Ban</th>
                <th className="py-3 px-4">Xem Giá Vốn</th>
                <th className="py-3 px-4">Company Vault</th>
                <th className="py-3 px-4">Quyền Đơn Hàng & Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {USER_ROLES.map((r) => {
                const isSelected = r.code === selectedRole;
                return (
                  <tr
                    key={r.code}
                    onClick={() => setSelectedRole(r.code)}
                    className={`hover:bg-slate-850/60 transition cursor-pointer ${
                      isSelected ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        <span className={isSelected ? 'text-emerald-400' : ''}>{r.code}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-200 font-medium">{r.title}</td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">{r.department}</td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {r.canViewCost ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <Eye className="w-3.5 h-3.5" /> Có
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <EyeOff className="w-3.5 h-3.5" /> ẨN (NULL)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {r.canAccessVault ? (
                        <span className="text-purple-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cho phép
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-slate-600" /> Bị chặn
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      <div className="line-clamp-1">{r.permissions.orders} · {r.permissions.inventory}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
