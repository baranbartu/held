import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { addDays } from 'date-fns';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDeadline } from '@/helpers/dates';
import { useTasks } from '@/store/tasks';
import { colors, fonts } from '@/theme';

export default function PostponeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTasks((s) => s.tasks.find((t) => t.id === id));
  const postpone = useTasks((s) => s.postpone);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  if (!task) {
    // Defensive — should not happen in normal flow.
    router.back();
    return null;
  }

  const today = new Date();

  const commit = (deadline: Date) => {
    postpone(task.id, deadline);
    router.back();
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (date && event.type === 'set') commit(date);
    } else if (date) {
      setPickerDate(date);
    }
  };

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable hitSlop={16} onPress={() => router.back()}>
            <Text style={styles.cancel}>cancel</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>postponing</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.currentDeadline}>
            currently due <Text style={styles.currentDeadlineEm}>{formatDeadline(task.deadline)}</Text>
          </Text>

          <View style={styles.pillsRow}>
            <Pill label="tomorrow" onPress={() => commit(addDays(today, 1))} />
            <Pill label="next week" onPress={() => commit(addDays(today, 7))} />
            <Pill
              label="pick a date"
              onPress={() => {
                setPickerDate(addDays(today, 2));
                setShowPicker(true);
              }}
            />
          </View>

          {showPicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={pickerDate ?? addDays(today, 2)}
                mode="date"
                minimumDate={today}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onPickerChange}
                textColor={colors.ink}
                themeVariant="light"
              />
              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={() => {
                    setShowPicker(false);
                    if (pickerDate) commit(pickerDate);
                  }}
                  hitSlop={12}
                  style={styles.pickerDone}
                >
                  <Text style={styles.pickerDoneText}>postpone</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  topRow: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    letterSpacing: 1.3,
    textTransform: 'lowercase',
    color: colors.muted,
  },
  body: {
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  eyebrow: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 14,
  },
  taskTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: colors.ink,
    marginBottom: 10,
  },
  currentDeadline: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: 36,
  },
  currentDeadlineEm: {
    color: colors.inkSoft,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: 'transparent',
  },
  pillPressed: {
    opacity: 0.7,
    backgroundColor: colors.paperDeep,
  },
  pillText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  pickerWrap: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  pickerDone: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  pickerDoneText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    letterSpacing: 1.3,
    textTransform: 'lowercase',
    color: colors.accent,
  },
});
