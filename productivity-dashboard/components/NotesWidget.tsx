'use client';

import { useRef, useState, useTransition } from 'react';
import { createNote, deleteNote, togglePinNote } from '@/app/actions';
import type { Note } from '@/lib/types';
import { Pin, Trash2 } from 'lucide-react';

export default function NotesWidget({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createNote(formData);
    formRef.current?.reset();
  }

  function handlePin(note: Note) {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    );
    startTransition(() => {
      togglePinNote(note.id, note.pinned);
    });
  }

  function handleDelete(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => {
      deleteNote(id);
    });
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <h2 className="font-semibold text-white mb-4">Quick notes</h2>

      <form ref={formRef} action={handleSubmit} className="flex gap-2 mb-4">
        <input
          name="content"
          placeholder="Jot something down…"
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

      <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="text-muted text-sm text-center py-6">No notes yet.</p>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            className="flex items-start gap-2 border border-border rounded-lg p-3 bg-panel2"
          >
            <p className="text-sm flex-1 text-white/90 whitespace-pre-wrap">{note.content}</p>
            <button
              onClick={() => handlePin(note)}
              className={`transition ${note.pinned ? 'text-accent2' : 'text-muted hover:text-white'}`}
              aria-label="Pin note"
            >
              <Pin size={14} fill={note.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => handleDelete(note.id)}
              className="text-muted hover:text-red-400 transition"
              aria-label="Delete note"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
