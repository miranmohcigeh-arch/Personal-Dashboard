export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null; // ISO date
  created_at: string;
  completed_at: string | null;
}

export interface Note {
  id: number;
  content: string;
  pinned: boolean;
  created_at: string;
}

export interface Habit {
  id: number;
  name: string;
  created_at: string;
}

export interface HabitWithLogs extends Habit {
  logged_today: boolean;
  streak: number;
}
