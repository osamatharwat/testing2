import React from 'react';
import { 
  TrendingUp, 
  Camera, 
  Handshake, 
  UsersRound, 
  Wand2, 
  HeartHandshake, 
  FolderArchive, 
  CalendarClock,
  Sparkles,
  Send
} from 'lucide-react';
import { CommitteeKey } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CommitteesSectionProps {
  onOpenRecruitment: (preselectedCommittee?: CommitteeKey) => void;
}

export const CommitteesSection: React.FC<CommitteesSectionProps> = ({ onOpenRecruitment }) => {
  const { t, language } = useLanguage();

  const committees = [
    {
      key: 'marketing' as CommitteeKey,
      name: language === 'ar' ? 'Marketing (التسويق)' : 'Marketing & Growth',
      tag: 'Growth & Branding',
      icon: TrendingUp,
      accent: 'text-amber-400',
      bg: 'from-amber-500/10 to-amber-950/30',
      border: 'border-amber-500/30',
      desc: language === 'ar' 
        ? 'نضع الخطط والاستراتيجيات الترويجية لنشر فكر Aliens، وإدارة الحملات الرقمية لصناعة تأثير ملموس داخل جامعة الدلتا وخارجها.'
        : 'Formulating data-driven marketing strategies, leading digital campaigns, and establishing Aliens brand equity across universities.',
      tasks: language === 'ar' 
        ? ['وضع الخطط التسويقية السنوية', 'صناعة محتوى الحملات الإعلانية', 'تحليل تفاعل الجمهور ومؤشرات النمو']
        : ['Annual marketing strategies', 'Campaign content production', 'Audience growth & analytics']
    },
    {
      key: 'media' as CommitteeKey,
      name: language === 'ar' ? 'Media (الميديا والإعلام)' : 'Media & Creative',
      tag: 'Creative Production',
      icon: Camera,
      accent: 'text-[#39ff14]',
      bg: 'from-emerald-500/10 to-emerald-950/30',
      border: 'border-[#39ff14]/30',
      desc: language === 'ar'
        ? 'عين التيم المرئية التي توثق الرحلة وتنتج التصاميم الجرافيكية والفيديوهات السينمائية بأعلى معايير الجودة العالمية.'
        : 'The visual powerhouse producing world-class graphic branding, cinematic event aftermovies, and digital photography.',
      tasks: language === 'ar'
        ? ['تصميم الهويات البصرية والبوسترات', 'التصوير والمونتاج الاحترافي', 'تغطية الفعاليات والمؤتمرات']
        : ['Brand identity & poster design', 'Cinematic videography & editing', 'Live event photo coverage']
    },
    {
      key: 'pr' as CommitteeKey,
      name: language === 'ar' ? 'Public Relations (العلاقات العامة)' : 'Public Relations (PR)',
      tag: 'Partnerships & Sponsors',
      icon: Handshake,
      accent: 'text-cyan-400',
      bg: 'from-cyan-500/10 to-cyan-950/30',
      border: 'border-cyan-500/30',
      desc: language === 'ar'
        ? 'نبني الجسور مع شركات الأدوية الكبرى، والمحاضرين، وسلاسل الصيدليات، لضمان استقطاب أفضل الرعاة وفرص العمل للطلاب.'
        : 'Connecting the organization with top pharma corporates, medical speakers, and healthcare sponsors for annual job fairs.',
      tasks: language === 'ar'
        ? ['استقطاب الرعاة لملتقى التوظيف', 'التنسيق مع كبار المتحدثين', 'تمثيل التيم في المحافل الرسمية']
        : ['Pharma corporate sponsorships', 'Keynote speaker relations', 'Official public representation']
    },
    {
      key: 'ir' as CommitteeKey,
      name: language === 'ar' ? 'Internal Relations (العلاقات الداخلية)' : 'Internal Relations (IR)',
      tag: 'Team Culture & Evaluation',
      icon: UsersRound,
      accent: 'text-purple-400',
      bg: 'from-purple-500/10 to-purple-950/30',
      border: 'border-purple-500/30',
      desc: language === 'ar'
        ? 'حلقة الوصل بين جميع أفراد المركبة. نهتم بالطاقم الداخلي، نتابع الأداء الفردي والتقييمات، ونحافظ على بيئة عمل إيجابية ومحفزة.'
        : 'Fostering organizational culture, conducting recruitment interviews, and administering strict monthly member evaluations.',
      tasks: language === 'ar'
        ? ['متابعة وتقييم أداء الأعضاء شهرياً', 'إجراء مقابلات التعيين والانترفيو', 'تنظيم الأنشطة التحفيزية للفاميليا']
        : ['Monthly performance evaluations', 'Applicant interview scoring', 'Team wellness & culture']
    },
    {
      key: 'magic_hand' as CommitteeKey,
      name: language === 'ar' ? 'Magic Hand (الأعمال اليدوية والديكور)' : 'Magic Hand (Decor & Stage)',
      tag: 'Cosmic Atmosphere',
      icon: Wand2,
      accent: 'text-pink-400',
      bg: 'from-pink-500/10 to-pink-950/30',
      border: 'border-pink-500/30',
      desc: language === 'ar'
        ? 'نحول الأفكار والرسومات إلى ديكورات ومجسمات واقعية ومبهرة تعكس الهوية الكونية للتيم في كل مؤتمر ومعرض.'
        : 'Designing tangible architectural installations, stage decor, and custom commemorative giveaways for conferences.',
      tasks: language === 'ar'
        ? ['صناعة مجسمات الفضاء والديكورات', 'تجهيز بوابات واستراحات المعارض', 'تصميم الهدايا التذكارية للحضور']
        : ['Exhibition booth design', 'Conference stage props', 'Handcrafted giveaways']
    },
    {
      key: 'charity' as CommitteeKey,
      name: language === 'ar' ? 'Charity (العمل المجتمعي والخيري)' : 'Community & Charity',
      tag: 'Community Impact',
      icon: HeartHandshake,
      accent: 'text-rose-400',
      bg: 'from-rose-500/10 to-rose-950/30',
      border: 'border-rose-500/30',
      desc: language === 'ar'
        ? 'ننظم حملات الدعم والمساعدات والقوافل الطبية الإنسانية لخدمة أهالي القرى المحيطة وترك أثر إنساني صادق ومستدام.'
        : 'Organizing sustainable medical relief convoys, free medicine distribution, and public healthcare awareness drives.',
      tasks: language === 'ar'
        ? ['تنظيم القوافل الطبية الدورية', 'حملات التبرع بالدم والأدوية', 'التوعية الصحية المجتمعية']
        : ['Free clinical health convoys', 'Blood donation campaigns', 'Public health education']
    },
    {
      key: 'secretary' as CommitteeKey,
      name: language === 'ar' ? 'Secretary (السكرتارية والتنظيم الإداري)' : 'Operations & Secretary',
      tag: 'Operations & Data',
      icon: FolderArchive,
      accent: 'text-blue-400',
      bg: 'from-blue-500/10 to-blue-950/30',
      border: 'border-blue-500/30',
      desc: language === 'ar'
        ? 'المسؤولون عن دقة البيانات، توثيق الاجتماعات، وإدارة جداول الحضور وقواعد البيانات لضمان أعلى مستويات الانضباط الإداري.'
        : 'Ensuring administrative rigor, managing official registries, taking meeting minutes, and maintaining database accuracy.',
      tasks: language === 'ar'
        ? ['إدارة قواعد بيانات الحضور والأعضاء', 'توثيق المحاضر والتقارير الرسمية', 'تنظيم المراسلات الإدارية']
        : ['Member database governance', 'Official meeting minutes', 'Administrative documentation']
    },
    {
      key: 'event_planning' as CommitteeKey,
      name: language === 'ar' ? 'Event Planning (تخطيط وإدارة الفعاليات)' : 'Event Planning & Logistics',
      tag: 'Logistics & Execution',
      icon: CalendarClock,
      accent: 'text-orange-400',
      bg: 'from-orange-500/10 to-orange-950/30',
      border: 'border-orange-500/30',
      desc: language === 'ar'
        ? 'نخطط لكل حدث من الألف إلى الياء، وندير اللوجستيات وسير القاعات لضمان تجربة سلسة ومبهرة لجميع الزوار.'
        : 'Executing event logistics, auditorium protocol, attendee flow management, and seamless on-ground operations.',
      tasks: language === 'ar'
        ? ['وضع الجداول الزمنية للفعاليات', 'إدارة حركة الحضور داخل القاعات', 'التنسيق اللوجستي لمسرح الفعاليات']
        : ['Conference timeline execution', 'Hall crowd flow management', 'Stage & audiovisual coordination']
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('committees_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('committees_title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {t('committees_subtitle')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {committees.map((comm) => {
          const Icon = comm.icon;
          return (
            <div
              key={comm.key}
              className={`p-6 rounded-3xl bg-gradient-to-br ${comm.bg} border ${comm.border} flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all shadow-xl group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${comm.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {comm.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{comm.name}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {comm.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-[11px] font-bold text-slate-400 mb-2">{t('committee_tasks_label')}</p>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {comm.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#39ff14] text-xs">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onOpenRecruitment(comm.key)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:border-[#39ff14]/40"
              >
                <Send className="w-3.5 h-3.5 text-[#39ff14]" />
                <span>{t('committee_join_btn')}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
