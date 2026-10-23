import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { FoodItem } from '../../types';

interface DeleteConfirmModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Consumed (Eaten)');

  if (!isOpen || !item) return null;

  const reasons = [
    'Consumed (Eaten)',
    'Discarded / Expired / Spoiled',
    'Moved to outside storage / pantry',
    'Donated or given away',
  ];

  const handleConfirm = () => {
    onConfirm(item.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Remove Food Record</h3>
              <p className="text-xs text-slate-500">Confirm removal from smart inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{item.name}</strong> ({item.quantity} {item.unit}) from the <strong>{item.location}</strong>?
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Removal
            </label>
            <div className="space-y-1.5">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r
                      ? 'border-rose-400 bg-rose-50/60 font-semibold text-rose-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="removalReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              Confirm Removal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
