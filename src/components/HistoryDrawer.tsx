import React, { useState, useEffect } from 'react';
import type { RunRecord } from '../types';
import { X, Trash2, Calendar, Navigation } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: RunRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onDeleteRecord,
  onClearAll,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/40 ${
        isClosing ? 'backdrop-exit' : 'backdrop-enter'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col ${
          isClosing ? 'sheet-exit' : 'sheet-enter'
        }`}
      >
        {/* Handle & Close Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Clear Action */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Run History
            </h2>
            <p className="text-xs text-zinc-400">
              {history.length} {history.length === 1 ? 'circuit completed' : 'circuits completed'}
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Runs List */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {history.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-zinc-300 stroke-[1.8]" />
              <p className="text-sm font-semibold text-zinc-600">No runs logged yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Complete your first circuit (Home → TO → Home) to record your times here.
              </p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-3"
              >
                {/* Date & Delete */}
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{record.dateStr}</span>
                  </div>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="text-zinc-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Circuit Route */}
                <div className="flex items-center space-x-1.5 text-xs text-zinc-800 font-bold">
                  <Navigation className="w-3.5 h-3.5 text-[#FF5E00]" />
                  <span>{record.fromName}</span>
                  <span className="text-zinc-300">→</span>
                  <span className="text-[#FF5E00]">{record.toName}</span>
                  <span className="text-zinc-300">→</span>
                  <span>{record.fromName}</span>
                </div>

                {/* Times & Splits Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center bg-white rounded-xl p-2.5 border border-zinc-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Start (Home)</span>
                    <p className="text-xs font-mono font-bold text-zinc-800 mt-0.5">{record.startTimeStr}</p>
                  </div>
                  <div className="border-x border-zinc-100">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Turnaround</span>
                    <p className="text-xs font-mono font-bold text-[#FF5E00] mt-0.5">{record.turnaroundTimeStr}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Finish (Home)</span>
                    <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">{record.finishTimeStr}</p>
                  </div>
                </div>

                {/* Outbound & Inbound Leg Splits */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium px-1">
                  <span>Outbound split: <strong className="text-zinc-800">{record.outboundDurationText}</strong></span>
                  <span>Return split: <strong className="text-zinc-800">{record.inboundDurationText}</strong></span>
                </div>

                {/* Total Duration Footer */}
                <div className="flex items-center justify-between pt-1 text-xs border-t border-zinc-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-medium">Total Time:</span>
                    <span className="font-mono font-black text-zinc-900 text-sm">
                      {record.durationText}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100/70 text-[#FF5E00] font-black text-xs">
                    {record.totalDistanceKm} km
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={onClearAll}
        title="Delete All Run History?"
        message="All saved circuit run records will be permanently removed. This action cannot be undone."
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
