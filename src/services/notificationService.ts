import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Konfigurasi cara notifikasi ditampilkan saat app sedang aktif (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Meminta izin (permission) untuk mengirim notifikasi
   */
  async requestPermissions() {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /**
   * Menjadwalkan notifikasi peringatan ganti oli berdasarkan sisa hari.
   * Karena KM tidak bisa diprediksi secara background, kita mengandalkan batas hari (waktu).
   */
  async scheduleOilReminder(vehicleId: string, vehicleName: string, daysRemaining: number) {
    if (Platform.OS === 'web') return;

    // Hapus notifikasi sebelumnya untuk motor ini agar tidak dobel
    await this.cancelReminder(vehicleId);

    // Jika sudah lewat batas, tidak perlu dijadwalkan lagi (akan muncul di UI)
    if (daysRemaining <= 0) return;

    // Jadwalkan H-3 sebelum batas waktu
    const triggerDays = daysRemaining - 3;
    
    // Hanya jadwalkan jika H-3 masih di masa depan
    if (triggerDays > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Waktunya Ganti Oli! 🛢️',
          body: `Oli motor ${vehicleName} Anda akan segera mencapai batas masa pakai. Jangan lupa jadwalkan ganti oli.`,
          data: { vehicleId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerDays * 24 * 60 * 60, // konversi hari ke detik
        },
        identifier: `reminder-${vehicleId}`,
      });
    }
  },

  /**
   * Membatalkan notifikasi untuk motor tertentu
   */
  async cancelReminder(vehicleId: string) {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(`reminder-${vehicleId}`);
  },

  /**
   * Membatalkan semua notifikasi
   */
  async cancelAll() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Mengetes notifikasi secara langsung (muncul setelah 2 detik)
   */
  async testNotification() {
    if (Platform.OS === 'web') {
      alert('Fitur notifikasi tidak didukung di Web');
      return;
    }
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      alert('Gagal: Izin notifikasi tidak diberikan di sistem pengaturan Android/iOS.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Notifikasi MotoCare',
        body: 'Notifikasi berhasil berjalan! Ini adalah contoh pengingat ganti oli.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2, 
      },
    });
  }
};
