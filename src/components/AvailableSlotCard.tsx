import React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';
import { Page } from '../types';

interface AvailableSlotCardProps {
  setCurrentPage?: (p: Page) => void;
  key?: React.Key;
}

export function AvailableSlotCard({ setCurrentPage }: AvailableSlotCardProps) {
  return (
    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/40 group shadow-sm">
      <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-blue-500 transition-colors" />
        Available Slot
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
        This slot is open for a new curated project.
      </p>
      <Button 
        variant="outline" 
        onClick={() => setCurrentPage && setCurrentPage('SUBMIT')}
        className="flex items-center gap-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
      >
        <Plus className="w-4 h-4" />
        Submit Token
      </Button>
    </div>
  );
}
