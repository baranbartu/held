import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeOut,
  LinearTransition,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks, type Task } from '@/store/tasks';
import { colors, fonts } from '@/theme';

type Section = {
  id: 'today' | 'this-week';
  title: string;
  tasks: Task[];
};

const laterCount = 4;
const todayDate = 'saturday · may 9';

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

export default function HomeScreen() {
  const tasks = useTasks((s) => s.tasks);
  const dismiss = useTasks((s) => s.dismiss);

  const today = tasks.filter((t) => t.category === 'today');
  const week = tasks.filter((t) => t.category === 'this-week');

  const isClear = today.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {isClear ? (
        <ClearState weekCount={week.length} />
      ) : (
        <TaskList today={today} week={week} onDone={dismiss} onSnooze={dismiss} />
      )}
      <AddBar onPress={() => router.push('/add')} />
    </SafeAreaView>
  );
}

function TaskList({
  today,
  week,
  onDone,
  onSnooze,
}: {
  today: Task[];
  week: Task[];
  onDone: (id: string) => void;
  onSnooze: (id: string) => void;
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
      <Text style={styles.topMeta}>{todayDate}</Text>
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
              onSnooze={onSnooze}
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
      <Text style={styles.topMeta}>{todayDate}</Text>
      <View style={styles.clearMessage}>
        <Text style={styles.clearGreeting}>
          You&apos;re <Text style={styles.clearGreetingAccent}>clear.</Text>
        </Text>
        <Text style={styles.clearLine}>Nothing needs you today.</Text>
        <Text style={styles.clearHint}>Go enjoy your Saturday.</Text>
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
  onSnooze,
}: {
  task: Task;
  last: boolean;
  onDone: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const doneProgress = useSharedValue(0);
  const [titleWidth, setTitleWidth] = useState(0);

  const tap = Gesture.Tap().onEnd((_e, success) => {
    'worklet';
    if (!success) return;
    doneProgress.value = withTiming(
      1,
      { duration: 260, easing: Easing.out(Easing.ease) },
      (strikeDone) => {
        if (strikeDone) {
          opacity.value = withTiming(
            0,
            { duration: 220, easing: Easing.in(Easing.ease) },
            (fadeDone) => {
              if (fadeDone) {
                runOnJS(onDone)(task.id);
              }
            }
          );
        }
      }
    );
  });

  const pan = Gesture.Pan()
    .activeOffsetX(20)
    .failOffsetY([-12, 12])
    .onChange((e) => {
      'worklet';
      if (e.translationX > 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationX > 100) {
        translateX.value = withTiming(440, { duration: 220 });
        opacity.value = withTiming(0, { duration: 220 }, (finished) => {
          if (finished) {
            runOnJS(onSnooze)(task.id);
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const titleColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(doneProgress.value, [0, 1], [colors.ink, colors.done]),
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: titleWidth * doneProgress.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.task, !last && styles.taskBorder, rowStyle]}
        layout={LinearTransition.duration(260)}
        exiting={FadeOut.duration(180)}
      >
        <View style={styles.titleWrap}>
          <Animated.Text
            style={[styles.taskTitle, titleColorStyle]}
            onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}
          >
            {task.title}
          </Animated.Text>
          <Animated.View style={[styles.strikeBar, strikeStyle]} pointerEvents="none" />
        </View>
        <View style={styles.taskMeta}>
          <Text style={[styles.taskWhen, task.urgent && styles.taskWhenUrgent]}>{task.when}</Text>
          <View style={styles.dot} />
          <Text style={styles.source}>{task.source}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
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
    paddingBottom: 120,
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
  task: {
    paddingVertical: 18,
  },
  taskBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  titleWrap: {
    alignSelf: 'flex-start',
    position: 'relative',
    marginBottom: 8,
  },
  taskTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.1,
    color: colors.ink,
  },
  strikeBar: {
    position: 'absolute',
    top: 11,
    left: 0,
    height: 1,
    backgroundColor: colors.done,
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
    paddingBottom: 120,
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

  // Add bar
  addBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
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
});
