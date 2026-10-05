import React from 'react';
import { ReturnModule } from '../components/returns/ReturnModule';
import { UserRole } from '../types/erp';

interface ReturnsPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

const ReturnsPage: React.FC<ReturnsPageProps> = ({ currentRole, currentUserId, onOpenMasterModal }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReturnModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onOpenMasterModal={onOpenMasterModal}
      />
    </div>
  );
};

export default ReturnsPage;
