import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { composeSource, formatDeadline, formatTodayHeader, formatTodayName } from '@/helpers/dates';
import { useTasks, type Task } from '@/store/tasks';
import { colors, fonts } from '@/theme';

type Section = {
  id: 'today' | 'this-week';
  title: string;
  tasks: Task[];
};

const laterCount = 4;

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

function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

// Today section can mix urgent + non-urgent tasks; This week and Later only
// have deadline-bearing tasks. Sort: urgent first, then deadline ascending.
function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!!a.urgent !== !!b.urgent) return a.urgent ? -1 : 1;
    return a.deadline.getTime() - b.deadline.getTime();
  });
}

export default function HomeScreen() {
  const tasks = useTasks((s) => s.tasks);
  const dismiss = useTasks((s) => s.dismiss);

  const visible = tasks.filter((t) => !t.dismissed);
  const today = sortTasks(visible.filter((t) => t.category === 'today'));
  const week = sortTasks(visible.filter((t) => t.category === 'this-week'));

  const isClear = today.length === 0;

  const openPostpone = (id: string) =>
    router.push({ pathname: '/postpone', params: { id } });
  const openDetail = (id: string) =>
    router.push({ pathname: '/detail', params: { id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {isClear ? (
        <ClearState weekCount={week.length} />
      ) : (
        <TaskList
          today={today}
          week={week}
          onDone={dismiss}
          onPostpone={openPostpone}
          onDetail={openDetail}
        />
      )}
      <BottomStack />
    </SafeAreaView>
  );
}

function BottomStack() {
  const pendingDismissId = useTasks((s) => s.pendingDismissId);
  const undo = useTasks((s) => s.undo);

  return (
    <View style={styles.bottomStack}>
      {pendingDismissId && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(180)}>
          <UndoBar onUndo={undo} />
        </Animated.View>
      )}
      <AddBar onPress={() => router.push('/add')} />
    </View>
  );
}

function TaskList({
  today,
  week,
  onDone,
  onPostpone,
  onDetail,
}: {
  today: Task[];
  week: Task[];
  onDone: (id: string) => void;
  onPostpone: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const isSingular = today.length === 1;
  const countWord = numberWord(today.length);
  const noun = isSingular ? 'thing' : 'things';
  const verb = isSingular ? 'needs you' : 'need you';

  let subgreeting: string;
  if (week.length === 0) {
    subgreeting = 'The rest can wait.';
  } else if (week.length === 1) {
    subgreeting = 'One more this week. The rest can wait.';
  } else {
    subgreeting = `${numberWord(week.length)} more this week. The rest can wait.`;
  }

  const sections: Section[] = [
    { id: 'today', title: 'Today', tasks: today },
    ...(week.length > 0
      ? [{ id: 'this-week' as const, title: 'This week', tasks: week }]
      : []),
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.topMeta}>{formatTodayHeader()}</Text>
      <Text style={styles.greeting}>
        {countWord} {noun} <Text style={styles.greetingAccent}>{verb}</Text> today.
      </Text>
      <Text style={styles.subgreeting}>{subgreeting}</Text>

      {sections.map((section, idx) => (
        <View key={section.id}>
          <SectionHead
            title={section.title}
            count={String(section.tasks.length)}
            first={idx === 0}
          />
          {section.tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              last={i === section.tasks.length - 1}
              onDone={onDone}
              onPostpone={onPostpone}
              onDetail={onDetail}
            />
          ))}
        </View>
      ))}

      <SectionHead title={`Later — ${laterCount} things`} count="›" extraTopMargin />
    </ScrollView>
  );
}

