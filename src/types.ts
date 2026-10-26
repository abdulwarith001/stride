export interface GeoLocation {
  id: 'from' | 'to';
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  timestamp: number;
}

export type CircuitPhase = 'ready' | 'outbound' | 'inbound' | 'finished';

export interface RunRecord {
  id: string;
  dateStr: string;            // e.g. "Mon, Oct 26, 2026"
  startTimeStr: string;       // e.g. "07:00 AM"
  turnaroundTimeStr: string;  // e.g. "07:26 AM"
  finishTimeStr: string;      // e.g. "07:52 AM"
  startTimestamp: number;
  turnaroundTimestamp: number;
  finishTimestamp: number;
  durationSeconds: number;
  durationText: string;       // e.g. "52m 14s"
  outboundDurationText: string;
  inboundDurationText: string;
  fromName: string;
  toName: string;
  totalDistanceKm: number;
  isAwayFromHome?: boolean;
  isIncomplete?: boolean;
  targetDistanceKm?: number;
}

