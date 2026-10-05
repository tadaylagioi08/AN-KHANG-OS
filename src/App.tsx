import React, { useState, Suspense } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DESIGNATED_USERS, DesignatedUser } from './components/Header';
import { MasterDataModal } from './components/master/MasterDataModal';
import { PageLoading } from './components/common/PageLoading';

import { UserRole } from './types/erp';

// Dynamic code-split pages for high performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage'));
const SalesPage = React.lazy(() => import('./pages/SalesPage'));
const WarehousePage = React.lazy(() => import('./pages/WarehousePage'));
const AccountingPage = React.lazy(() => import('./pages/AccountingPage'));
const VaultPage = React.lazy(() => import('./pages/VaultPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ExcelImportPage = React.lazy(() => import('./pages/ExcelImportPage'));

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<DesignatedUser>(DESIGNATED_USERS[1]); // Default: ROLE_CEO (Trí — Tổng Giám Đốc)
  const [isMasterModalOpen, setIsMasterModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);

  const handleUserChange = (user: DesignatedUser) => {
    setCurrentUser(user);
    // If switched to ROLE_ADMIN, open admin page
    if (user.role === UserRole.ROLE_ADMIN) {
      setActiveTab('admin');
      return;
    }
    // If user switches to a non-admin role while in admin tab, fallback to dashboard
    if (activeTab === 'admin') {
      setActiveTab('dashboard');
    }
    if (activeTab === 'vault' && user.role !== UserRole.ROLE_CEO && user.role !== UserRole.ROLE_LEGAL) {
      setActiveTab('dashboard');
    }
  };

  const handleOpenExcelImport = () => {
    setActiveTab('excel');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] flex antialiased font-sans selection:bg-[#9f3244]/20 selection:text-[#9f3244]">
      {/* 1. Left Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRole={currentUser.role}
          currentUserName={currentUser.label}
          currentUserRoleTitle={currentUser.badge}
          onOpenExcelImport={handleOpenExcelImport}
          onLogoutOrSwitch={() => {
            const nextIdx = (DESIGNATED_USERS.findIndex((u) => u.id === currentUser.id) + 1) % DESIGNATED_USERS.length;
            handleUserChange(DESIGNATED_USERS[nextIdx]);
          }}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              currentRole={currentUser.role}
              currentUserName={currentUser.label}
              currentUserRoleTitle={currentUser.badge}
              onOpenExcelImport={() => {
                handleOpenExcelImport();
                setIsMobileSidebarOpen(false);
              }}
              onLogoutOrSwitch={() => {
                const nextIdx = (DESIGNATED_USERS.findIndex((u) => u.id === currentUser.id) + 1) % DESIGNATED_USERS.length;
                handleUserChange(DESIGNATED_USERS[nextIdx]);
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Main Content Layout (TopBar + Page Content + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          currentUser={currentUser}
          onUserChange={handleUserChange}
          onOpenMasterModal={() => setIsMasterModalOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <Suspense fallback={<PageLoading title="Đang tải dữ liệu phân hệ..." />}>
            {activeTab === 'dashboard' && (
              <DashboardPage
                key={`dashboard-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersPage
                key={`customers-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onOpenMasterModal={() => setIsMasterModalOpen(true)}
              />
            )}

            {activeTab === 'sales' && (
              <SalesPage
                key={`sales-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onOpenMasterModal={() => setIsMasterModalOpen(true)}
              />
            )}

            {activeTab === 'warehouse' && (
              <WarehousePage
                key={`warehouse-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onOpenMasterModal={() => setIsMasterModalOpen(true)}
              />
            )}

            {activeTab === 'accounting' && (
              <AccountingPage
                key={`accounting-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
              />
            )}

            {activeTab === 'vault' && (
              <VaultPage
                key={`vault-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onDataChanged={() => setDataVersion((v) => v + 1)}
                onSwitchToAuthorizedRole={() => {
                  const legalUser = DESIGNATED_USERS.find((u) => u.role === UserRole.ROLE_LEGAL);
                  if (legalUser) handleUserChange(legalUser);
                }}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPage
                key={`admin-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onOpenMasterModal={() => setIsMasterModalOpen(true)}
              />
            )}

            {activeTab === 'excel' && (
              <ExcelImportPage
                key={`excel-${dataVersion}-${currentUser.id}`}
                currentRole={currentUser.role}
                currentUserId={currentUser.id}
                onDataChanged={() => setDataVersion((v) => v + 1)}
              />
            )}
          </Suspense>
        </main>

        {/* Clean Enterprise Footer */}
        <footer className="border-t border-[#eaeaea] bg-white py-4 px-6 text-xs text-[#64748b]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#9f3244]">KHANG AN OS</span>
              <span>·</span>
              <span>Hệ Thống Quản Trị ERP Khang An Badminton</span>
              <span>·</span>
              <span>Phiên bản Enterprise 2026</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[#64748b]">
                Đang trực tuyến: <strong className="text-[#1e293b]">{currentUser.label}</strong>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Master Data Modal */}
      <MasterDataModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        onDataChanged={() => {
          setDataVersion((prev) => prev + 1);
        }}
      />
    </div>
  );
}
