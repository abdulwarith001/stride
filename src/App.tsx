import { useState, useEffect, useRef } from 'react';
import { RunCircuitView } from './components/RunCircuitView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LocationSetupModal } from './components/LocationSetupModal';
import { ConfirmModal } from './components/ConfirmModal';
import type { GeoLocation, RunRecord, CircuitPhase } from './types';
import {
  calculateDistanceMeters,
  formatDuration,
  triggerHaptic,
  loadSavedLocations,
  saveFromLocation,
  saveToLocation,
  loadRunHistory,
  saveRunHistoryRecord,
  deleteRunHistoryRecord,
  clearAllRunHistory,
} from './utils/geo';
import { History, Settings2, Compass, Flame } from 'lucide-react';

export function App() {
  // 1. Saved Locations from localStorage (NO FAKE HARDCODED SEED)
  const [locations, setLocations] = useState<{ from: GeoLocation | null; to: GeoLocation | null }>(() => {
    // Clear any old fake SF coordinates if they were previously saved
    try {
      const rawFrom = localStorage.getItem('stride_circuit_from');
      if (rawFrom && JSON.parse(rawFrom).lat === 37.7879) {
        localStorage.removeItem('stride_circuit_from');
        localStorage.removeItem('stride_circuit_to');
        return { from: null, to: null };
      }
    } catch {
      // ignore
    }
    return loadSavedLocations();
  });

  // 2. Run History stored in localStorage
  const [history, setHistory] = useState<RunRecord[]>(() => loadRunHistory());

  // 3. User physical GPS coordinates (Read from device GPS)
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 4. Circuit State Machine
  const [phase, setPhase] = useState<CircuitPhase>('ready');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [turnaroundTimestamp, setTurnaroundTimestamp] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [outboundDuration, setOutboundDuration] = useState<number | null>(null);

  // 4b. Dynamic Session States (Away from Home, Incomplete/Turned Back Early)
  const [isAwayFromHome, setIsAwayFromHome] = useState(false);
  const [activeStartLoc, setActiveStartLoc] = useState<GeoLocation | null>(null);
  const [activeTurnaroundCoords, setActiveTurnaroundCoords] = useState<[number, number] | null>(null);
  const [isIncompleteRun, setIsIncompleteRun] = useState(false);

  // 5. Drawers & Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [setupModalType, setSetupModalType] = useState<'from' | 'to' | null>(null);
  const [alertModalInfo, setAlertModalInfo] = useState<{ title: string; message: string } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Read real device GPS (Offline Satellite API)
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setGpsError(null);
        },
        (err) => {
          setGpsError(err.message || 'GPS access denied or unavailable.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsError('Geolocation is not supported on this device.');
    }
  }, []);

  // Timer loop for active run
  useEffect(() => {
    if (phase === 'outbound' || phase === 'inbound') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Active Start & Turnaround endpoints
  const activeStart = (phase !== 'ready' && activeStartLoc) ? activeStartLoc : locations.from;

  const distanceToHome =
    activeStart && userCoords
      ? calculateDistanceMeters(userCoords[0], userCoords[1], activeStart.lat, activeStart.lng)
      : 9999;

  const distanceToTurnaround =
    locations.to && userCoords
      ? calculateDistanceMeters(userCoords[0], userCoords[1], locations.to.lat, locations.to.lng)
      : 9999;

  const isAtHome = activeStart ? distanceToHome <= activeStart.radiusMeters : false;
  const isAtTurnaround = locations.to ? distanceToTurnaround <= locations.to.radiusMeters : false;

  // STEP 1: START RUN (At Home or Away from Home)
  const handleStartRun = (isAway: boolean = false) => {
    if (!userCoords) {
      setAlertModalInfo({
        title: 'Acquiring GPS Signal',
        message: 'Looking for your physical GPS coordinates. Please ensure location services are enabled.',
      });
      return;
    }

    const now = Date.now();
    let startPoint: GeoLocation;

    if (isAway || !locations.from) {
      startPoint = {
        id: 'from',
        name: isAway ? 'Start (Away)' : 'Home',
        lat: userCoords[0],
        lng: userCoords[1],
        radiusMeters: 30,
        timestamp: now,
      };
      setIsAwayFromHome(isAway);
      setActiveStartLoc(startPoint);
      if (!locations.from) {
        saveFromLocation(startPoint);
        setLocations((prev) => ({ ...prev, from: startPoint }));
      }
    } else {
      setIsAwayFromHome(false);
      setActiveStartLoc(locations.from);
      startPoint = locations.from;
    }

    setStartTimestamp(now);
    setElapsedSeconds(0);
    setOutboundDuration(null);
    setTurnaroundTimestamp(null);
    setActiveTurnaroundCoords(null);
    setIsIncompleteRun(false);
    setPhase('outbound');
    triggerHaptic([120]);
  };

  // STEP 2: REACH TURNAROUND (Pre-set TO or On-The-Fly Turnaround Registration)
  const handleReachTurnaround = () => {
    if (!userCoords) return;
    const now = Date.now();
    setTurnaroundTimestamp(now);
    setOutboundDuration(elapsedSeconds);
    setActiveTurnaroundCoords(userCoords);

    // If Turnaround (TO) was not pre-configured, register current spot as the permanent TO!
    if (!locations.to) {
      const newTo: GeoLocation = {
        id: 'to',
        name: 'Turnaround',
        lat: userCoords[0],
        lng: userCoords[1],
        radiusMeters: 30,
        timestamp: now,
      };
      saveToLocation(newTo);
      setLocations((prev) => ({ ...prev, to: newTo }));
    }

    setPhase('inbound');
    triggerHaptic([100, 50, 100]);
  };

  // STEP 2b: TURN BACK EARLY (Incomplete Run)
  const handleTurnBackEarly = () => {
    if (!userCoords) return;
    const now = Date.now();
    setTurnaroundTimestamp(now);
    setOutboundDuration(elapsedSeconds);
    setActiveTurnaroundCoords(userCoords);
    setIsIncompleteRun(true);
    setPhase('inbound');
    triggerHaptic([150, 80, 150]);
  };

  // STEP 3: END RUN (Return to Start Location)
  const handleEndRun = () => {
    const finishNow = Date.now();
    const start = startTimestamp || finishNow - elapsedSeconds * 1000;
    const turnaround = turnaroundTimestamp || start + Math.round(elapsedSeconds / 2) * 1000;
    const finalSeconds = elapsedSeconds || Math.round((finishNow - start) / 1000);

    const startDate = new Date(start);
    const turnaroundDate = new Date(turnaround);
    const finishDate = new Date(finishNow);

    const outboundSecs = outboundDuration || Math.round((turnaround - start) / 1000);
    const inboundSecs = Math.max(0, finalSeconds - outboundSecs);

    const startLoc = activeStartLoc || locations.from;

    let actualLegMeters = 0;
    if (startLoc && activeTurnaroundCoords) {
      actualLegMeters = calculateDistanceMeters(
        startLoc.lat,
        startLoc.lng,
        activeTurnaroundCoords[0],
        activeTurnaroundCoords[1]
      );
    } else if (startLoc && locations.to) {
      actualLegMeters = calculateDistanceMeters(
        startLoc.lat,
        startLoc.lng,
        locations.to.lat,
        locations.to.lng
      );
    }

    const actualKm = Number(((actualLegMeters * 2) / 1000).toFixed(2));

    let plannedKm: number | undefined;
    if (isIncompleteRun && startLoc && locations.to) {
      const plannedLegMeters = calculateDistanceMeters(
        startLoc.lat,
        startLoc.lng,
        locations.to.lat,
        locations.to.lng
      );
      plannedKm = Number(((plannedLegMeters * 2) / 1000).toFixed(2));
    }

    const newRecord: RunRecord = {
      id: finishNow.toString(),
      dateStr: startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      startTimeStr: startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      turnaroundTimeStr: turnaroundDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      finishTimeStr: finishDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      startTimestamp: start,
      turnaroundTimestamp: turnaround,
      finishTimestamp: finishNow,
      durationSeconds: finalSeconds,
      durationText: formatDuration(finalSeconds),
      outboundDurationText: formatDuration(outboundSecs),
      inboundDurationText: formatDuration(inboundSecs),
      fromName: startLoc?.name || 'Home',
      toName: isIncompleteRun ? 'Turned Back Early' : (locations.to?.name || 'Turnaround'),
      totalDistanceKm: actualKm,
      isAwayFromHome,
      isIncomplete: isIncompleteRun,
      targetDistanceKm: plannedKm,
    };

    const updated = saveRunHistoryRecord(newRecord);
    setHistory(updated);
    setPhase('ready');
    setStartTimestamp(null);
    setTurnaroundTimestamp(null);
    setElapsedSeconds(0);
    setOutboundDuration(null);
    setIsAwayFromHome(false);
    setActiveStartLoc(null);
    setActiveTurnaroundCoords(null);
    setIsIncompleteRun(false);
    triggerHaptic([200, 100, 200]);
    setIsHistoryOpen(true);
  };

  const handleResetRun = () => {
    setPhase('ready');
    setStartTimestamp(null);
    setTurnaroundTimestamp(null);
    setElapsedSeconds(0);
    setOutboundDuration(null);
    setIsAwayFromHome(false);
    setActiveStartLoc(null);
    setActiveTurnaroundCoords(null);
    setIsIncompleteRun(false);
  };

  const handleSaveLocation = (loc: GeoLocation) => {
    const other = loc.id === 'from' ? locations.to : locations.from;
    if (other) {
      const dist = calculateDistanceMeters(loc.lat, loc.lng, other.lat, other.lng);
      const minDistance = Math.max(50, loc.radiusMeters + other.radiusMeters);
      if (dist < minDistance) {
        setAlertModalInfo({
          title: 'Locations Too Close',
          message: `Cannot save: "${loc.name}" is only ${dist}m away from "${other.name}". Start and Destination points must be separated by at least ${minDistance}m.`,
        });
        return;
      }
    }

    if (loc.id === 'from') {
      saveFromLocation(loc);
      setLocations((prev) => ({ ...prev, from: loc }));
    } else {
      saveToLocation(loc);
      setLocations((prev) => ({ ...prev, to: loc }));
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white flex justify-center">
      {/* Full-screen Mobile / Centered Desktop App Container */}
      <div className="relative w-full max-w-md min-h-[100dvh] bg-white flex flex-col sm:shadow-lg sm:border-x sm:border-zinc-100">
        
        {/* Top Header Bar with iOS Safe Area support */}
        <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-4 border-b border-zinc-100 flex items-center justify-between">
          {/* History Button with count badge */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center hover:bg-zinc-200 cursor-pointer relative"
            title="Run History"
          >
            <History className="w-5 h-5 stroke-[2.2]" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5E00] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {history.length}
              </span>
            )}
          </button>

          {/* Brand Logo & Real GPS Indicator */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF5E00] to-[#FF8C00] flex items-center justify-center text-white shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-zinc-900 uppercase">
                STRIDE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${userCoords ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono">{userCoords ? `GPS ±${gpsAccuracy || 5}m` : 'Finding GPS...'}</span>
            </div>
          </div>

          {/* Calibrate / Settings Button */}
          <button
            onClick={() => setSetupModalType('from')}
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center hover:bg-zinc-200 cursor-pointer"
            title="Calibrate Locations"
          >
            <Settings2 className="w-5 h-5 stroke-[2.2]" />
          </button>
        </header>

        {/* GPS Error Alert (if permission was denied) */}
        {gpsError && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <Compass className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{gpsError} Please allow GPS access in your browser settings.</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-5 overflow-y-auto">
          <RunCircuitView
            phase={phase}
            fromLocation={activeStart}
            toLocation={locations.to}
            userCoords={userCoords || [0, 0]}
            elapsedSeconds={elapsedSeconds}
            outboundDuration={outboundDuration}
            distanceToHome={distanceToHome}
            distanceToTurnaround={distanceToTurnaround}
            isAtHome={isAtHome}
            isAtTurnaround={isAtTurnaround}
            isAwayFromHome={isAwayFromHome}
            isIncompleteRun={isIncompleteRun}
            onStartRun={handleStartRun}
            onReachTurnaround={handleReachTurnaround}
            onTurnBackEarly={handleTurnBackEarly}
            onEndRun={handleEndRun}
            onResetRun={handleResetRun}
            onOpenSetup={(type) => setSetupModalType(type)}
          />
        </main>

        {/* History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onDeleteRecord={(id) => setHistory(deleteRunHistoryRecord(id))}
          onClearAll={() => setHistory(clearAllRunHistory())}
        />

        {/* Location Setup Modal (FROM / TO) */}
        {setupModalType && (
          <LocationSetupModal
            isOpen={Boolean(setupModalType)}
            onClose={() => setSetupModalType(null)}
            targetType={setupModalType}
            currentCoords={userCoords || [0, 0]}
            fromLocation={locations.from}
            toLocation={locations.to}
            onSaveLocation={handleSaveLocation}
          />
        )}

        {/* Custom Alert Modal */}
        {alertModalInfo && (
          <ConfirmModal
            isOpen={Boolean(alertModalInfo)}
            onClose={() => setAlertModalInfo(null)}
            title={alertModalInfo.title}
            message={alertModalInfo.message}
            confirmText="Got It"
            variant="warning"
          />
        )}
      </div>
    </div>
  );
}

export default App;
