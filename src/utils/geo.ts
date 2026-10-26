import type { GeoLocation, RunRecord } from '../types';

// Calculate distance in meters between two lat/lng coordinates using the Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatTimerClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function triggerHaptic(pattern: number[] = [100, 50, 100]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics not supported or permitted on device
    }
  }
}

const STORAGE_KEY_FROM = 'stride_circuit_from';
const STORAGE_KEY_TO = 'stride_circuit_to';
const STORAGE_KEY_HISTORY = 'stride_circuit_history';

// 100% Offline LocalStorage persistence
export function loadSavedLocations(): { from: GeoLocation | null; to: GeoLocation | null } {
  try {
    const rawFrom = localStorage.getItem(STORAGE_KEY_FROM);
    const rawTo = localStorage.getItem(STORAGE_KEY_TO);
    return {
      from: rawFrom ? JSON.parse(rawFrom) : null,
      to: rawTo ? JSON.parse(rawTo) : null,
    };
  } catch {
    return { from: null, to: null };
  }
}

export function saveFromLocation(loc: GeoLocation) {
  localStorage.setItem(STORAGE_KEY_FROM, JSON.stringify(loc));
}

export function saveToLocation(loc: GeoLocation) {
  localStorage.setItem(STORAGE_KEY_TO, JSON.stringify(loc));
}

export function loadRunHistory(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed: RunRecord[] = JSON.parse(raw);
    // Filter out any leftover sample records
    const clean = parsed.filter((r) => !r.id.startsWith('sample-'));
    if (clean.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(clean));
    }
    return clean;
  } catch {
    return [];
  }
}

export function saveRunHistoryRecord(record: RunRecord): RunRecord[] {
  const current = loadRunHistory();
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  return updated;
}

export function deleteRunHistoryRecord(id: string): RunRecord[] {
  const current = loadRunHistory();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  return updated;
}

export function clearAllRunHistory(): RunRecord[] {
  localStorage.removeItem(STORAGE_KEY_HISTORY);
  return [];
}

