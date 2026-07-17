import React from 'react';

export function StaticPage({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">{title}</h1>
      <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </div>
  );
}
