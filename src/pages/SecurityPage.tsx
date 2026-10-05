import React from 'react';
import { SecurityModule } from '../components/security/SecurityModule';
import { UserRole } from '../types/erp';

interface SecurityPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onDataChanged?: () => void;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ currentRole, currentUserId, onDataChanged }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SecurityModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onDataChanged={onDataChanged}
        defaultSubTab="audit"
      />
    </div>
  );
};

export default SecurityPage;
