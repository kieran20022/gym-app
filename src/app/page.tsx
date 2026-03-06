'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Flame, Calendar, TrendingUp, ChevronRight, Play, BookOpen, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, sessionDuration, formatDuration, sessionVolume } from '@/lib/utils';
import CreateWorkoutModal from '@/components/modals/CreateWorkoutModal';
import Link from 'next/link';

export default function HomePage() {
  const templates = useAppStore((s) => s.templates);
  const history = useAppStore((s) => s.history);
  const exercises = useAppStore((s) => s.exercises);
  const startFromTemplate = useAppStore((s) => s.startFromTemplate);
  const startEmptyWorkout = useAppStore((s) => s.startEmptyWorkout);
  const activeWorkout = useAppStore((s) => s.activeWorkout);

  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const now = Date.now();
  const weekStart = now - 7 * 86400000;
  const workoutsThisWeek = history.filter((s) => s.startedAt >= weekStart).length;
  const recentHistory = history.slice(0, 3);

  function getExerciseNames(session: (typeof history)[0]) {
    const names = session.exercises
      .slice(0, 3)
      .map((e) => exercises.find((ex) => ex.id === e.exerciseId)?.name ?? 'Unknown');
    const extra = session.exercises.length - 3;
    return names.join(', ') + (extra > 0 ? ` +${extra} more` : '');
  }

  return (
    <div className="px-4 pt-14 space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-sm">Ready to train?</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
        </div>
        <Link href="/settings" className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors mt-1">
          <Settings size={20} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-2xl p-3.5 border border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center mb-2">
            <Flame size={16} className="text-accent-400" />
          </div>
          <p className="text-xl font-bold text-white">{workoutsThisWeek}</p>
          <p className="text-xs text-zinc-500 mt-0.5">This week</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-3.5 border border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-xl font-bold text-white">{history.length}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Total</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-3.5 border border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center mb-2">
            <Dumbbell size={16} className="text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">{templates.length}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Templates</p>
        </div>
      </div>

      {/* Start Workout */}
      {!activeWorkout && (
        <div>
          <button
            onClick={() => setShowStartPicker(!showStartPicker)}
            className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-[var(--accent-shadow)]"
          >
            <Play size={18} fill="white" />
            Start Workout
          </button>

          <AnimatePresence>
            {showStartPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
              >
                <button
                  onClick={() => { startEmptyWorkout(); setShowStartPicker(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Plus size={16} className="text-zinc-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Empty Workout</span>
                </button>
                {templates.length === 0 && (
                  <div className="px-4 py-3 text-xs text-zinc-500">
                    No templates yet —{' '}
                    <Link href="/workouts" className="text-accent-400 underline">
                      create one
                    </Link>
                  </div>
                )}
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { startFromTemplate(t.id); setShowStartPicker(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                      <Dumbbell size={14} className="text-accent-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.exercises.length} exercises</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recent Workouts</h2>
          {history.length > 3 && (
            <Link href="/history" className="text-xs text-accent-400 flex items-center gap-0.5">
              See all <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {recentHistory.length === 0 ? (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
            <Calendar size={28} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No workouts yet</p>
            <p className="text-xs text-zinc-600 mt-1">Start your first workout above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentHistory.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-2xl px-4 py-3.5 border border-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{session.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatDate(session.startedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-zinc-400">{formatDuration(sessionDuration(session))}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{sessionVolume(session).toFixed(0)} kg vol.</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2 truncate">{getExerciseNames(session)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCreateWorkout(true)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 hover:bg-zinc-800 transition-colors text-left"
          >
            <Plus size={20} className="text-accent-400" />
            <p className="text-sm font-semibold text-white">New Template</p>
            <p className="text-xs text-zinc-500">Create a reusable workout</p>
          </button>
          <Link
            href="/exercises"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 hover:bg-zinc-800 transition-colors"
          >
            <BookOpen size={20} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Exercise Library</p>
            <p className="text-xs text-zinc-500">Browse & add exercises</p>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showCreateWorkout && (
          <CreateWorkoutModal onClose={() => setShowCreateWorkout(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
