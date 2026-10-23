import React, { useState } from 'react';
import { X, ArrowRightLeft, Refrigerator, Snowflake, Box } from 'lucide-react';
import { FoodItem, StorageLocation } from '../../types';

interface MoveLocationModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (id: string, targetLocation: StorageLocation) => void;
}

export const MoveLocationModal: React.FC<MoveLocationModalProps> = ({
  item,
  isOpen,
  onClose,
  onMove,
}) => {
  const [targetLocation, setTargetLocation] = useState<StorageLocation>('Freezer');

  if (!isOpen || !item) return null;

  const locations: { id: StorageLocation; label: string; desc: string; icon: any }[] = [
    {
      id: 'Refrigerator',
      label: 'Refrigerator (Main Cavity)',
      desc: 'Maintain 1°C to 4°C for daily dairy, produce & ready-to-eat items',
      icon: Refrigerator,
    },
    {
      id: 'Freezer',
      label: 'Freezer (-18°C Compartment)',
      desc: 'Halts microbial growth for long-term safe preservation',
      icon: Snowflake,
    },
    {
      id: 'Pantry/Crisper',
      label: 'Pantry / Crisper Humidity Drawer',
      desc: 'Optimized humidity zone for fresh produce and greens',
      icon: Box,
    },
  ];

  const handleConfirm = () => {
    onMove(item.id, targetLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base">Relocate Food Item</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
            <p className="font-semibold text-emerald-900">{item.name}</p>
            <p className="text-emerald-700 mt-0.5">
              Current Location: <span className="font-semibold">{item.location}</span> ({item.quantity} {item.unit})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select New Storage Zone
            </label>
            <div className="space-y-2.5">
              {locations.map((loc) => {
                const Icon = loc.icon;
                const isSelected = targetLocation === loc.id;
                const isCurrent = item.location === loc.id;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setTargetLocation(loc.id)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isCurrent
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900">{loc.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{loc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={targetLocation === item.location}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-safegreen hover:bg-safegreen-light text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Confirm Relocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
