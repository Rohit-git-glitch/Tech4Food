import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                border: 'border-emerald-500',
                bg: 'bg-white',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
                titleColor: 'text-emerald-950',
              };
            case 'error':
              return {
                border: 'border-rose-500',
                bg: 'bg-white',
                icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
                titleColor: 'text-rose-950',
              };
            case 'warning':
              return {
                border: 'border-amber-500',
                bg: 'bg-white',
                icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
                titleColor: 'text-amber-950',
              };
            default:
              return {
                border: 'border-teal-500',
                bg: 'bg-white',
                icon: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />,
                titleColor: 'text-slate-900',
              };
          }
        };

        const style = getStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border-l-4 ${style.border} ${style.bg} border-slate-200 transition-all duration-300 animate-slide-in`}
          >
            {style.icon}
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${style.titleColor}`}>{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
