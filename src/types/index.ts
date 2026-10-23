export type FoodCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Leftovers'
  | 'Beverages'
  | 'Condiments & Sauces'
  | 'Bakery'
  | 'Other';

export type StorageLocation = 'Refrigerator' | 'Freezer' | 'Pantry/Crisper';

export type FoodStatus = 'Fresh' | 'Approaching Expiry' | 'Requires Attention' | 'Expired';

export type UnitType = 'items' | 'g' | 'kg' | 'ml' | 'L' | 'packs' | 'slices' | 'bottles' | 'cans';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: UnitType;
  location: StorageLocation;
  dateAdded: string; // ISO string
  estimatedShelfLifeDays: number;
  estimatedExpiryDate: string; // ISO string
  storageGuidance: string;
  status: FoodStatus;
  notes?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'temperature' | 'expiry' | 'sensor' | 'storage' | 'door';

export interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string; // ISO string
  acknowledged: boolean;
  acknowledgedAt?: string;
  relatedFoodItemId?: string;
}

export type ActivityType =
  | 'item_added'
  | 'item_removed'
  | 'item_edited'
  | 'item_moved'
  | 'alert_raised'
  | 'alert_acknowledged'
  | 'threshold_updated'
  | 'system_reset'
  | 'system_event';

export interface ActivityLogEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}

export interface SensorReading {
  timestamp: string; // e.g. "10:00 AM" or ISO
  timeFull: string;
  temperature: number; // in Celsius
  humidity: number; // in %
  freezerTemp: number; // in Celsius
  doorOpen: boolean;
  status: 'optimal' | 'warning' | 'critical';
}

export interface SystemSettings {
  temperatureUnit: 'C' | 'F';
  fridgeMinTemp: number; // default 1.0°C
  fridgeMaxTemp: number; // default 4.0°C
  freezerMinTemp: number; // default -22.0°C
  freezerMaxTemp: number; // default -16.0°C
  doorAjarSeconds: number; // default 120
  expiryWarningDays: number; // default 2
  sampleMode: boolean; // true
}

export type VoiceIntent =
  | 'add_food'
  | 'remove_food'
  | 'move_food'
  | 'query_expiring'
  | 'query_inventory'
  | 'unknown';

export interface ParsedVoiceCommand {
  rawTranscript: string;
  intent: VoiceIntent;
  confidence: number;
  foodName?: string;
  quantity?: number;
  unit?: UnitType;
  location?: StorageLocation;
  targetLocation?: StorageLocation;
  category?: FoodCategory;
  clarificationPrompt?: string;
  previewSummary?: string;
  actionPayload?: {
    action: 'add' | 'remove' | 'move' | 'query';
    itemData?: Partial<FoodItem>;
    existingItemId?: string;
    targetLocation?: StorageLocation;
  };
}
