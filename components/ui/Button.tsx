'use client';

import React from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] border-transparent',
  secondary:
    'bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] border-transparent',
  ghost:
    'bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)] border-transparent',
  danger:
    'bg-[var(--error)] text-white hover:opacity-90 border-transparent',
  outline:
    'bg-transparent text-[var(--foreground)] border-[var(--border-strong)] hover:bg-[var(--surface-muted)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-6 text-base rounded-lg gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border';
  const combined = [
    base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={combined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="size-4 shrink-0" /> : leftIcon}
      {loading ? <span>Loading…</span> : children}
      {!loading && rightIcon}
    </button>
  );
}
