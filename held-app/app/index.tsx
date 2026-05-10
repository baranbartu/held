import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

const sections: Section[] = [
  {
    id: 'today',
    title: 'Today',
    tasks: [
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
    ],
  },
  {
    id: 'this-week',
    title: 'This week',
    tasks: [
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
    ],
  },
];

const laterCount = 4;
const todayDate = 'saturday · may 9';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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

      <View style={styles.addBar}>
        <Text style={styles.addBarText}>add something on your mind</Text>
        <View style={styles.plus}>
          <Text style={styles.plusText}>+</Text>
        </View>
      </View>
    </SafeAreaView>
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
