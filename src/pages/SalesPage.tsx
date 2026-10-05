import React from 'react';
import { SalesModule } from '../components/sales/SalesModule';
import { UserRole } from '../types/erp';

interface SalesPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

const SalesPage: React.FC<SalesPageProps> = ({ currentRole, currentUserId, onOpenMasterModal }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SalesModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onOpenMasterModal={onOpenMasterModal}
      />
    </div>
  );
};

export default SalesPage;
