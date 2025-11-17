'use client';

import ThemeToggle from '@/components/ThemeToggle';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      {children}
    </>
  );
}
