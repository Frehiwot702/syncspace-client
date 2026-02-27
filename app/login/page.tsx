'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '../store';
import Button from '@/components/ui/Button';
import { useToastStore } from '@/app/toast-store';

export default function Login() {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const toast = useToastStore((s) => s.add);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        'https://syncspace-server-jfmb.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: userPassword }),
        }
      );
      const res = await response.json();

      if (res.message) {
        setError(res.message);
        setLoading(false);
        return;
      }
      setAuth(res.user);
      toast('success', `Welcome back, ${res.user?.name ?? 'team'}!`);
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 text-[var(--foreground)] md:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12"
      >
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)]">
              SyncSpace
            </h1>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Sign in to continue to your workspaces.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Password"
                value={userPassword}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            {error && (
              <div
                className="rounded-lg border border-[var(--error)]/30 bg-[var(--error-muted)] px-4 py-3 text-sm text-[var(--error)]"
                role="alert"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign in
            </Button>
          </div>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Don’t have an account?{' '}
            <span className="font-medium text-[var(--primary)]">Contact your admin</span>
          </p>
        </div>
      </form>

      <div className="relative hidden md:block">
        <Image
          src="/image1.jpg"
          alt="Team collaboration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
}
