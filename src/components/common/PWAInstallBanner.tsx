import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed
    const dismissed = localStorage.getItem('aliens_pwa_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('aliens_pwa_dismissed', 'true');
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="p-4 rounded-3xl glass-panel-strong border border-[#39ff14]/40 shadow-2xl shadow-[#39ff14]/10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#39ff14]/15 border border-[#39ff14]/30 flex items-center justify-center text-2xl shrink-0">
          👽
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <span>تثبيت تطبيق Aliens Space</span>
            <span className="text-[10px] text-[#39ff14] bg-[#39ff14]/20 px-2 py-0.5 rounded-full">تطبيق هاتف</span>
          </h4>
          <p className="text-[11px] text-slate-300 truncate">
            ثبّت المنصة على هاتفك للوصول السريع والإشعارات الفورية
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3.5 py-2 rounded-xl bg-[#39ff14] text-slate-950 text-xs font-black hover:brightness-110 shadow-md shadow-[#39ff14]/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
