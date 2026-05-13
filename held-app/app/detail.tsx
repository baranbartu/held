import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { composeSource, formatDeadline } from '@/helpers/dates';
import { useTasks } from '@/store/tasks';
import { colors, fonts } from '@/theme';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTasks((s) => s.tasks.find((t) => t.id === id));
  const dismiss = useTasks((s) => s.dismiss);

  if (!task) {
    router.back();
    return null;
  }

  const handleDone = () => {
    dismiss(task.id);
    router.back();
  };

  const handlePostpone = () => {
    router.replace({ pathname: '/postpone', params: { id: task.id } });
  };

  const sourceLine = composeSource(task.source, task.addedAt);

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable hitSlop={16} onPress={() => router.back()}>
            <Text style={styles.close}>close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sourceLine}>{sourceLine}</Text>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={[styles.deadline, task.urgent && styles.deadlineUrgent]}>
            due {formatDeadline(task.deadline)}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>where this came from</Text>
          {task.context ? (
            <Text style={styles.contextText}>{task.context}</Text>
          ) : (
            <Text style={styles.contextNone}>you added this yourself.</Text>
          )}
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryText}>mark done</Text>
          </Pressable>
          <Pressable
            onPress={handlePostpone}
            style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
          >
            <Text style={styles.secondaryText}>postpone</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
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
  close: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    letterSpacing: 1.3,
    textTransform: 'lowercase',
    color: colors.muted,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 120,
  },
  sourceLine: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 0.7,
    color: colors.muted,
    textTransform: 'lowercase',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: 10,
  },
  deadline: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  deadlineUrgent: {
    color: colors.accent,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginVertical: 32,
  },
  sectionLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 18,
  },
  contextText: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkSoft,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.hairline,
  },
  contextNone: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    lineHeight: 24,
    color: colors.muted,
  },
  actionsRow: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 10,
  },
  primary: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  primaryText: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    color: colors.surface,
  },
  secondary: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  secondaryPressed: {
    opacity: 0.7,
    backgroundColor: colors.paperDeep,
  },
  secondaryText: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    color: colors.ink,
  },
});
