'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Play, Pencil, Trash2, MoreVertical, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WorkoutTemplate } from '@/types';
import CreateWorkoutModal from '@/components/modals/CreateWorkoutModal';
import { MUSCLE_GROUP_COLORS } from '@/lib/defaultData';

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onStart,
}: {
  template: WorkoutTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
}) {
  const exercises = useAppStore((s) => s.exercises);
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const templateExercises = template.exercises.map((te) => ({
    ...te,
    exercise: exercises.find((e) => e.id === te.exerciseId),
  }));

  const muscleGroups = [...new Set(templateExercises.map((te) => te.exercise?.muscleGroup).filter(Boolean))];
  const totalSets = template.exercises.reduce((t, e) => t + (e.warmupSets ?? 0) + (e.workingSets ?? (e as unknown as {sets?:number}).sets ?? 3), 0);

  return (
    <motion.div
      layout
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
    >
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{template.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {template.exercises.length} exercises · {totalSets} sets
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <Play size={12} fill="white" />
              Start
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400"
              >
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-10 z-20 bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden shadow-xl min-w-[140px]"
                    >
                      <button
                        onClick={() => { onEdit(); setShowMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white hover:bg-zinc-700 transition-colors"
                      >
                        <Pencil size={14} className="text-zinc-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => { onDelete(); setShowMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Muscle group badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(muscleGroups as string[]).map((mg) => (
            <span key={mg} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MUSCLE_GROUP_COLORS[mg] ?? ''}`}>
              {mg}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Hide exercises' : 'Show exercises'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-2">
              {templateExercises.map((te, i) => (
                <div key={te.exerciseId} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-5 text-right">{i + 1}.</span>
                  <div className="flex-1">
                    <span className="text-sm text-white">{te.exercise?.name ?? 'Unknown'}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{(te.warmupSets ?? 0) + (te.workingSets ?? (te as unknown as {sets?:number}).sets ?? 3)} sets</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WorkoutsPage() {
  const templates = useAppStore((s) => s.templates);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);
  const startFromTemplate = useAppStore((s) => s.startFromTemplate);

  const [showCreate, setShowCreate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="px-4 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-zinc-500 text-sm">Saved templates</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Workouts</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-xl bg-accent-600 hover:bg-accent-500 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Dumbbell size={28} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">No workout templates</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Create a template to quickly start workouts with your favourite exercises
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-2 bg-accent-600 hover:bg-accent-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Create Template
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onStart={() => startFromTemplate(template.id)}
              onEdit={() => setEditingTemplate(template)}
              onDelete={() => setDeleteId(template.id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <AnimatePresence>
        {(showCreate || editingTemplate) && (
          <CreateWorkoutModal
            template={editingTemplate}
            onClose={() => { setShowCreate(false); setEditingTemplate(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800"
            >
              <h3 className="text-lg font-bold text-white mb-1">Delete Template?</h3>
              <p className="text-sm text-zinc-400 mb-5">This can&apos;t be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteTemplate(deleteId); setDeleteId(null); }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
