'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store';
import Workspaces from '@/components/Workspaces';

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Welcome back, {user.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pick a workspace to start collaborating in real time.
        </p>
      </div>
      <Workspaces />
    </div>
  );
}