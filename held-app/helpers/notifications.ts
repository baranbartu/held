import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useTasks, type Task } from '@/store/tasks';

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

const WORDS = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
];

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
  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_ID, {
    name: 'Daily reminder',
    importance: Notifications.AndroidImportance.LOW,
    enableVibrate: false,
    showBadge: false,
  });
}

function sortForBullets(a: Task, b: Task): number {
  if (!!a.urgent !== !!b.urgent) return a.urgent ? -1 : 1;
  return a.deadline.getTime() - b.deadline.getTime();
}

// Snapshot the current Today list (filtered + sorted the same way the home
// screen renders) and turn it into a notification title + multi-line body
// with unicode bullets. Notification content is fixed at schedule time, so
// this captures the moment we're called — see scheduleDailyReminder().
function buildContent(titleSuffix: string = ''): { title: string; body?: string } {
  const today = useTasks
    .getState()
    .tasks.filter((t) => t.category === 'today' && !t.dismissed)
    .sort(sortForBullets);

  if (today.length === 0) {
    return {
      title: `You're clear${titleSuffix}`,
      body: 'Nothing needs you today.',
    };
  }

  const count = today.length;
  const word = WORDS[count] ?? String(count);
  const noun = count === 1 ? 'thing' : 'things';
  const verb = count === 1 ? 'needs you' : 'need you';
  const title = `${word} ${noun} ${verb} today${titleSuffix}`;

  const MAX_BULLETS = 5;
  const visible = today.slice(0, MAX_BULLETS);
  const bullets = visible.map((t) => `• ${t.title}`).join('\n');
  const more =
    today.length > MAX_BULLETS ? `\n• and ${today.length - MAX_BULLETS} more` : '';

  return { title, body: bullets + more };
}

export async function scheduleDailyReminder(
  hour: number = DEFAULT_HOUR,
  minute: number = DEFAULT_MINUTE
): Promise<void> {
  const granted = await ensurePermission();
  if (!granted) return;

  await ensureAndroidChannel();

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

  const { title, body } = buildContent('');

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title,
      body,
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
