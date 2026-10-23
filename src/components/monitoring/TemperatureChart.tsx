import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { SensorReading, SystemSettings } from '../../types';
import { Thermometer, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface TemperatureChartProps {
  data: SensorReading[];
  settings: SystemSettings;
  height?: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  settings,
  height = 260,
}) => {
  const [unit, setUnit] = useState<'C' | 'F'>(settings.temperatureUnit || 'C');

  const toDisplayTemp = (celsius: number) => {
    if (unit === 'F') {
      return Number(((celsius * 9) / 5 + 32).toFixed(1));
    }
    return Number(celsius.toFixed(1));
  };

  const formattedData = data.map((d) => ({
    ...d,
    displayTemp: toDisplayTemp(d.temperature),
    displayFreezer: toDisplayTemp(d.freezerTemp),
  }));

  const minSafe = toDisplayTemp(settings.fridgeMinTemp);
  const maxSafe = toDisplayTemp(settings.fridgeMaxTemp);

  return (
    <div className="w-full">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Fridge Temp</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Freezer Temp</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2 hidden sm:flex">
            <span className="w-3 h-2 rounded bg-emerald-100 border border-emerald-300"></span>
            <span>Safe Zone ({minSafe}° - {maxSafe}°{unit})</span>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs border border-slate-200">
          <button
            onClick={() => setUnit('C')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              unit === 'C' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('F')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              unit === 'F' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Chart Surface */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              domain={unit === 'C' ? [-22, 10] : [-10, 50]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              unit={`°`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const reading = payload[0].payload as SensorReading & { displayTemp: number; displayFreezer: number };
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                      Time: {reading.timeFull || reading.timestamp}
                    </p>
                    <p className="text-emerald-400 font-semibold">
                      Fridge: {reading.displayTemp}°{unit} {reading.displayTemp > maxSafe && '(Excursion!)'}
                    </p>
                    <p className="text-sky-300 font-semibold">
                      Freezer: {reading.displayFreezer}°{unit}
                    </p>
                    <p className="text-slate-400">
                      Humidity: {reading.humidity}% RH • Door: {reading.doorOpen ? 'Open' : 'Closed'}
                    </p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">Sample Telemetry Reading</p>
                  </div>
                );
              }}
            />
            {/* Safe zone area */}
            <ReferenceArea
              y1={minSafe}
              y2={maxSafe}
              fill="#10b981"
              fillOpacity={0.08}
            />
            <ReferenceLine y={maxSafe} stroke="#f59e0b" strokeDasharray="3 3" />
            <ReferenceLine y={minSafe} stroke="#10b981" strokeDasharray="3 3" />

            {/* Freezer temp line */}
            <Line
              type="monotone"
              dataKey="displayFreezer"
              stroke="#0284c7"
              strokeWidth={2}
              dot={{ r: 2, fill: '#0284c7' }}
              activeDot={{ r: 5 }}
            />
            {/* Fridge temp line */}
            <Line
              type="monotone"
              dataKey="displayTemp"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#059669' }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Visibly labeled sample sensor readings (ESP32 DHT22 integration pending).
        </span>
        <span className="text-emerald-600 font-medium">Auto-updated hourly</span>
      </div>
    </div>
  );
};
