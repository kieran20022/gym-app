'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Dumbbell, Timer, TrendingUp, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WorkoutSession } from '@/types';
import { formatDate, sessionDuration, formatDuration, sessionVolume, completedSets } from '@/lib/utils';
import { MUSCLE_GROUP_COLORS } from '@/lib/defaultData';

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: () => void;
}) {
  const exercises = useAppStore((s) => s.exercises);
  const [expanded, setExpanded] = useState(false);

  const volume = sessionVolume(session);
  const duration = sessionDuration(session);
  const sets = completedSets(session);

  const exerciseDetails = session.exercises.map((we) => ({
    ...we,
    exercise: exercises.find((e) => e.id === we.exerciseId),
  }));

  const muscleGroups = [...new Set(exerciseDetails.map((e) => e.exercise?.muscleGroup).filter(Boolean))] as string[];

  return (
    <motion.div
      layout
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
    >
      <button
        className="w-full text-left px-4 py-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{session.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{formatDate(session.startedAt)}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <ChevronDown
              size={16}
              className={`text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Timer size={12} className="text-zinc-500" />
            {formatDuration(duration)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Dumbbell size={12} className="text-zinc-500" />
            {sets} sets
          </div>
          {volume > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <TrendingUp size={12} className="text-zinc-500" />
              {volume.toFixed(0)} kg
            </div>
          )}
        </div>

        {/* Muscle groups */}
        {muscleGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {muscleGroups.map((mg) => (
              <span key={mg} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[mg] ?? ''}`}>
                {mg}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-4">
              {exerciseDetails.map((we) => {
                const completedSetsList = we.sets.filter((s) => s.completed);
                if (!we.exercise) return null;
                return (
                  <div key={we.exerciseId}>
                    <p className="text-sm font-semibold text-white mb-1.5">{we.exercise.name}</p>
                    {completedSetsList.length === 0 ? (
                      <p className="text-xs text-zinc-600">No sets completed</p>
                    ) : (
                      <div className="space-y-1">
                        {completedSetsList.map((set, i) => (
                          <div key={set.id} className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="text-zinc-600 w-12">Set {i + 1}</span>
                            <span className="font-medium text-white">
                              {typeof set.weight === 'number' ? `${set.weight} kg` : '—'}
                              {' × '}
                              {typeof set.reps === 'number' ? `${set.reps} reps` : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoryPage() {
  const history = useAppStore((s) => s.history);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // We'll need a way to delete sessions — let's read the store
  const store = useAppStore();

  function deleteSession(id: string) {
    // We'll manually update the store - zustand lets us do this via setState
    useAppStore.setState((state) => ({
      history: state.history.filter((s) => s.id !== id),
    }));
  }

  return (
    <div className="px-4 pt-14 pb-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-zinc-500 text-sm">{history.length} workouts logged</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">History</h1>
      </div>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Calendar size={28} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">No workouts yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Complete your first workout and it will show up here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {history.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => setDeleteId(session.id)}
            />
          ))}
        </div>
      )}

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
              <h3 className="text-lg font-bold text-white mb-1">Delete Workout?</h3>
              <p className="text-sm text-zinc-400 mb-5">This can&apos;t be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteSession(deleteId); setDeleteId(null); }}
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
