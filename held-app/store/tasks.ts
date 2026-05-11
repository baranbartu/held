import {
  addDays,
  differenceInDays,
  isToday as fnsIsToday,
  isTomorrow as fnsIsTomorrow,
  subDays,
} from 'date-fns';
import { create } from 'zustand';

export type TaskCategory = 'today' | 'this-week' | 'later';

export type Task = {
  id: string;
  title: string;
  deadline?: Date;
  addedAt: Date;
  source: string;
  urgent?: boolean;
  category: TaskCategory;
  dismissed?: boolean;
};

type TasksState = {
  tasks: Task[];
  pendingDismissId: string | null;
  add: (title: string, deadline?: Date) => void;
  dismiss: (id: string) => void;
  undo: () => void;
};

const UNDO_WINDOW_MS = 5000;

const newId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export function categorize(deadline: Date | undefined): TaskCategory {
  if (!deadline) return 'today';
  if (fnsIsToday(deadline) || fnsIsTomorrow(deadline)) return 'today';
  const days = differenceInDays(deadline, new Date());
  if (days <= 7) return 'this-week';
  return 'later';
}

function initialTasks(): Task[] {
  const now = new Date();
  return [
    {
      id: '1',
      title: 'Pick a time for your interview',
      deadline: addDays(now, 1),
      addedAt: subDays(now, 2),
      source: 'gmail',
      urgent: true,
      category: 'today',
    },
    {
      id: '2',
      title: 'Pay garbage tax — €127',
      deadline: addDays(now, 21),
      addedAt: subDays(now, 5),
      source: 'letter · gemeente',
      category: 'today',
    },
    {
      id: '3',
      title: 'Reply to mom about Sunday lunch',
      addedAt: subDays(now, 1),
      source: 'whatsapp',
      category: 'today',
    },
    {
      id: '4',
      title: 'Confirm dentist appointment',
      deadline: addDays(now, 3),
      addedAt: subDays(now, 8),
      source: 'sms',
      category: 'this-week',
    },
    {
      id: '5',
      title: 'Send Q2 draft to Marcus',
      deadline: addDays(now, 4),
      addedAt: subDays(now, 2),
      source: 'slack · #team',
      category: 'this-week',
    },
  ];
}

// Module-level so it isn't part of the serializable store and React doesn't
// re-render on its (non-reactive) changes.
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

export const useTasks = create<TasksState>((set, get) => ({
  tasks: initialTasks(),
  pendingDismissId: null,

  add: (title, deadline) =>
    set((state) => {
      const trimmed = title.trim();
      if (!trimmed) return state;
      const task: Task = {
        id: newId(),
        title: trimmed,
        deadline,
        addedAt: new Date(),
        source: 'you',
        category: categorize(deadline),
      };
      return { tasks: [task, ...state.tasks] };
    }),

  dismiss: (id) => {
    // Finalize any previous pending dismiss before queuing the new one.
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
      const prevId = get().pendingDismissId;
      if (prevId && prevId !== id) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== prevId) }));
      }
    }

    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, dismissed: true } : t)),
      pendingDismissId: id,
    }));

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        pendingDismissId: s.pendingDismissId === id ? null : s.pendingDismissId,
      }));
    }, UNDO_WINDOW_MS);
  },

  undo: () => {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === s.pendingDismissId ? { ...t, dismissed: false } : t
      ),
      pendingDismissId: null,
    }));
  },
}));

export const UNDO_WINDOW_SECONDS = UNDO_WINDOW_MS / 1000;
