/**
 * OilChangeScreen — Form catat pergantian oli
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { InputField } from '../components/InputField';
import { ActionButton } from '../components/ActionButton';
import { useAppStore, selectActiveVehicle } from '../store/useAppStore';
import { Droplet, Info } from 'lucide-react-native';

interface OilChangeScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function OilChangeScreen({ onComplete, onBack }: OilChangeScreenProps) {
  const activeVehicle = useAppStore(selectActiveVehicle);
  const addOilRecord = useAppStore((s) => s.addOilRecord);

  const [changeKM, setChangeKM] = useState(activeVehicle?.currentKM.toString() || '');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!changeKM.trim()) {
      newErrors.changeKM = 'KM wajib diisi';
    } else if (isNaN(Number(changeKM)) || Number(changeKM) < 0) {
      newErrors.changeKM = 'KM harus berupa angka positif';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !activeVehicle) return;
    setLoading(true);
    try {
      addOilRecord({
        vehicleId: activeVehicle.id,
        changeKM: Number(changeKM),
        changeDate: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Berhasil! ✅', 'Pergantian oli berhasil dicatat.', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch {
      Alert.alert('Error', 'Gagal menyimpan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  if (!activeVehicle) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ActionButton title="← Kembali" onPress={onBack} variant="ghost" style={styles.backBtn} />
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Droplet size={32} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>Catat Pergantian Oli</Text>
            <Text style={styles.subtitle}>{activeVehicle.name}</Text>
          </View>

          <View style={styles.form}>
            <InputField label="KM SAAT GANTI OLI" placeholder="Masukkan KM odometer" value={changeKM} onChangeText={setChangeKM} error={errors.changeKM} keyboardType="numeric" suffix="km" />
            <InputField label="CATATAN (OPSIONAL)" placeholder="contoh: Oli Yamalube 1L" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <Info size={16} color={colors.textPrimary} />
              <Text style={styles.infoTitle}>Tips</Text>
            </View>
            <Text style={styles.infoText}>Pastikan KM yang dimasukkan sesuai dengan odometer motor Anda saat ini.</Text>
          </View>

          <ActionButton title="Simpan Pergantian Oli" onPress={handleSave} loading={loading} fullWidth size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.safeBg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { ...typography.headlineLg, color: colors.textPrimary },
  subtitle: { ...typography.bodyMd, color: colors.textSecondary, marginTop: 4 },
  form: { marginBottom: spacing.lg },
  infoCard: { backgroundColor: colors.surfaceDim, borderRadius: layout.radiusMd, padding: spacing.lg, marginBottom: spacing['2xl'] },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  infoTitle: { ...typography.labelLg, color: colors.textPrimary },
  infoText: { ...typography.bodySm, color: colors.textSecondary },
});
