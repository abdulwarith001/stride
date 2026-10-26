import React, { useState } from 'react';
import type { GeoLocation } from '../types';
import { calculateDistanceMeters } from '../utils/geo';
import { X, Check, AlertTriangle, Radio, Sparkles, MapPin, Target, Home, Navigation } from 'lucide-react';

interface LocationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'from' | 'to';
  currentCoords: [number, number];
  fromLocation: GeoLocation | null;
  toLocation: GeoLocation | null;
  onSaveLocation: (loc: GeoLocation) => void;
}

export const LocationSetupModal: React.FC<LocationSetupModalProps> = ({
  isOpen,
  onClose,
  targetType,
  currentCoords,
  fromLocation,
  toLocation,
  onSaveLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'from' | 'to'>(targetType);

  const isFrom = activeTab === 'from';
  const currentLoc = isFrom ? fromLocation : toLocation;
  const otherLocation = isFrom ? toLocation : fromLocation;

  const [name, setName] = useState(
    currentLoc ? currentLoc.name : isFrom ? 'Home' : 'Turnaround'
  );
  const [radius, setRadius] = useState<number>(currentLoc ? currentLoc.radiusMeters : 30);
  const [activeCoords, setActiveCoords] = useState<[number, number]>(
    currentLoc ? [currentLoc.lat, currentLoc.lng] : currentCoords
  );

  // Switch between Home and Turnaround tabs
  const handleSwitchTab = (tab: 'from' | 'to') => {
    setActiveTab(tab);
    const loc = tab === 'from' ? fromLocation : toLocation;
    setName(loc ? loc.name : tab === 'from' ? 'Home' : 'Turnaround');
    setRadius(loc ? loc.radiusMeters : 30);
    setActiveCoords(loc ? [loc.lat, loc.lng] : currentCoords);
  };

  if (!isOpen) return null;

  // Real-time distance check against the other location
  const distanceToOther =
    otherLocation && activeCoords
      ? calculateDistanceMeters(activeCoords[0], activeCoords[1], otherLocation.lat, otherLocation.lng)
      : null;

  const minRequiredDistance = otherLocation ? Math.max(50, radius + otherLocation.radiusMeters) : 0;
  const isTooClose = distanceToOther !== null && distanceToOther < minRequiredDistance;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isTooClose) return;

    const loc: GeoLocation = {
      id: activeTab,
      name: name.trim(),
      lat: activeCoords[0],
      lng: activeCoords[1],
      radiusMeters: radius,
      timestamp: Date.now(),
    };

    onSaveLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-enter">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-zinc-100 sheet-enter max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md ${
                isFrom
                  ? 'bg-gradient-to-br from-zinc-800 to-zinc-950'
                  : 'bg-gradient-to-br from-[#FF5E00] to-[#FF8C00] shadow-orange-500/30'
              }`}
            >
              {isFrom ? '1' : '2'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-zinc-900 tracking-tight">
                  {isFrom ? 'Calibrate Home (Origin)' : 'Calibrate Turnaround (TO)'}
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
              </div>
              <p className="text-xs text-zinc-400">Lock high-precision GPS geofence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Home (FROM) vs Turnaround (TO) */}
        <div className="flex p-1 rounded-full bg-zinc-100 border border-zinc-200/80 my-3">
          <button
            type="button"
            onClick={() => handleSwitchTab('from')}
            className={`flex-1 py-2 rounded-full font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isFrom
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home (FROM)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('to')}
            className={`flex-1 py-2 rounded-full font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isFrom
                ? 'bg-[#FF5E00] text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Turnaround (TO)</span>
          </button>
        </div>

        {/* Interactive GPS Radar Scanner Visualizer */}
        <div className="my-4 p-4 rounded-3xl bg-gradient-to-b from-zinc-50 to-orange-50/30 border border-orange-100/60 relative overflow-hidden flex flex-col items-center text-center">
          {/* Radar Screen Graphic */}
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute inset-0 rounded-full border border-orange-200/60" />
            <div className="absolute inset-3 rounded-full border border-orange-300/40" />
            <div className="absolute inset-6 rounded-full border border-orange-400/30" />

            {/* Rotating scanner beam */}
            <div className="absolute inset-0 rounded-full overflow-hidden animate-radar-sweep pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#FF5E00]/25 to-transparent rounded-tl-full" />
            </div>

            {/* Expanding Geofence Visualizer ring dynamically scaled by selected radius */}
            <div
              className={`absolute rounded-full border-2 border-[#FF5E00] bg-[#FF5E00]/10 transition-all duration-300 pointer-events-none ${
                radius === 20 ? 'w-14 h-14' : radius === 30 ? 'w-20 h-20' : 'w-26 h-26'
              }`}
            />

            {/* Center Ping Dot */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-[#FF5E00] shadow-[0_0_12px_rgba(255,94,0,0.8)] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#FF5E00]/30 animate-radar-ping absolute" />
              <Target className="w-2.5 h-2.5 text-white stroke-[3]" />
            </div>
          </div>

          <div className="mt-2 space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 shadow-xs border border-orange-100 text-[11px] font-black text-[#FF5E00]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE HARDWARE GPS LOCKED</span>
            </div>
            <p className="text-xs font-mono font-semibold text-zinc-600 pt-1">
              {activeCoords[0].toFixed(5)}° N, {activeCoords[1].toFixed(5)}° E
            </p>
            <p className="text-[11px] text-zinc-400">
              Interactive target geofence: <strong className="text-zinc-800">±{radius} meters</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Location Custom Name Input */}
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider mb-1.5">
              Location Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isFrom ? 'e.g. Home' : 'e.g. Turnaround Point'}
                className="w-full px-4 py-3 rounded-full bg-zinc-100 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/40 font-bold border border-transparent focus:border-orange-300 transition-all"
              />
              <MapPin className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Geofence Detection Radius Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">
                Geofence Radius
              </label>
              <span className="text-xs font-mono font-black text-[#FF5E00]">±{radius}m detection zone</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[20, 30, 50].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                    radius === r
                      ? 'bg-gradient-to-r from-[#FF5E00] to-[#FF8C00] text-white shadow-[0_4px_14px_rgba(255,94,0,0.3)] scale-[1.02]'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  ±{r} meters
                </button>
              ))}
            </div>
          </div>

          {/* Overlap / Proximity Warning */}
          {isTooClose && otherLocation && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Overlapping Location Detected</p>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Your device is currently only <strong>{distanceToOther}m</strong> away from <strong>{otherLocation.name}</strong>. Home and Destination must be distinct points separated by at least {minRequiredDistance}m. Please calibrate at your turnaround point.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shiny Rounded-Full Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTooClose}
              className={`flex-1 py-4 rounded-full font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isTooClose
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'btn-shiny bg-gradient-to-r from-[#FF5E00] via-[#FF7518] to-[#FFA000] text-white shadow-[0_10px_28px_rgba(255,94,0,0.38)] hover:shadow-[0_12px_32px_rgba(255,94,0,0.48)] cursor-pointer'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isTooClose ? 'Cannot Overlap' : `Lock ${isFrom ? 'Home' : 'Turnaround'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

