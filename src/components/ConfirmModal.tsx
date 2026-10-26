import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, AlertCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText,
  variant = 'danger',
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const isAlertOnly = !cancelText;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-enter"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-zinc-100 text-center relative sheet-enter"
      >
        {/* Close Cross */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
              variant === 'danger'
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : variant === 'warning'
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-orange-50 text-[#FF5E00] border border-orange-100'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-black text-zinc-900 tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-500 mb-6 max-w-xs mx-auto">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {!isAlertOnly && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-full font-black text-xs cursor-pointer active:scale-95 transition-all text-white ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30'
                : 'btn-shiny bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] shadow-md shadow-orange-500/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
