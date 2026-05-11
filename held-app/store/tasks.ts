import { create } from 'zustand';

export type TaskCategory = 'today' | 'this-week' | 'later';

export type Task = {
  id: string;
  title: string;
  when: string;
  source: string;
  urgent?: boolean;
  category: TaskCategory;
};

type TasksState = {
  tasks: Task[];
  add: (title: string) => void;
  dismiss: (id: string) => void;
};

const newId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Pick a time for your interview',
    when: 'HR is waiting',
    source: 'gmail · 2 days ago',
    urgent: true,
    category: 'today',
  },
  {
    id: '2',
    title: 'Pay garbage tax — €127',
    when: 'due in 3 weeks',
    source: 'letter · gemeente',
    category: 'today',
  },
  {
    id: '3',
    title: 'Reply to mom about Sunday lunch',
    when: 'she asked yesterday',
    source: 'whatsapp',
    category: 'today',
  },
  {
    id: '4',
    title: 'Confirm dentist appointment',
    when: 'thursday',
    source: 'sms',
    category: 'this-week',
  },
  {
    id: '5',
    title: 'Send Q2 draft to Marcus',
    when: 'friday',
    source: 'slack · #team',
    category: 'this-week',
  },
];

export const useTasks = create<TasksState>((set) => ({
  tasks: INITIAL_TASKS,
  add: (title) =>
    set((state) => ({
      tasks: [
        {
          id: newId(),
          title,
          when: 'just added',
          source: 'you',
          category: 'today',
        },
        ...state.tasks,
      ],
    })),
  dismiss: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));
