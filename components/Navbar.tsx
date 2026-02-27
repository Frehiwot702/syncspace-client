'use client';

import { useAuthStore } from '@/app/store';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const router = useRouter();

  const handleLogout = async () => {
    if(!user) return;

    await fetch('https://syncspace-server-jfmb.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?._id}),
    });
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-xl font-semibold text-[var(--primary)] transition-opacity hover:opacity-90"
        >
          SyncSpace
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--foreground)]">{user?.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{user?.email}</p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}