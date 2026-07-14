import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Sparkles, Layers, Cpu, ShieldCheck } from 'lucide-react';

interface OrvixPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrvixPromptModal({ isOpen, onClose }: OrvixPromptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptText = `Anda adalah seorang Senior Web3 Full-Stack Architect dan UI/UX Design Lead. Tolong buatkan aplikasi dApp Web3 platform peluncuran token & trading AMM berkecepatan tinggi bernama "Orvix" di BNB Chain (BSC Mainnet & Testnet support) dengan spesifikasi yang sangat lengkap, detail, dan production-ready sebagai berikut:

1. ARSITEKTUR & TEKNOLOGI STACK
- Frontend: React 18+, TypeScript, Tailwind CSS, Framer Motion untuk animasi transisi widget/dashboard yang mulus dan profesional, Lucide React untuk ikon, Recharts untuk chart harga real-time.
- Web3 & Wallet: Integrasi Reown AppKit / Wagmi / Ethers.js dengan dukungan dinamis BNB Chain (ChainID 56 untuk Mainnet, ChainID 97 untuk Testnet) serta pemetaan Explorer URL otomatis (BscScan / Testnet BscScan).
- State & Storage: TypeScript global types, local persistence untuk state token, riwayat swap, dan riwayat submit token.

2. FITUR UTAMA & MODUL APLIKASI
- HomePage: Dashboard trading interaktif, statistik global platform (TVL, volume 24h, total tokens), widget trending token, banner promosi, dan list token terbaru dengan animasi masuk (entrance animations).
- Orvix New Alpha (Token Launchpad & Bonding Curve): Halaman kurasi token baru, filter progress bar bonding curve (0% - 100%), info likuiditas, dan form submit token baru (SubmitWizard) dengan opsi otomatis lock LP dan renounce ownership.
- Swap & AMM (Orvix Swap): Antarmuka pertukaran token terdesentralisasi (DEX) dengan routing otomatis, estimasi slippage, pemilihan token modal, dan eksekusi transaksi on-chain.
- History & Archive: Arsip token yang telah lulus bonding curve (graduate) menuju DEX utama/pancake serta log riwayat transaksi lengkap dengan link transaksi BscScan.
- Token Detail Modal / Page: Analisis mendalam token, informasi on-chain (contract address, creator, tax buy/sell, renounced status, LP lock status), chart harga, dan link media sosial resmi (Website, X, Telegram, GitHub).

3. DESAIN & IDENTITAS VISUAL (BRANDING)
- Warna & Tema: Mode Gelap (Dark Mode) modern bernuansa Obsidian & Slate (bg-zinc-950/zinc-900) dengan aksen Neon Blue / Cyan (#3b82f6) dan border tipis transparan (border-white/10).
- Tipografi: Font utama Inter untuk UI bersih, Space Grotesk untuk judul heading yang futuristik, dan JetBrains Mono untuk alamat kontrak, hash transaksi, serta data numerik.
- Logo: Orvix Logo berupa simbol heksagon geometris bercahaya dengan rotasi simetris yang melambangkan kecepatan dan desentralisasi.

4. KEAMANAN & KONFIGURASI JARINGAN
- Penanganan Network Mismatch yang ketat: Mencegah error frontend Mainnet dengan wallet Testnet melalui helper dinamis getExplorerUrl() dan ORVIX_CONFIG rpcDefault.
- Zero Mock Data untuk fungsionalitas wallet: Mendukung koneksi dompet Web3 asli dengan penanganan error yang elegan.

Tolong generate struktur kode lengkap, modular, dan bersih sesuai spesifikasi di atas!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Prompt Generator: Orvix dApp</h3>
              <p className="text-xs text-zinc-400">Prompt lengkap dan detail untuk pembuatan ulang / pengembangan dApp Orvix</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Salin Prompt Lengkap (Bahasa Indonesia / English)</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Prompt'}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
              {promptText}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <Sparkles className="w-4 h-4" /> Desain & UI/UX
              </div>
              <p className="text-[11px] text-zinc-400">Obsidian Dark Theme, Inter, Space Grotesk, JetBrains Mono, Framer Motion.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                <Cpu className="w-4 h-4" /> Smart Contract & Web3
              </div>
              <p className="text-[11px] text-zinc-400">BNB Chain Mainnet/Testnet, Ethers.js, Reown AppKit, Bonding Curve Launchpad.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <ShieldCheck className="w-4 h-4" /> Keamanan & Jaringan
              </div>
              <p className="text-[11px] text-zinc-400">Dynamic getExplorerUrl(), RPC fallbacks, anti network mismatch protection.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>Orvix Architecture Specification</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
