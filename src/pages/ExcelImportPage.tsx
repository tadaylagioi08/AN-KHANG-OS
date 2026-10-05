import React from 'react';
import { ExcelImporterModule } from '../components/excel/ExcelImporterModule';
import { UserRole } from '../types/erp';

interface ExcelImportPageProps {
  currentRole: UserRole;
  currentUserId: string;
  onDataChanged: () => void;
}

const ExcelImportPage: React.FC<ExcelImportPageProps> = ({ currentRole, currentUserId, onDataChanged }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ExcelImporterModule
        currentRole={currentRole}
        currentUserId={currentUserId}
        onDataChanged={onDataChanged}
      />
    </div>
  );
};

export default ExcelImportPage;
