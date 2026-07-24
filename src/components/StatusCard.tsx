/**
 * StatusCard — Card utama dashboard dengan status dominan
 * Card ini adalah "traffic light" utama aplikasi
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OilStatus, OilStatusData } from '../types';
import { colors, statusColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatKM, getStatusLabel, getStatusMessage } from '../utils/statusEngine';

interface StatusCardProps {
  vehicleName: string;
  statusData: OilStatusData;
}

export function StatusCard({ vehicleName, statusData }: StatusCardProps) {
  const colorSet = statusColors[statusData.status.toLowerCase() as keyof typeof statusColors];

  return (
    <View style={[styles.card, { borderLeftColor: colorSet.main }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.vehicleName}>{vehicleName}</Text>
          <Text style={styles.subtitle}>Kondisi Oli Mesin</Text>
        </View>
        <StatusBadge status={statusData.status} size="md" />
      </View>

      {/* Status Besar */}
      <View style={[styles.statusArea, { backgroundColor: colorSet.bg }]}>
        <Text style={styles.statusEmoji}>{colorSet.emoji}</Text>
        <Text style={[styles.statusLabel, { color: colorSet.main }]}>
          {getStatusLabel(statusData.status)}
        </Text>
        <Text style={styles.statusMessage}>{getStatusMessage(statusData)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SISA MASA PAKAI OLI</Text>
          <Text style={[styles.progressPercent, { color: colorSet.main }]}>
            {Math.max(0, Math.round(100 - statusData.percentUsed))}%
          </Text>
        </View>
        <ProgressBar percent={statusData.percentUsed} height={10} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>JARAK TEMPUH</Text>
          <Text style={styles.statValue}>{formatKM(statusData.kmDiff)} km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>WAKTU</Text>
          <Text style={styles.statValue}>{statusData.daysDiff} hari</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SISA KM</Text>
          <Text style={styles.statValue}>{formatKM(statusData.kmRemaining)} km</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing.xl,
    borderLeftWidth: 4,
    ...layout.cardElevationLg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  vehicleName: {
    ...typography.headlineSm,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusArea: {
    borderRadius: layout.radiusMd,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    ...typography.headlineMd,
    marginBottom: spacing.xs,
  },
  statusMessage: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
  progressPercent: {
    ...typography.labelLg,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
});
