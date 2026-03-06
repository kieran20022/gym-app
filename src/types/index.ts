export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Legs'
  | 'Biceps'
  | 'Triceps'
  | 'Core'
  | 'Cardio'
  | 'Full Body'
  | 'Other';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
}

export type SetType = 'warmup' | 'working';

export interface SetLog {
  id: string;
  type: SetType;
  weight: number | '';
  reps: number | '';
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: SetLog[];
  notes: string;
}

export interface TemplateExercise {
  exerciseId: string;
  warmupSets: number;
  workingSets: number;
  repRangeMin: number;
  repRangeMax: number;
  increment: number; // kg or lbs added when progressive overload is achieved
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: number;
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  exercises: WorkoutExercise[];
  startedAt: number;
  finishedAt: number;
}

export interface ActiveWorkout {
  templateId?: string;
  name: string;
  exercises: WorkoutExercise[];
  startedAt: number;
}