function ClearState({ weekCount }: { weekCount: number }) {
  return (
    <View style={styles.clearContainer}>
      <Text style={styles.topMeta}>{formatTodayHeader()}</Text>
      <View style={styles.clearMessage}>
        <Text style={styles.clearGreeting}>
          You&apos;re <Text style={styles.clearGreetingAccent}>clear.</Text>
        </Text>
        <Text style={styles.clearLine}>Nothing needs you today.</Text>
        <Text style={styles.clearHint}>Go enjoy your {formatTodayName()}.</Text>
      </View>

      <BreathingDot />

      <View style={styles.laterSummary}>
        <LaterRow label="waiting this week" num={weekCount} />
        <LaterRow label="waiting later" num={laterCount} />
        <Text style={styles.laterPromise}>
          we&apos;ll let you know when something needs you.
        </Text>
      </View>
    </View>
  );
}

function BreathingDot() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.15 }],
    opacity: 0.6 + progress.value * 0.4,
  }));

  return (
    <View style={styles.breathingWrap}>
      <Animated.View style={[styles.breathingCircle, animatedStyle]}>
        <View style={styles.breathingDot} />
      </Animated.View>
    </View>
  );
}

function LaterRow({ label, num }: { label: string; num: number }) {
  return (
    <View style={styles.laterRow}>
      <Text style={styles.laterRowLabel}>{label}</Text>
      <Text style={styles.laterRowNum}>{num}</Text>
    </View>
  );
}

function AddBar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addBar, pressed && styles.addBarPressed]}
    >
      <Text style={styles.addBarText}>add something on your mind</Text>
      <View style={styles.plus}>
        <Text style={styles.plusText}>+</Text>
      </View>
    </Pressable>
  );
}

function UndoBar({ onUndo }: { onUndo: () => void }) {
  return (
    <Pressable
      onPress={onUndo}
      style={({ pressed }) => [styles.undoBar, pressed && styles.undoBarPressed]}
    >
      <Text style={styles.undoMsg}>marked done</Text>
      <Text style={styles.undoLink}>undo</Text>
    </Pressable>
  );
}

function SectionHead({
  title,
  count,
  first,
  extraTopMargin,
}: {
  title: string;
  count: string;
  first?: boolean;
  extraTopMargin?: boolean;
}) {
  return (
    <View
      style={[
        styles.sectionHead,
        first && styles.sectionHeadFirst,
        extraTopMargin && styles.sectionHeadExtraTop,
      ]}
    >
      <Text style={styles.sectionHeadTitle}>{title}</Text>
      <Text style={styles.sectionHeadCount}>{count}</Text>
    </View>
  );
}

