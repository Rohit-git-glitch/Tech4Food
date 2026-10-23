import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { OverviewPage } from './pages/OverviewPage';
import { InventoryPage } from './pages/InventoryPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddEditFoodModal } from './components/inventory/AddEditFoodModal';

const DashboardContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalAddModalOpen, setGlobalAddModalOpen] = useState(false);
  const { addFoodItem } = useApp();

  const renderActivePage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <OverviewPage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenAddModal={() => setGlobalAddModalOpen(true)}
          />
        );
      case 'inventory':
        return (
          <InventoryPage onOpenAddModal={() => setGlobalAddModalOpen(true)} />
        );
      case 'voice':
        return <VoiceAssistantPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'activity':
        return <ActivityHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenAddModal={() => setGlobalAddModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row">
      {/* Toast Feedback notifications */}
      <ToastContainer />

      {/* Responsive Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Sticky Header / Navbar */}
        <Navbar
          currentPage={currentPage}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenAddModal={() => setGlobalAddModalOpen(true)}
          onNavigate={(page) => setCurrentPage(page)}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Quick Add Food Modal */}
      <AddEditFoodModal
        isOpen={globalAddModalOpen}
        onClose={() => setGlobalAddModalOpen(false)}
        onSubmit={(data) => addFoodItem(data)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
