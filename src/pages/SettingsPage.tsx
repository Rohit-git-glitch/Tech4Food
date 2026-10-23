import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Code,
  ShieldCheck,
  Radio,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SystemSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData, showToast } = useApp();

  const [formSettings, setFormSettings] = useState<SystemSettings>({ ...settings });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'fastapi' | 'supabase' | 'gemini' | 'esp32'>('fastapi');

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
  };

  const handleConfirmReset = async () => {
    await resetAllData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* System Status & Integration Health (Clearly Marked 'Not connected') */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            System Architecture & Connection Status
          </h2>
          <p className="text-xs text-slate-500">
            Current connection state across dashboard, backend, cloud database, AI agent, and IoT microcontroller
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Frontend */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Frontend Dashboard</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  Active (v1.0)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                React + TypeScript + Tailwind. Client-side state & local persistence.
              </p>
            </div>
          </div>

          {/* FastAPI Backend */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">FastAPI Backend</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                  API connected when backend is running
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Service interface defined. Ready for Phase 2 API connection.
              </p>
            </div>
          </div>

          {/* Supabase DB */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Supabase Database</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                  Not connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Browser LocalStorage is active for persistent demonstration data.
              </p>
            </div>
          </div>

          {/* AI Agent (Gemini) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">AI Agent (Gemini)</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                  Not connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gemini is called server-side through FastAPI; configure GEMINI_API_KEY and GEMINI_MODEL in ai-workflow-dev/.env.
              </p>
            </div>
          </div>

          {/* Hardware ESP32 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">ESP32 & Sensors</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                  Not connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visibly labelled sample readings simulating 24h temperature telemetry.
              </p>
            </div>
          </div>

          {/* Local Persistence */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Browser Persistence</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Demo inventory, moves, alerts & settings persist across browser refreshes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurable Temperature & Food Safety Thresholds */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Configurable Food Safety Thresholds
          </h3>
          <p className="text-xs text-slate-500">
            Define acceptable environmental and shelf-life boundaries for automated warning generation
          </p>
        </div>

        <form onSubmit={handleSaveThresholds} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Refrigerator Max Temp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fridge Upper Safety Limit (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formSettings.fridgeMaxTemp}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, fridgeMaxTemp: parseFloat(e.target.value) || 4.0 })
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard: 4.0°C (Excursions above this trigger safety warnings)
              </span>
            </div>

            {/* Refrigerator Min Temp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fridge Lower Freezing Limit (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formSettings.fridgeMinTemp}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, fridgeMinTemp: parseFloat(e.target.value) || 1.0 })
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard: 1.0°C (Prevents accidental freeze damage to fresh produce)
              </span>
            </div>

            {/* Expiry Warning Lead Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Shelf-Life Warning Notice (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={formSettings.expiryWarningDays}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, expiryWarningDays: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Highlight items approaching expiry within this window (Default: 2 days)
              </span>
            </div>

            {/* Door Ajar Seconds */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Door Ajar Alert Threshold (Seconds)
              </label>
              <input
                type="number"
                min="30"
                step="10"
                value={formSettings.doorAjarSeconds}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, doorAjarSeconds: parseInt(e.target.value) || 120 })
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Trigger audible/visual alert if door remains open (Default: 120s)
              </span>
            </div>

            {/* Display Temperature Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Default Temperature Unit
              </label>
              <select
                value={formSettings.temperatureUnit}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, temperatureUnit: e.target.value as 'C' | 'F' })
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-safegreen hover:bg-safegreen-light text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Thresholds</span>
            </button>
          </div>
        </form>
      </div>

      {/* Future Integration Service Specifications (Requirement 6) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-600" />
            Future Backend Integration & API Specifications (Phase 2)
          </h3>
          <p className="text-xs text-slate-500">
            Documented REST contracts, payload schemas, and database architectures for backend developers
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'fastapi', label: 'FastAPI Endpoints' },
            { id: 'supabase', label: 'Supabase Schema' },
            { id: 'gemini', label: 'Gemini AI Ingestion' },
            { id: 'esp32', label: 'ESP32 MQTT / HTTP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDocTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeDocTab === tab.id
                  ? 'bg-safegreen text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
          {activeDocTab === 'fastapi' && (
            <pre className="text-[11px] whitespace-pre-wrap">
{`# Proposed FastAPI REST Endpoints (api/v1)

GET    /api/v1/inventory
  -> Returns: List[FoodItemResponse]

POST   /api/v1/inventory
  -> Body: { "name": "Fresh Milk", "category": "Dairy & Eggs", "quantity": 1, "unit": "L", "location": "Refrigerator", "estimatedShelfLifeDays": 7 }
  -> Returns: FoodItemResponse (HTTP 201)

PUT    /api/v1/inventory/{food_id}
  -> Body: Partial<FoodItemUpdate>
  -> Returns: Updated FoodItemResponse

DELETE /api/v1/inventory/{food_id}?reason=consumed
  -> Returns: { "success": true, "deleted_id": "food-001" }

PATCH  /api/v1/inventory/{food_id}/relocate
  -> Body: { "target_location": "Freezer" }
  -> Returns: FoodItemResponse

GET    /api/v1/telemetry/history?hours=24
  -> Returns: List[SensorTelemetryPoint]

POST   /api/v1/telemetry/ingest
  -> ESP32 device ingest webhook`}
            </pre>
          )}

          {activeDocTab === 'supabase' && (
            <pre className="text-[11px] whitespace-pre-wrap">
{`-- Proposed Supabase PostgreSQL Schema

CREATE TABLE food_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL CHECK (location IN ('Refrigerator', 'Freezer', 'Pantry/Crisper')),
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_shelf_life_days INT NOT NULL,
  estimated_expiry_date TIMESTAMPTZ NOT NULL,
  storage_guidance TEXT,
  status VARCHAR(50) DEFAULT 'Fresh',
  notes TEXT
);

CREATE TABLE sensor_telemetry (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC(4, 2) NOT NULL,
  humidity NUMERIC(4, 2) NOT NULL,
  freezer_temperature NUMERIC(4, 2),
  door_open BOOLEAN DEFAULT FALSE
);

CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          )}

          {activeDocTab === 'gemini' && (
            <pre className="text-[11px] whitespace-pre-wrap">
{`# Gemini 2.0 Flash AI Voice Parsing Interface

Endpoint: POST /api/v1/ai/voice-parse
Content-Type: multipart/form-data (Audio file) OR application/json (Transcript)

Request Payload (JSON):
{
  "transcript": "I am putting two cartons of almond milk into the fridge",
  "fridge_state_context": {
    "existing_inventory_count": 10,
    "current_temperature": 3.2
  }
}

Expected Response from Gemini Structured Output:
{
  "intent": "add_food",
  "confidence": 0.98,
  "entities": {
    "food_name": "Almond Milk",
    "category": "Dairy & Eggs",
    "quantity": 2,
    "unit": "cartons",
    "location": "Refrigerator",
    "shelf_life_recommendation_days": 10
  },
  "safety_advisory": "Store in main cavity. Refrigerate below 4°C once opened."
}`}
            </pre>
          )}

          {activeDocTab === 'esp32' && (
            <pre className="text-[11px] whitespace-pre-wrap">
{`// ESP32 Microcontroller Ingest Payload (HTTP POST or MQTT Topic: smartfridge/telemetry)

{
  "device_id": "esp32-fridge-01",
  "uptime_sec": 86420,
  "wifi_rssi_dbm": -58,
  "sensors": {
    "dht22_temp_c": 3.24,
    "dht22_humidity_pct": 65.2,
    "freezer_ds18b20_temp_c": -18.1,
    "reed_door_switch_open": false,
    "door_open_seconds": 0
  },
  "timestamp": "2026-10-23T07:15:00Z"
}`}
            </pre>
          )}
        </div>
      </div>

      {/* Local Storage & Demo Reset Option (with confirmation) */}
      <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Reset Demo Storage to Default State
            </h3>
            <p className="text-xs text-slate-500">
              Clear all locally stored demo items, simulated excursion alerts, and custom activity logs, restoring the original initial dataset
            </p>
          </div>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
          >
            Reset All Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Confirm Factory Demo Reset</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will reset your browser LocalStorage for Tech4Food. All customized foods, moved locations, simulated sensor readings, and new activity events will be replaced with the original factory sample data.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
