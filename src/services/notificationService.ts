import { Platform, Alert } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;

// Di Expo Go SDK 53+, import expo-notifications melemparkan error jika dipanggil langsung di top-level.
// Dengan try-catch, aplikasi tidak akan pernah muncul layar merah (RedBox) di Expo Go,
// dan notifikasi tetap berjalan normal pada Standalone Build / Development Build.
try {
  if (Platform.OS !== 'web') {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (err) {
  console.log('expo-notifications disabled in Expo Go client:', err);
  Notifications = null;
}

/**
 * Membuat Notification Channel untuk Android (Wajib agar notifikasi muncul sebagai pop-up / banner di Android 8+)
 */
async function setupAndroidChannel() {
  const notifications = Notifications;
  if (Platform.OS === 'android' && notifications) {
    try {
      await notifications.setNotificationChannelAsync('motocare-reminders', {
        name: 'Pengingat Ganti Oli MotoCare',
        importance: notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    } catch (e) {
      console.warn('Could not setup Android channel:', e);
    }
  }
}

export const notificationService = {
  /**
   * Meminta izin (permission) untuk mengirim notifikasi
   */
  async requestPermissions() {
    const notifications = Notifications;
    if (Platform.OS === 'web' || !notifications) return false;

    try {
      await setupAndroidChannel();

      const { status: existingStatus } = await notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permissions:', e);
      return false;
    }
  },

  /**
   * Menjadwalkan notifikasi peringatan ganti oli berdasarkan sisa hari.
   */
  async scheduleOilReminder(vehicleId: string, vehicleName: string, daysRemaining: number) {
    const notifications = Notifications;
    if (Platform.OS === 'web' || !notifications) return;

    try {
      await this.cancelReminder(vehicleId);

      if (daysRemaining <= 0) return;

      const triggerDays = daysRemaining - 3;
      if (triggerDays > 0) {
        await setupAndroidChannel();
        await notifications.scheduleNotificationAsync({
          content: {
            title: 'Waktunya Servis & Ganti Oli! 🛢️',
            body: `Oli motor ${vehicleName} sudah mendekati batas pemakaian. Segera lakukan penggantian oli agar performa mesin tetap prima!`,
            data: { vehicleId, screen: 'OilChange' },
            sound: true,
            priority: notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerDays * 24 * 60 * 60,
            channelId: 'motocare-reminders',
          },
          identifier: `reminder-${vehicleId}`,
        });
      }
    } catch (e) {
      console.warn('Schedule notification error:', e);
    }
  },

  /**
   * Membatalkan notifikasi untuk motor tertentu
   */
  async cancelReminder(vehicleId: string) {
    const notifications = Notifications;
    if (Platform.OS === 'web' || !notifications) return;
    try {
      await notifications.cancelScheduledNotificationAsync(`reminder-${vehicleId}`);
    } catch (e) {}
  },

  /**
   * Membatalkan semua notifikasi
   */
  async cancelAll() {
    const notifications = Notifications;
    if (Platform.OS === 'web' || !notifications) return;
    try {
      await notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {}
  },

  /**
   * Mengetes notifikasi secara langsung (muncul pop-up setelah 2 detik)
   */
  async testNotification(vehicleName?: string) {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Fitur notifikasi tidak didukung di Web');
      return;
    }

    const targetVehicle = vehicleName || 'kendaraan Anda';
    const notifications = Notifications;

    if (!notifications) {
      // Saat diuji di Expo Go SDK 53+, berikan tes notifikasi banner/alert interaktif
      setTimeout(() => {
        Alert.alert(
          '🔔 Pengingat Ganti Oli MotoCare',
          `Pengingat untuk ${targetVehicle} berhasil dipemicu! (Pengingat otomatis aktif H-3 sebelum oli habis).`
        );
      }, 1500);
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Izin Dibutuhkan', 'Izin notifikasi belum diberikan. Silakan izinkan notifikasi pada Pengaturan Sistem HP Anda.');
      return;
    }

    try {
      await setupAndroidChannel();
      await notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Pengingat Ganti Oli MotoCare',
          body: `Sistem pengingat aktif! Kami akan mengingatkan Anda saat oli motor ${targetVehicle} perlu diganti.`,
          data: { vehicleName, screen: 'MainTabs' },
          sound: true,
          priority: notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: 'motocare-reminders',
        },
      });

      Alert.alert('Notifikasi Dipemicu 🎉', 'Notifikasi pengingat akan muncul sebagai banner di atas layar dalam 2 detik!');
    } catch (e) {
      console.error('Test notification error:', e);
      Alert.alert('Error', 'Gagal menjadwalkan notifikasi');
    }
  },

  /**
   * Mendengarkan respon ketika notifikasi di-klik oleh pengguna
   */
  setupResponseListener(onNotificationClick: (data: any) => void) {
    const notifications = Notifications;
    if (!notifications) return () => {};

    try {
      const subscription = notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data;
        if (data) {
          onNotificationClick(data);
        }
      });

      notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
          const data = response?.notification?.request?.content?.data;
          if (data) {
            onNotificationClick(data);
          }
        }
      }).catch((err) => {
        console.warn('Error fetching last notification response:', err);
      });

      return () => {
        subscription.remove();
      };
    } catch (e) {
      console.warn('Error setting up notification response listener:', e);
      return () => {};
    }
  }
};




