'use client';

import React, { useEffect } from 'react';
import { useToastStore } from '@/app/toast-store';

const variantStyles = {
  success: 'bg-[var(--success)] text-white',
  error: 'bg-[var(--error)] text-white',
  warning: 'bg-[var(--warning)] text-white',
  info: 'bg-[var(--foreground)] text-[var(--background)]',
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onDismiss={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  item,
  onDismiss,
}: {
  item: { id: string; variant: 'success' | 'error' | 'warning' | 'info'; message: string };
  onDismiss: () => void;
}) {
  return (
    <div
      className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${variantStyles[item.variant]} flex items-center justify-between gap-3`}
    >
      <span>{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
