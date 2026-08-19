import React, { useState, useRef } from 'react';
import { MemoryPost } from '../../types';
import { AppStore } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MessageSquareQuote, 
  Send, 
  Heart, 
  Camera, 
  Sparkles, 
  MessageCircle, 
  Trash2,
  Lock,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoriesWallProps {
  memories: MemoryPost[];
  onOpenAuth: () => void;
}

export const MemoriesWall: React.FC<MemoriesWallProps> = ({ memories, onOpenAuth }) => {
  const { currentProfile, isTeamMember } = useAuth();
  const { t, language, isRtl } = useLanguage();
  const [memoryText, setMemoryText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'ar' ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت' : 'Image size is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile || !memoryText.trim()) return;

    setIsPublishing(true);
    AppStore.addMemoryPost(
      currentProfile,
      memoryText.trim(),
      imagePreview || imageUrl.trim() || undefined
    );

    setMemoryText('');
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPublishing(false);
    setSuccessNotice(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setSuccessNotice(false), 4000);
  };

  const handleLike = (id: string) => {
    if (!currentProfile) {
      onOpenAuth();
      return;
    }
    AppStore.toggleMemoryLike(id, currentProfile.id);
  };

  const handleAddComment = (memoryId: string) => {
    if (!currentProfile) {
      onOpenAuth();
      return;
    }
    const text = commentInputs[memoryId];
    if (!text || !text.trim()) return;

    AppStore.addMemoryComment(memoryId, currentProfile, text.trim());
    setCommentInputs(prev => ({ ...prev, [memoryId]: '' }));
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الذكرى؟' : 'Are you sure you want to delete this memory?')) {
      AppStore.deleteMemory(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>{t('memories_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('memories_title')}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {t('memories_sub')}
        </p>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-emerald-300 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
            <span>تم نشر الذكرى بنجاح وإضافة +75 XP لرتبتك الكونية! 🚀</span>
          </div>
          <span className="text-[10px] bg-[#39ff14]/20 text-[#39ff14] px-2 py-0.5 rounded-md font-black">
            +75 XP
          </span>
        </div>
      )}

      {/* Post Creator Box for Any Active Member */}
      {currentProfile ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile?.full_name || 'Member')}&background=07101d&color=39ff14`}
                alt={currentProfile?.full_name}
                className="w-11 h-11 rounded-2xl object-cover border border-[#39ff14]/30"
              />
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'ar' ? `وثّق لحظتك يا ${currentProfile?.full_name}` : `Share your moment, ${currentProfile?.full_name}`}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentProfile?.position} • {currentProfile?.committee ? `${currentProfile.committee.toUpperCase()} Committee` : 'Active Crew Member'}
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-amber-300">
              <Award className="w-3 h-3 text-amber-400" />
              <span>مفتوح لكل الأعضاء</span>
            </span>
          </div>

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <textarea
              rows={3}
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك للذكرى هنا... عبر عن لحظات لا تُنسى في المؤتمرات والفعاليات وورش العمل' : 'Write your memorable message here...'}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-white text-sm focus:border-[#39ff14]/60 focus:outline-none placeholder:text-slate-500 resize-y"
            />

            {/* Image Preview Box if Selected */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 max-h-60 bg-slate-950 inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-60 object-contain rounded-xl" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-auto flex items-center gap-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                  id="memory-image-input"
                />

                <label
                  htmlFor="memory-image-input"
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer transition-all hover:border-[#39ff14]/40"
                >
                  <Camera className="w-4 h-4 text-[#39ff14]" />
                  <span>{language === 'ar' ? 'رفع صورة من جهازك' : 'Upload photo from device'}</span>
                </label>

                <div className="relative flex-1 hidden md:block">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value.startsWith('http')) setImagePreview(e.target.value);
                    }}
                    placeholder={language === 'ar' ? 'أو ضع رابط صورة مباشر...' : 'Or direct image URL...'}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-md shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('memories_publish_btn')}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center border border-white/10 space-y-3">
          <Lock className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-black text-white text-base">
            {language === 'ar' ? 'المشاركة في حائط الذكريات مقتصرة على أعضاء الفريق' : 'Posting on the Memories Wall is reserved for team members'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {language === 'ar' 
              ? 'سجّل دخولك بكود العضوية لتتمكن من كتابة الذكريات وتوثيق رحلتك مع الفاميليا.' 
              : 'Log in with your Access Code to share memories and interact.'}
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs cursor-pointer transition-all"
          >
            {t('nav_login')}
          </button>
        </div>
      )}

      {/* Memories Feed */}
      <div className="space-y-6">
        {memories.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
            <Camera className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">لا توجد ذكريات بعد</h3>
            <p className="text-xs text-slate-400">كن أول من يشارك لحظات النشاط على حائط الذكريات!</p>
          </div>
        ) : (
          memories.map((post) => (
            <div 
              key={post.id} 
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
            >
              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=07101d&color=39ff14`}
                    alt={post.author_name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="font-black text-white text-sm">{post.author_name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-[#39ff14] font-semibold">{post.author_committee}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Delete button for author or leadership */}
                {currentProfile && (currentProfile.id === post.user_id || currentProfile.role === 'og' || currentProfile.role === 'team_head') && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title={language === 'ar' ? 'حذف الذكرى' : 'Delete Memory'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Memory Text */}
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {post.memory_text}
              </p>

              {/* Memory Image Attachment */}
              {post.image_url && (
                <div className="rounded-2xl overflow-hidden border border-white/10 max-h-96 bg-slate-950/60">
                  <img
                    src={post.image_url}
                    alt="Memory photo"
                    className="w-full h-full max-h-96 object-cover hover:scale-102 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Actions: Likes & Comments count */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    currentProfile && (post.liked_by_users || []).includes(currentProfile.id)
                      ? 'text-rose-400'
                      : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentProfile && (post.liked_by_users || []).includes(currentProfile.id) ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes_count || 0}</span>
                </button>

                <div className="flex items-center gap-1.5 font-bold">
                  <MessageCircle className="w-4 h-4" />
                  <span>{(post.comments || []).length}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                {(post.comments || []).map((comm) => (
                  <div key={comm.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-slate-200">{comm.author_name}</span>
                      <span className="text-slate-500 text-[10px]">{new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-300">{comm.comment_text}</p>
                  </div>
                ))}

                {/* Add Comment Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder={currentProfile ? (language === 'ar' ? 'اكتب تعليقاً لطيفاً...' : 'Write a comment...') : (language === 'ar' ? 'سجل دخولك للتعليق...' : 'Log in to comment...')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:border-[#39ff14]/50 focus:outline-none placeholder:text-slate-500"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-[#39ff14] transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
