import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { FoodItem, FoodCategory, StorageLocation, UnitType } from '../../types';
import { DEFAULT_STORAGE_GUIDELINES, getRelativeDate } from '../../data/mockData';

interface AddEditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FoodItem, 'id' | 'dateAdded'>) => void;
  initialItem?: FoodItem | null;
}

const CATEGORIES: FoodCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Leftovers',
  'Beverages',
  'Condiments & Sauces',
  'Bakery',
  'Other',
];

const LOCATIONS: StorageLocation[] = ['Refrigerator', 'Freezer', 'Pantry/Crisper'];

const UNITS: UnitType[] = ['items', 'g', 'kg', 'ml', 'L', 'packs', 'slices', 'bottles', 'cans'];

export const AddEditFoodModal: React.FC<AddEditFoodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Produce');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('items');
  const [location, setLocation] = useState<StorageLocation>('Refrigerator');
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(6);
  const [storageGuidance, setStorageGuidance] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; quantity?: string; shelfLife?: string }>({});

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setQuantity(initialItem.quantity);
      setUnit(initialItem.unit);
      setLocation(initialItem.location);
      setShelfLifeDays(initialItem.estimatedShelfLifeDays);
      setStorageGuidance(initialItem.storageGuidance);
      setNotes(initialItem.notes || '');
    } else {
      // Default new item values
      setName('');
      setCategory('Produce');
      setQuantity(1);
      setUnit('items');
      setLocation('Refrigerator');
      const defaultGuide = DEFAULT_STORAGE_GUIDELINES['Produce'];
      setShelfLifeDays(defaultGuide.defaultDays);
      setStorageGuidance(defaultGuide.guidance);
      setNotes('');
    }
    setErrors({});
  }, [initialItem, isOpen]);

  // Handle Category change to suggest default guidance and shelf-life
  const handleCategoryChange = (cat: FoodCategory) => {
    setCategory(cat);
    if (!initialItem) {
      const guide = DEFAULT_STORAGE_GUIDELINES[cat];
      if (guide) {
        setShelfLifeDays(guide.defaultDays);
        setStorageGuidance(guide.guidance);
      }
    }
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: { name?: string; quantity?: string; shelfLife?: string } = {};
    if (!name.trim()) {
      errs.name = 'Food name is required';
    }
    if (!quantity || quantity <= 0) {
      errs.quantity = 'Quantity must be greater than 0';
    }
    if (shelfLifeDays === undefined || shelfLifeDays < 1) {
      errs.shelfLife = 'Estimated shelf life must be at least 1 day';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const estimatedExpiryDate = getRelativeDate(shelfLifeDays);

    onSubmit({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      location,
      estimatedShelfLifeDays: Number(shelfLifeDays),
      estimatedExpiryDate,
      storageGuidance: storageGuidance.trim() || 'Store in cool conditions according to food type.',
      status: shelfLifeDays <= 2 ? 'Approaching Expiry' : 'Fresh',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialItem ? 'Edit Food Record' : 'Add Food to Inventory'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialItem
                ? 'Update storage parameters and estimated review date'
                : 'Log item into smart fridge database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Food Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Baby Spinach or Fresh Milk"
              className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Storage Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as StorageLocation)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.quantity
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Shelf Life */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Estimated Shelf Life (Days) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Projected Review Date: {new Date(Date.now() + (shelfLifeDays || 0) * 86400000).toLocaleDateString()}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="365"
              value={shelfLifeDays}
              onChange={(e) => setShelfLifeDays(parseInt(e.target.value) || 1)}
              className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.shelfLife
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
            {errors.shelfLife && <p className="text-xs text-rose-500 mt-1">{errors.shelfLife}</p>}
          </div>

          {/* Storage Guidance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Food Safety & Storage Guidance
            </label>
            <textarea
              rows={2}
              value={storageGuidance}
              onChange={(e) => setStorageGuidance(e.target.value)}
              placeholder="e.g. Keep sealed in crisper drawer below 4°C"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Optional Notes / Batch Details
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Opened on Tuesday, cooked fresh"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            />
          </div>

          {/* Food Safety Notice */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Food Safety Note:</strong> Estimated shelf life is an advisory guideline based on ideal cold storage, not a guaranteed expiry date. Always inspect aroma, appearance, and temperature before consumption.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-safegreen hover:bg-safegreen-light text-white shadow-sm transition-all"
            >
              {initialItem ? 'Save Changes' : 'Confirm & Add Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
