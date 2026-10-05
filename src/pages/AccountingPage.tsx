import React from 'react';
import { AccountingModule } from '../components/accounting/AccountingModule';
import { UserRole } from '../types/erp';

interface AccountingPageProps {
  currentRole: UserRole;
  currentUserId: string;
}

const AccountingPage: React.FC<AccountingPageProps> = ({ currentRole, currentUserId }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <AccountingModule
        currentRole={currentRole}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default AccountingPage;
