'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Exercise,
  WorkoutTemplate,
  WorkoutSession,
  ActiveWorkout,
  WorkoutExercise,
  SetLog,
  SetType,
  TemplateExercise,
} from '@/types';
import { DEFAULT_EXERCISES } from '@/lib/defaultData';
import { generateId } from '@/lib/utils';
import { AccentColor } from '@/lib/themes';

interface Settings {
  accentColor: AccentColor;
  weightUnit: 'kg' | 'lbs';
}

function makeEmptySet(type: SetLog['type'] = 'working'): SetLog {
  return { id: generateId(), type, weight: '', reps: '', completed: false };
}

// Warmup loading percentages and rep targets
const WARMUP_MULTIPLIERS = [0.4, 0.6, 0.75, 0.85, 0.9];
const WARMUP_REPS        = [15,  10,  5,    3,    2  ];

function makePrefilledSet(
  type: SetLog['type'],
  weight: number | '',
  reps: number | '',
): SetLog {
  return { id: generateId(), type, weight, reps, completed: false };
}

/** Build a WorkoutExercise with pre-filled weights/reps from a recommendation */
function makeWorkoutExerciseFromTemplate(
  exerciseId: string,
  warmupSets: number,
  workingSets: number,
  recWeight: number | '',
  recReps: number | '',
  increment: number,
): WorkoutExercise {
  const sets: SetLog[] = [];

  for (let i = 0; i < warmupSets; i++) {
    const mult  = WARMUP_MULTIPLIERS[Math.min(i, WARMUP_MULTIPLIERS.length - 1)];
    const wReps = WARMUP_REPS[Math.min(i, WARMUP_REPS.length - 1)];
    const wWeight: number | '' =
      typeof recWeight === 'number' && recWeight > 0
        ? Math.max(increment, Math.round((recWeight * mult) / increment) * increment)
        : '';
    sets.push(makePrefilledSet('warmup', wWeight, wReps));
  }

  for (let i = 0; i < workingSets; i++) {
    sets.push(makePrefilledSet('working', recWeight, recReps));
  }

  return { exerciseId, notes: '', sets };
}

/** Empty exercise for ad-hoc addition during a workout */
function makeWorkoutExercise(exerciseId: string, sets = 3): WorkoutExercise {
  return {
    exerciseId,
    notes: '',
    sets: Array.from({ length: sets }, () => makeEmptySet('working')),
  };
}

/**
 * Progressive overload recommendation:
 * - If the user completed all working sets at >= repRangeMax last session → add increment
 * - Otherwise → same weight, aim for one more rep per set
 */
function getRecommendation(
  exerciseId: string,
  history: WorkoutSession[],
  repRangeMin: number,
  repRangeMax: number,
  increment: number,
): { recWeight: number | ''; recReps: number | '' } {
  const session = history.find((s) =>
    s.exercises.some(
      (e) => e.exerciseId === exerciseId && e.sets.some((s) => s.completed),
    ),
  );
  if (!session) return { recWeight: '', recReps: repRangeMin };

  const we = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (!we) return { recWeight: '', recReps: repRangeMin };

  const workingSets = we.sets.filter(
    (s) => s.completed && (s.type ?? 'working') === 'working' && typeof s.weight === 'number',
  );
  if (!workingSets.length) return { recWeight: '', recReps: repRangeMin };

  const maxWeight = Math.max(...workingSets.map((s) => s.weight as number));
  const setsAtMax  = workingSets.filter((s) => s.weight === maxWeight);
  const allHitTop  = setsAtMax.every((s) => typeof s.reps === 'number' && s.reps >= repRangeMax);

  if (allHitTop) {
    return { recWeight: maxWeight + increment, recReps: repRangeMin };
  }

  const avgReps =
    setsAtMax.reduce((t, s) => t + (typeof s.reps === 'number' ? s.reps : 0), 0) /
    setsAtMax.length;
  return {
    recWeight: maxWeight,
    recReps: Math.min(Math.round(avgReps) + 1, repRangeMax),
  };
}

interface AppState {
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  history: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  isWorkoutExpanded: boolean;

  // Exercises
  addExercise: (data: Omit<Exercise, 'id' | 'isCustom'>) => void;
  updateExercise: (id: string, data: Partial<Omit<Exercise, 'id' | 'isCustom'>>) => void;
  deleteExercise: (id: string) => void;

  // Templates
  addTemplate: (name: string, exercises: TemplateExercise[]) => void;
  updateTemplate: (id: string, name: string, exercises: TemplateExercise[]) => void;
  deleteTemplate: (id: string) => void;

  // Active Workout
  startWorkout: (name: string, exercises: WorkoutExercise[], templateId?: string) => void;
  startFromTemplate: (templateId: string) => void;
  startEmptyWorkout: () => void;
  setWorkoutExpanded: (expanded: boolean) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;

  // Active Workout - exercises
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  reorderExercises: (exercises: WorkoutExercise[]) => void;
  updateWorkoutExerciseNotes: (exerciseId: string, notes: string) => void;

