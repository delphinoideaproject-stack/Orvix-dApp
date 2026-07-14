import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchModal({ 
  isOpen, 
  onClose,
  searchQuery,
  setSearchQuery
}: { 
  isOpen: boolean; 
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[101]"
          >
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-2 shadow-2xl flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-500 ml-2" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Name, Symbol, or Address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[var(--text)] text-sm py-2 px-1 font-mono"
              />
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
