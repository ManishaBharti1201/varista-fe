// components/Toast.tsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Auto-close after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border bg-white animate-in slide-in-from-right-full duration-300 z-50">
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};