'use client';

import { useRef, useState, useTransition } from 'react';
import { createTask, deleteTask, toggleTaskStatus } from '@/app/actions';
import type { Task } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';

const priorityColor: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);

  function handleToggle(task: Task) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
          : t
      )
    );
    startTransition(() => {
      toggleTaskStatus(task.id, task.status);
    });
  }

  function handleDelete(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => {
      deleteTask(id);
    });
  }

  async function handleSubmit(formData: FormData) {
    await createTask(formData);
    formRef.current?.reset();
    setShowForm(false);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Tasks</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-sm text-accent2 hover:text-white transition"
        >
          <Plus size={16} /> New task
        </button>
      </div>

      {showForm && (
        <form
          ref={formRef}
          action={handleSubmit}
          className="mb-4 grid gap-2 border border-border rounded-lg p-3 bg-panel2"
        >
          <input
            name="title"
            placeholder="Task title"
            required
            className="rounded-md px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={2}
            className="rounded-md px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select name="priority" defaultValue="medium" className="rounded-md px-3 py-2 text-sm flex-1">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" name="due_date" className="rounded-md px-3 py-2 text-sm flex-1" />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-indigo-500 transition text-white rounded-md py-2 text-sm font-medium"
          >
            Add task
          </button>
        </form>
      )}

      <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <p className="text-muted text-sm text-center py-6">No tasks yet — add one above.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-start gap-3 border border-border rounded-lg p-3 bg-panel2 ${
              task.status === 'done' ? 'opacity-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => handleToggle(task)}
              className="mt-1 accent-indigo-500 w-4 h-4"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  task.status === 'done' ? 'line-through text-muted' : 'text-white'
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted mt-0.5 truncate">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`text-[10px] uppercase tracking-wide border rounded-full px-2 py-0.5 ${
                    priorityColor[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
                {task.due_date && (
                  <span
                    className={`text-[11px] ${
                      task.due_date < today && task.status !== 'done'
                        ? 'text-red-400'
                        : 'text-muted'
                    }`}
                  >
                    Due {task.due_date}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-muted hover:text-red-400 transition"
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