function TaskRow({
  task,
  last,
  onDone,
  onPostpone,
  onDetail,
}: {
  task: Task;
  last: boolean;
  onDone: (id: string) => void;
  onPostpone: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Tap = open detail (the conventional "tap to open" pattern). Mark-done is
  // moved to swipe-right; postpone to swipe-left. Brief was "tap = done", but
  // novice user feedback showed it was unintuitive — most apps treat tap as
  // "show me more", and surprise mark-done erodes trust (even with undo).
  const tap = Gesture.Tap().onEnd((_e, success) => {
    'worklet';
    if (!success) return;
    runOnJS(onDetail)(task.id);
  });

  // Bidirectional pan: swipe right past threshold dismisses (mark done) with
  // a slide-off animation; swipe left past threshold opens /postpone with the
  // row springing back (the postpone modal slides over it). The hint backdrop
  // behind the row reveals "done" on the left as the row drags right, and
  // "postpone" on the right as it drags left — making the gestures
  // self-documenting without on-row chrome.
  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onChange((e) => {
      'worklet';
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      const COMMIT = 100;
      if (e.translationX > COMMIT) {
        // Swipe right = mark done. Slide row off, fade, then dismiss.
        translateX.value = withTiming(440, { duration: 220 });
        opacity.value = withTiming(0, { duration: 220 }, (finished) => {
          if (finished) runOnJS(onDone)(task.id);
        });
      } else if (e.translationX < -COMMIT) {
        // Swipe left = postpone. Spring back, navigate to /postpone modal.
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
        runOnJS(onPostpone)(task.id);
      } else {
        // Below threshold, spring back.
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const whenText = formatDeadline(task.deadline);
  const sourceText = composeSource(task.source, task.addedAt);

  return (
    <Animated.View
      style={[styles.taskWrap, !last && styles.taskWrapBorder]}
      layout={LinearTransition.duration(260)}
      exiting={FadeOut.duration(180)}
    >
      {/* Hint backdrop — visible only when the row drags away from rest. */}
      <View style={styles.hints} pointerEvents="none">
        <Text style={styles.hintDone}>done</Text>
        <Text style={styles.hintPostpone}>postpone</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.task, rowStyle]}>
          <View style={styles.titleWrap}>
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>
          <View style={styles.taskMeta}>
            <Text style={[styles.taskWhen, task.urgent && styles.taskWhenUrgent]}>{whenText}</Text>
            <View style={styles.dot} />
            <Text style={styles.source}>{sourceText}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 140,
  },
  topMeta: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 14,
  },
  greeting: {
    fontFamily: fonts.serif.regular,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: 6,
  },
  greetingAccent: {
    fontFamily: fonts.serif.regularItalic,
    color: colors.accent,
  },
  subgreeting: {
    fontFamily: fonts.serif.light,
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: 36,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 18,
  },
  sectionHeadFirst: {
    marginTop: 0,
  },
  sectionHeadExtraTop: {
    marginTop: 36,
  },
  sectionHeadTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  sectionHeadCount: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.muted,
  },
  taskWrap: {
    position: 'relative',
  },
  taskWrapBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  hints: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  hintDone: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.done,
  },
  hintPostpone: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.accentSoft,
  },
  task: {
    paddingVertical: 18,
    backgroundColor: colors.paper,
  },
  titleWrap: {
    marginBottom: 8,
  },
  taskTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.1,
    color: colors.ink,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskWhen: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  taskWhenUrgent: {
    color: colors.accent,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.muted,
    marginHorizontal: 10,
  },
  source: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 0.7,
    color: colors.muted,
  },

  // Clear state
  clearContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 140,
  },
  clearMessage: {
    marginTop: 48,
  },
  clearGreeting: {
    fontFamily: fonts.serif.regular,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.4,
    color: colors.ink,
    marginBottom: 16,
  },
  clearGreetingAccent: {
    fontFamily: fonts.serif.regularItalic,
    color: colors.accent,
  },
  clearLine: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 17,
    lineHeight: 25,
    color: colors.inkSoft,
    marginBottom: 14,
  },
  clearHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  breathingWrap: {
    alignItems: 'center',
    marginVertical: 56,
  },
  breathingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  laterSummary: {
    marginTop: 'auto',
    paddingTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  laterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  laterRowLabel: {
    fontFamily: fonts.serif.regular,
    fontSize: 14,
    color: colors.inkSoft,
  },
  laterRowNum: {
    fontFamily: fonts.serif.medium,
    fontSize: 14,
    color: colors.ink,
  },
  laterPromise: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    paddingTop: 4,
  },

  // Bottom stack (undo + add)
  bottomStack: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 10,
  },

  // Add bar
  addBar: {
    backgroundColor: colors.ink,
    borderRadius: 32,
    paddingVertical: 16,
    paddingLeft: 24,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  addBarPressed: {
    opacity: 0.92,
  },
  addBarText: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 15,
    color: colors.surface,
  },
  plus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontFamily: fonts.sans.regular,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 22,
  },

  // Undo bar
  undoBar: {
    backgroundColor: colors.ink,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  undoBarPressed: {
    opacity: 0.9,
  },
  undoMsg: {
    fontFamily: fonts.serif.lightItalic,
    fontSize: 14,
    color: colors.surface,
  },
  undoLink: {
    fontFamily: fonts.serif.mediumItalic,
    fontSize: 14,
    color: colors.accentSoft,
  },
});
