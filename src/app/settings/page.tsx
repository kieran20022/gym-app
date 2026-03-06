'use client';

import { motion } from 'framer-motion';
import { Check, Dumbbell, Trash2, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ACCENT_THEMES, AccentColor } from '@/lib/themes';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const history = useAppStore((s) => s.history);
  const templates = useAppStore((s) => s.templates);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function clearHistory() {
    useAppStore.setState({ history: [] });
    setShowClearConfirm(false);
  }

  return (
    <div className="px-4 pt-14 pb-8">
      <div className="mb-6">
        <p className="text-zinc-500 text-sm">Personalise your experience</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Accent Color */}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <h2 className="text-sm font-bold text-white mb-1">Accent Colour</h2>
          <p className="text-xs text-zinc-500 mb-4">Changes the highlight colour across the entire app</p>

          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(ACCENT_THEMES) as [AccentColor, typeof ACCENT_THEMES[AccentColor]][]).map(([key, theme]) => {
              const isActive = settings.accentColor === key;
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => updateSettings({ accentColor: key })}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: theme.swatch,
                      boxShadow: isActive ? `0 0 0 3px #09090b, 0 0 0 5px ${theme.swatch}` : 'none',
                    }}
                  >
                    {isActive && <Check size={20} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {theme.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Weight Unit */}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <h2 className="text-sm font-bold text-white mb-1">Weight Unit</h2>
          <p className="text-xs text-zinc-500 mb-4">Displayed next to weight inputs</p>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as const).map((unit) => {
              const isActive = settings.weightUnit === unit;
              return (
                <button
                  key={unit}
                  onClick={() => updateSettings({ weightUnit: unit })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-accent-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <h2 className="text-sm font-bold text-white mb-3">Your Data</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Dumbbell size={14} className="text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">Workouts logged</span>
              </div>
              <span className="text-sm font-bold text-white">{history.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <RotateCcw size={14} className="text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">Templates saved</span>
              </div>
              <span className="text-sm font-bold text-white">{templates.length}</span>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-zinc-900 rounded-2xl border border-red-900/30 p-4">
          <h2 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h2>
          <p className="text-xs text-zinc-500 mb-4">These actions cannot be undone</p>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-400">Clear Workout History</span>
          </button>
        </section>
      </div>

      {/* Clear confirm modal */}
      <AnimatePresence>
        {showClearConfirm && (
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
              <h3 className="text-lg font-bold text-white mb-1">Clear History?</h3>
              <p className="text-sm text-zinc-400 mb-5">
                All {history.length} logged workouts will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
