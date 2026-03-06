'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Timer,
  Dumbbell,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDuration } from '@/lib/utils';
import { SetLog, WorkoutExercise } from '@/types';
import ExercisePicker from '@/components/ExercisePicker';

function SetRow({
  set,
  workingNumber,
  prevSet,
  exerciseId,
  weightUnit,
}: {
  set: SetLog;
  workingNumber: number | null; // null = warmup
  prevSet?: SetLog;
  exerciseId: string;
  weightUnit: string;
}) {
  const updateSet = useAppStore((s) => s.updateSet);
  const toggleSetComplete = useAppStore((s) => s.toggleSetComplete);
  const removeSet = useAppStore((s) => s.removeSet);

  const isWarmup = (set.type ?? 'working') === 'warmup';

  function toggleType() {
    updateSet(exerciseId, set.id, { type: isWarmup ? 'working' : 'warmup', completed: false });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center gap-2 py-1.5 rounded-lg px-1 transition-opacity ${
        set.completed ? 'opacity-50' : ''
      }`}
    >
      {/* Type badge — tap to toggle warmup/working */}
      <button
        onClick={toggleType}
        title={isWarmup ? 'Warmup set — tap to make working' : 'Working set — tap to make warmup'}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${
          isWarmup
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-zinc-700/60 text-zinc-400 border border-transparent hover:border-zinc-600'
        }`}
      >
        {isWarmup ? 'W' : workingNumber}
      </button>

      {/* Previous */}
      <div className="flex-1 text-center min-w-0">
        {prevSet && typeof prevSet.weight === 'number' && typeof prevSet.reps === 'number' ? (
          <span className="text-xs text-zinc-500 truncate">
            {prevSet.weight}{weightUnit} × {prevSet.reps}
          </span>
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </div>

      {/* Weight */}
      <input
        type="number"
        inputMode="decimal"
        placeholder={weightUnit}
        value={set.weight}
        onChange={(e) =>
          updateSet(exerciseId, set.id, {
            weight: e.target.value === '' ? '' : parseFloat(e.target.value),
          })
        }
        className={`w-14 text-center bg-zinc-800 border rounded-lg py-1.5 text-sm font-semibold outline-none transition-colors ${
          set.completed
            ? 'border-green-600/50 text-green-400'
            : isWarmup
            ? 'border-zinc-700 text-amber-200/80 focus-accent'
            : 'border-zinc-700 text-white focus-accent'
        }`}
      />

      {/* Reps */}
      <input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={set.reps}
        onChange={(e) =>
          updateSet(exerciseId, set.id, {
            reps: e.target.value === '' ? '' : parseInt(e.target.value),
          })
        }
        className={`w-14 text-center bg-zinc-800 border rounded-lg py-1.5 text-sm font-semibold outline-none transition-colors ${
          set.completed
            ? 'border-green-600/50 text-green-400'
            : isWarmup
            ? 'border-zinc-700 text-amber-200/80 focus-accent'
            : 'border-zinc-700 text-white focus-accent'
        }`}
      />

      {/* Complete toggle */}
      <button
        onClick={() => toggleSetComplete(exerciseId, set.id)}
        className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
          set.completed
            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
            : 'bg-zinc-700/60 text-zinc-500 hover:text-zinc-300 border border-transparent'
        }`}
      >
        <Check size={14} strokeWidth={2.5} />
      </button>

      {/* Delete */}
      <button
        onClick={() => removeSet(exerciseId, set.id)}
        className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

function ExerciseBlock({
  we,
  weightUnit,
  dragControls,
}: {
  we: WorkoutExercise;
  weightUnit: string;
  dragControls: ReturnType<typeof useDragControls>;
}) {
  const exerciseId = we.exerciseId;
  const exercises = useAppStore((s) => s.exercises);
  const addSet = useAppStore((s) => s.addSet);
  const removeExerciseFromWorkout = useAppStore((s) => s.removeExerciseFromWorkout);
  const getPreviousSets = useAppStore((s) => s.getPreviousSets);

  const exercise = exercises.find((e) => e.id === exerciseId);
  const prevSets = getPreviousSets(exerciseId);

  if (!exercise) return null;

  const completedCount = we.sets.filter((s) => s.completed).length;
  const workingSetsCount = we.sets.filter((s) => (s.type ?? 'working') === 'working').length;
  const warmupSetsCount = we.sets.length - workingSetsCount;

  let runningWorkingIdx = 0;
  const workingNumbers = we.sets.map((s) => {
    if ((s.type ?? 'working') === 'working') { runningWorkingIdx++; return runningWorkingIdx; }
    return null;
  });

  return (
    <div className="bg-zinc-800/60 rounded-2xl px-4 pt-4 pb-3 border border-zinc-700/50">
      {/* Exercise header */}
      <div className="flex items-center gap-2 mb-3">
        {/* Drag handle */}
        <button
          onPointerDown={(e) => dragControls.start(e)}
          className="touch-none p-1 -ml-1 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{exercise.name}</h3>
          <p className="text-xs text-zinc-500">{exercise.muscleGroup} · {exercise.equipment}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {warmupSetsCount > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              {warmupSetsCount}W
            </span>
          )}
          <span className="text-xs text-zinc-400">
            {completedCount}/{we.sets.length}
          </span>
          <button
            onClick={() => removeExerciseFromWorkout(exerciseId)}
            className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Set header row */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <div className="w-7 text-center text-[10px] text-zinc-600 font-semibold uppercase">Set</div>
        <div className="flex-1 text-center text-[10px] text-zinc-600 font-semibold uppercase">Previous</div>
        <div className="w-14 text-center text-[10px] text-zinc-600 font-semibold uppercase">{weightUnit}</div>
        <div className="w-14 text-center text-[10px] text-zinc-600 font-semibold uppercase">Reps</div>
        <div className="w-7" />
        <div className="w-7" />
      </div>

      {/* Sets */}
      <div className="space-y-0.5">
        <AnimatePresence>
          {we.sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              workingNumber={workingNumbers[i]}
              prevSet={prevSets?.[i]}
              exerciseId={exerciseId}
              weightUnit={weightUnit}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add set buttons */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => addSet(exerciseId, 'warmup')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400/80 hover:text-amber-400 text-xs font-medium transition-colors border border-amber-500/20"
        >
          <Plus size={12} />
          Warmup
        </button>
        <button
          onClick={() => addSet(exerciseId, 'working')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-700/40 hover:bg-zinc-700/60 text-zinc-400 hover:text-white text-xs font-medium transition-colors border border-zinc-700/40"
        >
          <Plus size={12} />
          Working Set
        </button>
      </div>
    </div>
  );
}

/** Thin wrapper so each ExerciseBlock owns its own drag controls */
function DraggableExerciseBlock({ we, weightUnit }: { we: WorkoutExercise; weightUnit: string }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={we}
      dragControls={dragControls}
      dragListener={false}
      className="list-none"
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 10 }}
    >
      <ExerciseBlock we={we} weightUnit={weightUnit} dragControls={dragControls} />
    </Reorder.Item>
  );
}

export default function ActiveWorkoutSheet() {
  const activeWorkout = useAppStore((s) => s.activeWorkout);
  const isExpanded = useAppStore((s) => s.isWorkoutExpanded);
  const setExpanded = useAppStore((s) => s.setWorkoutExpanded);
  const finishWorkout = useAppStore((s) => s.finishWorkout);
  const cancelWorkout = useAppStore((s) => s.cancelWorkout);
  const addExerciseToWorkout = useAppStore((s) => s.addExerciseToWorkout);
  const reorderExercises = useAppStore((s) => s.reorderExercises);
  const weightUnit = useAppStore((s) => s.settings.weightUnit);

  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeWorkout.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startedAt]);

  const completedSets = activeWorkout?.exercises.reduce(
    (t, ex) => t + ex.sets.filter((s) => s.completed).length,
    0
  ) ?? 0;

  const totalSets = activeWorkout?.exercises.reduce(
    (t, ex) => t + ex.sets.length,
    0
  ) ?? 0;

  if (!activeWorkout) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <h1 className="text-base font-bold text-white leading-tight">{activeWorkout.name}</h1>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Timer size={11} />
                    <span>{formatDuration(elapsed)}</span>
                    <span className="mx-1">·</span>
                    <span>{completedSets}/{totalSets} sets</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  onClick={finishWorkout}
                  disabled={completedSets === 0}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Exercises */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
              {activeWorkout.exercises.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Dumbbell size={40} className="text-zinc-700" />
                  <p className="text-zinc-500 text-sm">No exercises yet</p>
                  <p className="text-zinc-600 text-xs">Add exercises to start logging</p>
                </div>
              )}
              <Reorder.Group
                axis="y"
                values={activeWorkout.exercises}
                onReorder={reorderExercises}
                className="space-y-3"
              >
                {activeWorkout.exercises.map((we) => (
                  <DraggableExerciseBlock key={we.exerciseId} we={we} weightUnit={weightUnit} />
                ))}
              </Reorder.Group>

              {/* Add exercise */}
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 border-dashed text-accent-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                <Plus size={18} />
                Add Exercise
              </button>

              {/* Cancel */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 text-red-500 text-sm font-medium hover:text-red-400"
              >
                Cancel Workout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized bar */}
      <AnimatePresence>
        {!isExpanded && activeWorkout && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setExpanded(true)}
            className="fixed bottom-20 left-4 right-4 z-40 bg-accent-600 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl shadow-[var(--accent-shadow)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <div className="text-left">
                <p className="text-sm font-bold text-white">{activeWorkout.name}</p>
                <p className="text-xs text-white/70">{formatDuration(elapsed)} · {completedSets}/{totalSets} sets</p>
              </div>
            </div>
            <ChevronUp size={20} className="text-white/70" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cancel confirm */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800"
            >
              <h3 className="text-lg font-bold text-white mb-1">Cancel Workout?</h3>
              <p className="text-sm text-zinc-400 mb-5">
                Your progress will be lost and the workout won&apos;t be saved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => { cancelWorkout(); setShowCancelConfirm(false); }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise picker */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            onSelect={(exercise) => {
              addExerciseToWorkout(exercise.id);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
            selectedIds={activeWorkout.exercises.map((e) => e.exerciseId)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
