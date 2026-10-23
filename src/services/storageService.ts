import { FoodItem, SafetyAlert, SensorReading, ActivityLogEvent, SystemSettings } from '../types';
import { INITIAL_FOOD_ITEMS, INITIAL_ALERTS, INITIAL_SENSOR_HISTORY, DEFAULT_SETTINGS, getRelativeDate } from '../data/mockData';

const STORAGE_KEYS = {
  INVENTORY: 'tech4food_inventory_v1',
  ALERTS: 'tech4food_alerts_v1',
  SENSOR: 'tech4food_sensor_v1',
  ACTIVITIES: 'tech4food_activities_v1',
  SETTINGS: 'tech4food_settings_v1',
};

const INITIAL_ACTIVITIES: ActivityLogEvent[] = [
  {
    id: 'act-01',
    type: 'alert_raised',
    title: 'Shelf-life Warning Raised',
    description: 'Atlantic Salmon reached 0 days remaining shelf life.',
    timestamp: getRelativeDate(0, -2),
  },
  {
    id: 'act-02',
    type: 'item_added',
    title: 'Food Item Stored',
    description: 'Strawberries (300g) added to Refrigerator crisper.',
    timestamp: getRelativeDate(-1),
  },
  {
    id: 'act-03',
    type: 'item_moved',
    title: 'Storage Relocated',
    description: 'Chicken Breast Fillets moved from Refrigerator to Freezer for long-term safe preservation.',
    timestamp: getRelativeDate(-2),
  },
  {
    id: 'act-04',
    type: 'system_event',
    title: 'System Initialized',
    description: 'Tech4Food Smart Fridge dashboard started in Demo Mode.',
    timestamp: getRelativeDate(-5),
  },
];

class StorageService {
  private safeParse<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (err) {
      console.warn(`[StorageService] Failed to parse key ${key}, falling back to initial data:`, err);
      return fallback;
    }
  }

  private safeSet<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[StorageService] Failed to write key ${key} to localStorage:`, err);
    }
  }

  getInventory(): FoodItem[] {
    return this.safeParse<FoodItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_FOOD_ITEMS);
  }

  saveInventory(items: FoodItem[]): void {
    this.safeSet(STORAGE_KEYS.INVENTORY, items);
  }

  getAlerts(): SafetyAlert[] {
    return this.safeParse<SafetyAlert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  saveAlerts(alerts: SafetyAlert[]): void {
    this.safeSet(STORAGE_KEYS.ALERTS, alerts);
  }

  getSensorHistory(): SensorReading[] {
    return this.safeParse<SensorReading[]>(STORAGE_KEYS.SENSOR, INITIAL_SENSOR_HISTORY);
  }

  saveSensorHistory(readings: SensorReading[]): void {
    this.safeSet(STORAGE_KEYS.SENSOR, readings);
  }

  getActivities(): ActivityLogEvent[] {
    return this.safeParse<ActivityLogEvent[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  saveActivities(activities: ActivityLogEvent[]): void {
    this.safeSet(STORAGE_KEYS.ACTIVITIES, activities);
  }

  getSettings(): SystemSettings {
    return this.safeParse<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  saveSettings(settings: SystemSettings): void {
    this.safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.INVENTORY);
      localStorage.removeItem(STORAGE_KEYS.ALERTS);
      localStorage.removeItem(STORAGE_KEYS.SENSOR);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      // Re-seed
      this.saveInventory(INITIAL_FOOD_ITEMS);
      this.saveAlerts(INITIAL_ALERTS);
      this.saveSensorHistory(INITIAL_SENSOR_HISTORY);
      this.saveActivities(INITIAL_ACTIVITIES);
      this.saveSettings(DEFAULT_SETTINGS);
    } catch (e) {
      console.error('Error during data reset:', e);
    }
  }
}

export const storageService = new StorageService();
