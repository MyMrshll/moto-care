/**
 * MotoCare — Status Engine (Core Business Logic)
 * 
 * Menentukan status kondisi oli berdasarkan:
 * 1. Jarak tempuh (KM) sejak pergantian oli terakhir
 * 2. Waktu (hari) sejak pergantian oli terakhir
 * 
 * Status: SAFE 🟢 → WARNING 🟡 → URGENT 🔴
 */

import { differenceInDays } from 'date-fns';
import { OilRecord, OilStatus, OilStatusData, Settings, Vehicle } from '../types';

const DEFAULT_SETTINGS: Settings = {
  kmLimit: 2500,
  dayLimit: 60,
  notificationEnabled: true,
};

/**
 * Hitung status oli untuk kendaraan tertentu
 */
export function calculateOilStatus(
  vehicle: Vehicle,
  records: OilRecord[],
  settings: Settings = DEFAULT_SETTINGS,
): OilStatusData {
  // Cari record terbaru untuk kendaraan ini
  const vehicleRecords = records
    .filter((r) => r.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());

  const lastRecord = vehicleRecords[0] || null;

  if (!lastRecord) {
    // Belum pernah ganti oli → URGENT
    return {
      status: 'URGENT',
      kmDiff: vehicle.currentKM,
      daysDiff: 0,
      kmRemaining: 0,
      daysRemaining: 0,
      percentUsed: 100,
      lastRecord: null,
    };
  }

  const kmDiff = vehicle.currentKM - lastRecord.changeKM;
  const daysDiff = differenceInDays(new Date(), new Date(lastRecord.changeDate));

  const kmRemaining = Math.max(0, settings.kmLimit - kmDiff);
  const daysRemaining = Math.max(0, settings.dayLimit - daysDiff);

  // Persentase pemakaian (ambil yang lebih tinggi antara KM dan waktu)
  const kmPercent = Math.min(100, (kmDiff / settings.kmLimit) * 100);
  const dayPercent = Math.min(100, (daysDiff / settings.dayLimit) * 100);
  const percentUsed = Math.max(kmPercent, dayPercent);

  // Tentukan status
  const status = determineStatus(kmDiff, daysDiff, settings);

  return {
    status,
    kmDiff,
    daysDiff,
    kmRemaining,
    daysRemaining,
    percentUsed,
    lastRecord,
  };
}

/**
 * Core status logic
 * RED: Melebihi batas KM atau hari
 * YELLOW: 80% KM atau 75% hari
 * GREEN: Di bawah threshold
 */
function determineStatus(
  kmDiff: number,
  daysDiff: number,
  settings: Settings,
): OilStatus {
  // URGENT: Melebihi batas
  if (kmDiff >= settings.kmLimit || daysDiff >= settings.dayLimit) {
    return 'URGENT';
  }

  // WARNING: Mendekati batas (80% KM atau 75% waktu)
  const kmThreshold = settings.kmLimit * 0.8;
  const dayThreshold = settings.dayLimit * 0.75;

  if (kmDiff >= kmThreshold || daysDiff >= dayThreshold) {
    return 'WARNING';
  }

  // SAFE
  return 'SAFE';
}

/**
 * Format angka KM: 12450 → "12.450"
 */
export function formatKM(km: number): string {
  return km.toLocaleString('id-ID');
}

/**
 * Format hari yang tersisa ke teks yang mudah dibaca
 */
export function formatDaysRemaining(days: number): string {
  if (days <= 0) return 'Sudah lewat!';
  if (days === 1) return '1 hari lagi';
  if (days < 7) return `${days} hari lagi`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} minggu lagi`;
  const months = Math.floor(days / 30);
  return `${months} bulan lagi`;
}

/**
 * Status label bahasa Indonesia
 */
export function getStatusLabel(status: OilStatus): string {
  switch (status) {
    case 'SAFE':
      return 'Aman';
    case 'WARNING':
      return 'Peringatan';
    case 'URGENT':
      return 'Segera Ganti!';
  }
}

/**
 * Status message deskriptif
 */
export function getStatusMessage(statusData: OilStatusData): string {
  switch (statusData.status) {
    case 'SAFE':
      return `Oli masih bagus. Sisa ${formatKM(statusData.kmRemaining)} km atau ${statusData.daysRemaining} hari.`;
    case 'WARNING':
      return `Oli mulai perlu diganti. Sisa ${formatKM(statusData.kmRemaining)} km atau ${statusData.daysRemaining} hari.`;
    case 'URGENT':
      if (!statusData.lastRecord) {
        return 'Belum ada catatan ganti oli. Segera catat!';
      }
      return 'Oli sudah melewati batas! Segera ganti oli motor Anda.';
  }
}
