'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeProvider() {
  const accentColor = useAppStore((s) => s.settings.accentColor);

  useEffect(() => {
    document.documentElement.dataset.theme = accentColor === 'indigo' ? '' : accentColor;
  }, [accentColor]);

  return null;
}
