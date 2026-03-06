import { Exercise } from '@/types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'e1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', isCustom: false },
  { id: 'e2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', isCustom: false },
  { id: 'e3', name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable', isCustom: false },
  { id: 'e4', name: 'Push-Up', muscleGroup: 'Chest', equipment: 'Bodyweight', isCustom: false },
  { id: 'e5', name: 'Chest Dip', muscleGroup: 'Chest', equipment: 'Bodyweight', isCustom: false },
  { id: 'e6', name: 'Pec Deck', muscleGroup: 'Chest', equipment: 'Machine', isCustom: false },

  // Back
  { id: 'e7', name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', isCustom: false },
  { id: 'e8', name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', isCustom: false },
  { id: 'e9', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', isCustom: false },
  { id: 'e10', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', isCustom: false },
  { id: 'e11', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', isCustom: false },
  { id: 'e12', name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', isCustom: false },

  // Shoulders
  { id: 'e13', name: 'Barbell Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { id: 'e14', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { id: 'e15', name: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable', isCustom: false },
  { id: 'e16', name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { id: 'e17', name: 'Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },

  // Legs
  { id: 'e18', name: 'Barbell Squat', muscleGroup: 'Legs', equipment: 'Barbell', isCustom: false },
  { id: 'e19', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'e20', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', isCustom: false },
  { id: 'e21', name: 'Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'e22', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'e23', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'e24', name: 'Walking Lunge', muscleGroup: 'Legs', equipment: 'Dumbbell', isCustom: false },
  { id: 'e25', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', isCustom: false },

  // Biceps
  { id: 'e26', name: 'Barbell Curl', muscleGroup: 'Biceps', equipment: 'Barbell', isCustom: false },
  { id: 'e27', name: 'Dumbbell Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { id: 'e28', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { id: 'e29', name: 'Cable Curl', muscleGroup: 'Biceps', equipment: 'Cable', isCustom: false },

  // Triceps
  { id: 'e30', name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', isCustom: false },
  { id: 'e31', name: 'Skull Crusher', muscleGroup: 'Triceps', equipment: 'Barbell', isCustom: false },
  { id: 'e32', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell', isCustom: false },
  { id: 'e33', name: 'Diamond Push-Up', muscleGroup: 'Triceps', equipment: 'Bodyweight', isCustom: false },

  // Core
  { id: 'e34', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'e35', name: 'Crunch', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'e36', name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'e37', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'e38', name: 'Ab Wheel Rollout', muscleGroup: 'Core', equipment: 'Other', isCustom: false },

  // Cardio
  { id: 'e39', name: 'Treadmill', muscleGroup: 'Cardio', equipment: 'Machine', isCustom: false },
  { id: 'e40', name: 'Cycling', muscleGroup: 'Cardio', equipment: 'Machine', isCustom: false },
  { id: 'e41', name: 'Rowing Machine', muscleGroup: 'Cardio', equipment: 'Machine', isCustom: false },
  { id: 'e42', name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Other', isCustom: false },
];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body', 'Other',
] as const;

export const EQUIPMENT_LIST = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Resistance Band', 'Other',
] as const;

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: 'bg-rose-500/20 text-rose-400',
  Back: 'bg-blue-500/20 text-blue-400',
  Shoulders: 'bg-amber-500/20 text-amber-400',
  Legs: 'bg-green-500/20 text-green-400',
  Biceps: 'bg-purple-500/20 text-purple-400',
  Triceps: 'bg-violet-500/20 text-violet-400',
  Core: 'bg-orange-500/20 text-orange-400',
  Cardio: 'bg-cyan-500/20 text-cyan-400',
  'Full Body': 'bg-indigo-500/20 text-indigo-400',
  Other: 'bg-zinc-500/20 text-zinc-400',
};
