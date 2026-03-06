'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Exercise, Equipment, MuscleGroup } from '@/types';
import { MUSCLE_GROUPS, EQUIPMENT_LIST } from '@/lib/defaultData';

interface Props {
  exercise?: Exercise;
  onClose: () => void;
}

export default function CreateExerciseModal({ exercise, onClose }: Props) {
  const addExercise = useAppStore((s) => s.addExercise);
  const updateExercise = useAppStore((s) => s.updateExercise);

  const [name, setName] = useState(exercise?.name ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(exercise?.muscleGroup ?? 'Chest');
  const [equipment, setEquipment] = useState<Equipment>(exercise?.equipment ?? 'Barbell');

  const isEditing = !!exercise;

  function handleSave() {
    if (!name.trim()) return;
    if (isEditing && exercise) {
      updateExercise(exercise.id, { name: name.trim(), muscleGroup, equipment });
    } else {
      addExercise({ name: name.trim(), muscleGroup, equipment });
    }
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full bg-zinc-900 rounded-t-2xl px-4 pt-4 pb-10 border-t border-zinc-800"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Edit Exercise' : 'New Exercise'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Exercise Name
            </label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus-accent transition-colors placeholder:text-zinc-500"
              placeholder="e.g. Incline Bench Press"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Muscle Group
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setMuscleGroup(mg)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    muscleGroup === mg
                      ? 'bg-accent-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Equipment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_LIST.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setEquipment(eq)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    equipment === eq
                      ? 'bg-accent-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
          >
            {isEditing ? 'Save Changes' : 'Create Exercise'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
