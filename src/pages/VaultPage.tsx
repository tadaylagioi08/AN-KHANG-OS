import React from 'react';
import { SecurityModule } from '../components/security/SecurityModule';
import { UserRole } from '../types/erp';
import { FolderLock, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface VaultPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onDataChanged?: () => void;
  onSwitchToAuthorizedRole?: () => void;
}

const VaultPage: React.FC<VaultPageProps> = ({
  currentRole,
  currentUserId,
  onDataChanged,
  onSwitchToAuthorizedRole,
}) => {
  const isVaultAuthorized = currentRole === UserRole.ROLE_CEO || currentRole === UserRole.ROLE_LEGAL;

  if (!isVaultAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 rounded-2xl bg-white border border-[#f0dfe2] shadow-lg text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#9f3244]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#9f3244]/10 text-[#9f3244] border border-[#9f3244]/20 uppercase tracking-wider">
            RLS Policy: Restrict Access to Private Vault
          </span>
          <h2 className="text-xl font-bold text-[#1e293b]">
            NGĂN LƯU VĂN THƯ BỊ KHÓA BỞI QUYỀN TRUY CẬP (RBAC)
          </h2>
          <p className="text-xs text-[#64748b] max-w-lg mx-auto leading-relaxed">
            Ngăn <strong>"Lưu văn thư mật"</strong> (Storage Bucket <code>private_vault</code>) chứa các hồ sơ pháp lý, Hợp đồng lao động và Quy chế nội bộ của Công ty TNHH Khang An Badminton.
            Theo quy định bảo mật, chỉ có tài khoản <strong>Tổng Giám Đốc (ROLE_CEO)</strong> và <strong>Trưởng phòng Pháp chế (ROLE_LEGAL)</strong> mới được phép mở và thao tác.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#fbf5f6] border border-[#f0dfe2] text-xs font-mono text-[#7a2432] inline-block text-left space-y-1">
          <div>• Tài khoản hiện tại: <strong className="text-[#9f3244]">{currentUserId}</strong></div>
          <div>• Vai trò hiện tại: <strong className="text-[#9f3244]">{currentRole}</strong> (Không có quyền)</div>
          <div>• Yêu cầu: <span className="text-emerald-700 font-bold">role IN (ROLE_CEO, ROLE_LEGAL)</span></div>
        </div>

        {onSwitchToAuthorizedRole && (
          <div className="pt-2">
            <button
              onClick={onSwitchToAuthorizedRole}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9f3244] hover:bg-[#7a2432] text-white text-xs font-bold transition shadow-md shadow-[#9f3244]/20 cursor-pointer"
            >
              <span>Chuyển sang vai trò TP Pháp chế (ROLE_LEGAL)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SecurityModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onDataChanged={onDataChanged}
        defaultSubTab="vault"
      />
    </div>
  );
};

export default VaultPage;
