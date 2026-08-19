/**
 * VehicleCard — Kartu motor pada daftar Garasi
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Vehicle, OilStatusData } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { formatKM } from '../utils/statusEngine';
import { Bike, ChevronRight, CheckCircle2, Gauge } from 'lucide-react-native';

interface VehicleCardProps {
  vehicle: Vehicle;
  statusData: OilStatusData;
  isActive: boolean;
  onSelectActive: () => void;
  onViewDetail: () => void;
}

export function VehicleCard({
  vehicle,
  statusData,
  isActive,
  onSelectActive,
  onViewDetail,
}: VehicleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onViewDetail}
      activeOpacity={0.88}
    >
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Bike size={24} color={isActive ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {vehicle.name}
            </Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <CheckCircle2 size={12} color={colors.surface} />
                <Text style={styles.activeBadgeText}>Dipantau</Text>
              </View>
            )}
          </View>
          <View style={styles.subRow}>
            {vehicle.plateNumber ? (
              <Text style={styles.plateBadge}>{vehicle.plateNumber}</Text>
            ) : null}
            {vehicle.brand ? (
              <Text style={styles.brandText}>{vehicle.brand}</Text>
            ) : null}
            {!vehicle.plateNumber && !vehicle.brand ? (
              <Text style={styles.kmSubText}>Odometer: {formatKM(vehicle.currentKM)} km</Text>
            ) : null}
          </View>
        </View>
        <StatusBadge status={statusData.status} />
      </View>

      {/* Status Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ODOMETER</Text>
          <Text style={styles.statValue}>{formatKM(vehicle.currentKM)} <Text style={styles.unitText}>km</Text></Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SISA OLI</Text>
          <Text style={[styles.statValue, statusData.status === 'URGENT' && styles.textUrgent]}>
            {formatKM(statusData.kmRemaining)} <Text style={styles.unitText}>km</Text>
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ESTIMASI</Text>
          <Text style={styles.statValue}>{statusData.daysRemaining} <Text style={styles.unitText}>hari</Text></Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {!isActive ? (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={(e) => {
              e.stopPropagation();
              onSelectActive();
            }}
            activeOpacity={0.7}
          >
            <Gauge size={14} color={colors.primary} />
            <Text style={styles.selectButtonText}>Pantau Motor Ini</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.monitoredNote}>
            <Text style={styles.monitoredNoteText}>Fokus Pantau di Beranda</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.detailButton}
          onPress={onViewDetail}
          activeOpacity={0.7}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...layout.cardElevation,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F7FCF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleName: {
    ...typography.headlineSm,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.radiusFull,
  },
  activeBadgeText: {
    ...typography.labelSm,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  plateBadge: {
    ...typography.labelSm,
    color: colors.textPrimary,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  brandText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  kmSubText: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDim,
    borderRadius: layout.radiusMd,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
    fontSize: 9,
    marginBottom: 2,
  },
  statValue: {
    ...typography.labelLg,
    color: colors.textPrimary,
    fontSize: 13,
  },
  textUrgent: {
    color: colors.urgent,
  },
  unitText: {
    ...typography.bodySm,
    color: colors.textTertiary,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: layout.radiusFull,
    backgroundColor: '#E6F4EA',
  },
  selectButtonText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  monitoredNote: {
    paddingVertical: 4,
  },
  monitoredNoteText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  detailButtonText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
