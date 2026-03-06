import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import HydrationGuard from '@/components/HydrationGuard';
import BottomNav from '@/components/BottomNav';
import ActiveWorkoutSheet from '@/components/ActiveWorkoutSheet';
import ThemeProvider from '@/components/ThemeProvider';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'GymApp',
  description: 'Track your workouts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} bg-zinc-950 text-zinc-50 antialiased`}>
        <HydrationGuard>
          <ThemeProvider />
          <div className="min-h-screen pb-20">
            {children}
          </div>
          <BottomNav />
          <ActiveWorkoutSheet />
        </HydrationGuard>
      </body>
    </html>
  );
}
