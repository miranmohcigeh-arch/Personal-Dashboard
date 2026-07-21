import { getTasks, getNotes, getHabits } from '@/app/actions';
import Greeting from '@/components/Greeting';
import StatsCards from '@/components/StatsCards';
import TaskBoard from '@/components/TaskBoard';
import NotesWidget from '@/components/NotesWidget';
import HabitsWidget from '@/components/HabitsWidget';

export const dynamic = 'force-dynamic'; // always read fresh data from Neon

export default async function Dashboard() {
  const [tasks, notes, habits] = await Promise.all([
    getTasks(),
    getNotes(),
    getHabits(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <Greeting />
      <StatsCards tasks={tasks} habits={habits} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TaskBoard initialTasks={tasks} />
        </div>
        <div className="space-y-4">
          <HabitsWidget initialHabits={habits} />
          <NotesWidget initialNotes={notes} />
        </div>
      </div>

      <footer className="text-center text-xs text-muted pt-6">
        Personal dashboard · data stored in Neon Postgres
      </footer>
    </main>
  );
}
