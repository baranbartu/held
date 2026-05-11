import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { addDays, format } from 'date-fns';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks } from '@/store/tasks';
import { colors, fonts } from '@/theme';

type Selection = 'today' | 'tomorrow' | 'custom';

export default function AddScreen() {
  const [text, setText] = useState('');
  const [selection, setSelection] = useState<Selection>('today');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const add = useTasks((s) => s.add);

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const resolveDeadline = (): Date => {
    if (selection === 'today') return today;
    if (selection === 'tomorrow') return tomorrow;
    return customDate ?? addDays(today, 2);
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add(trimmed, resolveDeadline());
    router.back();
  };

  const openPicker = () => {
    Keyboard.dismiss();
    setShowPicker(true);
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (date && event.type === 'set') {
        setCustomDate(date);
        setSelection('custom');
      }
    } else if (date) {
      setCustomDate(date);
      setSelection('custom');
    }
  };

  const customLabel =
    customDate && selection === 'custom'
      ? format(customDate, 'EEE, MMM d').toLowerCase()
      : 'pick a date';

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.topRow}>
            <Pressable hitSlop={16} onPress={() => router.back()}>
              <Text style={styles.cancel}>cancel</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="what's on your mind?"
              placeholderTextColor={colors.muted}
              autoFocus
              multiline
              blurOnSubmit
              returnKeyType="done"
              onSubmitEditing={submit}
              maxLength={240}
              textAlignVertical="top"
              selectionColor={colors.accent}
            />

            <View style={styles.pillsRow}>
              <Pill
                label="today"
                selected={selection === 'today'}
                onPress={() => setSelection('today')}
              />
              <Pill
                label="tomorrow"
                selected={selection === 'tomorrow'}
                onPress={() => setSelection('tomorrow')}
              />
              <Pill
                label={customLabel}
                selected={selection === 'custom'}
                onPress={openPicker}
              />
            </View>

            <Text style={styles.hint}>held.</Text>

            {showPicker && (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={customDate ?? addDays(today, 2)}
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
                      if (!customDate) {
                        setCustomDate(addDays(today, 2));
                        setSelection('custom');
                      }
                    }}
                    hitSlop={12}
                    style={styles.pickerDone}
                  >
                    <Text style={styles.pickerDoneText}>done</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.pillSelected,
        pressed && styles.pillPressed,
      ]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  flex: {
    flex: 1,
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
  input: {
    fontFamily: fonts.serif.regular,
    fontSize: 28,
    lineHeight: 38,
    letterSpacing: -0.3,
    color: colors.ink,
    padding: 0,
    minHeight: 80,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 28,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  pillTextSelected: {
    color: colors.surface,
  },
  hint: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 14,
    color: colors.muted,
    marginTop: 24,
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
