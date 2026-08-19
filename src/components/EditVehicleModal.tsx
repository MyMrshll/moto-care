/**
 * EditVehicleModal — Modal form edit detail & batas servis kendaraan
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Vehicle } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { useAppStore } from '../store/useAppStore';

interface EditVehicleModalProps {
  visible: boolean;
  vehicle: Vehicle;
  onClose: () => void;
}

export function EditVehicleModal({ visible, vehicle, onClose }: EditVehicleModalProps) {
  const updateVehicle = useAppStore((s) => s.updateVehicle);

  const [name, setName] = useState(vehicle.name);
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber || '');
  const [brand, setBrand] = useState(vehicle.brand || '');
  const [currentKM, setCurrentKM] = useState(vehicle.currentKM.toString());
  const [kmLimitOverride, setKmLimitOverride] = useState(
    vehicle.kmLimitOverride ? vehicle.kmLimitOverride.toString() : ''
  );
  const [dayLimitOverride, setDayLimitOverride] = useState(
    vehicle.dayLimitOverride ? vehicle.dayLimitOverride.toString() : ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(vehicle.name);
    setPlateNumber(vehicle.plateNumber || '');
    setBrand(vehicle.brand || '');
    setCurrentKM(vehicle.currentKM.toString());
    setKmLimitOverride(vehicle.kmLimitOverride ? vehicle.kmLimitOverride.toString() : '');
    setDayLimitOverride(vehicle.dayLimitOverride ? vehicle.dayLimitOverride.toString() : '');
    setErrors({});
  }, [vehicle, visible]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama motor wajib diisi';
    if (!currentKM.trim()) {
      errs.currentKM = 'KM odometer wajib diisi';
    } else if (isNaN(Number(currentKM)) || Number(currentKM) < 0) {
      errs.currentKM = 'KM harus angka valid';
    }

    if (kmLimitOverride.trim() && (isNaN(Number(kmLimitOverride)) || Number(kmLimitOverride) <= 0)) {
      errs.kmLimitOverride = 'Batas KM harus berupa angka positif';
    }

    if (dayLimitOverride.trim() && (isNaN(Number(dayLimitOverride)) || Number(dayLimitOverride) <= 0)) {
      errs.dayLimitOverride = 'Batas hari harus berupa angka positif';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      updateVehicle(vehicle.id, {
        name: name.trim(),
        plateNumber: plateNumber.trim() ? plateNumber.trim().toUpperCase() : undefined,
        brand: brand.trim() ? brand.trim() : undefined,
        currentKM: Number(currentKM),
        kmLimitOverride: kmLimitOverride.trim() ? Number(kmLimitOverride) : undefined,
        dayLimitOverride: dayLimitOverride.trim() ? Number(dayLimitOverride) : undefined,
      });
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Gagal memperbarui kendaraan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Edit Detail Motor</Text>
          <Text style={styles.subtitle}>Perbarui informasi dan batas servis motor Anda</Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <InputField
              label="NAMA MOTOR"
              placeholder="contoh: Honda Vario 160"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <InputField
              label="PLAT NOMOR (OPSIONAL)"
              placeholder="contoh: B 1234 XYZ"
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
            />

            <InputField
              label="MEREK / MANUFAKTUR (OPSIONAL)"
              placeholder="contoh: Honda, Yamaha, Vespa"
              value={brand}
              onChangeText={setBrand}
            />

            <InputField
              label="ODOMETER (KM SAAT INI)"
              placeholder="contoh: 15400"
              value={currentKM}
              onChangeText={setCurrentKM}
              error={errors.currentKM}
              keyboardType="numeric"
              suffix="km"
            />

            <InputField
              label="BATAS KM GANTI OLI KHUSUS (OPSIONAL)"
              placeholder="Kosongkan untuk pakai default (2.500 km)"
              value={kmLimitOverride}
              onChangeText={setKmLimitOverride}
              error={errors.kmLimitOverride}
              keyboardType="numeric"
              suffix="km"
            />

            <InputField
              label="BATAS HARI GANTI OLI KHUSUS (OPSIONAL)"
              placeholder="Kosongkan untuk pakai default (60 hari)"
              value={dayLimitOverride}
              onChangeText={setDayLimitOverride}
              error={errors.dayLimitOverride}
              keyboardType="numeric"
              suffix="hari"
            />
          </ScrollView>

          <View style={styles.actions}>
            <ActionButton
              title="Batal"
              onPress={onClose}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <ActionButton
              title="Simpan"
              onPress={handleSave}
              loading={saving}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: layout.radiusXl,
    borderTopRightRadius: layout.radiusXl,
    padding: spacing['2xl'],
    maxHeight: '85%',
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  formScroll: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
});
