import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../../types';
import { calculateMemberTier } from '../../lib/gamification';
import { AppStore } from '../../lib/store';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Rocket, 
  Check, 
  Copy, 
  Instagram, 
  Facebook, 
  Palette, 
  Zap, 
  Award,
  Flame,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const [theme, setTheme] = useState<'neon' | 'purple' | 'cyan' | 'amber'>('neon');
  const [slogan, setSlogan] = useState('We are not alone in the universe, we are Aliens Delta! 🛸✨');
  const [alienSticker, setAlienSticker] = useState('👽');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const allEvaluations = AppStore.getEvaluations();
  const gamified = calculateMemberTier(profile.id, allEvaluations);

  const slogansList = [
    'We are not alone in the universe, we are Aliens Delta! 🛸✨',
    'Delta Pharmacy Aliens • Out of This World 👽💚',
    'طاقة فضائية تصنع الفارق في صيدلة الدلتا 🚀⚡',
    'Alien Member • Official Crew Badge 🧬🛸',
    'نلهم، نقود، ونبتكر في عالم الصيدلة الكوني 🌟'
  ];

  const alienStickers = ['👽', '🛸', '🚀', '🧪', '🪐', '⚡', '🧬', '👾'];

  const themeStyles = {
    neon: {
      border: 'border-[#39ff14]/50 shadow-[0_0_50px_rgba(57,255,20,0.3)]',
      gradient: 'from-slate-950 via-[#062410] to-slate-950',
      accentText: 'text-[#39ff14]',
      accentBg: 'bg-[#39ff14]/15 border-[#39ff14]/40',
      badgeBg: 'bg-[#39ff14] text-slate-950',
      glow: '#39ff14'
    },
    purple: {
      border: 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]',
      gradient: 'from-slate-950 via-[#1e0a38] to-slate-950',
      accentText: 'text-purple-400',
      accentBg: 'bg-purple-500/15 border-purple-500/40',
      badgeBg: 'bg-purple-500 text-white',
      glow: '#a855f7'
    },
    cyan: {
      border: 'border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)]',
      gradient: 'from-slate-950 via-[#082338] to-slate-950',
      accentText: 'text-cyan-400',
      accentBg: 'bg-cyan-500/15 border-cyan-500/40',
      badgeBg: 'bg-cyan-400 text-slate-950',
      glow: '#06b6d4'
    },
    amber: {
      border: 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)]',
      gradient: 'from-slate-950 via-[#2d1a04] to-slate-950',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500/15 border-amber-500/40',
      badgeBg: 'bg-amber-400 text-slate-950',
      glow: '#f59e0b'
    }
  };

  const activeTheme = themeStyles[theme];

  // Export card using HTML Canvas
  const handleDownloadStoryImage = async () => {
    setIsExporting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas to 9:16 high resolution (1080 x 1920)
      canvas.width = 1080;
      canvas.height = 1920;

      // 1. Draw Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      if (theme === 'neon') {
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#062811');
        bgGrad.addColorStop(1, '#020617');
      } else if (theme === 'purple') {
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#20083b');
        bgGrad.addColorStop(1, '#020617');
      } else if (theme === 'cyan') {
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#07243b');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#331c03');
        bgGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Stars & Galactic Grid Particles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 160; i++) {
        const x = Math.random() * 1080;
        const y = Math.random() * 1920;
        const r = Math.random() * 2.5 + 0.5;
        const a = Math.random() * 0.8 + 0.2;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Glowing cosmic circles
      const glowGrad = ctx.createRadialGradient(540, 600, 50, 540, 600, 450);
      glowGrad.addColorStop(0, activeTheme.glow + '44');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1080, 1200);

      // Border outline
      ctx.strokeStyle = activeTheme.glow + '88';
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, 1000, 1840);

      // Top Header: Team Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = activeTheme.glow;
      ctx.font = '900 48px Inter, sans-serif';
      ctx.fillText('ALIENS STUDENT ACTIVITY', 540, 150);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 28px Cairo, sans-serif';
      ctx.fillText('كلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا', 540, 200);

      // Sticker Icon
      ctx.font = '120px sans-serif';
      ctx.fillText(alienSticker, 540, 360);

      // Slogan Bubble
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(100, 410, 880, 90, 45);
      ctx.fill();
      ctx.strokeStyle = activeTheme.glow + '55';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 26px Cairo, sans-serif';
      ctx.fillText(`"${slogan}"`, 540, 465);

      // Member Photo / Avatar Frame
      const avatarX = 540;
      const avatarY = 720;
      const avatarR = 170;

      // Avatar background circle
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = activeTheme.glow;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Load avatar image
      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      avatarImg.src = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=07101d&color=39ff14&size=400`;

      await new Promise((resolve) => {
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR - 5, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
          ctx.restore();
          resolve(true);
        };
        avatarImg.onerror = () => resolve(true);
      });

      // Member Full Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px Cairo, sans-serif';
      ctx.fillText(profile.full_name, 540, 990);

      // Username / Handle
      ctx.fillStyle = activeTheme.glow;
      ctx.font = '700 32px monospace';
      ctx.fillText(`@${profile.username || 'aliens_member'}`, 540, 1045);

      // Committee Badge Box
      const commText = `لجنة ${profile.committee ? profile.committee.toUpperCase() : 'GENERAL'} • ${profile.position}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(140, 1090, 800, 80, 24);
      ctx.fill();
      ctx.strokeStyle = activeTheme.glow + '66';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '800 32px Cairo, sans-serif';
      ctx.fillText(commText, 540, 1142);

      // Gamification Tier Box
      const tierBoxY = 1210;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(140, tierBoxY, 800, 240, 32);
      ctx.fill();
      ctx.strokeStyle = activeTheme.glow + '88';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Cosmic Rank Title
      ctx.fillStyle = activeTheme.glow;
      ctx.font = '800 30px Cairo, sans-serif';
      ctx.fillText('الرتبة الكونية الرسمية (Official Cosmic Rank)', 540, tierBoxY + 55);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px Cairo, sans-serif';
      ctx.fillText(`${gamified.tier.badgeIcon} ${gamified.tier.tierNameAr} (${gamified.tier.tierNameEn})`, 540, tierBoxY + 125);

      // Cosmic XP
      ctx.fillStyle = '#fde047';
      ctx.font = '900 40px monospace';
      ctx.fillText(`⚡ ${gamified.totalXP} TOTAL COSMIC XP`, 540, tierBoxY + 195);

      // Footer: Join & Verification
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(140, 1500, 800, 180, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px Cairo, sans-serif';
      ctx.fillText('انضم إلى طاقم الفضائيين في صيدلة الدلتا 🛸', 540, 1570);

      ctx.fillStyle = activeTheme.glow;
      ctx.font = '700 28px monospace';
      ctx.fillText('aliensdelta.org • @aliens_delta', 540, 1630);

      // Watermark
      ctx.fillStyle = '#64748b';
      ctx.font = '600 22px sans-serif';
      ctx.fillText('VERIFIED ALIENS CREW CARD • DELTA PHARMACY 2026', 540, 1780);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `aliens_story_${profile.username || 'member'}.png`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 80, spread: 80 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/#member-${profile.username || profile.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel-strong rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            مولد بطاقة استوري إنستغرام وفيسبوك • Aliens Story Card 🛸
          </div>
          <h2 className="text-2xl font-black text-white">شارك بروفايلك الفضائي في الاستوري</h2>
          <p className="text-xs text-slate-400">صمم بطاقة ستوري عمودية بأبعاد 9:16 مع رتبتك الكونية وشعار التيم المميز.</p>
        </div>

        {/* Hidden Canvas for High-Resolution Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Content Grid: Preview on left/top, Customization on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* 📱 9:16 Story Card Live Preview (5 cols on lg) */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              ref={cardRef}
              className={`relative w-full max-w-[300px] aspect-[9/16] rounded-3xl p-5 bg-gradient-to-b ${activeTheme.gradient} border-2 ${activeTheme.border} flex flex-col justify-between overflow-hidden shadow-2xl transition-all select-none`}
            >
              {/* Star Particles Background */}
              <div className="absolute inset-0 cosmic-bg pointer-events-none opacity-60" />
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#39ff14]/15 blur-3xl pointer-events-none" />

              {/* Card Top */}
              <div className="relative z-10 text-center space-y-1">
                <span className="text-[10px] font-black tracking-widest text-[#39ff14] uppercase block">
                  ALIENS STUDENT ACTIVITY
                </span>
                <span className="text-[9px] text-slate-400 block font-bold">
                  صيدلة جامعة الدلتا للعلوم والتكنولوجيا
                </span>

                {/* Alien Sticker */}
                <div className="text-4xl py-1 animate-bounce">
                  {alienSticker}
                </div>

                {/* Slogan */}
                <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-200 font-bold leading-tight">
                  "{slogan}"
                </div>
              </div>

              {/* Card Center: Member Info */}
              <div className="relative z-10 text-center space-y-2 my-auto">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=07101d&color=39ff14`}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover border-3 border-[#39ff14] shadow-lg mx-auto"
                  />
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#39ff14] text-slate-950 text-xs font-black flex items-center justify-center border-2 border-slate-950">
                    ✓
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-white text-base leading-tight">{profile.full_name}</h3>
                  <span className={`text-[11px] font-mono font-bold ${activeTheme.accentText}`}>
                    @{profile.username || 'aliens_member'}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-200 inline-block">
                  لجنة {profile.committee ? profile.committee.toUpperCase() : 'GENERAL'} • {profile.position}
                </div>

                {/* Cosmic Rank & XP */}
                <div className="p-2.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="text-[11px] font-black text-white flex items-center justify-center gap-1">
                    <span>{gamified.tier.badgeIcon}</span>
                    <span>{gamified.tier.tierNameAr}</span>
                  </div>
                  <div className="text-[10px] font-black text-amber-300 font-mono">
                    ⚡ {gamified.totalXP} TOTAL COSMIC XP
                  </div>
                </div>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 text-center space-y-1 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-white block">
                  انضم لطاقم الفضائيين 🛸
                </span>
                <span className="text-[9px] text-[#39ff14] font-mono font-bold block">
                  aliensdelta.org • @aliens_delta
                </span>
              </div>
            </div>
          </div>

          {/* 🎨 Customization Controls & Export Buttons (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#39ff14]" />
                اختر النمط واللون الكوني:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'neon', name: 'Alien Neon', color: 'bg-emerald-500' },
                  { id: 'purple', name: 'Nebula Purple', color: 'bg-purple-500' },
                  { id: 'cyan', name: 'Quantum Cyan', color: 'bg-cyan-500' },
                  { id: 'amber', name: 'Supernova', color: 'bg-amber-500' },
                ].map(tItem => (
                  <button
                    key={tItem.id}
                    onClick={() => setTheme(tItem.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      theme === tItem.id
                        ? 'bg-white/15 border-white text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${tItem.color}`} />
                    <span className="text-[10px]">{tItem.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alien Sticker Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-[#39ff14]" />
                اختر ملصق الفضائيين (Alien Sticker):
              </label>
              <div className="flex flex-wrap gap-2">
                {alienStickers.map((stk) => (
                  <button
                    key={stk}
                    onClick={() => setAlienSticker(stk)}
                    className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      alienSticker === stk
                        ? 'bg-[#39ff14]/20 border-2 border-[#39ff14] scale-110 shadow-md shadow-[#39ff14]/20'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>

            {/* Slogan Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#39ff14]" />
                شعار التيم في الاستوري:
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {slogansList.map((slg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlogan(slg)}
                    className={`w-full p-2.5 rounded-xl text-right text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      slogan === slg
                        ? 'bg-[#39ff14]/15 border border-[#39ff14]/40 text-white font-bold'
                        : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>"{slg}"</span>
                    {slogan === slg && <Check className="w-3.5 h-3.5 text-[#39ff14] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Download Image & Direct Share */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <button
                onClick={handleDownloadStoryImage}
                disabled={isExporting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] via-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                <span>{isExporting ? 'جارٍ توليد وتحميل الصورة...' : 'تحميل بطاقة الاستوري كصورة عالية الدقة (PNG) 🚀'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyProfileLink}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#39ff14]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط البروفايل'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`أنا عضو في طاقم Aliens Student Activity بكلية الصيدلة! 🛸✨ تفقد بروفايلي ورتبتي الكونية: ${window.location.origin}/#member-${profile.username || profile.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة في واتساب</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                💡 نصيحة: حمّل الصورة وضعها في استوري إنستغرام أو فيسبوك واستخدم منشن <span className="text-[#39ff14] font-bold">@aliens_delta</span> لنعيد نشرها في صفحة التيم! 🚀
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
