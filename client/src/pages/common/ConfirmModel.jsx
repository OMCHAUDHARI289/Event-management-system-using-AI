import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function DeletePopup({ isOpen, onClose, onConfirm, itemName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  

  const handleDelete = () => {
    setIsDeleting(true);
    onConfirm?.(); // Call parent deletion logic
    setTimeout(() => {
      setIsDeleting(false);
      onClose?.();
    }, 500); // simulate delay
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-red-500/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500"></div>
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Delete {itemName}?</h2>
                <p className="text-sm text-gray-400">This action is permanent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold transition-all shadow-xl shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
