'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { socket } from '@/app/socket';
import { Workspace } from '@/types/types';
import { useAuthStore, useWorkspaceStore } from '@/app/store';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToastStore } from '@/app/toast-store';

export default function Workspaces() {
  const user = useAuthStore((state) => state.user);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspace);
  const [workspace, setWorkspace] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToastStore((s) => s.add);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchWorkspaces = async () => {
      try {
        const result = await fetch(
          `https://3j20j2tc-5000.uks1.devtunnels.ms/api/workspaces/${user._id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const res = await result.json();

        if (cancelled) return;
        if (res.message) {
          setError(res.message);
          toast('error', res.message);
          setWorkspace([]);
        } else {
          setWorkspace(Array.isArray(res) ? res : []);
          setWorkspaces(res);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load workspaces';
          setError(msg);
          toast('error', msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWorkspaces();
    return () => { cancelled = true; };
  }, [user, toast, setWorkspaces]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {});
    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && workspace.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Workspaces</h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--error-muted)] px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
        <EmptyState
          title="Couldn’t load workspaces"
          description="Check your connection or try again later."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Workspaces</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Workspaces you’ve joined (by admin approval).
        </p>
      </div>

      {workspace.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          description="When an admin adds you to a workspace, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {workspace.map((w) => (
            <Link key={w._id} href={`/workspaces/${w._id}`}>
              <div className="flex h-24 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center font-medium text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]">
                {w.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
