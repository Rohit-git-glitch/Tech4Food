import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Download,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityType, ActivityLogEvent } from '../types';

export const ActivityHistoryPage: React.FC = () => {
  const { activities, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (selectedType !== 'all') {
        if (selectedType === 'add' && act.type !== 'item_added') return false;
        if (selectedType === 'remove' && act.type !== 'item_removed') return false;
        if (selectedType === 'move' && act.type !== 'item_moved') return false;
        if (selectedType === 'alert' && act.type !== 'alert_raised' && act.type !== 'alert_acknowledged') return false;
        if (selectedType === 'system' && act.type !== 'threshold_updated' && act.type !== 'system_reset' && act.type !== 'system_event') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, selectedType, searchQuery]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'item_added':
        return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      case 'item_removed':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'item_moved':
        return <ArrowRightLeft className="w-4 h-4 text-sky-600" />;
      case 'alert_raised':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'alert_acknowledged':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'threshold_updated':
      case 'system_reset':
      case 'system_event':
      default:
        return <Sliders className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `tech4food_activity_log_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast({
        type: 'success',
        title: 'Export Complete',
        message: 'Activity audit trail saved as JSON.',
      });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls & Export */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Audit & Operation History
          </h2>
          <p className="text-xs text-slate-500">
            Real-time chronological events recorded from actual user actions, voice commands, and safety alerts
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON Audit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event logs by item or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'add', label: 'Added' },
              { id: 'remove', label: 'Removed' },
              { id: 'move', label: 'Moved' },
              { id: 'alert', label: 'Alerts' },
              { id: 'system', label: 'System' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedType(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedType === btn.id
                    ? 'bg-safegreen text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {filteredActivities.length} of {activities.length} total logged events
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No events found matching your search.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Dot / Icon */}
                <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  {getActivityIcon(act.type)}
                </div>

                {/* Content */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{act.title}</h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
