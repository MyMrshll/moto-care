/**
 * VehicleSelector — Horizontal scroll untuk pilih motor (multi-vehicle)
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Vehicle } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function VehicleSelector({ vehicles, activeId, onSelect, onAdd }: VehicleSelectorProps) {
  if (vehicles.length <= 1) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {vehicles.map((v) => {
          const isActive = v.id === activeId;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(v.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipIcon]}>🏍️</Text>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
                {v.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addChip} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.radiusFull,
    backgroundColor: colors.surfaceDim,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    ...typography.labelLg,
    color: colors.textPrimary,
    maxWidth: 100,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  addChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
