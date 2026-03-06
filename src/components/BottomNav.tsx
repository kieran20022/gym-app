'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, History, BookOpen, TrendingUp } from 'lucide-react';

const tabs = [
  { href: '/',          label: 'Home',      icon: Home       },
  { href: '/workouts',  label: 'Workouts',  icon: Dumbbell   },
  { href: '/progress',  label: 'Progress',  icon: TrendingUp },
  { href: '/history',   label: 'History',   icon: History    },
  { href: '/exercises', label: 'Exercises', icon: BookOpen   },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2 pb-safe">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? 'accent-text' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[9px] font-medium ${active ? 'accent-text' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
