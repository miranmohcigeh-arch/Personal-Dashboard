'use client';

import { useRef, useState, useTransition } from 'react';
import { createHabit, deleteHabit, toggleHabitToday } from '@/app/actions';
import type { HabitWithLogs } from '@/lib/types';
import { Flame, Trash2, Plus } from 'lucide-react';

export default function HabitsWidget({ initialHabits }: { initialHabits: HabitWithLogs[] }) {
  const [habits, setHabits] = useState(initialHabits);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createHabit(formData);
    formRef.current?.reset();
    setShowForm(false);
  }

  function handleToggle(habit: HabitWithLogs) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              logged_today: !h.logged_today,
              streak: h.logged_today ? Math.max(0, h.streak - 1) : h.streak + 1,
            }
          : h
      )
    );
    startTransition(() => {
      toggleHabitToday(habit.id, habit.logged_today);
    });
  }

  function handleDelete(id: number) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    startTransition(() => {
      deleteHabit(id);
    });
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Habits</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-sm text-accent2 hover:text-white transition"
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      {showForm && (
        <form ref={formRef} action={handleSubmit} className="flex gap-2 mb-4">
          <input
            name="name"
            placeholder="e.g. Read 20 minutes"
            required
            className="flex-1 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-indigo-500 transition text-white rounded-md px-3 text-sm font-medium"
          >
            Add
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {habits.length === 0 && (
          <p className="text-muted text-sm text-center py-6">No habits tracked yet.</p>
        )}
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center gap-3 border border-border rounded-lg p-3 bg-panel2"
          >
            <input
              type="checkbox"
              checked={habit.logged_today}
              onChange={() => handleToggle(habit)}
              className="accent-indigo-500 w-4 h-4"
            />
            <span className="flex-1 text-sm text-white/90">{habit.name}</span>
            {habit.streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={13} /> {habit.streak}
              </span>
            )}
            <button
              onClick={() => handleDelete(habit.id)}
              className="text-muted hover:text-red-400 transition"
              aria-label="Delete habit"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
