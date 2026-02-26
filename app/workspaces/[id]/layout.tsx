import React from 'react';
import Navbar from '@/components/Navbar';

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
}