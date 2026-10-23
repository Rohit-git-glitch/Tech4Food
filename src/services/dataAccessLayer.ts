import { FoodItem, SafetyAlert, SensorReading, ActivityLogEvent, SystemSettings, StorageLocation } from '../types';
import { storageService } from './storageService';

/**
 * TECH4FOOD DATA ACCESS LAYER
 * 
 * Architecture Note:
 * This layer decouples the React UI components from the underlying data source.
 * In Phase 1 (current frontend demo), it operates asynchronously over browser LocalStorage.
 * In Phase 2, each method can be redirected to FastAPI backend endpoints connected to Supabase:
 * 
 * Proposed Backend REST Endpoints:
 * - GET    /api/v1/inventory                -> Returns FoodItem[]
 * - POST   /api/v1/inventory                -> Creates a new item, returns FoodItem
 * - PUT    /api/v1/inventory/{id}           -> Updates food details
 * - DELETE /api/v1/inventory/{id}           -> Removes food item
 * - PATCH  /api/v1/inventory/{id}/location  -> Updates storage location
 * - GET    /api/v1/telemetry/current        -> Returns latest ESP32 reading
 * - GET    /api/v1/telemetry/history?hrs=24 -> Returns SensorReading[]
 * - POST   /api/v1/telemetry/ingest         -> ESP32 DHT22 sensor webhook/MQTT ingest
 * - GET    /api/v1/alerts                   -> Returns SafetyAlert[]
 * - PATCH  /api/v1/alerts/{id}/ack          -> Marks alert acknowledged
 * - POST   /api/v1/ai/voice-parse           -> Gemini 1.5/2.0 Flash agent voice/NLP intent interpreter
 */

export interface IInventoryService {
  getAll(): Promise<FoodItem[]>;
  create(item: Omit<FoodItem, 'id' | 'dateAdded'>): Promise<FoodItem>;
  update(id: string, updates: Partial<FoodItem>): Promise<FoodItem>;
  delete(id: string): Promise<boolean>;
  moveLocation(id: string, targetLocation: StorageLocation): Promise<FoodItem>;
}

export interface ISensorService {
  getLatest(): Promise<SensorReading>;
  getHistory(): Promise<SensorReading[]>;
  recordReading(reading: SensorReading): Promise<void>;
}

export interface IAlertService {
  getAll(): Promise<SafetyAlert[]>;
  acknowledge(id: string): Promise<SafetyAlert>;
  createAlert(alert: Omit<SafetyAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<SafetyAlert>;
}

export interface IActivityService {
  getAll(): Promise<ActivityLogEvent[]>;
  logEvent(event: Omit<ActivityLogEvent, 'id' | 'timestamp'>): Promise<ActivityLogEvent>;
}

export interface ISettingsService {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  resetAllData(): Promise<void>;
}

// Phase 1 Local Implementation
class LocalInventoryService implements IInventoryService {
  async getAll(): Promise<FoodItem[]> {
    return storageService.getInventory();
  }

  async create(data: Omit<FoodItem, 'id' | 'dateAdded'>): Promise<FoodItem> {
    const items = storageService.getInventory();
    const newItem: FoodItem = {
      ...data,
      id: `food-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      dateAdded: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    storageService.saveInventory(updated);
    return newItem;
  }

  async update(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    const items = storageService.getInventory();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Item ${id} not found`);
    }
    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    storageService.saveInventory(items);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const items = storageService.getInventory();
    const filtered = items.filter((i) => i.id !== id);
    storageService.saveInventory(filtered);
    return true;
  }

