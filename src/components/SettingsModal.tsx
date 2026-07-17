import React, { useState, useEffect } from 'react';
import { X, Globe, Moon, Sun, Monitor, Server, AlertCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
  language: string;
  setLanguage: (l: string) => void;
  onOpenPromptModal: () => void;
}

export function SettingsModal({ isOpen, onClose, theme, setTheme, language, setLanguage, onOpenPromptModal }: SettingsModalProps) {
  const [rpcUrl, setRpcUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      const settingsStr = localStorage.getItem('orvix_settings');
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          setRpcUrl(settings.rpcUrlTestnet || '');
        } catch(e) {}
      }
    }
  }, [isOpen]);

  const testRpcConnection = async (url: string) => {
    if (!url) return true;
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');

    // Test RPC connectivity
    if (rpcUrl.trim()) {
      const isValid = await testRpcConnection(rpcUrl.trim());
      if (!isValid) {
        setErrorMsg('Failed to connect to RPC URL');
        setIsSaving(false);
        return;
      }
    }

    const settingsStr = localStorage.getItem('orvix_settings');
    let settings: any = {};
    if (settingsStr) {
      try {
        settings = JSON.parse(settingsStr);
      } catch(e) {}
    }
    
    const hasChanged = settings.rpcUrlTestnet !== rpcUrl.trim();

    settings = {
      ...settings,
      rpcUrlTestnet: rpcUrl.trim()
    };
    localStorage.setItem('orvix_settings', JSON.stringify(settings));
    setIsSaving(false);
    onClose();
    
    if (hasChanged) {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold tracking-tight">App Settings</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* RPC Settings */}
        <div className="space-y-4">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Server className="w-4 h-4" /> RPC Configuration
          </label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">RPC URL</label>
              <input 
                type="text" 
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="https://data-seed-prebsc-1-s1.binance.org:8545/"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('light')}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'light' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
              } disabled:opacity-50`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
              } disabled:opacity-50`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'system' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
              } disabled:opacity-50`}
            >
              <Monitor className="w-4 h-4" /> System
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">Language / Bahasa</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLanguage('EN')}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                language === 'EN' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
              } disabled:opacity-50`}
            >
              <Globe className="w-4 h-4" /> English (EN)
            </button>
            <button
              onClick={() => setLanguage('ID')}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                language === 'ID' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
              } disabled:opacity-50`}
            >
              <Globe className="w-4 h-4" /> Bahasa (ID)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>Orvix Labs ©2026</span>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
