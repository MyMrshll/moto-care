/**
 * VehicleDetailScreen — Detail kendaraan + riwayat servis
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { LogItem } from '../components/LogItem';
import { ActionButton } from '../components/ActionButton';
import { useAppStore, selectActiveVehicle, selectVehicleRecords } from '../store/useAppStore';
import { calculateOilStatus, formatKM } from '../utils/statusEngine';
import { Ruler, Calendar } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

interface VehicleDetailScreenProps {
  onOilChange: () => void;
}

export function VehicleDetailScreen({ onOilChange }: VehicleDetailScreenProps) {
  const activeVehicle = useAppStore(selectActiveVehicle);
  const settings = useAppStore((s) => s.settings);
  const removeVehicle = useAppStore((s) => s.removeVehicle);
  const records = useAppStore(useShallow(activeVehicle ? selectVehicleRecords(activeVehicle.id) : () => []));

  const statusData = useMemo(() => {
    if (!activeVehicle) return null;
    return calculateOilStatus(activeVehicle, records, settings);
  }, [activeVehicle, records, settings]);

  if (!activeVehicle || !statusData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}><Text style={styles.emptyText}>Pilih kendaraan terlebih dahulu</Text></View>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    Alert.alert('Hapus Kendaraan', `Yakin ingin menghapus ${activeVehicle!.name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeVehicle(activeVehicle!.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Detail Kendaraan</Text>

        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.vehicleName}>{activeVehicle.name}</Text>
              <Text style={styles.vehicleDate}>Ditambahkan {format(activeVehicle.createdAt ? new Date(activeVehicle.createdAt) : new Date(), 'd MMM yyyy', { locale: idLocale })}</Text>
            </View>
            <StatusBadge status={statusData.status} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ODOMETER</Text>
              <Text style={styles.statValue}>{formatKM(activeVehicle.currentKM)}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>GANTI OLI KE-</Text>
              <Text style={styles.statValue}>{records.length}</Text>
              <Text style={styles.statUnit}>kali</Text>
            </View>
          </View>
        </View>

        {/* Oil Life Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masa Pakai Oli</Text>
          <View style={styles.oilLifeRow}>
            <Text style={styles.oilLifePercent}>{Math.max(0, Math.round(100 - statusData.percentUsed))}%</Text>
            <Text style={styles.oilLifeLabel}>tersisa</Text>
          </View>
          <ProgressBar percent={statusData.percentUsed} height={12} />
          <View style={styles.oilLifeDetails}>
            <View style={styles.detailItem}>
              <Ruler size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{formatKM(statusData.kmRemaining)} km tersisa</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{statusData.daysRemaining} hari tersisa</Text>
            </View>
          </View>
        </View>

        {/* Riwayat */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Lengkap</Text>
        </View>
        {records.length === 0 ? (
          <View style={styles.emptyLog}><Text style={styles.emptyText}>Belum ada riwayat</Text></View>
        ) : (
          <View style={styles.card}>
            {records.map((r, i) => <LogItem key={r.id} record={r} isLast={i === records.length - 1} />)}
          </View>
        )}

        <View style={{ marginTop: spacing['2xl'], gap: spacing.md }}>
          <ActionButton title="Catat Ganti Oli" onPress={onOilChange} fullWidth size="lg" />
          <ActionButton title="Hapus Kendaraan" onPress={handleDelete} variant="ghost" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding, paddingBottom: 100 },
  screenTitle: { ...typography.headlineLg, color: colors.textPrimary, marginBottom: spacing.lg, marginTop: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: layout.radiusLg, padding: spacing.xl, marginBottom: spacing.lg, ...layout.cardElevation },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  vehicleName: { ...typography.headlineSm, color: colors.textPrimary },
  vehicleDate: { ...typography.bodySm, color: colors.textTertiary, marginTop: 2 },
  cardTitle: { ...typography.labelMd, color: colors.textSecondary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.surfaceDim, borderRadius: layout.radiusMd, padding: spacing.lg, alignItems: 'center' },
  statLabel: { ...typography.labelSm, color: colors.textTertiary, marginBottom: 4 },
  statValue: { ...typography.numberMd, color: colors.textPrimary },
  statUnit: { ...typography.bodySm, color: colors.textTertiary },
  oilLifeRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md, gap: 6 },
  oilLifePercent: { ...typography.numberLg, color: colors.textPrimary },
  oilLifeLabel: { ...typography.bodyMd, color: colors.textSecondary },
  oilLifeDetails: { marginTop: spacing.md, gap: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...typography.bodyMd, color: colors.textSecondary },
  sectionHeader: { marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { ...typography.headlineSm, color: colors.textPrimary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyLog: { backgroundColor: colors.surface, borderRadius: layout.radiusLg, padding: spacing['3xl'], alignItems: 'center', ...layout.cardElevation },
  emptyText: { ...typography.bodyMd, color: colors.textTertiary },
});
