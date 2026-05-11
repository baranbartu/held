import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
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

export default function AddScreen() {
  const [text, setText] = useState('');
  const add = useTasks((s) => s.add);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add(trimmed);
    router.back();
  };

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
            <Text style={styles.hint}>we&apos;ll figure out the rest.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
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
  hint: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 14,
    color: colors.muted,
    marginTop: 24,
  },
});
