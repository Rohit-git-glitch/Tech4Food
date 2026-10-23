import React, { useState } from 'react';
import {
  ShieldAlert,
  Thermometer,
  Snowflake,
  Droplets,
  DoorClosed,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Info,
  Clock,
  ShieldCheck,
  Cpu,
  Flame,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TemperatureChart } from '../components/monitoring/TemperatureChart';
import { DEFAULT_STORAGE_GUIDELINES } from '../data/mockData';
import { FoodCategory, AlertSeverity, SafetyAlert } from '../types';

export const MonitoringPage: React.FC = () => {
  const {
    latestSensor,
    sensorHistory,
    settings,
    alerts,
    acknowledgeAlert,
    simulateTemperatureChange,
    expiringSoonItems,
    attentionItems,
  } = useApp();

  const [alertFilter, setAlertFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [simTemp, setSimTemp] = useState<number>(3.2);

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'unacknowledged') return !a.acknowledged;
    if (alertFilter === 'acknowledged') return a.acknowledged;
    return true;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Warning
          </span>
        );
      case 'info':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Sensor Notice Banner */}
      <div className="bg-emerald-950 text-slate-200 p-4 rounded-2xl border border-emerald-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Hardware State: Disconnected (Sample Readings Active)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold uppercase">
                Simulated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ESP32 / DHT22 environmental sensor is currently offline. Demonstrating live telemetry using calibrated sample data.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 whitespace-nowrap self-end sm:self-center">
          Last Telemetry Sync: <strong className="text-slate-200">{latestSensor.timeFull || 'Just now'}</strong>
        </div>
      </div>

      {/* Environmental Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Fridge Temp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Internal Refrigerator
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {latestSensor.temperature.toFixed(1)}°C
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                latestSensor.temperature <= settings.fridgeMaxTemp && latestSensor.temperature >= settings.fridgeMinTemp
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {latestSensor.temperature <= settings.fridgeMaxTemp && latestSensor.temperature >= settings.fridgeMinTemp
                ? 'Optimal'
                : 'Excursion'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Safe range: {settings.fridgeMinTemp}°C – {settings.fridgeMaxTemp}°C
          </p>
        </div>

        {/* Freezer Cavity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Freezer Sub-Zero
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {latestSensor.freezerTemp.toFixed(1)}°C
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800">
              Deep Cold
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Safe range: {settings.freezerMinTemp}°C – {settings.freezerMaxTemp}°C
          </p>
        </div>

        {/* Relative Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Relative Humidity
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {latestSensor.humidity}% RH
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800">
              Produce Safe
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Crisper zone maintains ~65% RH</p>
        </div>

        {/* Magnetic Door Seal State */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Door Seal Sensor
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              {latestSensor.doorOpen ? <DoorOpen className="w-4 h-4 text-amber-600" /> : <DoorClosed className="w-4 h-4 text-emerald-600" />}
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold tracking-tight ${latestSensor.doorOpen ? 'text-amber-600' : 'text-slate-900'}`}>
              {latestSensor.doorOpen ? 'Door Ajar' : 'Hermetic Closed'}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                latestSensor.doorOpen ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {latestSensor.doorOpen ? 'Excursion Risk' : 'Sealed'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Alert trigger: &gt; {settings.doorAjarSeconds}s open</p>
        </div>
      </div>

      {/* Interactive Excursion Simulator (Proving Demo Responsiveness) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Interactive Environmental Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate real-time temperature fluctuations or door excursions to test reactive safety alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => simulateTemperatureChange(3.0, false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Optimal (3.0°C)
            </button>
            <button
              onClick={() => simulateTemperatureChange(4.8, true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Door Ajar (4.8°C)
            </button>
            <button
              onClick={() => simulateTemperatureChange(7.2, false)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
            >
              Excursion (7.2°C)
            </button>
          </div>
        </div>
      </div>

      {/* Temperature History Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-emerald-600" />
          24-Hour Environmental Telemetry History
        </h3>
        <p className="text-xs text-slate-500">
          Continuous temperature logs with upper critical threshold (4.0°C) and lower freezing limit (1.0°C)
        </p>
        <TemperatureChart data={sensorHistory} settings={settings} height={300} />
      </div>

      {/* Active and Historical Safety Alerts Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Safety Alerts & Risk Log
            </h3>
            <p className="text-xs text-slate-500">
              Automated notifications for temperature excursions, expired shelf life, and door open conditions
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                alertFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setAlertFilter('unacknowledged')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                alertFilter === 'unacknowledged' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active ({alerts.filter((a) => !a.acknowledged).length})
            </button>
            <button
              onClick={() => setAlertFilter('acknowledged')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                alertFilter === 'acknowledged' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Acknowledged ({alerts.filter((a) => a.acknowledged).length})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No alerts matching the selected filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  alert.acknowledged
                    ? 'bg-slate-50/70 border-slate-200 opacity-70'
                    : alert.severity === 'critical'
                    ? 'bg-rose-50/60 border-rose-300'
                    : 'bg-amber-50/60 border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityBadge(alert.severity)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{alert.title}</h4>
                      {alert.acknowledged && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Triggered: {new Date(alert.timestamp).toLocaleString()}
                      {alert.acknowledgedAt && ` • Acknowledged: ${new Date(alert.acknowledgedAt).toLocaleTimeString()}`}
                    </span>
                  </div>
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="self-end sm:self-center px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Food-Specific Storage Rules Guidelines Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Configurable Food Safety & Preservation Reference Guide
          </h3>
          <p className="text-xs text-slate-500">
            Scientifically backed storage rules based on USDA/FDA food safety standards
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Baseline Shelf Life</th>
                <th className="py-3 px-4">Optimal Temperature</th>
                <th className="py-3 px-4">Food Safety Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(Object.entries(DEFAULT_STORAGE_GUIDELINES) as [string, { defaultDays: number; guidance: string; safeTempRange: string }][]).map(([cat, info]) => (
                <tr key={cat} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{cat}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-800">{info.defaultDays} days</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{info.safeTempRange}</td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">{info.guidance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Food Safety Notice Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 leading-relaxed">
          <h4 className="font-bold text-amber-950">Food Safety Scientific Advisory</h4>
          <p>
            Do not claim or assume that food is safe solely because it looks normal, smells normal, or has not reached an estimated review date. Pathogenic bacteria such as <em>Listeria monocytogenes</em>, <em>Salmonella</em>, and <em>Staphylococcus aureus</em> can multiply to hazardous levels without producing noticeable odors or visual changes if refrigeration exceeds 4°C (40°F) for extended durations.
          </p>
        </div>
      </div>
    </div>
  );
};
