import React from 'react';
import {
  Package,
  Clock,
  AlertTriangle,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Mic,
  Activity,
  CheckCircle2,
  ChevronRight,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TemperatureChart } from '../components/monitoring/TemperatureChart';
import { NavPage } from '../components/layout/Sidebar';
import { FoodCategory } from '../types';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenAddModal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onOpenAddModal }) => {
  const {
    inventory,
    totalItems,
    expiringSoonItems,
    attentionItems,
    freshItems,
    categoryBreakdown,
    latestSensor,
    sensorHistory,
    settings,
    activeAlerts,
    activities,
    acknowledgeAlert,
  } = useApp();

  const categories = Object.entries(categoryBreakdown) as [FoodCategory, number][];
  const maxCategoryCount = Math.max(...categories.map(([_, count]) => count), 1);

  return (
    <div className="space-y-6">
      {/* Active Alert Banner if any */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    {activeAlerts.length} Active Food Safety Alert{activeAlerts.length > 1 ? 's' : ''}
                  </h3>
                  <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Attention Needed
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                  {activeAlerts[0].title}: {activeAlerts[0].message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => acknowledgeAlert(activeAlerts[0].id)}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onNavigate('monitoring')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inventory
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalItems}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {freshItems.length} fresh
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Stored across 3 thermal zones</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-emerald-700 font-semibold hover:underline inline-flex items-center text-[11px]"
            >
              Manage &rarr;
            </button>
          </p>
        </div>

        {/* Approaching Expiry */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Approaching Expiry
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {expiringSoonItems.length}
            </span>
            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Within 48 hours
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {expiringSoonItems.length > 0
              ? `E.g. ${expiringSoonItems[0].name}`
              : 'No items expiring soon'}
          </p>
        </div>

        {/* Requires Immediate Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Requires Attention
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {attentionItems.length}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                attentionItems.length > 0
                  ? 'text-rose-800 bg-rose-50'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {attentionItems.length > 0 ? 'Action Required' : 'All Safe'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Cook today, freeze, or review status
          </p>
        </div>

        {/* Temperature & Sensor Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cavity Temp & Sensor
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {latestSensor.temperature.toFixed(1)}°C
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                latestSensor.status === 'optimal'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {latestSensor.status === 'optimal' ? 'Optimal Range' : 'Excursion'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Hardware: Disconnected</span>
            <span className="text-emerald-700 font-medium">Sample Live</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Quick Actions / Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Temperature History */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  24-Hour Temperature Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous tracking with optimal safety bounds (1.0°C – 4.0°C)
                </p>
              </div>
              <button
                onClick={() => onNavigate('monitoring')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Telemetry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <TemperatureChart data={sensorHistory} settings={settings} height={260} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400 text-[11px] block">Freezer Cavity</span>
              <span className="font-bold text-slate-800 text-sm">
                {latestSensor.freezerTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400 text-[11px] block">Relative Humidity</span>
              <span className="font-bold text-slate-800 text-sm">{latestSensor.humidity}% RH</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400 text-[11px] block">Door Magnetic State</span>
              <span className="font-bold text-emerald-700 text-sm">
                {latestSensor.doorOpen ? 'Ajar' : 'Hermetic Sealed'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Inventory Categories */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-safegreen to-safegreen-dark text-white p-5 rounded-2xl shadow-md space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                Quick Operations
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Control Smart Fridge</h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                Voice command ingestion, inventory logging, and safety inspection.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={onOpenAddModal}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400 text-safegreen-dark flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Add Food to Inventory</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button
                onClick={() => onNavigate('voice')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-safegreen-dark font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-safegreen-dark text-emerald-300 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span>Launch Voice Assistant</span>
                </div>
                <span className="text-[10px] bg-safegreen-dark text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Speech AI
                </span>
              </button>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                Food by Category
              </h3>
              <span className="text-xs text-slate-500">{totalItems} Total</span>
            </div>

            <div className="space-y-2.5">
              {categories.slice(0, 5).map(([category, count]) => {
                const percentage = Math.round((count / (totalItems || 1)) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{category}</span>
                      <span className="text-slate-500 font-semibold">
                        {count} item{count !== 1 ? 's' : ''} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Attention Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Inventory Activity
            </h3>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Full Log &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Expiry Watchlist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Shelf-Life Watchlist (Next 48h)
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View Inventory &rarr;
            </button>
          </div>

          {expiringSoonItems.length === 0 && attentionItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All current items have healthy shelf-life projections.
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...attentionItems, ...expiringSoonItems].slice(0, 4).map((item) => {
                const now = new Date().getTime();
                const exp = new Date(item.estimatedExpiryDate).getTime();
                const days = Math.ceil((exp - now) / 86400000);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {item.location}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.quantity} {item.unit} • {item.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                          days <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {days <= 0 ? 'Today / Overdue' : `${days} day${days > 1 ? 's' : ''} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
