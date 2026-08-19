/**
 * VehicleDropdown — Dropdown picker komponen untuk memilih motor yang dipantau di Beranda
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Vehicle, OilRecord, Settings } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { calculateOilStatus, formatKM } from '../utils/statusEngine';
import { Bike, ChevronDown, Check, Plus, ShieldAlert } from 'lucide-react-native';

interface VehicleDropdownProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  oilRecords: OilRecord[];
  settings: Settings;
  onSelect: (id: string) => void;
  onAdd: () => void;
  label?: string;
}

export function VehicleDropdown({
  vehicles,
  activeVehicle,
  oilRecords,
  settings,
  onSelect,
  onAdd,
  label = 'PILIH MOTOR DIPANTAU',
}: VehicleDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          <View style={styles.bikeIconContainer}>
            <Bike size={20} color={colors.primary} />
          </View>
          <View style={styles.triggerTextContainer}>
            <Text style={styles.selectedName} numberOfLines={1}>
              {activeVehicle.name}
            </Text>
            <View style={styles.subDetailRow}>
              {activeVehicle.plateNumber ? (
                <Text style={styles.plateBadge}>{activeVehicle.plateNumber}</Text>
              ) : null}
              <Text style={styles.kmSubText}>
                {formatKM(activeVehicle.currentKM)} km
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronBox}>
          <ChevronDown size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pilih Motor Dipantau</Text>
                  <Text style={styles.cardSub}>
                    Layar Beranda akan menampilkan kondisi oli motor yang Anda pilih
                  </Text>
                </View>

                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                  {vehicles.map((v) => {
                    const isSelected = v.id === activeVehicle.id;
                    const records = oilRecords.filter((r) => r.vehicleId === v.id);
                    const statusData = calculateOilStatus(v, records, settings);

                    const statusColor =
                      statusData.status === 'SAFE'
                        ? colors.safe
                        : statusData.status === 'WARNING'
                        ? colors.warning
                        : colors.urgent;

                    return (
                      <TouchableOpacity
                        key={v.id}
                        style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                        onPress={() => {
                          onSelect(v.id);
                          setOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.itemDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                            {v.name}
                          </Text>
                          <View style={styles.itemSubRow}>
                            {v.plateNumber ? (
                              <Text style={styles.itemPlate}>{v.plateNumber}</Text>
                            ) : null}
                            <Text style={styles.itemKM}>{formatKM(v.currentKM)} km</Text>
                          </View>
                        </View>

                        {isSelected ? (
                          <View style={styles.checkContainer}>
                            <Check size={16} color={colors.primary} />
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Add New Motor Button */}
                <TouchableOpacity
                  style={styles.addMotorRow}
                  onPress={() => {
                    setOpen(false);
                    onAdd();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.addIconCircle}>
                    <Plus size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.addMotorText}>Tambah Motor Baru</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelSm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
    fontSize: 10,
    fontWeight: '700',
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...layout.cardElevation,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  bikeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTextContainer: {
    flex: 1,
  },
  selectedName: {
    ...typography.headlineSm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  subDetailRow: {
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
    fontSize: 10,
  },
  kmSubText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  chevronBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  dropdownCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusXl,
    padding: spacing.xl,
    maxHeight: '75%',
    ...layout.cardElevation,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.headlineSm,
    color: colors.textPrimary,
  },
  cardSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listScroll: {
    maxHeight: 280,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: layout.radiusMd,
    marginBottom: 6,
    backgroundColor: colors.surfaceDim,
  },
  itemRowSelected: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  itemNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  itemSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  itemPlate: {
    ...typography.labelSm,
    color: colors.textPrimary,
    backgroundColor: '#DADADA',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
  },
  itemKM: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMotorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
  },
  addIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMotorText: {
    ...typography.labelLg,
    color: colors.primary,
  },
});
