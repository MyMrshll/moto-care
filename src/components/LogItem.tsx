/**
 * LogItem — Item riwayat servis/pergantian oli
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { OilRecord } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { formatKM } from '../utils/statusEngine';

interface LogItemProps {
  record: OilRecord;
  isLast?: boolean;
}

export function LogItem({ record, isLast = false }: LogItemProps) {
  const date = new Date(record.changeDate);
  const formattedDate = format(date, 'd MMM yyyy', { locale: idLocale });

  return (
    <View style={[styles.container, !isLast && styles.borderBottom]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🛢️</Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Ganti Oli</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
      </View>
      <View style={styles.kmContainer}>
        <Text style={styles.km}>{formatKM(record.changeKM)}</Text>
        <Text style={styles.kmLabel}>KM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  borderBottom: {
    // Tidak ada border — line di timeline sudah cukup
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 32,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
    marginTop: 4,
    minHeight: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  date: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notes: {
    ...typography.bodySm,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  kmContainer: {
    alignItems: 'flex-end',
  },
  km: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  kmLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
  },
});
