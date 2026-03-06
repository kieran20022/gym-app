'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Dumbbell, Settings2, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Exercise, TemplateExercise, WorkoutTemplate } from '@/types';
import ExercisePicker from '@/components/ExercisePicker';

interface Props {
  template?: WorkoutTemplate;
  onClose: () => void;
}

interface TEState {
  exerciseId: string;
  exercise?: Exercise;
  warmupSets: number;
  workingSets: number;
  repRangeMin: number;
  repRangeMax: number;
  increment: number;
}

const REP_PRESETS = [
  { label: 'Strength',     min: 1,  max: 5  },
  { label: 'Power',        min: 3,  max: 6  },
  { label: 'Hypertrophy',  min: 8,  max: 12 },
  { label: 'Endurance',    min: 15, max: 20 },
];

function Stepper({
  value,
  min = 0,
  max = 20,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-zinc-700/60 rounded-lg">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
      >
        <Minus size={12} />
      </button>
      <span className="w-6 text-center text-sm font-bold text-white tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

function ExerciseRow({
  te,
  onChange,
  onRemove,
}: {
  te: TEState;
  onChange: (updated: Partial<TEState>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalSets = te.warmupSets + te.workingSets;

  return (
    <div className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700/50">
      {/* Collapsed header */}
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{te.exercise?.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500">{te.exercise?.muscleGroup} · {te.exercise?.equipment}</span>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {te.warmupSets > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              {te.warmupSets}W
            </span>
          )}
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-300">
            {te.workingSets}×{te.repRangeMin}-{te.repRangeMax}
          </span>
          <span className="text-[10px] text-zinc-500">+{te.increment}kg</span>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className={`p-1.5 rounded-lg transition-colors ${expanded ? 'bg-accent-600/20 text-accent-400' : 'hover:bg-zinc-700 text-zinc-500 hover:text-white'}`}
        >
          <Settings2 size={14} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-600 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Expanded config */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-zinc-700/50 pt-3 space-y-4">

              {/* Sets row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-20">Warmup sets</span>
                  <Stepper value={te.warmupSets} min={0} max={5} onChange={(v) => onChange({ warmupSets: v })} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-20">Working sets</span>
                  <Stepper value={te.workingSets} min={1} max={10} onChange={(v) => onChange({ workingSets: v })} />
                </div>
              </div>

              {/* Rep range */}
              <div>
                <p className="text-xs text-zinc-400 mb-2">Rep range</p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={te.repRangeMin}
                    min={1}
                    max={te.repRangeMax - 1}
                    onChange={(e) => onChange({ repRangeMin: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-14 text-center bg-zinc-700 border border-zinc-600 text-white rounded-lg py-1.5 text-sm font-bold outline-none focus-accent"
                  />
                  <span className="text-zinc-500 text-sm">to</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={te.repRangeMax}
                    min={te.repRangeMin + 1}
                    onChange={(e) => onChange({ repRangeMax: Math.max(te.repRangeMin + 1, parseInt(e.target.value) || te.repRangeMin + 1) })}
                    className="w-14 text-center bg-zinc-700 border border-zinc-600 text-white rounded-lg py-1.5 text-sm font-bold outline-none focus-accent"
                  />
                  <span className="text-xs text-zinc-500">reps</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {REP_PRESETS.map((p) => {
                    const active = te.repRangeMin === p.min && te.repRangeMax === p.max;
                    return (
                      <button
                        key={p.label}
                        onClick={() => onChange({ repRangeMin: p.min, repRangeMax: p.max })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          active ? 'bg-accent-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                        }`}
                      >
                        {p.label} {p.min}–{p.max}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Increment */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Weight increment</span>
                <div className="flex items-center gap-1.5">
                  {[1.25, 2.5, 5, 10].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => onChange({ increment: inc })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        te.increment === inc ? 'bg-accent-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                      }`}
                    >
                      +{inc}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={te.increment}
                      min={0.25}
                      step={0.25}
                      onChange={(e) => onChange({ increment: Math.max(0.25, parseFloat(e.target.value) || 0.25) })}
                      className="w-14 text-center bg-zinc-700 border border-zinc-600 text-white rounded-lg py-1 text-xs font-bold outline-none focus-accent"
                    />
                    <span className="text-xs text-zinc-500">kg</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateWorkoutModal({ template, onClose }: Props) {
  const exercises = useAppStore((s) => s.exercises);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const updateTemplate = useAppStore((s) => s.updateTemplate);

  const isEditing = !!template;

  const [name, setName] = useState(template?.name ?? '');
  const [templateExercises, setTemplateExercises] = useState<TEState[]>(
    template?.exercises.map((te) => ({
      exerciseId: te.exerciseId,
      exercise: exercises.find((e) => e.id === te.exerciseId),
      warmupSets:  te.warmupSets  ?? 0,
      workingSets: te.workingSets ?? (te as unknown as { sets?: number }).sets ?? 3,
      repRangeMin: te.repRangeMin ?? 8,
      repRangeMax: te.repRangeMax ?? 12,
      increment:   te.increment   ?? 2.5,
    })) ?? []
  );
  const [showPicker, setShowPicker] = useState(false);

  const selectedIds = templateExercises.map((te) => te.exerciseId);

  function handleAddExercise(exercise: Exercise) {
    if (selectedIds.includes(exercise.id)) return;
    setTemplateExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, exercise, warmupSets: 0, workingSets: 3, repRangeMin: 8, repRangeMax: 12, increment: 2.5 },
    ]);
  }

  function handleChange(exerciseId: string, updated: Partial<TEState>) {
    setTemplateExercises((prev) =>
      prev.map((te) => (te.exerciseId === exerciseId ? { ...te, ...updated } : te))
    );
  }

  function handleSave() {
    if (!name.trim() || templateExercises.length === 0) return;
    const data: TemplateExercise[] = templateExercises.map(({ exerciseId, warmupSets, workingSets, repRangeMin, repRangeMax, increment }) => ({
      exerciseId, warmupSets, workingSets, repRangeMin, repRangeMax, increment,
    }));
    if (isEditing && template) {
      updateTemplate(template.id, name.trim(), data);
    } else {
      addTemplate(name.trim(), data);
    }
    onClose();
  }

  return (
    <>
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
          style={{ maxHeight: '92vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0">
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Workout' : 'New Workout'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Workout Name
              </label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus-accent transition-colors placeholder:text-zinc-500"
                placeholder="e.g. Push Day, Leg Day..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Exercises */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Exercises ({templateExercises.length})
                </label>
                <span className="text-xs text-zinc-600">Tap ⚙ to configure sets &amp; reps</span>
              </div>

              {templateExercises.length === 0 && (
                <div className="bg-zinc-800/50 rounded-xl p-6 flex flex-col items-center gap-2 border border-zinc-800 border-dashed">
                  <Dumbbell size={24} className="text-zinc-600" />
                  <p className="text-sm text-zinc-500">No exercises added yet</p>
                </div>
              )}

              <div className="space-y-2">
                {templateExercises.map((te) => (
                  <ExerciseRow
                    key={te.exerciseId}
                    te={te}
                    onChange={(updated) => handleChange(te.exerciseId, updated)}
                    onRemove={() => setTemplateExercises((prev) => prev.filter((e) => e.exerciseId !== te.exerciseId))}
                  />
                ))}
              </div>

              <button
                onClick={() => setShowPicker(true)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 border-dashed text-accent-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="px-4 pb-8 pt-2 border-t border-zinc-800 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={!name.trim() || templateExercises.length === 0}
              className="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Workout'}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            onSelect={(exercise) => handleAddExercise(exercise)}
            onClose={() => setShowPicker(false)}
            selectedIds={selectedIds}
            multiSelect
          />
        )}
      </AnimatePresence>
    </>
  );
}
