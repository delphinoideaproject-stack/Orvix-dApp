import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function CopyButton({ text, className, label }: { text: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Contract address copied to clipboard!' }));
  };

  return (
    <button 
      onClick={handleCopy}
      className={cn("text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1.5", className)}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  );
}
