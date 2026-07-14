import React from 'react';
import { cn } from '../lib/utils';

export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'destructive' }) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
