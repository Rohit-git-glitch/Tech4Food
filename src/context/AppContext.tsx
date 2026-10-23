import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  FoodItem,
  SafetyAlert,
  SensorReading,
  ActivityLogEvent,
  SystemSettings,
  StorageLocation,
  FoodCategory,
} from '../types';
import {
  inventoryService,
  sensorService,
  alertService,
  activityService,
  settingsService,
} from '../services/dataAccessLayer';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  inventory: FoodItem[];
  alerts: SafetyAlert[];
  activities: ActivityLogEvent[];
  sensorHistory: SensorReading[];
  latestSensor: SensorReading;
  settings: SystemSettings;
  loading: boolean;
  toasts: ToastNotification[];

  // Actions
  addFoodItem: (item: Omit<FoodItem, 'id' | 'dateAdded'>) => Promise<FoodItem>;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => Promise<FoodItem>;
  removeFoodItem: (id: string, reason?: string) => Promise<boolean>;
  moveFoodItem: (id: string, targetLocation: StorageLocation) => Promise<FoodItem>;
  acknowledgeAlert: (id: string) => Promise<void>;
  simulateTemperatureChange: (temp: number, doorOpen?: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  resetAllData: () => Promise<void>;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;

  // Computed Stats
  totalItems: number;
  expiringSoonItems: FoodItem[];
  attentionItems: FoodItem[];
  freshItems: FoodItem[];
  categoryBreakdown: Record<FoodCategory, number>;
  locationBreakdown: Record<StorageLocation, number>;
  activeAlerts: SafetyAlert[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [activities, setActivities] = useState<ActivityLogEvent[]>([]);
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [latestSensor, setLatestSensor] = useState<SensorReading>({
    timestamp: 'Now',
    timeFull: new Date().toLocaleTimeString(),
    temperature: 3.2,
    humidity: 65,
    freezerTemp: -18.0,
    doorOpen: false,
    status: 'optimal',
  });
  const [settings, setSettings] = useState<SystemSettings>({
    temperatureUnit: 'C',
    fridgeMinTemp: 1.0,
    fridgeMaxTemp: 4.0,
    freezerMinTemp: -22.0,
    freezerMaxTemp: -16.0,
    doorAjarSeconds: 120,
    expiryWarningDays: 2,
    sampleMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  const refreshAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [items, alts, acts, hist, sets] = await Promise.all([
        inventoryService.getAll(),
        alertService.getAll(),
        activityService.getAll(),
        sensorService.getHistory(),
        settingsService.getSettings(),
      ]);

      setInventory(items);
      setAlerts(alts);
      setActivities(acts);
      setSensorHistory(hist);
      setSettings(sets);
      if (hist.length > 0) {
        setLatestSensor(hist[hist.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast({
        type: 'error',
        title: 'Storage Error',
        message: 'Could not load data from storage. Falling back to defaults.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Recalculate status based on expiry dates
  const dynamicInventory = useMemo(() => {
    const now = new Date().getTime();
    return inventory.map((item) => {
      const expTime = new Date(item.estimatedExpiryDate).getTime();
      const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

      let calculatedStatus = item.status;
      if (diffDays < 0) {
        calculatedStatus = 'Expired';
      } else if (diffDays <= 0) {
        calculatedStatus = 'Requires Attention';
      } else if (diffDays <= settings.expiryWarningDays) {
        calculatedStatus = 'Approaching Expiry';
      } else {
        calculatedStatus = 'Fresh';
      }

      return {
        ...item,
        status: calculatedStatus,
      };
    });
  }, [inventory, settings.expiryWarningDays]);

  // Inventory actions
  const addFoodItem = async (data: Omit<FoodItem, 'id' | 'dateAdded'>) => {
    const newItem = await inventoryService.create(data);
    setInventory((prev) => [newItem, ...prev]);

    // Log Activity
    const act = await activityService.logEvent({
      type: 'item_added',
      title: 'Food Item Added',
      description: `Added ${newItem.quantity} ${newItem.unit} of ${newItem.name} to ${newItem.location}.`,
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'success',
      title: 'Item Added Successfully',
      message: `"${newItem.name}" saved in ${newItem.location}.`,
    });

    return newItem;
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    const updated = await inventoryService.update(id, updates);
    setInventory((prev) => prev.map((item) => (item.id === id ? updated : item)));

    const act = await activityService.logEvent({
      type: 'item_edited',
      title: 'Food Item Updated',
      description: `Updated details for ${updated.name}.`,
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'info',
      title: 'Item Updated',
      message: `Saved changes to "${updated.name}".`,
    });

    return updated;
  };

  const removeFoodItem = async (id: string, reason = 'consumed') => {
    const item = inventory.find((i) => i.id === id);
    await inventoryService.delete(id);
    setInventory((prev) => prev.filter((i) => i.id !== id));

    const itemName = item?.name || 'Item';
    const act = await activityService.logEvent({
      type: 'item_removed',
      title: 'Food Item Removed',
      description: `Removed "${itemName}" (${reason}).`,
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'info',
      title: 'Item Removed',
      message: `"${itemName}" was removed from inventory.`,
    });

    return true;
  };

  const moveFoodItem = async (id: string, targetLocation: StorageLocation) => {
    const item = inventory.find((i) => i.id === id);
    const oldLocation = item?.location || 'Unknown';
    const updated = await inventoryService.moveLocation(id, targetLocation);
    setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));

    const act = await activityService.logEvent({
      type: 'item_moved',
      title: 'Item Relocated',
      description: `Moved "${updated.name}" from ${oldLocation} to ${targetLocation}.`,
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'success',
      title: 'Storage Location Updated',
      message: `Moved "${updated.name}" to ${targetLocation}.`,
    });

    return updated;
  };

  const acknowledgeAlert = async (id: string) => {
    const acked = await alertService.acknowledge(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? acked : a)));

    const act = await activityService.logEvent({
      type: 'alert_acknowledged',
      title: 'Safety Alert Acknowledged',
      description: `Acknowledged alert: "${acked.title}".`,
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'info',
      title: 'Alert Acknowledged',
      message: 'Status updated.',
    });
  };

  const simulateTemperatureChange = async (temp: number, doorOpen = false) => {
    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    if (temp > settings.fridgeMaxTemp || temp < settings.fridgeMinTemp) {
      status = temp > settings.fridgeMaxTemp + 2 ? 'critical' : 'warning';
    }

    const newReading: SensorReading = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeFull: new Date().toLocaleTimeString(),
      temperature: Number(temp.toFixed(1)),
      humidity: Math.floor(60 + Math.random() * 10),
      freezerTemp: Number((-18 + (temp - 3.2) * 0.4).toFixed(1)),
      doorOpen,
      status,
    };

    await sensorService.recordReading(newReading);
    setSensorHistory((prev) => [...prev.slice(-23), newReading]);
    setLatestSensor(newReading);

    // If critical or warning, generate safety alert
    if (status === 'critical' || status === 'warning') {
      const alert = await alertService.createAlert({
        title: `Temperature Excursion Detected: ${temp}°C`,
        message: `Fridge temperature reached ${temp}°C, exceeding optimal safety threshold of ${settings.fridgeMaxTemp}°C. Check door seal or compressor.`,
        severity: status,
        category: 'temperature',
      });
      setAlerts((prev) => [alert, ...prev]);

      const act = await activityService.logEvent({
        type: 'alert_raised',
        title: 'Temperature Excursion Triggered',
        description: `Internal sensor recorded ${temp}°C (Threshold: ${settings.fridgeMaxTemp}°C).`,
      });
      setActivities((prev) => [act, ...prev]);

      showToast({
        type: status === 'critical' ? 'error' : 'warning',
        title: 'Safety Alert Triggered',
        message: `High fridge temperature: ${temp}°C!`,
      });
    } else {
      showToast({
        type: 'success',
        title: 'Sensor Updated',
        message: `Simulated reading set to ${temp}°C (${status}).`,
      });
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);

    const act = await activityService.logEvent({
      type: 'threshold_updated',
      title: 'Thresholds Updated',
      description: 'System temperature or shelf-life parameters adjusted.',
    });
    setActivities((prev) => [act, ...prev]);

    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'System parameters have been updated.',
    });
  };

  const resetAllData = async () => {
    await settingsService.resetAllData();
    await refreshAllData();
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All inventory, alerts, and history restored to factory sample state.',
    });
  };

  // Derived statistics
  const totalItems = dynamicInventory.length;
  const expiringSoonItems = dynamicInventory.filter((i) => i.status === 'Approaching Expiry');
  const attentionItems = dynamicInventory.filter(
    (i) => i.status === 'Requires Attention' || i.status === 'Expired'
  );
  const freshItems = dynamicInventory.filter((i) => i.status === 'Fresh');

  const categoryBreakdown = useMemo(() => {
    const counts: Record<FoodCategory, number> = {
      'Produce': 0,
      'Dairy & Eggs': 0,
      'Meat & Seafood': 0,
      'Leftovers': 0,
      'Beverages': 0,
      'Condiments & Sauces': 0,
      'Bakery': 0,
      'Other': 0,
    };
    dynamicInventory.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [dynamicInventory]);

  const locationBreakdown = useMemo(() => {
    const counts: Record<StorageLocation, number> = {
      'Refrigerator': 0,
      'Freezer': 0,
      'Pantry/Crisper': 0,
    };
    dynamicInventory.forEach((item) => {
      counts[item.location] = (counts[item.location] || 0) + 1;
    });
    return counts;
  }, [dynamicInventory]);

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.acknowledged), [alerts]);

  return (
    <AppContext.Provider
      value={{
        inventory: dynamicInventory,
        alerts,
        activities,
        sensorHistory,
        latestSensor,
        settings,
        loading,
        toasts,
        addFoodItem,
        updateFoodItem,
        removeFoodItem,
        moveFoodItem,
        acknowledgeAlert,
        simulateTemperatureChange,
        updateSettings,
        resetAllData,
        showToast,
        removeToast,
        totalItems,
        expiringSoonItems,
        attentionItems,
        freshItems,
        categoryBreakdown,
        locationBreakdown,
        activeAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
