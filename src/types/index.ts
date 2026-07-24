/**
 * MotoCare — TypeScript Type Definitions
 */

/** Kendaraan milik user */
export interface Vehicle {
  id: string;
  name: string;
  currentKM: number;
  createdAt: string; // ISO date string
}

/** Catatan pergantian oli */
export interface OilRecord {
  id: string;
  vehicleId: string;
  changeKM: number;
  changeDate: string; // ISO date string
  notes?: string;
}

/** Status kondisi oli */
export type OilStatus = 'SAFE' | 'WARNING' | 'URGENT';

/** Pengaturan batas servis */
export interface Settings {
  /** Batas KM untuk ganti oli (default: 2500) */
  kmLimit: number;
  /** Batas hari untuk ganti oli (default: 60) */
  dayLimit: number;
  /** Toggle notifikasi */
  notificationEnabled: boolean;
}

/** Data status yang sudah dihitung */
export interface OilStatusData {
  status: OilStatus;
  kmDiff: number;
  daysDiff: number;
  kmRemaining: number;
  daysRemaining: number;
  percentUsed: number; // 0-100, berdasarkan mana yang lebih tinggi
  lastRecord: OilRecord | null;
}

/** State keseluruhan app */
export interface AppState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  oilRecords: OilRecord[];
  settings: Settings;
  isInitialized: boolean;
  hasSeenOnboarding: boolean;
}
