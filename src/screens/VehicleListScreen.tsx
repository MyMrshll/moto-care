/**
 * VehicleListScreen — Layar Garasi & Daftar Motor 🏍️
 * Fitur 1.1.0: Menampilkan daftar seluruh motor, status oli, dan pengalih motor aktif
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { useAppStore } from '../store/useAppStore';
import { calculateOilStatus } from '../utils/statusEngine';
import { VehicleCard } from '../components/VehicleCard';
import { GarageSummaryCard } from '../components/GarageSummaryCard';
import { ActionButton } from '../components/ActionButton';
import { Plus, Bike, Filter } from 'lucide-react-native';

interface VehicleListScreenProps {
  onAddVehicle: () => void;
  onViewDetail: (vehicleId: string) => void;
}

export function VehicleListScreen({ onAddVehicle, onViewDetail }: VehicleListScreenProps) {
  const vehicles = useAppStore((s) => s.vehicles);
  const activeVehicleId = useAppStore((s) => s.activeVehicleId);
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const oilRecords = useAppStore((s) => s.oilRecords);
  const settings = useAppStore((s) => s.settings);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ATTENTION'>('ALL');

  // Kalkulasi data status tiap kendaraan
  const vehiclesWithStatus = useMemo(() => {
    return vehicles.map((v) => {
      const records = oilRecords.filter((r) => r.vehicleId === v.id);
      const statusData = calculateOilStatus(v, records, settings);
      return {
        vehicle: v,
        statusData,
      };
    });
  }, [vehicles, oilRecords, settings]);

  // Statistik garasi
  const stats = useMemo(() => {
    let urgent = 0;
    let warning = 0;
    let totalKM = 0;

    vehiclesWithStatus.forEach(({ vehicle, statusData }) => {
      totalKM += vehicle.currentKM;
      if (statusData.status === 'URGENT') urgent++;
      if (statusData.status === 'WARNING') warning++;
    });

    return {
      totalVehicles: vehicles.length,
      urgentCount: urgent,
      warningCount: warning,
      totalKM,
    };
  }, [vehiclesWithStatus, vehicles]);

  // List yang difilter
  const filteredVehicles = useMemo(() => {
    if (filter === 'ATTENTION') {
      return vehiclesWithStatus.filter(
        (item) => item.statusData.status === 'URGENT' || item.statusData.status === 'WARNING'
      );
    }
    return vehiclesWithStatus;
  }, [vehiclesWithStatus, filter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Garasi Motor</Text>
          <Text style={styles.headerSubtitle}>Kelola seluruh kendaraan Anda</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddVehicle} activeOpacity={0.8}>
          <Plus size={18} color={colors.surface} />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 400);
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Ringkasan Garasi */}
        <GarageSummaryCard
          totalVehicles={stats.totalVehicles}
          urgentCount={stats.urgentCount}
          warningCount={stats.warningCount}
          totalKM={stats.totalKM}
        />

        {/* Tab Filter Cepat */}
        {vehicles.length > 0 && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
              onPress={() => setFilter('ALL')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
                Semua ({vehicles.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filter === 'ATTENTION' && styles.filterChipActive]}
              onPress={() => setFilter('ATTENTION')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'ATTENTION' && styles.filterChipTextActive,
                ]}
              >
                Perlu Servis ({stats.urgentCount + stats.warningCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bike size={48} color={colors.textTertiary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyTitle}>
              {vehicles.length === 0 ? 'Garasi Masih Kosong' : 'Tidak Ada Motor yang Perlu Servis'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {vehicles.length === 0
                ? 'Daftarkan motor pertama Anda untuk melacak kondisi oli secara akurat.'
                : 'Semua motor Anda dalam kondisi aman! 🟢'}
            </Text>
            {vehicles.length === 0 && (
              <ActionButton title="Tambah Motor Baru" onPress={onAddVehicle} size="lg" />
            )}
          </View>
        ) : (
          /* List Motor Cards */
          filteredVehicles.map(({ vehicle, statusData }) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              statusData={statusData}
              isActive={vehicle.id === activeVehicleId}
              onSelectActive={() => setActiveVehicle(vehicle.id)}
              onViewDetail={() => onViewDetail(vehicle.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineLg,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: layout.radiusFull,
  },
  addButtonText: {
    ...typography.labelLg,
    color: colors.surface,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 110,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: layout.radiusFull,
    backgroundColor: colors.surfaceDim,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  filterChipText: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing['3xl'],
    alignItems: 'center',
    marginTop: spacing.md,
    ...layout.cardElevation,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
