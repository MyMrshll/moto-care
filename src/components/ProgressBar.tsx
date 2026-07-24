/**
 * ProgressBar — Oil Life Remaining Bar
 * Warna berubah dinamis: hijau → kuning → merah
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { layout } from '../theme/spacing';

interface ProgressBarProps {
  /** Persentase 0-100 (100 = oli habis) */
  percent: number;
  height?: number;
  showTrack?: boolean;
}

export function ProgressBar({ percent, height = 8, showTrack = true }: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  // Invert: 100% used → bar kosong, 0% used → bar penuh
  const remaining = 100 - clampedPercent;

  const barColor = getBarColor(clampedPercent);

  return (
    <View style={[styles.track, { height }, !showTrack && { backgroundColor: 'transparent' }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${remaining}%`,
            backgroundColor: barColor,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

function getBarColor(percentUsed: number): string {
  if (percentUsed >= 80) return colors.urgent;
  if (percentUsed >= 60) return colors.warning;
  return colors.safe;
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});
