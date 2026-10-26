import React, { useState, useEffect } from 'react';
import type { GeoLocation, CircuitPhase } from '../types';
import { formatTimerClock } from '../utils/geo';
import { 
  Play, 
  Check, 
  Flag, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2,
  Home,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface RunCircuitViewProps {
  phase: CircuitPhase;
  fromLocation: GeoLocation | null;
  toLocation: GeoLocation | null;
  userCoords: [number, number];
  elapsedSeconds: number;
  outboundDuration: number | null;
  distanceToHome: number;
  distanceToTurnaround: number;
  isAtHome: boolean;
  isAtTurnaround: boolean;
  onStartRun: () => boolean | void;
  onReachTurnaround: () => boolean | void;
  onEndRun: () => boolean | void;
  onResetRun: () => void;
  onOpenSetup: (type: 'from' | 'to') => void;
}

export const RunCircuitView: React.FC<RunCircuitViewProps> = ({
  phase,
  fromLocation,
  toLocation,
  elapsedSeconds,
  outboundDuration,
  distanceToHome,
  distanceToTurnaround,
  isAtHome,
  isAtTurnaround,
  onStartRun,
  onReachTurnaround,
  onEndRun,
  onResetRun,
  onOpenSetup,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Auto-dismiss geofence validation error after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  // If locations are not yet calibrated
  if (!fromLocation || !toLocation) {
    return (
      <div className="flex flex-col space-y-4 pt-1 pb-10">
        
        {/* Header Title */}
        <div className="text-center pt-1 pb-1">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            Set Your Circuit
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lock starting point & turnaround destination
          </p>
        </div>

        {/* Clean Animated Circuit Track */}
        <div className="py-2.5 px-4 rounded-3xl bg-white border border-zinc-200/80 shadow-xs relative">
          <div className="relative py-1">
            <svg viewBox="0 0 300 64" className="w-full h-auto">
              {/* Outbound Path (Home -> Turnaround) */}
              <path
                d="M 36 24 C 90 8, 210 8, 264 24"
                fill="none"
                stroke="#E4E4E7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 36 24 C 90 8, 210 8, 264 24"
                fill="none"
                stroke="#FF5E00"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-dash-flow opacity-90"
              />

              {/* Inbound Path (Turnaround -> Finish) */}
              <path
                d="M 264 40 C 210 56, 90 56, 36 40"
                fill="none"
                stroke="#E4E4E7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 264 40 C 210 56, 90 56, 36 40"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-dash-flow opacity-90"
              />

              {/* Node 1: Home Origin */}
              <g transform="translate(36, 32)">
                <circle
                  r="16"
                  className={fromLocation ? 'fill-emerald-500' : 'fill-zinc-900'}
                />
                <circle
                  r="21"
                  className={fromLocation ? 'stroke-emerald-300 stroke-2 fill-none' : 'stroke-zinc-300 stroke-2 fill-none animate-ping opacity-30'}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  {fromLocation ? '✓' : '1'}
                </text>
              </g>

              {/* Node 2: Turnaround Destination */}
              <g transform="translate(264, 32)">
                <circle
                  r="16"
                  className={toLocation ? 'fill-emerald-500' : 'fill-[#FF5E00]'}
                />
                <circle
                  r="21"
                  className={toLocation ? 'stroke-emerald-300 stroke-2 fill-none' : 'stroke-orange-300 stroke-2 fill-none animate-ping opacity-40'}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  {toLocation ? '✓' : '2'}
                </text>
              </g>

              <text x="150" y="14" textAnchor="middle" fill="#FF5E00" fontSize="8" fontWeight="800">
                OUTBOUND →
              </text>
              <text x="150" y="56" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="800">
                ← RETURN
              </text>
            </svg>
          </div>
        </div>

        {/* Shiny Interactive Calibration Cards (Responsive for 360px viewport) */}
        <div className="space-y-3 text-left">
          {/* Card 1: Home / Start Location */}
          <div
            className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
              fromLocation
                ? 'bg-white border-zinc-200/80 shadow-xs'
                : 'bg-white border-zinc-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                  fromLocation
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-zinc-900 text-white shadow-md'
                }`}
              >
                {fromLocation ? <Check className="w-5 h-5 stroke-[2.8]" /> : <Home className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                  Step 1 · Origin
                </span>
                <p className="text-sm font-black text-zinc-900 leading-tight">
                  {fromLocation ? fromLocation.name : 'Home (FROM)'}
                </p>
                <p className="text-[11px] text-zinc-500 leading-tight pt-0.5">
                  {fromLocation ? `Radius ±${fromLocation.radiusMeters}m · Calibrated` : 'Lock your physical start position'}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onOpenSetup('from')}
                className={`cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
                  fromLocation
                    ? 'rounded-full px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs'
                    : 'btn-shiny rounded-full px-5 py-2.5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 text-white font-black text-xs shadow-md'
                }`}
              >
                <span>{fromLocation ? 'Edit' : 'Lock Home'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Destination / Turnaround */}
          <div
            className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
              toLocation
                ? 'bg-white border-zinc-200/80 shadow-xs'
                : 'bg-white border-zinc-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                  toLocation
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-gradient-to-br from-[#FF5E00] to-[#FF8C00] text-white shadow-orange-500/30 shadow-md'
                }`}
              >
                {toLocation ? <Check className="w-5 h-5 stroke-[2.8]" /> : <Navigation className="w-5 h-5 fill-white/20" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5E00] block">
                  Step 2 · Turnaround
                </span>
                <p className="text-sm font-black text-zinc-900 leading-tight">
                  {toLocation ? toLocation.name : 'Destination (TO)'}
                </p>
                <p className="text-[11px] text-zinc-500 leading-tight pt-0.5">
                  {toLocation ? `Radius ±${toLocation.radiusMeters}m · Calibrated` : 'Lock your turnaround checkpoint'}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onOpenSetup('to')}
                className={`cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
                  toLocation
                    ? 'rounded-full px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs'
                    : 'btn-shiny rounded-full px-5 py-2.5 bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] text-white font-black text-xs shadow-[0_6px_20px_rgba(255,94,0,0.35)]'
                }`}
              >
                <span>{toLocation ? 'Edit' : 'Lock Turnaround'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Active validation handlers
  const handleActionClick = () => {
    setErrorMessage(null);

    if (phase === 'ready') {
      if (!isAtHome) {
        setErrorMessage(
          `Cannot start run: You are currently ${distanceToHome}m away from ${fromLocation.name}. You must be physically at Home to begin.`
        );
        return;
      }
      onStartRun();
    } else if (phase === 'outbound') {
      if (!isAtTurnaround) {
        setErrorMessage(
          `Cannot check in: You are ${distanceToTurnaround}m away from ${toLocation.name}. You must reach your destination to check in.`
        );
        return;
      }
      onReachTurnaround();
    } else if (phase === 'inbound') {
      if (!isAtHome) {
        setErrorMessage(
          `Cannot end run: You are ${distanceToHome}m away from ${fromLocation.name}. You must run all the way back Home to finish.`
        );
        return;
      }
      onEndRun();
    }
  };

  // Determine current target distance & zone status
  const currentTargetName =
    phase === 'outbound' ? toLocation.name : fromLocation.name;
  const currentDistance =
    phase === 'outbound' ? distanceToTurnaround : distanceToHome;
  const isCurrentlyInZone =
    phase === 'outbound' ? isAtTurnaround : isAtHome;

  return (
    <div className="flex flex-col justify-between min-h-[68vh] py-3 pb-8">
      {/* Top: Compact Route Pill (Shown only in Ready Phase) */}
      {phase === 'ready' && (
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1 p-1 pr-1.5 rounded-full bg-white border border-zinc-200/80 shadow-xs text-xs font-bold text-zinc-700">
            <button
              type="button"
              onClick={() => onOpenSetup('from')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-800"
              title="Calibrate Home (FROM)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate max-w-[110px]">{fromLocation?.name || 'Home'}</span>
            </button>
            <span className="text-zinc-300 font-normal select-none px-0.5">⇄</span>
            <button
              type="button"
              onClick={() => onOpenSetup('to')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-orange-50 hover:text-[#FF5E00] transition-colors cursor-pointer text-zinc-800"
              title="Calibrate Turnaround (TO)"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5E00] shrink-0" />
              <span className="truncate max-w-[110px]">{toLocation?.name || 'Turnaround'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Middle: Clean Status or Live Stopwatch */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 text-center">
        {phase === 'ready' ? (
          /* Ready Phase Hero */
          <div className="space-y-3">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                isAtHome
                  ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 shadow-sm'
                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
              }`}
            >
              {isAtHome ? (
                <Check className="w-10 h-10 stroke-[2.8]" />
              ) : (
                <Home className="w-9 h-9 stroke-[2]" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                {isAtHome ? 'Ready to Start' : 'Go to Home'}
              </h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {isAtHome
                  ? `At ${fromLocation.name} · Inside ±${fromLocation.radiusMeters}m geofence`
                  : `Currently ${distanceToHome}m away from ${fromLocation.name}. Move to start line.`}
              </p>
            </div>
          </div>
        ) : (
          /* Active Run Phase (Minimal Athletic Layout) */
          <div className="space-y-6 w-full">
            {/* Phase Label */}
            <span className="text-xs font-black uppercase tracking-widest text-[#FF5E00] block">
              {phase === 'outbound' ? 'Outbound' : 'Returning Home'}
            </span>

            {/* Giant Stopwatch */}
            <div className="text-7xl font-mono font-black text-zinc-900 tracking-tight">
              {formatTimerClock(elapsedSeconds)}
            </div>

            {/* Clean Distance Counter */}
            <div className="space-y-1">
              <div className={`text-4xl font-mono font-black tracking-tight ${isCurrentlyInZone ? 'text-emerald-600' : 'text-zinc-900'}`}>
                {currentDistance}m
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {isCurrentlyInZone
                  ? (phase === 'outbound' ? 'At Turnaround (In Zone)' : 'At Home (In Zone)')
                  : (phase === 'outbound' ? `to ${currentTargetName}` : 'to Home Finish')}
              </p>
            </div>

            {outboundDuration !== null && phase === 'inbound' && (
              <p className="text-xs font-mono text-zinc-400 pt-1">
                Turnaround split: {Math.round(outboundDuration / 60)}m {outboundDuration % 60}s
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Error Alert & Action Button */}
      <div className="space-y-3 w-full">
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start space-x-2.5 text-rose-800 text-xs text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        <button
          onClick={handleActionClick}
          className={`w-full py-5 rounded-full font-black text-sm tracking-wider flex items-center justify-center space-x-2.5 cursor-pointer active:scale-95 transition-all text-white ${
            phase === 'ready'
              ? isAtHome
                ? 'btn-shiny bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] shadow-[0_12px_32px_rgba(255,94,0,0.4)]'
                : 'bg-zinc-800 text-zinc-300 shadow-md'
              : phase === 'outbound'
              ? isAtTurnaround
                ? 'btn-shiny bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_12px_32px_rgba(16,185,129,0.4)]'
                : 'bg-zinc-800 text-zinc-300 shadow-md'
              : isAtHome
              ? 'btn-shiny bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 shadow-[0_12px_32px_rgba(16,185,129,0.4)]'
              : 'bg-zinc-800 text-zinc-300 shadow-md'
          }`}
        >
          {phase === 'ready' ? (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>START RUN</span>
            </>
          ) : phase === 'outbound' ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>CHECK IN</span>
            </>
          ) : (
            <>
              <Flag className="w-5 h-5 fill-current" />
              <span>FINISH RUN</span>
            </>
          )}
        </button>

        {phase === 'ready' && !isAtHome && (
          <p className="text-center text-xs text-zinc-400">
            Must be within {fromLocation.radiusMeters}m of {fromLocation.name} to start
          </p>
        )}
      </div>

      {/* Cancel / Reset Run if in progress */}
      {phase !== 'ready' && (
        <div className="text-center pt-2">
          <button
            onClick={() => setIsCancelConfirmOpen(true)}
            className="text-xs font-bold text-zinc-400 hover:text-rose-500 inline-flex items-center gap-1 cursor-pointer p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel Run</span>
          </button>
        </div>
      )}

      {/* Cancel Active Run Confirmation Modal */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={onResetRun}
        title="Cancel Active Run?"
        message="Your current circuit progress and stopwatch timer will be discarded."
        confirmText="Yes, Cancel Run"
        cancelText="Keep Running"
        variant="danger"
      />
    </div>
  );
};
