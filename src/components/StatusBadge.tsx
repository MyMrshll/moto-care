/**
 * StatusBadge — Pill-shaped status indicator
 * Menampilkan status oli dalam bentuk badge kecil
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OilStatus } from '../types';
import { statusColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/spacing';

interface StatusBadgeProps {
  status: OilStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorSet = statusColors[status.toLowerCase() as keyof typeof statusColors];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorSet.bg },
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colorSet.main }]} />
      <Text
        style={[
          styles.label,
          { color: colorSet.main },
          size === 'sm' && styles.labelSm,
          size === 'lg' && styles.labelLg,
        ]}
      >
        {colorSet.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.radiusFull,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    ...typography.labelLg,
  },
  labelSm: {
    fontSize: 11,
  },
  labelLg: {
    fontSize: 15,
  },
});
