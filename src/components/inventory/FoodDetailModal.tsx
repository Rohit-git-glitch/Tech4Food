import React from 'react';
import { X, Calendar, MapPin, Tag, ShieldCheck, AlertTriangle, Clock, Info } from 'lucide-react';
import { FoodItem } from '../../types';
import { DEFAULT_STORAGE_GUIDELINES } from '../../data/mockData';

interface FoodDetailModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: FoodItem) => void;
  onMove: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onMove,
  onDelete,
}) => {
  if (!isOpen || !item) return null;

  const addedDate = new Date(item.dateAdded).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const expiryDate = new Date(item.estimatedExpiryDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const now = new Date().getTime();
  const expTime = new Date(item.estimatedExpiryDate).getTime();
  const daysRemaining = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

  const guideline = DEFAULT_STORAGE_GUIDELINES[item.category];

  const getStatusBadge = () => {
    switch (item.status) {
      case 'Fresh':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Fresh & Safe
          </span>
        );
      case 'Approaching Expiry':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Approaching Shelf Life ({daysRemaining}d left)
          </span>
        );
      case 'Requires Attention':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            Requires Attention (Consume or Freeze Today)
          </span>
        );
      case 'Expired':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
            Past Estimated Shelf Life
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {item.id}
              </span>
              {getStatusBadge()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quantity: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span> • Location: <span className="font-semibold text-slate-700">{item.location}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{item.category}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Zone
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{item.location}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Added On
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{addedDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Review Date
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{expiryDate}</p>
            </div>
          </div>

          {/* Storage Guidance */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Recommended Storage Guidance
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {item.storageGuidance}
            </p>
            {guideline && (
              <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1">
                <span className="font-semibold">Optimal Temperature Range:</span> {guideline.safeTempRange}
              </div>
            )}
          </div>

          {/* Item Notes */}
          {item.notes && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">User Notes:</span>
              <p className="text-slate-700 mt-0.5">{item.notes}</p>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Estimated shelf life is calculated from date added and baseline USDA food preservation protocols. Do not consume if food displays off-odors, discoloration, or packaging swelling.
            </p>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onDelete(item);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Remove Item
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onMove(item);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Relocate
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-4 py-1.5 rounded-xl bg-safegreen hover:bg-safegreen-light text-white text-xs font-semibold transition-colors"
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
