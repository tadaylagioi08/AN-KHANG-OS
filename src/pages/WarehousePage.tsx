import React from 'react';
import { WarehouseModule } from '../components/warehouse/WarehouseModule';
import { UserRole } from '../types/erp';

interface WarehousePageProps {
  currentRole: UserRole;
  currentUserId: string;
  onOpenMasterModal: () => void;
}

const WarehousePage: React.FC<WarehousePageProps> = ({ currentRole, currentUserId, onOpenMasterModal }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <WarehouseModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onOpenMasterModal={onOpenMasterModal}
      />
    </div>
  );
};

export default WarehousePage;