  // Active Workout - sets
  addSet: (exerciseId: string, type?: SetType) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<Omit<SetLog, 'id'>>) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;

  // Helpers
  getPreviousSets: (exerciseId: string) => SetLog[] | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_EXERCISES,
      templates: [],
      history: [],
      activeWorkout: null,
      isWorkoutExpanded: false,
      settings: { accentColor: 'indigo', weightUnit: 'kg' },

      // --- Exercises ---
      addExercise: (data) =>
        set((state) => ({
          exercises: [...state.exercises, { ...data, id: generateId(), isCustom: true }],
        })),

      updateExercise: (id, data) =>
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        })),

      // --- Templates ---
      addTemplate: (name, exercises) =>
        set((state) => ({
          templates: [
            ...state.templates,
            { id: generateId(), name, exercises, createdAt: Date.now() },
          ],
        })),

      updateTemplate: (id, name, exercises) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, name, exercises } : t
          ),
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      // --- Active Workout ---
      startWorkout: (name, exercises, templateId) =>
        set({
          activeWorkout: { name, exercises, templateId, startedAt: Date.now() },
          isWorkoutExpanded: true,
        }),

      startFromTemplate: (templateId) => {
        const state = get();
        const template = state.templates.find((t) => t.id === templateId);
        if (!template) return;

        const exercises = template.exercises.map((te) => {
          // Graceful fallback for templates saved before the new schema
          const warmupSets  = te.warmupSets  ?? 0;
          const workingSets = te.workingSets ?? (te as unknown as { sets?: number }).sets ?? 3;
          const repRangeMin = te.repRangeMin ?? 8;
          const repRangeMax = te.repRangeMax ?? 12;
          const increment   = te.increment   ?? 2.5;

          const { recWeight, recReps } = getRecommendation(
            te.exerciseId, state.history, repRangeMin, repRangeMax, increment,
          );

          return makeWorkoutExerciseFromTemplate(
            te.exerciseId, warmupSets, workingSets, recWeight, recReps, increment,
          );
        });

        set({
          activeWorkout: { name: template.name, exercises, templateId, startedAt: Date.now() },
          isWorkoutExpanded: true,
        });
      },

      startEmptyWorkout: () =>
        set({
          activeWorkout: {
            name: 'Quick Workout',
            exercises: [],
            startedAt: Date.now(),
          },
          isWorkoutExpanded: true,
        }),

      setWorkoutExpanded: (expanded) => set({ isWorkoutExpanded: expanded }),

      cancelWorkout: () => set({ activeWorkout: null, isWorkoutExpanded: false }),

      finishWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const session: WorkoutSession = {
          id: generateId(),
          templateId: activeWorkout.templateId,
          name: activeWorkout.name,
          exercises: activeWorkout.exercises,
          startedAt: activeWorkout.startedAt,
          finishedAt: Date.now(),
        };
        set((state) => ({
          history: [session, ...state.history],
          activeWorkout: null,
          isWorkoutExpanded: false,
        }));
      },

      // --- Active Workout - exercises ---
      addExerciseToWorkout: (exerciseId) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [
                ...state.activeWorkout.exercises,
                makeWorkoutExercise(exerciseId, 3),
              ],
            },
          };
        }),

      reorderExercises: (exercises) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return { activeWorkout: { ...state.activeWorkout, exercises } };
        }),

      removeExerciseFromWorkout: (exerciseId) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.filter(
                (e) => e.exerciseId !== exerciseId
              ),
            },
          };
        }),

      updateWorkoutExerciseNotes: (exerciseId, notes) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((e) =>
                e.exerciseId === exerciseId ? { ...e, notes } : e
              ),
            },
          };
        }),

      // --- Active Workout - sets ---
      addSet: (exerciseId, type = 'working') =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? { ...e, sets: [...e.sets, makeEmptySet(type)] }
                  : e
              ),
            },
          };
        }),

      removeSet: (exerciseId, setId) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
                  : e
              ),
            },
          };
        }),

      updateSet: (exerciseId, setId, data) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? {
                      ...e,
                      sets: e.sets.map((s) =>
                        s.id === setId ? { ...s, ...data } : s
                      ),
                    }
                  : e
              ),
            },
          };
        }),

      toggleSetComplete: (exerciseId, setId) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? {
                      ...e,
                      sets: e.sets.map((s) =>
                        s.id === setId ? { ...s, completed: !s.completed } : s
                      ),
                    }
                  : e
              ),
            },
          };
        }),

      // --- Settings ---
      updateSettings: (data) =>
        set((state) => ({ settings: { ...state.settings, ...data } })),

      // --- Helpers ---
      getPreviousSets: (exerciseId) => {
        const { history } = get();
        for (const session of history) {
          const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
          if (ex && ex.sets.length > 0) return ex.sets;
        }
        return null;
      },
    }),
    {
      name: 'gym-app-storage',
      skipHydration: true,
    }
  )
);
