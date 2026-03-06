'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, X, Search, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WorkoutSession, SetLog } from '@/types';
import { CHART_COLORS } from '@/lib/themes';
import { MUSCLE_GROUP_COLORS } from '@/lib/defaultData';

type Metric = 'maxWeight' | 'volume' | 'maxReps' | 'estimated1RM';

const METRIC_LABELS: Record<Metric, string> = {
  maxWeight:    'Max Weight (kg)',
  volume:       'Total Volume (kg)',
  maxReps:      'Max Reps',
  estimated1RM: 'Est. 1RM (kg)',
};

function getMetricValue(sets: SetLog[], metric: Metric): number | null {
  const completed = sets.filter((s) => s.completed);
  if (completed.length === 0) return null;

  switch (metric) {
    case 'maxWeight':
      return Math.max(
        ...completed
          .filter((s) => typeof s.weight === 'number')
          .map((s) => s.weight as number)
      );
    case 'volume':
      return completed.reduce((t, s) => {
        if (typeof s.weight === 'number' && typeof s.reps === 'number')
          return t + s.weight * s.reps;
        return t;
      }, 0);
    case 'maxReps':
      return Math.max(
        ...completed
          .filter((s) => typeof s.reps === 'number')
          .map((s) => s.reps as number)
      );
    case 'estimated1RM':
      return Math.max(
        ...completed
          .filter((s) => typeof s.weight === 'number' && typeof s.reps === 'number')
          .map((s) => {
            const w = s.weight as number;
            const r = s.reps as number;
            return r === 1 ? w : w * (1 + r / 30);
          })
      );
  }
}

