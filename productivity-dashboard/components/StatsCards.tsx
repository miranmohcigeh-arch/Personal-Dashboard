import type { Task, HabitWithLogs } from '@/lib/types';

export default function StatsCards({
  tasks,
  habits,
}: {
  tasks: Task[];
  habits: HabitWithLogs[];
}) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => t.due_date === today && t.status !== 'done').length;
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== 'done'
  ).length;
  const habitsDoneToday = habits.filter((h) => h.logged_today).length;

  const stats = [
    { label: 'Completed', value: `${done}/${total}`, accent: 'text-accent2' },
    { label: 'Due today', value: dueToday, accent: dueToday > 0 ? 'text-yellow-400' : 'text-white' },
    { label: 'Overdue', value: overdue, accent: overdue > 0 ? 'text-red-400' : 'text-white' },
    {
      label: 'Habits today',
      value: `${habitsDoneToday}/${habits.length}`,
      accent: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-panel border border-border rounded-xl p-4">
          <p className="text-muted text-xs uppercase tracking-wide">{s.label}</p>
          <p className={`text-2xl font-semibold mt-1 ${s.accent}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
