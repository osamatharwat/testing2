import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  X, 
  Send, 
  ShieldCheck, 
  Lock,
  Camera,
  Layers,
  Calendar,
  Eye,
  Maximize2,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Award
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppStore } from '../../lib/store';
import { canCommentOnGallery, isLeaderOrHead, isTeamLeadership } from '../../lib/permissions';
import confetti from 'canvas-confetti';

interface GalleryViewProps {
  gallery: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ gallery }) => {
  const { currentProfile } = useAuth();
  const { language, t, isRtl } = useLanguage();
  
  // Selected category filter
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Active Album Modal State (When user clicks an Album card)
  const [activeAlbumName, setActiveAlbumName] = useState<string | null>(null);
  
  // Active Single Photo Lightbox State (When user clicks a photo inside or outside album)
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  // Upload Board Photo Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSection, setUploadSection] = useState('مجلس الإدارة والقيادة (Board & Leadership)');
  const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(null);
  const [uploadImageUrl, setUploadImageUrl] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTag, setUploadTag] = useState('board');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadBoardPhoto = currentProfile && (
    isLeaderOrHead(currentProfile.role) || 
    isTeamLeadership(currentProfile.role) || 
    currentProfile.role === 'head' || 
    currentProfile.role === 'sub_head' ||
    currentProfile.role === 'og' ||
    currentProfile.role === 'team_head'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert(language === 'ar' ? 'حجم الصورة كبير، يرجى اختيار ملف أقل من 6 ميجابايت' : 'Image is too large (max 6MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setUploadImagePreview(res);
        setUploadImageUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBoardPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = uploadImagePreview || uploadImageUrl.trim();
    if (!finalUrl || !uploadTitle.trim()) return;

    AppStore.createGalleryItem({
      title: uploadTitle.trim(),
      description: uploadDescription.trim() || undefined,
      image_url: finalUrl,
      tag: uploadTag,
      section_name: uploadSection,
      created_by: currentProfile?.full_name || 'Board Member'
    });

    setUploadTitle('');
    setUploadDescription('');
    setUploadImagePreview(null);
    setUploadImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadSuccess(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadModalOpen(false);
    }, 1500);
  };

  // Group photos into Albums by `section_name`
  const albumMap = gallery.reduce((acc, item) => {
    const key = item.section_name || 'عام / General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

  const albumNames = Object.keys(albumMap);

  // Filtered albums
  const filteredAlbumNames = albumNames.filter(name => {
    return selectedFilter === 'all' || name === selectedFilter;
  });

  const handleToggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const token = currentProfile ? currentProfile.id : 'guest_session_' + (window.navigator.userAgent.slice(0, 25));
    AppStore.toggleGalleryLike(id, token);
    
    // Update local photo modal state if open
    if (activePhoto && activePhoto.id === id) {
      const isAlreadyLiked = (activePhoto.liked_by_users || []).includes(token);
      setActivePhoto({
        ...activePhoto,
        likes_count: isAlreadyLiked ? Math.max(0, activePhoto.likes_count - 1) : activePhoto.likes_count + 1,
        liked_by_users: isAlreadyLiked 
          ? (activePhoto.liked_by_users || []).filter(u => u !== token)
          : [...(activePhoto.liked_by_users || []), token]
      });
    }
  };

  const handleOpenPhoto = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhoto(item);
    setNewCommentText('');
    setCommentError('');
  };

  const handleDownloadPhoto = (imageUrl: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Aliens-Gallery-${title.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhoto) return;

    if (!canCommentOnGallery(currentProfile)) {
      setCommentError(language === 'ar' 
        ? 'كتابة التعليقات مقتصرة حصرياً على أعضاء طاقم Aliens المعتمدين.'
        : 'Commenting is reserved for verified Aliens team members.'
      );
      return;
    }

    if (!newCommentText.trim()) return;
    if (!currentProfile) return;

    AppStore.addGalleryComment(activePhoto.id, currentProfile, newCommentText.trim());
    
    // Update local modal state
    const updatedGallery = AppStore.getGallery();
    const freshPhoto = updatedGallery.find(g => g.id === activePhoto.id);
    if (freshPhoto) {
      setActivePhoto(freshPhoto);
    }
    setNewCommentText('');
    setCommentError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header with Board Upload Action */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
            <Camera className="w-3.5 h-3.5" />
            <span>{t('gallery_badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t('gallery_title')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('gallery_sub')}
          </p>
        </div>

        {/* Board / Leadership Photo Upload Button */}
        {canUploadBoardPhoto && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'رفع صور البورد والقيادة 📸' : 'Upload Board Photo 📸'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs / Albums Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#39ff14] text-slate-950 font-black shadow-md shadow-[#39ff14]/20'
              : 'glass-panel text-slate-300 hover:text-white hover:bg-white/5 border border-white/10'
          }`}
        >
          {language === 'ar' ? 'جميع الألبومات' : 'All Albums'} ({gallery.length})
        </button>

        {albumNames.map(name => (
          <button
            key={name}
            onClick={() => setSelectedFilter(name)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === name
                ? 'bg-[#39ff14] text-slate-950 font-black shadow-md shadow-[#39ff14]/20'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">
              {albumMap[name]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* 📁 Albums Collection Grid */}
      <div className="space-y-12">
        {filteredAlbumNames.map(albumName => {
          const items = albumMap[albumName] || [];
          const coverPhoto = items[0];

          return (
            <div key={albumName} className="space-y-4">
              {/* Album Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">{albumName}</h2>
                    <span className="text-xs text-slate-400">{items.length} صور في هذا الألبوم</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveAlbumName(albumName)}
                  className="text-xs font-bold text-[#39ff14] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>استعراض كامل الألبوم</span>
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Album Photos Strip / Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    onClick={(e) => handleOpenPhoto(item, e)}
                    className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 hover:border-[#39ff14]/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[#39ff14]/10 aspect-square"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-[#39ff14] border border-[#39ff14]/30">
                          {item.tag || 'Aliens'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleDownloadPhoto(item.image_url, item.title, e)}
                            className="p-1.5 rounded-full bg-black/60 text-white hover:text-[#39ff14] transition-colors"
                            title="تحميل الصورة"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleToggleLike(item.id, e)}
                            className="p-1.5 rounded-full bg-black/60 text-white hover:text-rose-400 transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${(item.liked_by_users || []).includes(currentProfile?.id || '') ? 'fill-rose-400 text-rose-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-white line-clamp-1">{item.title}</h3>
                        <p className="text-[11px] text-slate-300 flex items-center justify-between mt-1">
                          <span>{item.created_by || 'Aliens Space'}</span>
                          <span>{(item.comments || []).length} تعليق</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🖼️ MODAL 1: FULL ALBUM BROWSER MODAL */}
      {activeAlbumName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-5xl max-h-[90vh] glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#39ff14]" />
                <h2 className="text-xl font-black text-white">{activeAlbumName}</h2>
                <span className="text-xs text-slate-400">({albumMap[activeAlbumName]?.length || 0} صور)</span>
              </div>

              <button
                onClick={() => setActiveAlbumName(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-1">
              {(albumMap[activeAlbumName] || []).map(item => (
                <div
                  key={item.id}
                  onClick={(e) => handleOpenPhoto(item, e)}
                  className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-[#39ff14]/40 transition-all cursor-pointer aspect-video"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <span className="self-end px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-[#39ff14]">
                      {item.tag}
                    </span>
                    <h4 className="text-xs font-black text-white line-clamp-1">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📸 MODAL 2: SINGLE PHOTO LIGHTBOX WITH COMMENTS & DOWNLOAD */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] glass-panel-strong rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-xl bg-slate-950/80 hover:bg-black text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View Box */}
            <div className="lg:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] relative">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
              
              {/* Photo Floating Download & Like buttons */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <button
                  onClick={(e) => handleDownloadPhoto(activePhoto.image_url, activePhoto.title, e)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-black border border-white/15 flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>تحميل الصورة</span>
                </button>
              </div>
            </div>

            {/* Photo Details & Comments Column */}
            <div className="lg:w-2/5 p-6 flex flex-col justify-between space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 text-[10px] font-black">
                    {activePhoto.tag || 'Gallery'}
                  </span>
                  <span className="text-xs text-slate-400">{activePhoto.section_name}</span>
                </div>

                <h3 className="text-lg font-black text-white">{activePhoto.title}</h3>
                {activePhoto.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{activePhoto.description}</p>
                )}

                <div className="flex items-center gap-4 py-2 border-y border-white/10 text-xs text-slate-400">
                  <button
                    onClick={() => handleToggleLike(activePhoto.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                      (activePhoto.liked_by_users || []).includes(currentProfile?.id || '')
                        ? 'text-rose-400'
                        : 'hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${(activePhoto.liked_by_users || []).includes(currentProfile?.id || '') ? 'fill-rose-400' : ''}`} />
                    <span>{activePhoto.likes_count || 0} إعجاب</span>
                  </button>

                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{(activePhoto.comments || []).length} تعليقات</span>
                  </span>
                </div>
              </div>

              {/* Comments Stream */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-48 pr-1">
                {(activePhoto.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">لا توجد تعليقات بعد، كن أول من يعلق!</p>
                ) : (
                  (activePhoto.comments || []).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200">{c.user_name || 'Member'}</span>
                        <span className="text-[9px] text-slate-500">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-300">{c.comment_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-white/10">
                {commentError && (
                  <p className="text-[11px] text-rose-400 font-bold">{commentError}</p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={canCommentOnGallery(currentProfile) ? 'اكتب تعليقك...' : 'التعليق متاح فقط للأعضاء...'}
                    disabled={!canCommentOnGallery(currentProfile)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!canCommentOnGallery(currentProfile)}
                    className="p-2 rounded-xl bg-[#39ff14] text-slate-950 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 3: BOARD & LEADERSHIP PHOTO UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-5">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>صلاحية البورد والقيادة (High Board Access)</span>
              </div>
              <h2 className="text-xl font-black text-white">رفع صورة جديدة لمعرض النشاط</h2>
              <p className="text-xs text-slate-400">أضف صور البورد، الفعاليات الكبرى، أو صور اللجان للأرشيف الرسمي.</p>
            </div>

            {uploadSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2 text-emerald-300">
                <CheckCircle2 className="w-10 h-10 text-[#39ff14] mx-auto" />
                <h3 className="text-base font-black text-white">تم نشر وتثبيت الصورة بنجاح! 🚀</h3>
              </div>
            ) : (
              <form onSubmit={handleSaveBoardPhoto} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">عنوان الصورة</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="مثال: صورة المجلس التنفيذي 2026..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">القسم / الألبوم</label>
                    <select
                      value={uploadSection}
                      onChange={(e) => setUploadSection(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    >
                      <option value="مجلس الإدارة والقيادة (Board & Leadership)">مجلس الإدارة والقيادة (Board)</option>
                      <option value="فعاليات ومؤتمرات الصيدلة">فعاليات ومؤتمرات الصيدلة</option>
                      <option value="ملتقيات التوظيف والتدريب">ملتقيات التوظيف والتدريب</option>
                      <option value="ورش عمل اللجان والتكريمات">ورش عمل اللجان والتكريمات</option>
                      <option value="عام / General Moments">عام / General Moments</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الوسم (Tag)</label>
                    <input
                      type="text"
                      value={uploadTag}
                      onChange={(e) => setUploadTag(e.target.value)}
                      placeholder="board, summit, leadership..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                    />
                  </div>
                </div>

                {/* File Upload / URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">ملف الصورة</label>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                      id="board-photo-file-input"
                    />
                    <label
                      htmlFor="board-photo-file-input"
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:border-[#39ff14]/40"
                    >
                      <Upload className="w-4 h-4 text-[#39ff14]" />
                      <span>اختر صورة من جهازك</span>
                    </label>

                    <input
                      type="url"
                      value={uploadImageUrl}
                      onChange={(e) => {
                        setUploadImageUrl(e.target.value);
                        if (e.target.value.startsWith('http')) setUploadImagePreview(e.target.value);
                      }}
                      placeholder="أو رابط الصورة المباشر..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                    />
                  </div>

                  {uploadImagePreview && (
                    <div className="relative rounded-2xl overflow-hidden border border-white/15 max-h-48 bg-slate-950 mt-2">
                      <img src={uploadImagePreview} alt="Preview" className="max-h-48 w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => { setUploadImagePreview(null); setUploadImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">وصف الصورة (اختياري)</label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="وصف مختصر لمناسبة الصورة أو أسماء الحاضرين..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>تأكيد ونشر الصورة في المعرض 🚀</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
