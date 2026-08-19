/**
 * AddVehicleScreen — Form tambah motor baru
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { InputField } from '../components/InputField';
import { ActionButton } from '../components/ActionButton';
import { useAppStore } from '../store/useAppStore';
import { Bike } from 'lucide-react-native';

interface AddVehicleScreenProps {
  onComplete: () => void;
  onBack?: () => void;
  isModal?: boolean;
}

export function AddVehicleScreen({ onComplete, onBack, isModal = false }: AddVehicleScreenProps) {
  const addVehicle = useAppStore((s) => s.addVehicle);
  const addOilRecord = useAppStore((s) => s.addOilRecord);

  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [currentKM, setCurrentKM] = useState('');
  const [lastChangeKM, setLastChangeKM] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama motor wajib diisi';
    }
    if (!currentKM.trim()) {
      newErrors.currentKM = 'KM saat ini wajib diisi';
    } else if (isNaN(Number(currentKM)) || Number(currentKM) < 0) {
      newErrors.currentKM = 'KM harus berupa angka positif';
    }
    if (!lastChangeKM.trim()) {
      newErrors.lastChangeKM = 'KM ganti oli terakhir wajib diisi';
    } else if (isNaN(Number(lastChangeKM)) || Number(lastChangeKM) < 0) {
      newErrors.lastChangeKM = 'KM harus berupa angka positif';
    } else if (Number(lastChangeKM) > Number(currentKM)) {
      newErrors.lastChangeKM = 'KM ganti oli tidak boleh lebih dari KM saat ini';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setLoading(true);
    try {
      const vehicleId = addVehicle({
        name: name.trim(),
        plateNumber: plateNumber.trim() ? plateNumber.trim().toUpperCase() : undefined,
        brand: brand.trim() ? brand.trim() : undefined,
        currentKM: Number(currentKM),
      });

      // Tambah record oli awal
      addOilRecord({
        vehicleId,
        changeKM: Number(lastChangeKM),
        changeDate: new Date().toISOString(),
        notes: 'Data awal',
      });

      onComplete();
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan kendaraan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          {isModal && onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← Kembali</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerIcon}>
            <Bike size={32} color={colors.textPrimary} />
          </View>
          <Text style={styles.title}>Tambah Kendaraan</Text>
          <Text style={styles.subtitle}>
            Masukkan detail motor Anda untuk mulai melacak kondisi oli.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="NAMA MOTOR"
            placeholder="contoh: Honda Vario 160"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
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
            label="KM SAAT INI"
            placeholder="contoh: 12000"
            value={currentKM}
            onChangeText={setCurrentKM}
            error={errors.currentKM}
            keyboardType="numeric"
            suffix="km"
            helperText="Lihat di speedometer motor Anda"
          />

          <InputField
            label="KM GANTI OLI TERAKHIR"
            placeholder="contoh: 10000"
            value={lastChangeKM}
            onChangeText={setLastChangeKM}
            error={errors.lastChangeKM}
            keyboardType="numeric"
            suffix="km"
            helperText="Perkiraan KM saat terakhir ganti oli"
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <ActionButton
            title="Simpan Kendaraan"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.bodyLg,
    color: colors.primary,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing['3xl'],
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