function buildChartData(
  selectedIds: string[],
  exerciseNames: Record<string, string>,
  history: WorkoutSession[],
  metric: Metric
) {
  // Collect all dates across selected exercises
  const dateMap = new Map<string, Record<string, number>>();

  for (const session of history) {
    const dateKey = new Date(session.startedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    for (const exId of selectedIds) {
      const we = session.exercises.find((e) => e.exerciseId === exId);
      if (!we) continue;
      const val = getMetricValue(we.sets, metric);
      if (val === null) continue;

      const name = exerciseNames[exId] ?? exId;
      const existing = dateMap.get(dateKey) ?? {};
      // Keep the best value for that day
      existing[name] = Math.max(existing[name] ?? 0, val);
      dateMap.set(dateKey, existing);
    }
  }

  // Sort by date and convert to array
  const sessions = [...history].sort((a, b) => a.startedAt - b.startedAt);
  const orderedDates: string[] = [];
  const seen = new Set<string>();

  for (const s of sessions) {
    const k = new Date(s.startedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!seen.has(k)) { seen.add(k); orderedDates.push(k); }
  }

  return orderedDates
    .filter((d) => dateMap.has(d))
    .map((date) => ({ date, ...dateMap.get(date) }));
}

// Custom tooltip
function CustomTooltip({ active, payload, label, metric }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-zinc-300 truncate max-w-[120px]">{p.name}</span>
          <span className="font-bold text-white ml-auto pl-2">
            {metric === 'volume' ? `${p.value.toFixed(0)} kg` :
             metric === 'maxReps' ? `${p.value} reps` :
             `${p.value.toFixed(1)} kg`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const history = useAppStore((s) => s.history);
  const exercises = useAppStore((s) => s.exercises);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [metric, setMetric] = useState<Metric>('maxWeight');
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // Only show exercises that appear in history
  const usedExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const session of history) {
      for (const we of session.exercises) {
        if (we.sets.some((s) => s.completed)) ids.add(we.exerciseId);
      }
    }
    return ids;
  }, [history]);

  const usedExercises = exercises.filter((e) => usedExerciseIds.has(e.id));

  const exerciseNames = useMemo(
    () => Object.fromEntries(exercises.map((e) => [e.id, e.name])),
    [exercises]
  );

  const chartData = useMemo(
    () => buildChartData(selectedIds, exerciseNames, history, metric),
    [selectedIds, exerciseNames, history, metric]
  );

  const filteredPicker = usedExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleExercise(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const hasData = chartData.length >= 2 && selectedIds.length > 0;

  return (
    <div className="px-4 pt-14 pb-8">
      {/* Header */}
      <div className="mb-5">
        <p className="text-zinc-500 text-sm">Track your gains</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Progress</h1>
      </div>

      {usedExercises.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <TrendingUp size={28} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">No data yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Complete workouts with logged sets to see your progress here
          </p>
        </motion.div>
      ) : (
        <>
          {/* Exercise selector */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedIds.map((id, idx) => {
                const ex = exercises.find((e) => e.id === id);
                return (
                  <motion.div
                    key={id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] + '33', border: `1px solid ${CHART_COLORS[idx % CHART_COLORS.length]}66` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    {ex?.name ?? id}
                    <button
                      onClick={() => toggleExercise(id)}
                      className="ml-0.5 text-white/50 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                );
              })}
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700"
              >
                + Add Exercise
                <ChevronDown size={12} className={`transition-transform ${showPicker ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Exercise picker dropdown */}
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4"
                >
                  <div className="p-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
                      <Search size={14} className="text-zinc-500" />
                      <input
                        className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-zinc-500"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredPicker.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">No exercises found</p>
                    )}
                    {filteredPicker.map((ex, idx) => {
                      const isSelected = selectedIds.includes(ex.id);
                      const colorIdx = selectedIds.indexOf(ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => toggleExercise(ex.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 border-2"
                            style={isSelected ? {
                              backgroundColor: CHART_COLORS[colorIdx % CHART_COLORS.length],
                              borderColor: CHART_COLORS[colorIdx % CHART_COLORS.length],
                            } : { borderColor: '#52525b', backgroundColor: 'transparent' }}
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-white">{ex.name}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[ex.muscleGroup]}`}>
                            {ex.muscleGroup}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metric selector */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-5 pb-1">
            {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  metric === m
                    ? 'bg-accent-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            {selectedIds.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <TrendingUp size={28} className="text-zinc-700" />
                <p className="text-sm text-zinc-500">Select an exercise above</p>
              </div>
            ) : !hasData ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <p className="text-sm text-zinc-500">Not enough data points yet</p>
                <p className="text-xs text-zinc-600">Log at least 2 sessions to see trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip metric={metric} />} />
                  {selectedIds.length > 1 && (
                    <Legend
                      wrapperStyle={{ fontSize: 10, color: '#a1a1aa', paddingTop: 8 }}
                    />
                  )}
                  {selectedIds.map((id, idx) => {
                    const name = exerciseNames[id] ?? id;
                    return (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: CHART_COLORS[idx % CHART_COLORS.length], strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Per-exercise stats cards */}
          {selectedIds.length > 0 && (
            <div className="mt-4 space-y-3">
              {selectedIds.map((id, idx) => {
                const ex = exercises.find((e) => e.id === id);
                const sessions = history.filter((s) =>
                  s.exercises.some((we) => we.exerciseId === id && we.sets.some((s) => s.completed))
                );
                const allValues = sessions.flatMap((s) => {
                  const we = s.exercises.find((e) => e.exerciseId === id);
                  return we ? [getMetricValue(we.sets, metric)] : [];
                }).filter((v): v is number => v !== null);

                const best = allValues.length ? Math.max(...allValues) : null;
                const latest = allValues.length ? allValues[allValues.length - 1] : null;
                const trend = allValues.length >= 2
                  ? allValues[allValues.length - 1] - allValues[allValues.length - 2]
                  : null;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4"
                    style={{ borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length], borderLeftWidth: 3 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{ex?.name}</p>
                        <p className="text-xs text-zinc-500">{sessions.length} sessions logged</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[ex?.muscleGroup ?? 'Other']}`}>
                        {ex?.muscleGroup}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Best</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {best !== null ? best.toFixed(metric === 'maxReps' ? 0 : 1) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Latest</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {latest !== null ? latest.toFixed(metric === 'maxReps' ? 0 : 1) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Change</p>
                        <p className={`text-base font-bold mt-0.5 ${
                          trend === null ? 'text-zinc-600' :
                          trend > 0 ? 'text-green-400' :
                          trend < 0 ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          {trend === null ? '—' : `${trend > 0 ? '+' : ''}${trend.toFixed(metric === 'maxReps' ? 0 : 1)}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
