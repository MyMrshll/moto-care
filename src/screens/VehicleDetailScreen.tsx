/**
 * VehicleDetailScreen — Detail kendaraan, edit info & riwayat servis lengkap
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
import { EditVehicleModal } from '../components/EditVehicleModal';
import { VehicleDropdown } from '../components/VehicleDropdown';
import { useAppStore, selectActiveVehicle, selectVehicleRecords } from '../store/useAppStore';
import { calculateOilStatus, formatKM } from '../utils/statusEngine';
import { Ruler, Calendar, ArrowLeft, Edit3, Gauge, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

interface VehicleDetailScreenProps {
  vehicleId?: string;
  onOilChange: () => void;
  onBack?: () => void;
  onAddVehicle?: () => void;
}

export function VehicleDetailScreen({
  vehicleId,
  onOilChange,
  onBack,
  onAddVehicle,
}: VehicleDetailScreenProps) {
  const vehicles = useAppStore((s) => s.vehicles);
  const activeVehicleId = useAppStore((s) => s.activeVehicleId);
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const settings = useAppStore((s) => s.settings);
  const allRecords = useAppStore((s) => s.oilRecords);
  const removeVehicle = useAppStore((s) => s.removeVehicle);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicleId || null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Tentukan kendaraan mana yang ditampilkan
  const targetVehicle = useMemo(() => {
    const currentId = selectedVehicleId || vehicleId || activeVehicleId;
    return vehicles.find((v) => v.id === currentId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId, vehicleId, activeVehicleId]);

  const isActive = targetVehicle ? targetVehicle.id === activeVehicleId : false;

  const records = useAppStore(
    useShallow(targetVehicle ? selectVehicleRecords(targetVehicle.id) : () => [])
  );

  const statusData = useMemo(() => {
    if (!targetVehicle) return null;
    return calculateOilStatus(targetVehicle, records, settings);
  }, [targetVehicle, records, settings]);

  if (!targetVehicle || !statusData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Pilih atau tambahkan kendaraan terlebih dahulu</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    Alert.alert(
      'Hapus Kendaraan',
      `Yakin ingin menghapus ${targetVehicle!.name}? Seluruh riwayat ganti oli untuk motor ini akan dihapus permanent.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            removeVehicle(targetVehicle!.id);
            if (onBack) onBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Navigation */}
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.screenTitle}>Detail Motor</Text>
        )}

        <TouchableOpacity
          onPress={() => setShowEditModal(true)}
          style={styles.editHeaderButton}
          activeOpacity={0.7}
        >
          <Edit3 size={18} color={colors.primary} />
          <Text style={styles.editHeaderText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dropdown Motor */}
        <VehicleDropdown
          vehicles={vehicles}
          activeVehicle={targetVehicle}
          oilRecords={allRecords}
          settings={settings}
          onSelect={(id) => setSelectedVehicleId(id)}
          onAdd={onAddVehicle || (() => {})}
          label="PILIH MOTOR"
        />

        {/* Vehicle Main Info Card */}
        <View style={[styles.card, isActive && styles.activeCardBorder]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.vehicleName}>{targetVehicle.name}</Text>
                {isActive && (
                  <View style={styles.activeTag}>
                    <CheckCircle2 size={12} color={colors.surface} />
                    <Text style={styles.activeTagText}>Dipantau</Text>
                  </View>
                )}
              </View>

              <View style={styles.badgeRow}>
                {targetVehicle.plateNumber ? (
                  <Text style={styles.plateBadge}>{targetVehicle.plateNumber}</Text>
                ) : null}
                {targetVehicle.brand ? (
                  <Text style={styles.brandBadge}>{targetVehicle.brand}</Text>
                ) : null}
              </View>

              <Text style={styles.vehicleDate}>
                Didaftarkan{' '}
                {format(
                  targetVehicle.createdAt ? new Date(targetVehicle.createdAt) : new Date(),
                  'd MMM yyyy',
                  { locale: idLocale }
                )}
              </Text>
            </View>

            <StatusBadge status={statusData.status} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ODOMETER</Text>
              <Text style={styles.statValue}>{formatKM(targetVehicle.currentKM)}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TOTAL OLI</Text>
              <Text style={styles.statValue}>{records.length}</Text>
              <Text style={styles.statUnit}>kali ganti</Text>
            </View>
          </View>

          {!isActive && (
            <TouchableOpacity
              style={styles.setMonitoredBanner}
              onPress={() => setActiveVehicle(targetVehicle.id)}
              activeOpacity={0.8}
            >
              <Gauge size={18} color={colors.primary} />
              <Text style={styles.setMonitoredText}>Jadikan Motor Ini yang Dipantau</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Oil Life Gauge Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status & Masa Pakai Oli</Text>
          <View style={styles.oilLifeRow}>
            <Text style={styles.oilLifePercent}>
              {Math.max(0, Math.round(100 - statusData.percentUsed))}%
            </Text>
            <Text style={styles.oilLifeLabel}>tersisa</Text>
          </View>

          <ProgressBar percent={statusData.percentUsed} height={12} />

          <View style={styles.oilLifeDetails}>
            <View style={styles.detailItem}>
              <Ruler size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatKM(statusData.kmRemaining)} km tersisa (Batas:{' '}
                {formatKM(targetVehicle.kmLimitOverride || settings.kmLimit)} km)
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {statusData.daysRemaining} hari tersisa (Batas:{' '}
                {targetVehicle.dayLimitOverride || settings.dayLimit} hari)
              </Text>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Ganti Oli ({records.length})</Text>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyLog}>
            <Text style={styles.emptyText}>Belum ada riwayat ganti oli untuk motor ini</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {records.map((r, i) => (
              <LogItem key={r.id} record={r} isLast={i === records.length - 1} />
            ))}
          </View>
        )}

        {/* Actions Container */}
        <View style={styles.actionContainer}>
          <ActionButton title="Catat Ganti Oli" onPress={onOilChange} fullWidth size="lg" />

          <ActionButton
            title="Edit Detail Motor"
            onPress={() => setShowEditModal(true)}
            variant="secondary"
            fullWidth
          />

          <ActionButton
            title="Hapus Kendaraan"
            onPress={handleDelete}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <EditVehicleModal
          visible={showEditModal}
          vehicle={targetVehicle}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  screenTitle: {
    ...typography.headlineLg,
    color: colors.textPrimary,
  },
  editHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.radiusFull,
  },
  editHeaderText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  content: { padding: layout.screenPadding, paddingBottom: 110 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...layout.cardElevation,
  },
  activeCardBorder: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  vehicleName: { ...typography.headlineSm, color: colors.textPrimary },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.radiusFull,
  },
  activeTagText: {
    ...typography.labelSm,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  plateBadge: {
    ...typography.labelSm,
    color: colors.textPrimary,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
    fontSize: 11,
  },
  brandBadge: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  vehicleDate: { ...typography.bodySm, color: colors.textTertiary, marginTop: 4 },
  cardTitle: { ...typography.labelMd, color: colors.textSecondary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
    borderRadius: layout.radiusMd,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statLabel: { ...typography.labelSm, color: colors.textTertiary, marginBottom: 4 },
  statValue: { ...typography.numberMd, color: colors.textPrimary },
  statUnit: { ...typography.bodySm, color: colors.textTertiary },
  setMonitoredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E6F4EA',
    paddingVertical: 12,
    borderRadius: layout.radiusMd,
    marginTop: spacing.lg,
  },
  setMonitoredText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  oilLifeRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md, gap: 6 },
  oilLifePercent: { ...typography.numberLg, color: colors.textPrimary },
  oilLifeLabel: { ...typography.bodyMd, color: colors.textSecondary },
  oilLifeDetails: { marginTop: spacing.md, gap: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...typography.bodyMd, color: colors.textSecondary },
  sectionHeader: { marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { ...typography.headlineSm, color: colors.textPrimary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyLog: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing['3xl'],
    alignItems: 'center',
    ...layout.cardElevation,
  },
  emptyText: { ...typography.bodyMd, color: colors.textTertiary },
  actionContainer: { marginTop: spacing.xl, gap: spacing.md },
});
