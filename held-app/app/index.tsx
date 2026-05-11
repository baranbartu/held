import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

type Task = {
  id: string;
  title: string;
  when: string;
  source: string;
  urgent?: boolean;
};

type Section = {
  id: 'today' | 'this-week';
  title: string;
  tasks: Task[];
};

const todayTasks: Task[] = [
  {
    id: '1',
    title: 'Pick a time for your interview',
    when: 'HR is waiting',
    source: 'gmail · 2 days ago',
    urgent: true,
  },
  {
    id: '2',
    title: 'Pay garbage tax — €127',
    when: 'due in 3 weeks',
    source: 'letter · gemeente',
  },
  {
    id: '3',
    title: 'Reply to mom about Sunday lunch',
    when: 'she asked yesterday',
    source: 'whatsapp',
  },
];

const weekTasks: Task[] = [
  {
    id: '4',
    title: 'Confirm dentist appointment',
    when: 'thursday',
    source: 'sms',
  },
  {
    id: '5',
    title: 'Send Q2 draft to Marcus',
    when: 'friday',
    source: 'slack · #team',
  },
];

const laterCount = 4;
const todayDate = 'saturday · may 9';

// Preview toggle while everything is mocked. Flip to 'tasks' to see the
// task list. Real implementation: derive from `todayTasks.length === 0`.
const MODE: 'tasks' | 'clear' = 'clear';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {MODE === 'clear' ? <ClearState /> : <TaskList />}
      <AddBar />
    </SafeAreaView>
  );
}

function TaskList() {
  const sections: Section[] = [
    { id: 'today', title: 'Today', tasks: todayTasks },
    { id: 'this-week', title: 'This week', tasks: weekTasks },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.topMeta}>{todayDate}</Text>
      <Text style={styles.greeting}>
        Three things <Text style={styles.greetingAccent}>need you</Text> today.
      </Text>
      <Text style={styles.subgreeting}>Two more this week. The rest can wait.</Text>

      {sections.map((section, idx) => (
        <View key={section.id}>
          <SectionHead
            title={section.title}
            count={String(section.tasks.length)}
            first={idx === 0}
          />
          {section.tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} last={i === section.tasks.length - 1} />
          ))}
        </View>
      ))}

      <SectionHead title={`Later — ${laterCount} things`} count="›" extraTopMargin />
    </ScrollView>
  );
}

function ClearState() {
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
        <LaterRow label="waiting this week" num={weekTasks.length} />
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

function AddBar() {
  return (
    <View style={styles.addBar}>
      <Text style={styles.addBarText}>add something on your mind</Text>
      <View style={styles.plus}>
        <Text style={styles.plusText}>+</Text>
      </View>
    </View>
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

function TaskRow({ task, last }: { task: Task; last: boolean }) {
  return (
    <View style={[styles.task, !last && styles.taskBorder]}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <View style={styles.taskMeta}>
        <Text style={[styles.taskWhen, task.urgent && styles.taskWhenUrgent]}>{task.when}</Text>
        <View style={styles.dot} />
        <Text style={styles.source}>{task.source}</Text>
      </View>
    </View>
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
  taskTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.1,
    color: colors.ink,
    marginBottom: 8,
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