  async moveLocation(id: string, targetLocation: StorageLocation): Promise<FoodItem> {
    return this.update(id, { location: targetLocation });
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8001/api/v1';

class ApiInventoryService implements IInventoryService {
  private endpoint = `${API_BASE_URL}/inventory`;

  async getAll(): Promise<FoodItem[]> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        const errorDetail = await res.text().catch(() => '');
        throw new Error(
          `FastAPI returned HTTP ${res.status} (${res.statusText}): ${errorDetail}`
        );
      }

      const data: FoodItem[] = await res.json();
      return data;
    } catch (err: any) {
      // Do not silently fall back to stale localStorage. Re-throw with clear message.
      throw new Error(
        `Failed to fetch inventory from FastAPI backend at ${this.endpoint}: ${err?.message || err}`
      );
    }
  }

  async create(data: Omit<FoodItem, 'id' | 'dateAdded'>): Promise<FoodItem> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorDetail = await res.text().catch(() => '');
      throw new Error(
        `FastAPI create item failed (HTTP ${res.status}): ${errorDetail}`
      );
    }

    return await res.json();
  }

  async update(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    const res = await fetch(`${this.endpoint}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorDetail = await res.text().catch(() => '');
      throw new Error(
        `FastAPI update item failed (HTTP ${res.status}): ${errorDetail}`
      );
    }

    return await res.json();
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.endpoint}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const errorDetail = await res.text().catch(() => '');
      throw new Error(
        `FastAPI delete item failed (HTTP ${res.status}): ${errorDetail}`
      );
    }

    return true;
  }

  async moveLocation(id: string, targetLocation: StorageLocation): Promise<FoodItem> {
    const res = await fetch(`${this.endpoint}/${encodeURIComponent(id)}/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ targetLocation }),
    });

    if (!res.ok) {
      const errorDetail = await res.text().catch(() => '');
      throw new Error(
        `FastAPI relocate item failed (HTTP ${res.status}): ${errorDetail}`
      );
    }

    return await res.json();
  }
}

class LocalSensorService implements ISensorService {
  async getLatest(): Promise<SensorReading> {
    const history = storageService.getSensorHistory();
    return history[history.length - 1] || {
      timestamp: 'Now',
      timeFull: new Date().toLocaleTimeString(),
      temperature: 3.2,
      humidity: 65,
      freezerTemp: -18.0,
      doorOpen: false,
      status: 'optimal',
    };
  }

  async getHistory(): Promise<SensorReading[]> {
    return storageService.getSensorHistory();
  }

  async recordReading(reading: SensorReading): Promise<void> {
    const history = storageService.getSensorHistory();
    const updated = [...history.slice(-23), reading]; // keep 24 entries
    storageService.saveSensorHistory(updated);
  }
}

class LocalAlertService implements IAlertService {
  async getAll(): Promise<SafetyAlert[]> {
    return storageService.getAlerts();
  }

  async acknowledge(id: string): Promise<SafetyAlert> {
    const alerts = storageService.getAlerts();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Alert ${id} not found`);
    const acked = {
      ...alerts[index],
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    };
    alerts[index] = acked;
    storageService.saveAlerts(alerts);
    return acked;
  }

  async createAlert(data: Omit<SafetyAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<SafetyAlert> {
    const alerts = storageService.getAlerts();
    const newAlert: SafetyAlert = {
      ...data,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    const updated = [newAlert, ...alerts];
    storageService.saveAlerts(updated);
    return newAlert;
  }
}

class LocalActivityService implements IActivityService {
  async getAll(): Promise<ActivityLogEvent[]> {
    return storageService.getActivities();
  }

  async logEvent(data: Omit<ActivityLogEvent, 'id' | 'timestamp'>): Promise<ActivityLogEvent> {
    const activities = storageService.getActivities();
    const newEvent: ActivityLogEvent = {
      ...data,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEvent, ...activities.slice(0, 49)]; // keep 50 latest
    storageService.saveActivities(updated);
    return newEvent;
  }
}

class LocalSettingsService implements ISettingsService {
  async getSettings(): Promise<SystemSettings> {
    return storageService.getSettings();
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = storageService.getSettings();
    const updated = { ...current, ...settings };
    storageService.saveSettings(updated);
    return updated;
  }

  async resetAllData(): Promise<void> {
    storageService.resetAll();
  }
}

// Export singleton instances
export const inventoryService: IInventoryService = new ApiInventoryService();
export const sensorService: ISensorService = new LocalSensorService();
export const alertService: IAlertService = new LocalAlertService();
export const activityService: IActivityService = new LocalActivityService();
export const settingsService: ISettingsService = new LocalSettingsService();
