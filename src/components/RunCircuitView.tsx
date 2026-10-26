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
  ChevronRight,
  Compass,
  Footprints
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
  isAwayFromHome: boolean;
  isIncompleteRun: boolean;
  onStartRun: (isAway?: boolean) => boolean | void;
  onReachTurnaround: () => boolean | void;
  onTurnBackEarly: () => void;
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
  isAwayFromHome,
  isIncompleteRun,
  onStartRun,
  onReachTurnaround,
  onTurnBackEarly,
  onEndRun,
  onResetRun,
  onOpenSetup,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isTurnBackConfirmOpen, setIsTurnBackConfirmOpen] = useState(false);

  // Auto-dismiss geofence validation error after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  // ONBOARDING: If Home is not yet calibrated at all
  if (!fromLocation) {
    return (
      <div className="flex flex-col space-y-4 pt-1 pb-10">
        <div className="text-center pt-1 pb-1">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            Start Your Circuit
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calibrate your home base or quick-start right where you are
          </p>
        </div>

        {/* Clean Animated Circuit Track */}
        <div className="py-2.5 px-4 rounded-3xl bg-white border border-zinc-200/80 shadow-xs relative">
          <div className="relative py-1">
            <svg viewBox="0 0 300 64" className="w-full h-auto">
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
              <g transform="translate(36, 32)">
                <circle r="16" className="fill-zinc-900" />
                <circle r="21" className="stroke-zinc-300 stroke-2 fill-none animate-ping opacity-30" />
                <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="900">1</text>
              </g>
              <g transform="translate(264, 32)">
                <circle r="16" className="fill-[#FF5E00]" />
                <circle r="21" className="stroke-orange-300 stroke-2 fill-none animate-ping opacity-40" />
                <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="900">2</text>
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

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          {/* Option 1: Quick start here */}
          <button
            type="button"
            onClick={() => onStartRun(true)}
            className="w-full btn-shiny py-4 px-5 rounded-3xl bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] text-white flex items-center justify-between shadow-[0_10px_28px_rgba(255,94,0,0.38)] cursor-pointer active:scale-95 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Play className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <p className="font-black text-sm tracking-tight">Start Run from Here</p>
                <p className="text-[11px] text-white/80">Uses your current physical GPS coordinates</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/90" />
          </button>

          {/* Option 2: Pre-calibrate Home Base */}
          <button
            type="button"
            onClick={() => onOpenSetup('from')}
            className="w-full py-4 px-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:bg-zinc-50 cursor-pointer active:scale-95 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-zinc-900 tracking-tight">Lock Home Base</p>
                <p className="text-[11px] text-zinc-400">Save permanent Home geofence (±30m)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
    );
  }

  // Active validation handlers
  const handleActionClick = () => {
    setErrorMessage(null);

    if (phase === 'ready') {
      if (isAtHome) {
        onStartRun(false);
      } else {
        // Runner is away from home, start from current position!
        onStartRun(true);
      }
    } else if (phase === 'outbound') {
      if (!toLocation) {
        // Setting turnaround on the fly! Must be at least 50m away from start
        if (distanceToHome < 50) {
          setErrorMessage('You must be at least 50m away from your start point to set a turnaround.');
          return;
        }
        onReachTurnaround();
      } else {
        if (!isAtTurnaround) {
          setErrorMessage(
            `Cannot check in: You are ${distanceToTurnaround}m away from ${toLocation.name}. You must reach your destination, or tap "Turn Back Early" below.`
          );
          return;
        }
        onReachTurnaround();
      }
    } else if (phase === 'inbound') {
      if (!isAtHome) {
        setErrorMessage(
          `Cannot end run: You are ${distanceToHome}m away from ${fromLocation.name}. Return to start to finish.`
        );
        return;
      }
      onEndRun();
    }
  };

  // Determine current target distance & zone status
  const currentTargetName =
    phase === 'outbound'
      ? toLocation
        ? toLocation.name
        : 'Turnaround Point'
      : fromLocation.name;

  const currentDistance =
    phase === 'outbound'
      ? toLocation
        ? distanceToTurnaround
        : distanceToHome
      : distanceToHome;

  const isCurrentlyInZone =
    phase === 'outbound'
      ? toLocation
        ? isAtTurnaround
        : distanceToHome >= 50
      : isAtHome;

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
              <span className={`w-2 h-2 rounded-full shrink-0 ${isAtHome ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="truncate max-w-[110px]">{fromLocation.name}</span>
            </button>
            <span className="text-zinc-300 font-normal select-none px-0.5">⇄</span>
            <button
              type="button"
              onClick={() => onOpenSetup('to')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-orange-50 hover:text-[#FF5E00] transition-colors cursor-pointer text-zinc-800"
              title={toLocation ? 'Calibrate Turnaround (TO)' : 'Set Turnaround'}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${toLocation ? 'bg-[#FF5E00]' : 'bg-zinc-300 animate-pulse'}`} />
              <span className="truncate max-w-[110px]">
                {toLocation ? toLocation.name : 'Set on Fly 🚩'}
              </span>
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
                  : 'bg-amber-50 text-amber-600 border-2 border-amber-200 shadow-sm'
              }`}
            >
              {isAtHome ? (
                <Check className="w-10 h-10 stroke-[2.8]" />
              ) : (
                <Compass className="w-9 h-9 stroke-[2.2]" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                {isAtHome ? 'Ready to Start' : 'Away from Home'}
              </h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {isAtHome
                  ? `At ${fromLocation.name} · Inside ±${fromLocation.radiusMeters}m geofence`
                  : `Currently ${distanceToHome}m away from ${fromLocation.name}. You can start right from here!`}
              </p>
            </div>

            {!toLocation && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF5E00] text-[11px] font-bold border border-orange-200/60 mt-1">
                <Flag className="w-3.5 h-3.5" />
                <span>Turnaround will be locked when you check in</span>
              </div>
            )}
          </div>
        ) : (
          /* Active Run Phase (Minimal Athletic Layout) */
          <div className="space-y-6 w-full">
            {/* Phase Label */}
            <span className="text-xs font-black uppercase tracking-widest text-[#FF5E00] block">
              {phase === 'outbound'
                ? 'Outbound'
                : isIncompleteRun
                ? 'Returning Early'
                : isAwayFromHome
                ? 'Returning to Start'
                : 'Returning Home'}
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
                {phase === 'outbound'
                  ? toLocation
                    ? isAtTurnaround
                      ? 'At Turnaround (In Zone)'
                      : `to ${currentTargetName}`
                    : `${currentDistance}m from start · Check in when ready`
                  : isAtHome
                  ? 'At Finish (In Zone)'
                  : `to ${fromLocation.name} Finish`}
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
              ? 'btn-shiny bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] shadow-[0_12px_32px_rgba(255,94,0,0.4)]'
              : phase === 'outbound'
              ? !toLocation
                ? distanceToHome >= 50
                  ? 'btn-shiny bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] shadow-[0_12px_32px_rgba(255,94,0,0.4)]'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
                : isAtTurnaround
                ? 'btn-shiny bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_12px_32px_rgba(16,185,129,0.4)]'
                : 'bg-zinc-800 text-zinc-300 shadow-md'
              : isAtHome
              ? 'btn-shiny bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 shadow-[0_12px_32px_rgba(16,185,129,0.4)]'
              : 'bg-zinc-800 text-zinc-300 shadow-md'
          }`}
        >
          {phase === 'ready' ? (
            isAtHome ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>START RUN</span>
              </>
            ) : (
              <>
                <Footprints className="w-5 h-5" />
                <span>START RUN (AWAY FROM HOME)</span>
              </>
            )
          ) : phase === 'outbound' ? (
            !toLocation ? (
              <>
                <Flag className="w-5 h-5 fill-current" />
                <span>{distanceToHome >= 50 ? 'LOCK TURNAROUND HERE' : 'RUN 50M+ TO SET TURNAROUND'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>CHECK IN</span>
              </>
            )
          ) : (
            <>
              <Flag className="w-5 h-5 fill-current" />
              <span>FINISH RUN</span>
            </>
          )}
        </button>

        {phase === 'ready' && !isAtHome && (
          <p className="text-center text-xs text-zinc-400">
            Will record this session as an "Away from Home" circuit
          </p>
        )}
      </div>

      {/* In-Run Actions (Turn Back Early & Cancel) */}
      {phase !== 'ready' && (
        <div className="flex items-center justify-center gap-4 pt-3">
          {/* Turn Back Early Button (Only available during Outbound) */}
          {phase === 'outbound' && (
            <button
              type="button"
              onClick={() => setIsTurnBackConfirmOpen(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Turn Back Early</span>
            </button>
          )}

          {/* Cancel Run Button */}
          <button
            type="button"
            onClick={() => setIsCancelConfirmOpen(true)}
            className="text-xs font-bold text-zinc-400 hover:text-rose-500 inline-flex items-center gap-1 cursor-pointer py-1.5 px-2"
          >
            <span>Cancel Run</span>
          </button>
        </div>
      )}

      {/* Turn Back Early Confirmation Modal */}
      <ConfirmModal
        isOpen={isTurnBackConfirmOpen}
        onClose={() => setIsTurnBackConfirmOpen(false)}
        onConfirm={onTurnBackEarly}
        title="Turn Back Early?"
        message={`Heading back now? We'll log your progress so far (${currentDistance}m) and record this as an incomplete run when you finish.`}
        confirmText="Yes, Head Back Now"
        cancelText="Keep Going"
        variant="warning"
      />

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
