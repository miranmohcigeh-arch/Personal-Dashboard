'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import type { Task, Note, HabitWithLogs } from '@/lib/types';

// ---------- TASKS ----------

function toDateOnlyString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return new Date(value as string).toISOString().slice(0, 10);
}

function toISOString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return new Date(value as string).toISOString();
}

function serializeTask(row: any): Task {
  return {
    ...row,
    due_date: toDateOnlyString(row.due_date),
    created_at: toISOString(row.created_at) as string,
    completed_at: toISOString(row.completed_at),
  };
}

export async function getTasks(): Promise<Task[]> {
  const rows = await sql`
    SELECT * FROM tasks
    ORDER BY
      (status = 'done') ASC,
      (due_date IS NULL) ASC,
      due_date ASC,
      CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC,
      created_at DESC
  `;
  // Neon can return DATE/TIMESTAMPTZ columns as JS Date objects. Those aren't
  // serializable across the Server -> Client Component boundary, so we
  // normalize everything to plain strings before returning.
  return (rows as any[]).map(serializeTask);
}

export async function createTask(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const priority = String(formData.get('priority') || 'medium');
  const dueDate = String(formData.get('due_date') || '') || null;

  if (!title) return;

  await sql`
    INSERT INTO tasks (title, description, priority, due_date)
    VALUES (${title}, ${description || null}, ${priority}, ${dueDate})
  `;
  revalidatePath('/');
}

export async function toggleTaskStatus(id: number, currentStatus: string) {
  const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
  const completedAt = nextStatus === 'done' ? new Date().toISOString() : null;

  await sql`
    UPDATE tasks
    SET status = ${nextStatus}, completed_at = ${completedAt}
    WHERE id = ${id}
  `;
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  revalidatePath('/');
}

// ---------- NOTES ----------

export async function getNotes(): Promise<Note[]> {
  const rows = await sql`
    SELECT * FROM notes
    ORDER BY pinned DESC, created_at DESC
    LIMIT 50
  `;
  return (rows as any[]).map((row) => ({
    ...row,
    created_at: toISOString(row.created_at) as string,
  }));
}

export async function createNote(formData: FormData) {
  const content = String(formData.get('content') || '').trim();
  if (!content) return;

  await sql`INSERT INTO notes (content) VALUES (${content})`;
  revalidatePath('/');
}

export async function togglePinNote(id: number, pinned: boolean) {
  await sql`UPDATE notes SET pinned = ${!pinned} WHERE id = ${id}`;
  revalidatePath('/');
}

export async function deleteNote(id: number) {
  await sql`DELETE FROM notes WHERE id = ${id}`;
  revalidatePath('/');
}

// ---------- HABITS ----------

export async function getHabits(): Promise<HabitWithLogs[]> {
  const habits = await sql`SELECT * FROM habits ORDER BY created_at ASC`;
  const logs = await sql`
    SELECT habit_id, log_date FROM habit_logs
    ORDER BY log_date DESC
  `;

  const logsByHabit = new Map<number, string[]>();
  for (const log of logs as any[]) {
    const arr = logsByHabit.get(log.habit_id) || [];
    arr.push(toDateOnlyString(log.log_date) as string);
    logsByHabit.set(log.habit_id, arr);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (habits as any[]).map((h) => {
    const dates = logsByHabit.get(h.id) || [];
    const loggedToday = dates.includes(today);

    // Count consecutive days streak ending today or yesterday
    let streak = 0;
    const dateSet = new Set(dates);
    const cursor = new Date();
    if (!loggedToday) cursor.setDate(cursor.getDate() - 1);
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      ...h,
      created_at: toISOString(h.created_at) as string,
      logged_today: loggedToday,
      streak,
    } as HabitWithLogs;
  });
}

export async function createHabit(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  await sql`INSERT INTO habits (name) VALUES (${name})`;
  revalidatePath('/');
}

export async function toggleHabitToday(habitId: number, loggedToday: boolean) {
  if (loggedToday) {
    await sql`
      DELETE FROM habit_logs
      WHERE habit_id = ${habitId} AND log_date = CURRENT_DATE
    `;
  } else {
    await sql`
      INSERT INTO habit_logs (habit_id, log_date)
      VALUES (${habitId}, CURRENT_DATE)
      ON CONFLICT (habit_id, log_date) DO NOTHING
    `;
  }
  revalidatePath('/');
}

export async function deleteHabit(id: number) {
  await sql`DELETE FROM habits WHERE id = ${id}`;
  revalidatePath('/');
}
