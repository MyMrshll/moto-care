/**
 * SettingsScreen — Pengaturan batas KM, waktu, notifikasi
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { InputField } from '../components/InputField';
import { ActionButton } from '../components/ActionButton';
import { useAppStore } from '../store/useAppStore';
import { notificationService } from '../services/notificationService';

export function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAll = useAppStore((s) => s.resetAll);
  const vehicles = useAppStore((s) => s.vehicles);

  const [kmLimit, setKmLimit] = useState(settings.kmLimit.toString());
  const [dayLimit, setDayLimit] = useState(settings.dayLimit.toString());
  const [notifEnabled, setNotifEnabled] = useState(settings.notificationEnabled);

  function handleSave() {
    const km = Number(kmLimit);
    const days = Number(dayLimit);
    if (isNaN(km) || km <= 0) { Alert.alert('Error', 'Batas KM harus lebih dari 0'); return; }
    if (isNaN(days) || days <= 0) { Alert.alert('Error', 'Batas hari harus lebih dari 0'); return; }

    updateSettings({ kmLimit: km, dayLimit: days, notificationEnabled: notifEnabled });
    Alert.alert('Tersimpan ✅', 'Pengaturan berhasil diperbarui.');
  }

  function handleReset() {
    Alert.alert('Reset Semua Data', 'Semua kendaraan dan riwayat akan dihapus. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Pengaturan</Text>

        {/* Batas Servis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BATAS SERVIS OLI</Text>
          <Text style={styles.cardDesc}>Atur batas kilometer dan waktu untuk peringatan ganti oli.</Text>
          <InputField label="BATAS KILOMETER" value={kmLimit} onChangeText={setKmLimit} keyboardType="numeric" suffix="km" helperText="Standar: 2.000 - 3.000 km" />
          <InputField label="BATAS WAKTU" value={dayLimit} onChangeText={setDayLimit} keyboardType="numeric" suffix="hari" helperText="Standar: 60 - 90 hari" />
        </View>

        {/* Notifikasi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NOTIFIKASI</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Pengingat Ganti Oli</Text>
              <Text style={styles.switchDesc}>Kirim notifikasi saat oli mendekati batas</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: colors.border, true: colors.safe }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={{ marginTop: spacing.md }}>
            <ActionButton 
              title="Coba Notifikasi (Muncul 2 Detik)" 
              onPress={() => {
                Alert.alert("Siap!", "Tutup aplikasi atau biarkan terbuka, notifikasi akan muncul dalam 2 detik.");
                notificationService.testNotification();
              }} 
              variant="secondary" 
              fullWidth 
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMASI</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Jumlah Kendaraan</Text><Text style={styles.infoValue}>{vehicles.length}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Versi Aplikasi</Text><Text style={styles.infoValue}>1.0.0</Text></View>
        </View>

        <ActionButton title="Simpan Pengaturan" onPress={handleSave} fullWidth size="lg" />
        <View style={{ height: spacing.lg }} />
        <ActionButton title="Reset Semua Data" onPress={handleReset} variant="ghost" fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding, paddingBottom: 100 },
  screenTitle: { ...typography.headlineLg, color: colors.textPrimary, marginBottom: spacing.lg, marginTop: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: layout.radiusLg, padding: spacing.xl, marginBottom: spacing.lg, ...layout.cardElevation },
  cardTitle: { ...typography.labelMd, color: colors.textSecondary, marginBottom: spacing.xs },
  cardDesc: { ...typography.bodySm, color: colors.textTertiary, marginBottom: spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { ...typography.labelLg, color: colors.textPrimary },
  switchDesc: { ...typography.bodySm, color: colors.textTertiary, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { ...typography.bodyMd, color: colors.textSecondary },
  infoValue: { ...typography.labelLg, color: colors.textPrimary },
});
