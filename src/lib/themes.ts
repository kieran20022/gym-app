export const ACCENT_THEMES = {
  indigo:  { label: 'Indigo',  swatch: '#6366f1', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', muted: 'rgb(99 102 241 / 0.15)',  border: 'rgb(99 102 241 / 0.4)',  shadow: 'rgb(79 70 229 / 0.3)'  },
  violet:  { label: 'Violet',  swatch: '#8b5cf6', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', muted: 'rgb(139 92 246 / 0.15)', border: 'rgb(139 92 246 / 0.4)', shadow: 'rgb(124 58 237 / 0.3)' },
  sky:     { label: 'Sky',     swatch: '#0ea5e9', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', muted: 'rgb(14 165 233 / 0.15)',  border: 'rgb(14 165 233 / 0.4)',  shadow: 'rgb(2 132 199 / 0.3)'  },
  emerald: { label: 'Emerald', swatch: '#10b981', 400: '#34d399', 500: '#10b981', 600: '#059669', muted: 'rgb(16 185 129 / 0.15)',  border: 'rgb(16 185 129 / 0.4)',  shadow: 'rgb(5 150 105 / 0.3)'  },
  rose:    { label: 'Rose',    swatch: '#f43f5e', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', muted: 'rgb(244 63 94 / 0.15)',   border: 'rgb(244 63 94 / 0.4)',   shadow: 'rgb(225 29 72 / 0.3)'  },
  amber:   { label: 'Amber',   swatch: '#f59e0b', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', muted: 'rgb(245 158 11 / 0.15)',  border: 'rgb(245 158 11 / 0.4)',  shadow: 'rgb(217 119 6 / 0.3)'  },
  orange:  { label: 'Orange',  swatch: '#f97316', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', muted: 'rgb(249 115 22 / 0.15)',  border: 'rgb(249 115 22 / 0.4)',  shadow: 'rgb(234 88 12 / 0.3)'  },
} as const;

export type AccentColor = keyof typeof ACCENT_THEMES;

// Distinct colors for chart lines (independent of accent theme)
export const CHART_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b',
  '#0ea5e9', '#8b5cf6', '#f97316', '#ec4899',
];
