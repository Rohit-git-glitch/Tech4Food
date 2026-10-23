import React from 'react';
import {
  LayoutDashboard,
  Refrigerator,
  Mic,
  ShieldCheck,
  History,
  Settings,
  Cpu,
  WifiOff,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavPage = 'overview' | 'inventory' | 'voice' | 'monitoring' | 'activity' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { totalItems, activeAlerts, latestSensor } = useApp();

  const navItems = [
    {
      id: 'overview' as NavPage,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as NavPage,
      label: 'Food Inventory',
      icon: Refrigerator,
      badge: totalItems.toString(),
    },
    {
      id: 'voice' as NavPage,
      label: 'Voice Assistant',
      icon: Mic,
      pulse: true,
      badge: 'Local AI',
    },
    {
      id: 'monitoring' as NavPage,
      label: 'Safety & Sensors',
      icon: ShieldCheck,
      badge: activeAlerts.length > 0 ? activeAlerts.length.toString() : null,
      badgeColor: activeAlerts.length > 0 ? 'bg-amber-500 text-white' : undefined,
    },
    {
      id: 'activity' as NavPage,
      label: 'Activity History',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as NavPage,
      label: 'System & Status',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-safegreen-dark text-slate-100 flex flex-col border-r border-safegreen/30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-safegreen-accent flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Refrigerator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Tech4Food
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  IoT
                </span>
              </div>
              <p className="text-xs text-slate-400">Smart Fridge Monitor</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mini Environment Widget */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator inline-block"></span>
              Fridge Status
            </span>
            <span className="text-[11px] text-slate-400">Sample Live</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                {latestSensor.temperature.toFixed(1)}°C
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5">Target: 3.0°C</span>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-300">{latestSensor.humidity}% RH</div>
              <div className="text-[10px] text-slate-400">
                {latestSensor.doorOpen ? 'Door Ajar' : 'Sealed'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.badgeColor || (active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System State Notice */}
        <div className="p-4 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-emerald-400 text-[11px]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Phase 1 Frontend Prototype</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Physical ESP32 & Supabase offline. Simulated sensor telemetry active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
