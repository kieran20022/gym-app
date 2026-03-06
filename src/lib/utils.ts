import { WorkoutSession } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s < 10 ? '0' + s : s}s`;
  return `${s}s`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function sessionDuration(session: WorkoutSession): number {
  return Math.floor((session.finishedAt - session.startedAt) / 1000);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((setTotal, set) => {
        if (
          set.completed &&
          typeof set.weight === 'number' &&
          typeof set.reps === 'number'
        ) {
          return setTotal + set.weight * set.reps;
        }
        return setTotal;
      }, 0)
    );
  }, 0);
}

export function completedSets(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets.filter((s) => s.completed).length;
  }, 0);
}
