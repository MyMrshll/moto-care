/**
 * DashboardScreen — Main Screen ⭐
 * Status-first UI — info kondisi oli langsung terlihat
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Modal, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { StatusCard } from '../components/StatusCard';
import { ActionButton } from '../components/ActionButton';
import { VehicleSelector } from '../components/VehicleSelector';
import { LogItem } from '../components/LogItem';
import { InputField } from '../components/InputField';
import { useAppStore, selectActiveVehicle, selectVehicleRecords } from '../store/useAppStore';
import { calculateOilStatus, formatKM } from '../utils/statusEngine';
import { Bike, Droplet, BarChart2 } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

interface DashboardScreenProps {
  onAddVehicle: () => void;
  onOilChange: () => void;
}

export function DashboardScreen({ onAddVehicle, onOilChange }: DashboardScreenProps) {
  const vehicles = useAppStore((s) => s.vehicles);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const settings = useAppStore((s) => s.settings);
  const updateKM = useAppStore((s) => s.updateKM);
  const records = useAppStore(
    useShallow(activeVehicle ? selectVehicleRecords(activeVehicle.id) : () => [])
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showUpdateKM, setShowUpdateKM] = useState(false);
  const [newKM, setNewKM] = useState('');

  const statusData = useMemo(() => {
    if (!activeVehicle) return null;
    return calculateOilStatus(activeVehicle, records, settings);
  }, [activeVehicle, records, settings]);

  function handleUpdateKM() {
    if (!activeVehicle) return;
    setNewKM(activeVehicle.currentKM.toString());
    setShowUpdateKM(true);
  }

  function confirmUpdateKM() {
    if (!activeVehicle) return;
    const km = Number(newKM);
    if (isNaN(km) || km < 0) {
      Alert.alert('Error', 'Masukkan angka KM yang valid');
      return;
    }
    updateKM(activeVehicle.id, km);
    setShowUpdateKM(false);
  }

  if (!activeVehicle || !statusData) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Image 
            source={require('../../assets/motocare-logo.png')} 
            style={{ width: 80, height: 80, marginBottom: 16, resizeMode: 'contain' }} 
          />
          <Text style={styles.emptyTitle}>Belum Ada Kendaraan</Text>
          <Text style={styles.emptySubtitle}>
            Tambahkan motor Anda untuk mulai melacak kondisi oli
          </Text>
          <ActionButton title="Tambah Motor" onPress={onAddVehicle} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Image 
              source={require('../../assets/motocare-logo.png')} 
              style={styles.headerLogo} 
            />
            <View>
              <Text style={styles.greeting}>MotoCare</Text>
              <Text style={styles.headerSub}>KM saat ini: {formatKM(activeVehicle.currentKM)} km</Text>
            </View>
          </View>
          <View style={styles.headerBadge}><Droplet size={22} color={colors.textPrimary} /></View>
        </View>

        <VehicleSelector vehicles={vehicles} activeId={activeVehicle.id} onSelect={setActiveVehicle} onAdd={onAddVehicle} />

        <View style={styles.section}><StatusCard vehicleName={activeVehicle.name} statusData={statusData} /></View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <ActionButton title="Perbarui KM" onPress={handleUpdateKM} variant="secondary" icon={<BarChart2 size={16} color={colors.textPrimary} />} style={{ flex: 1 }} />
          <ActionButton title="Ganti Oli" onPress={onOilChange} variant="primary" icon={<Droplet size={16} color={colors.surface} />} style={{ flex: 1 }} />
        </View>

        {/* Riwayat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Ganti Oli</Text>
            <Text style={styles.sectionCount}>{records.length} catatan</Text>
          </View>
          {records.length === 0 ? (
            <View style={styles.emptyLog}><Text style={styles.emptyLogText}>Belum ada riwayat</Text></View>
          ) : (
            <View style={styles.logCard}>
              {records.slice(0, 5).map((r, i) => <LogItem key={r.id} record={r} isLast={i === Math.min(records.length, 5) - 1} />)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Update KM Modal */}
      <Modal visible={showUpdateKM} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Perbarui Kilometer</Text>
            <Text style={styles.modalSub}>KM sebelumnya: {formatKM(activeVehicle.currentKM)} km</Text>
            <InputField label="KM BARU" placeholder="Masukkan KM terbaru" value={newKM} onChangeText={setNewKM} keyboardType="numeric" suffix="km" />
            <View style={styles.modalActions}>
              <ActionButton title="Batal" onPress={() => setShowUpdateKM(false)} variant="ghost" style={{ flex: 1 }} />
              <ActionButton title="Simpan" onPress={confirmUpdateKM} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerLogo: { width: 40, height: 40, resizeMode: 'contain', borderRadius: 8 },
  greeting: { ...typography.headlineLg, color: colors.textPrimary },
  headerSub: { ...typography.bodyMd, color: colors.textSecondary, marginTop: 2 },
  headerBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceDim, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: layout.screenPadding, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.headlineSm, color: colors.textPrimary },
  sectionCount: { ...typography.bodySm, color: colors.textTertiary },
  actionRow: { flexDirection: 'row', paddingHorizontal: layout.screenPadding, gap: spacing.md, marginBottom: spacing['2xl'] },
  logCard: { backgroundColor: colors.surface, borderRadius: layout.radiusLg, padding: spacing.lg, ...layout.cardElevation },
  emptyLog: { backgroundColor: colors.surface, borderRadius: layout.radiusLg, padding: spacing['3xl'], alignItems: 'center', ...layout.cardElevation },
  emptyLogText: { ...typography.bodyMd, color: colors.textTertiary },
  emptyContainer: { flex: 1, backgroundColor: colors.background },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.screenPadding },
  emptyTitle: { ...typography.headlineMd, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.bodyMd, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: layout.radiusXl, borderTopRightRadius: layout.radiusXl, padding: spacing['2xl'], paddingBottom: spacing['4xl'] },
  modalTitle: { ...typography.headlineMd, color: colors.textPrimary, marginBottom: spacing.xs },
  modalSub: { ...typography.bodyMd, color: colors.textSecondary, marginBottom: spacing['2xl'] },
  modalActions: { flexDirection: 'row', gap: spacing.md },
});
