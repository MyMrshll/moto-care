/**
 * MotoCare — Zustand Store + AsyncStorage Persistence
 * State management utama aplikasi
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, OilRecord, Settings, AppState } from '../types';

const DEFAULT_SETTINGS: Settings = {
  kmLimit: 2500,
  dayLimit: 60,
  notificationEnabled: true,
};

interface AppActions {
  // Vehicle
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => string;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  updateKM: (vehicleId: string, km: number) => void;

  // Oil Records
  addOilRecord: (record: Omit<OilRecord, 'id'>) => string;
  removeOilRecord: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<Settings>) => void;

  // App
  setInitialized: () => void;
  completeOnboarding: () => void;
  resetAll: () => void;
}

type AppStore = AppState & AppActions;

/** Generate simple unique ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // === Initial State ===
      vehicles: [],
      activeVehicleId: null,
      oilRecords: [],
      settings: DEFAULT_SETTINGS,
      isInitialized: false,
      hasSeenOnboarding: false,

      // === Vehicle Actions ===
      addVehicle: (vehicleData) => {
        const id = generateId();
        const vehicle: Vehicle = {
          id,
          name: vehicleData.name,
          currentKM: vehicleData.currentKM,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          vehicles: [...state.vehicles, vehicle],
          activeVehicleId: state.activeVehicleId || id, // Set active jika belum ada
        }));
        return id;
      },

      updateVehicle: (id, updates) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates } : v,
          ),
        }));
      },

      removeVehicle: (id) => {
        set((state) => {
          const filtered = state.vehicles.filter((v) => v.id !== id);
          return {
            vehicles: filtered,
            oilRecords: state.oilRecords.filter((r) => r.vehicleId !== id),
            activeVehicleId:
              state.activeVehicleId === id
                ? filtered[0]?.id || null
                : state.activeVehicleId,
          };
        });
      },

      setActiveVehicle: (id) => {
        set({ activeVehicleId: id });
      },

      updateKM: (vehicleId, km) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === vehicleId ? { ...v, currentKM: km } : v,
          ),
        }));
      },

      // === Oil Record Actions ===
      addOilRecord: (recordData) => {
        const id = generateId();
        const record: OilRecord = { id, ...recordData };
        set((state) => ({
          oilRecords: [...state.oilRecords, record],
        }));
        // Juga update currentKM kendaraan
        get().updateKM(recordData.vehicleId, recordData.changeKM);
        return id;
      },

      removeOilRecord: (id) => {
        set((state) => ({
          oilRecords: state.oilRecords.filter((r) => r.id !== id),
        }));
      },

      // === Settings Actions ===
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // === App Actions ===
      setInitialized: () => {
        set({ isInitialized: true });
      },

      completeOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      resetAll: () => {
        set({
          vehicles: [],
          activeVehicleId: null,
          oilRecords: [],
          settings: DEFAULT_SETTINGS,
          isInitialized: false,
          hasSeenOnboarding: false,
        });
      },
    }),
    {
      name: 'motocare-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// === Selectors (untuk performa) ===
export const selectActiveVehicle = (state: AppStore) =>
  state.vehicles.find((v) => v.id === state.activeVehicleId) || null;

export const selectVehicleRecords = (vehicleId: string) => (state: AppStore) =>
  state.oilRecords
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());

export const selectLatestRecord = (vehicleId: string) => (state: AppStore) => {
  const records = state.oilRecords
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
  return records[0] || null;
};
