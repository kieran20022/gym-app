'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Exercise, MuscleGroup } from '@/types';
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUPS } from '@/lib/defaultData';

interface Props {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  selectedIds?: string[];
  multiSelect?: boolean;
}

export default function ExercisePicker({ onSelect, onClose, selectedIds = [], multiSelect = false }: Props) {
  const exercises = useAppStore((s) => s.exercises);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'All'>('All');

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.muscleGroup === filter;
    return matchSearch && matchFilter;
  });

  const grouped = MUSCLE_GROUPS.reduce<Record<string, Exercise[]>>((acc, mg) => {
    const list = filtered.filter((e) => e.muscleGroup === mg);
    if (list.length) acc[mg] = list;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="mt-auto bg-zinc-900 rounded-t-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Add Exercise</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-zinc-400 flex-shrink-0" />
            <input
              className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-zinc-500"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-zinc-400">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {(['All', ...MUSCLE_GROUPS] as const).map((mg) => (
            <button
              key={mg}
              onClick={() => setFilter(mg)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === mg
                  ? 'bg-accent-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {mg}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group} className="mb-4">
              {filter === 'All' && (
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  {group}
                </p>
              )}
              <div className="space-y-1">
                {list.map((exercise) => {
                  const isSelected = selectedIds.includes(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      onClick={() => onSelect(exercise)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-muted)] border border-[var(--accent-border)]'
                          : 'bg-zinc-800/60 hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{exercise.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{exercise.equipment}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}`}>
                          {exercise.muscleGroup}
                        </span>
                        {isSelected ? (
                          <Check size={16} className="text-accent-400" />
                        ) : (
                          <Plus size={16} className="text-zinc-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-8">No exercises found</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
