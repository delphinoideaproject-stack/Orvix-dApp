import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
            className="pointer-events-auto flex items-center justify-between gap-3 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-700/80 shadow-2xl rounded-2xl px-4 py-3 text-zinc-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-sm font-medium tracking-tight text-zinc-200">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
