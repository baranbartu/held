import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Quiet by default: banner shows when the app is foreground, but no sound
// and no badge dot (per Held's "no urgency theater" principle).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DAILY_REMINDER_ID = 'daily-reminder';
const DEFAULT_HOUR = 8;
const DEFAULT_MINUTE = 0;

async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (settings.canAskAgain === false) return false;
  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return result.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  // Android requires a notification channel; "default" exists by default,
  // but we create our own with low importance so it never vibrates or rings.
  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_ID, {
    name: 'Daily reminder',
    importance: Notifications.AndroidImportance.LOW,
    enableVibrate: false,
    showBadge: false,
  });
}

export async function scheduleDailyReminder(
  hour: number = DEFAULT_HOUR,
  minute: number = DEFAULT_MINUTE
): Promise<void> {
  const granted = await ensurePermission();
  if (!granted) return;

  await ensureAndroidChannel();

  // Cancel any prior schedule before re-scheduling (idempotent on launch).
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {
    // If no notification with that ID exists, the call rejects on some
    // platforms — safe to ignore.
  });

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "here's what needs you today",
      // Static body for v1 — recomputing the live count at fire-time isn't
      // reliable without a backend or background task. Add dynamic body once
      // we have persistence (MMKV) and can compute on the JS side at schedule.
      sound: false,
      ...(Platform.OS === 'android' ? { channelId: DAILY_REMINDER_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}
