/**
 * GarageSummaryCard — Kartu Statistik Ringkasan Garasi
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { formatKM } from '../utils/statusEngine';
import { Bike, AlertTriangle, Gauge } from 'lucide-react-native';

interface GarageSummaryCardProps {
  totalVehicles: number;
  urgentCount: number;
  warningCount: number;
  totalKM: number;
}

export function GarageSummaryCard({
  totalVehicles,
  urgentCount,
  warningCount,
  totalKM,
}: GarageSummaryCardProps) {
  const needsAttentionCount = urgentCount + warningCount;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Garasi Saya</Text>
        <Text style={styles.subtitle}>{totalVehicles} motor terdaftar</Text>
      </View>

      <View style={styles.grid}>
        {/* Item 1 */}
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <Bike size={18} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{totalVehicles}</Text>
          <Text style={styles.statLabel}>Total Motor</Text>
        </View>

        {/* Item 2 */}
        <View style={styles.statCard}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: needsAttentionCount > 0 ? '#FFEBEE' : '#F5F5F5' },
            ]}
          >
            <AlertTriangle
              size={18}
              color={needsAttentionCount > 0 ? colors.urgent : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.statNumber,
              needsAttentionCount > 0 && { color: colors.urgent },
            ]}
          >
            {needsAttentionCount}
          </Text>
          <Text style={styles.statLabel}>Perlu Servis</Text>
        </View>

        {/* Item 3 */}
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <Gauge size={18} color="#1976D2" />
          </View>
          <Text style={styles.statNumber} numberOfLines={1}>
            {formatKM(totalKM)}
          </Text>
          <Text style={styles.statLabel}>Total KM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...layout.cardElevation,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineSm,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
    borderRadius: layout.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.numberLg,
    color: colors.textPrimary,
    fontSize: 16,
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
});
