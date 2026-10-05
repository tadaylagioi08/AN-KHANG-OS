import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  title?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ title = 'Đang tải dữ liệu module...' }) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-2xl border border-[#f0dfe2] shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-[#9f3244]/10 text-[#9f3244] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#9f3244]" />
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-bold text-[#1e293b]">{title}</div>
        <div className="text-xs text-[#64748b]">KHANG AN OS · Kiến trúc Dynamic Code Splitting</div>
      </div>
    </div>
  );
};
