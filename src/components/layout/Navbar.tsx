import React from 'react';
import { Menu, Plus, Mic, AlertCircle, Thermometer, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavPage } from './Sidebar';

interface NavbarProps {
  currentPage: NavPage;
  onOpenMobile: () => void;
  onOpenAddModal: () => void;
  onNavigate: (page: NavPage) => void;
}

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time telemetry, storage metrics & food safety status',
  },
  inventory: {
    title: 'Food Inventory',
    subtitle: 'Manage tracked food items, storage locations & shelf-life projections',
  },
  voice: {
    title: 'Voice Assistant Demo',
    subtitle: 'Speech & text interface with intent parsing, action previews & confirmation',
  },
  monitoring: {
    title: 'Food Safety & Environmental Monitoring',
    subtitle: 'Temperature logging, excursion simulation & food preservation guidance',
  },
  activity: {
    title: 'Activity History',
    subtitle: 'Audit trail of inventory updates, moves, voice commands & alerts',
  },
  settings: {
    title: 'System Settings & Architecture',
    subtitle: 'Hardware configuration, threshold controls & future API specifications',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onOpenMobile,
  onOpenAddModal,
  onNavigate,
}) => {
  const { latestSensor, activeAlerts } = useApp();
  const pageInfo = PAGE_TITLES[currentPage] || PAGE_TITLES.overview;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hardware Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
          <span>Internal: {latestSensor.temperature.toFixed(1)}°C</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-500 text-[11px] font-normal">Sample Sensor</span>
        </div>

        {/* Active Alerts Pill */}
        {activeAlerts.length > 0 && (
          <button
            onClick={() => onNavigate('monitoring')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
            title={`${activeAlerts.length} unacknowledged safety alerts`}
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Quick Voice Command Button */}
        <button
          onClick={() => onNavigate('voice')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
          title="Open Voice Assistant"
        >
          <Mic className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Voice Assistant</span>
        </button>

        {/* Quick Add Food Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-safegreen hover:bg-safegreen-light text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>
      </div>
    </header>
  );
};
