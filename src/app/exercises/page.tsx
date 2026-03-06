'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, X, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Exercise, MuscleGroup } from '@/types';
import CreateExerciseModal from '@/components/modals/CreateExerciseModal';
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUPS } from '@/lib/defaultData';

function ExerciseRow({
  exercise,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-3 py-3 px-4 bg-zinc-900 rounded-xl border border-zinc-800"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}`}>
            {exercise.muscleGroup}
          </span>
          <span className="text-[10px] text-zinc-600">{exercise.equipment}</span>
          {exercise.isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-muted)] text-accent-400 font-medium">
              Custom
            </span>
          )}
        </div>
      </div>
      {exercise.isCustom && (
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function ExercisesPage() {
  const exercises = useAppStore((s) => s.exercises);
  const deleteExercise = useAppStore((s) => s.deleteExercise);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'All'>('All');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.muscleGroup === filter;
    const matchCustom = !showCustomOnly || e.isCustom;
    return matchSearch && matchFilter && matchCustom;
  });

  const grouped = MUSCLE_GROUPS.reduce<Record<string, Exercise[]>>((acc, mg) => {
    const list = filtered.filter((e) => e.muscleGroup === mg);
    if (list.length) acc[mg] = list;
    return acc;
  }, {});

  const customCount = exercises.filter((e) => e.isCustom).length;

  return (
    <div className="px-4 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-zinc-500 text-sm">{exercises.length} exercises</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Library</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-xl bg-accent-600 hover:bg-accent-500 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5 mb-3">
        <Search size={16} className="text-zinc-400 flex-shrink-0" />
        <input
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-zinc-500"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
        {(['All', ...MUSCLE_GROUPS] as const).map((mg) => (
          <button
            key={mg}
            onClick={() => setFilter(mg)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === mg
                ? 'bg-accent-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {mg}
          </button>
        ))}
        {customCount > 0 && (
          <button
            onClick={() => setShowCustomOnly(!showCustomOnly)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              showCustomOnly
                ? 'bg-accent-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <SlidersHorizontal size={11} />
            Custom
          </button>
        )}
      </div>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">No exercises found</p>
          {search && (
            <button
              onClick={() => { setShowCreate(true); }}
              className="mt-3 text-accent-400 text-sm underline"
            >
              Create &quot;{search}&quot;
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filter === 'All' ? (
            Object.entries(grouped).map(([group, list]) => (
              <div key={group}>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{group}</p>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {list.map((exercise) => (
                      <ExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        onEdit={() => setEditingExercise(exercise)}
                        onDelete={() => setDeleteId(exercise.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence>
                {filtered.map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={() => setEditingExercise(exercise)}
                    onDelete={() => setDeleteId(exercise.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      <AnimatePresence>
        {(showCreate || editingExercise) && (
          <CreateExerciseModal
            exercise={editingExercise}
            onClose={() => { setShowCreate(false); setEditingExercise(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800"
            >
              <h3 className="text-lg font-bold text-white mb-1">Delete Exercise?</h3>
              <p className="text-sm text-zinc-400 mb-5">This can&apos;t be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteExercise(deleteId); setDeleteId(null); }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
