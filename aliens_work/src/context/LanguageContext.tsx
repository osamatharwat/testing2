import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Brand & Header
  'app_name': { ar: 'ألينز سبيس', en: 'ALIENS SPACE' },
  'app_sub': { ar: 'نظام تشغيل النشاط الطلابي', en: 'Student Team Operating System' },
  'delta_pharma': { ar: 'صيدلة الدلتا', en: 'DELTA PHARMA' },
  
  // Navigation
  'nav_home': { ar: 'الرئيسية', en: 'Home' },
  'nav_committees': { ar: 'اللجان', en: 'Committees' },
  'nav_events': { ar: 'الفعاليات', en: 'Events' },
  'nav_hall_of_fame': { ar: 'لوحة الشرف وتكريمات التميز', en: 'Hall of Fame' },
  'nav_members': { ar: 'دليل الأعضاء والطاقم', en: 'Member Directory' },
  'nav_gallery': { ar: 'المعرض', en: 'Gallery' },
  'nav_projects': { ar: 'مشاريع الأعضاء', en: 'Projects' },
  'nav_cultural': { ar: 'المجتمع الثقافي', en: 'Cultural Hub' },
  'nav_internships': { ar: 'فرص التدريب', en: 'Internships' },
  'nav_memories': { ar: 'حائط الذكريات', en: 'Memories' },
  'nav_cv': { ar: 'صانع الـ CV (v5)', en: 'CV Builder' },
  'nav_profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'nav_admin': { ar: 'لوحة القيادة', en: 'Dashboard' },
  'nav_join_crew': { ar: 'انضم للطاقم', en: 'Join Crew' },
  'nav_login': { ar: 'تسجيل دخول', en: 'Log In' },
  'nav_signup': { ar: 'حساب جديد', en: 'Sign Up' },
  'nav_logout': { ar: 'تسجيل خروج', en: 'Log Out' },
  'role_switcher': { ar: 'تبديل الأدوار للاختبار', en: 'Role Switcher' },

  // Hero Section
  'hero_tag': { ar: 'النشاط الطلابي الرسمي • صيدلة جامعة الدلتا', en: 'Official Student Activity • Faculty of Pharmacy, Delta University' },
  'hero_welcome': { ar: 'مرحباً بك في طاقم', en: 'WELCOME TO THE' },
  'hero_crew': { ar: 'طاقم ALIENS', en: 'ALIENS CREW' },
  'hero_desc': { ar: 'نشاط طلابي رائد بكلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا. نبني مهارات مهنية، خبرات إكلينيكية، وبيئة عملية تربط الطلاب بسوق العمل الدوائي.', en: 'Leading student organization at the Faculty of Pharmacy, Delta University. Empowering future clinical pharmacists with professional skills, leadership excellence, and industry connections.' },
  'hero_cta_join': { ar: 'انضم لطاقمنا الآن', en: 'Join Our Crew' },
  'hero_cta_committees': { ar: 'استكشف اللجان', en: 'Explore Committees' },
  
  // Hero Achievements
  'hero_achievements_title': { ar: 'أرقام وإنجازات', en: 'Key Achievements & Milestones' },
  'hero_achievements_sub': { ar: 'أرقام حقيقية تعكس أثر Aliens المستمر في صيدلة الدلتا والمجتمع.', en: 'Measurable impact and leadership across Delta University and the healthcare sector.' },
  'stat_jobfairs': { ar: 'معارض توظيف كبرى', en: 'Major Job Fairs' },
  'stat_jobfairs_sub': { ar: 'ملتقيات سنوية مع كبرى الشركات', en: 'Annual pharmaceutical career expos' },
  'stat_beneficiaries': { ar: 'مستفيد ومشارك', en: 'Participants & Beneficiaries' },
  'stat_beneficiaries_sub': { ar: 'من ورش العمل والقوافل الطبية', en: 'Clinical workshops and medical convoys' },
  'stat_members': { ar: 'عضو نشط في الفريق', en: 'Active Crew Members' },
  'stat_members_sub': { ar: 'قادة في 8 لجان متخصصة', en: 'Leaders across 8 specialized committees' },
  'stat_founded': { ar: 'عام التأسيس', en: 'Founded in' },
  'stat_founded_sub': { ar: 'مسيرة ريادية متواصلة', en: 'Years of continuous student leadership' },

  // Who We Are & Pillars
  'who_we_are_title': { ar: 'من نحن؟', en: 'Who We Are' },
  'who_we_are_desc': { ar: 'تأسس فريق Aliens عام 2019 داخل كلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا، ليكون الكيان الطلابي الرائد في صقل مهارات الطلاب المهنية والشخصية.', en: 'Established in 2019 at the Faculty of Pharmacy, Delta University, Aliens is the premier student organization bridging academic study with clinical and market readiness.' },
  'our_vision_title': { ar: 'رؤيتنا', en: 'Our Vision' },
  'our_vision_desc': { ar: 'أن نكون النموذج الريادي الأول للأنشطة الطلابية الطبية في مصر، القادر على تخريج كوادر صيدلانية تمتلك أعلى المهارات الإكلينيكية والقيادية.', en: 'To be the foremost pharmaceutical student model in Egypt, graduating visionary pharmacists equipped with clinical acumen and executive capability.' },
  'our_mission_title': { ar: 'رسالتنا', en: 'Our Mission' },
  'our_mission_desc': { ar: 'تقديم برامج تدريب نوعية، ملتقيات توظيف كبرى، وحملات توعوية مجتمعية مستدامة، بالإضافة إلى بناء شراكات استراتيجية مع كبرى المؤسسات الدوائية.', en: 'Delivering specialized training, high-impact conferences, health awareness campaigns, and strategic alliances with leading pharmaceutical firms.' },

  // Quick Links
  'quick_links_title': { ar: 'بوابات النظام الرقمي', en: 'Digital Platform Portals' },
  'quick_links_sub': { ar: 'تنقل في النظام الرقمي بكامل طاقته واستفد من جميع الأقسام.', en: 'Access all integrated portals and resources across the platform.' },
  'portal_events_title': { ar: 'سجل الفعاليات والمؤتمرات', en: 'Events & Conferences' },
  'portal_events_desc': { ar: 'سجل فورياً في ورش العمل والملتقيات الطبية.', en: 'Register instantly for workshops and medical expos.' },
  'portal_committees_title': { ar: 'هيكل اللجان التخصصية', en: 'Specialized Committees' },
  'portal_committees_desc': { ar: 'تعرف على القيادات والمسؤوليات في كل لجنة.', en: 'Explore leadership roles and technical divisions.' },
  'portal_gallery_title': { ar: 'المعرض والأرشيف الرقمي', en: 'Digital Photo Archive' },
  'portal_gallery_desc': { ar: 'تصفح ألبومات المؤتمرات والإنجازات السنوية.', en: 'Browse conference albums and visual milestones.' },
  'portal_projects_title': { ar: 'مشاريع وابتكارات الأعضاء', en: 'Member Innovations' },
  'portal_projects_desc': { ar: 'منتجات وتطبيقات طلاب وخريجي صيدلة الدلتا.', en: 'Showcase of entrepreneurial products and apps.' },
  'portal_cultural_title': { ar: 'المكتبة والمجتمع الثقافي', en: 'Clinical Knowledge Hub' },
  'portal_cultural_desc': { ar: 'مراجع طبية ودوائية إكلينيكية وكتب OTC متخصصة.', en: 'Clinical pharmacology books and OTC references.' },
  'portal_internships_title': { ar: 'فرص التدريب الصيفي', en: 'Internship Opportunities' },
  'portal_internships_desc': { ar: 'فرص تدريب حصري بمصانع الأدوية وسلاسل الصيدليات.', en: 'Exclusive training placements with pharma sponsors.' },

  // PR & Join Portals
  'join_portal_title': { ar: 'بوابات الانضمام والشراكات', en: 'Membership & Strategic Partnerships' },
  'join_portal_sub': { ar: 'سواء كنت طالباً تبحث عن تطوير مهاراتك، أو مؤسسة تبحث عن شريك نجاح رسمي لملتقى التوظيف؛ نحن نرحب بك.', en: 'Whether you are a student striving for excellence or a corporate partner seeking top talent, welcome to Aliens.' },
  'students_portal_title': { ar: 'بوابة الطلاب والأعضاء', en: 'Students & Members Portal' },
  'students_portal_desc': { ar: 'سجّل معنا لتطوير مهاراتك الإكلينيكية، والمشاركة في تنظيم أكبر المؤتمرات الدوائية بجامعة الدلتا.', en: 'Register with us to hone clinical capabilities and co-host major healthcare events at Delta University.' },
  'apply_recruitment_btn': { ar: 'تقديم طلب انضمام (Recruitment)', en: 'Apply for Membership (Recruitment)' },
  'pr_portal_title': { ar: 'بوابة الشركاء والرعاة (PR)', en: 'Sponsors & Corporate PR Portal' },
  'pr_portal_desc': { ar: 'تواصل مباشرة مع مسؤولي العلاقات العامة لبحث فرص الرعاية والشراكات في المعرض التوظيفي السنوي.', en: 'Direct channel with PR leadership to discuss annual job fair sponsorships and strategic partnerships.' },
  'chat_pr_head': { ar: 'محادثة رئيس العلاقات العامة', en: 'Chat with PR Head' },
  'chat_pr_sub': { ar: 'محادثة نائب العلاقات العامة', en: 'Chat with PR Vice Head' },

  // Committees View
  'committees_badge': { ar: 'الهيكل التنظيمي • صيدلة الدلتا', en: 'Organizational Structure • Delta Pharmacy' },
  'committees_title': { ar: 'لجان نشاط Aliens', en: 'Aliens Committees' },
  'committees_subtitle': { ar: 'تعرف على لجان النشاط الثمانية المتخصصة، مهام كل لجنة، ومسؤوليها القياديين.', en: 'Explore our 8 specialized operational divisions, responsibilities, and leadership.' },
  'committee_tasks_label': { ar: 'أبرز مهام ومسؤوليات اللجنة:', en: 'Core Responsibilities & Tasks:' },
  'committee_join_btn': { ar: 'التقديم على هذه اللجنة', en: 'Apply for This Committee' },

  // Events View
  'events_badge': { ar: 'أجندة المؤتمرات وورش العمل', en: 'Conferences & Workshops Agenda' },
  'events_title': { ar: 'سجل الفعاليات والمؤتمرات', en: 'Events & Conferences' },
  'events_desc': { ar: 'سجّل حضورك في ورش العمل الإكلينيكية والملتقيات التوظيفية، واحصل على شهادات معتمدة وانضم لمجموعات الواتساب الرسمية.', en: 'Register for clinical workshops, annual career expos, obtain certificates, and join official event WhatsApp groups.' },
  'events_register_btn': { ar: 'تسجيل الحضور في الفعالية', en: 'Register for Event' },
  'events_wa_groups': { ar: 'جروبات الواتساب المعتمدة للفعالية', en: 'Official Event WhatsApp Groups' },
  'events_join_wa': { ar: 'انضم للمتابعة', en: 'Join Group' },
  'events_search_placeholder': { ar: 'بحث في الفعاليات...', en: 'Search events...' },
  'events_speaker': { ar: 'المحاضر / المتحدث:', en: 'Keynote Speaker:' },
  'events_location': { ar: 'المكان:', en: 'Venue:' },
  'events_date': { ar: 'الموعد:', en: 'Date & Time:' },
  'events_registered_count': { ar: 'مسجل', en: 'registered' },

  // Gallery
  'gallery_badge': { ar: 'الأرشيف الرقمي والتوثيق المرئي', en: 'Digital Archive & Visual Media' },
  'gallery_title': { ar: 'ألبومات ومعرض الصور', en: 'Photo Albums & Gallery' },
  'gallery_subtitle': { ar: 'استعرض ألبومات المؤتمرات والمعارض وافتح كل ألبوم لمشاهدة جميع صوره والتفاعل معها.', en: 'Browse conference and event albums. Open any album to view high-resolution photos and join discussions.' },
  'gallery_all_albums': { ar: 'جميع الألبومات', en: 'All Albums' },
  'gallery_photos_count': { ar: 'صورة', en: 'photos' },
  'gallery_open_album': { ar: 'فتح وتصفح الألبوم', en: 'Open Album' },
  'gallery_close': { ar: 'إغلاق', en: 'Close' },
  'gallery_likes': { ar: 'إعجاب', en: 'Likes' },
  'gallery_comments': { ar: 'تعليق', en: 'Comments' },
  'gallery_write_comment': { ar: 'اكتب تعليقك كعضو في الفريق...', en: 'Write a comment as a team member...' },
  'gallery_guest_prompt': { ar: 'التعليق متاح حصرياً لأعضاء الفريق المسجلين. الزوار يمكنهم الإعجاب بالصور.', en: 'Commenting is reserved for verified team members. Guests can like photos.' },

  // Projects View
  'projects_badge': { ar: 'معرض ريادة الأعمال والابتكار', en: 'Innovation & Entrepreneurship Hub' },
  'projects_title': { ar: 'مشاريع أعضاء الفاميليا', en: 'Member Innovations & Startups' },
  'projects_sub': { ar: 'استعراض تطبيقات ومنتجات رواد الأعمال من طلاب وخريجي صيدلة الدلتا. تواصل معهم وادعم أفكارهم.', en: 'Showcase of entrepreneurial products, applications, and initiatives built by Delta Pharmacy students.' },
  'projects_by': { ar: 'بواسطة:', en: 'By:' },
  'projects_link_btn': { ar: 'رابط المشروع', en: 'Visit Project' },
  'projects_contact_btn': { ar: 'تواصل مباشر', en: 'Direct Contact' },

  // Cultural Hub
  'cultural_badge': { ar: 'المكتبة والمجتمع الثقافي الدوائي', en: 'Clinical Pharmacology Knowledge Hub' },
  'cultural_title': { ar: 'المجتمع الثقافي', en: 'Cultural & Clinical Library' },
  'cultural_sub': { ar: 'مصادر ومراجع طبية ودوائية إكلينيكية مجانية مخصصة لطلاب الصيدلة لصقل مهاراتهم السريرية.', en: 'Free, peer-reviewed clinical pharmacy references, drug charts, and OTC master guides.' },
  'cultural_search': { ar: 'ابحث عن كتاب، كورس أو مرجع دوائي...', en: 'Search books, courses, or clinical references...' },
  'cultural_exclusive_badge': { ar: 'حصري لأعضاء التيم', en: 'Exclusive to Team Members' },
  'cultural_download_btn': { ar: 'تصفح وتحميل المرجع', en: 'Read & Download Reference' },
  'cultural_unlock_btn': { ar: 'تسجيل الدخول كعضو لفتح المرجع', en: 'Log in as Member to Access' },

  // Internships
  'internships_badge': { ar: 'بوابة التدريب الصيفي والفرص المهنية', en: 'Summer Training & Career Placements' },
  'internships_title': { ar: 'فرص التدريب المهني', en: 'Career & Internship Opportunities' },
  'internships_sub': { ar: 'فرص تدريب عملي حصرية ومباشرة مع كبرى مصانع الأدوية وسلاسل الصيدليات المعتمدة.', en: 'Hands-on clinical and industrial training placements with top pharmaceutical sponsors.' },
  'internships_apply_btn': { ar: 'قدّم الآن على فرصة التدريب', en: 'Apply for Internship' },
  'internships_deadline': { ar: 'آخر موعد للتقديم:', en: 'Application Deadline:' },

  // CV Builder
  'cv_title': { ar: 'منشئ السيرة الذاتية العالمي', en: 'ATS Resume Builder (v5)' },
  'cv_desc': { ar: 'صمم سيرة ذاتية احترافية معتمدة من أنظمة فحص الـ ATS العالمية ومخصصة لطلاب وخريجي صيدلة الدلتا.', en: 'Create professional ATS-compliant resumes tailored for pharmacy leaders and clinical practitioners.' },
  'cv_print_btn': { ar: 'طباعة / تصدير PDF', en: 'Export / Print PDF' },
  'cv_score': { ar: 'مقياس جودة السيرة الذاتية (ATS Score)', en: 'ATS Resume Score' },

  // Memories Wall
  'memories_badge': { ar: 'حائط الذكريات ولحظات الفاميليا', en: 'Crew Memories & Moments Wall' },
  'memories_title': { ar: 'حائط الذكريات', en: 'Team Memories' },
  'memories_sub': { ar: 'شارك رسالتك، ذكرياتك في المعارض والمؤتمرات، وتجاربك مع عائلة Aliens.', en: 'Share messages, conference memories, and unforgettable moments with the Aliens family.' },
  'memories_publish_btn': { ar: 'توثيق ونشر', en: 'Post Memory' },
  'memories_like_btn': { ar: 'إعجاب', en: 'Likes' },
  'memories_comments': { ar: 'تعليقات', en: 'Comments' },

  // Admin Dashboard
  'admin_title': { ar: 'لوحة القيادة والإدارة العليا', en: 'Executive Command Center' },
  'admin_unauthorized_title': { ar: 'غير مصرح بالدخول للوحة التحكم', en: 'Unauthorized Access' },
  'admin_unauthorized_desc': { ar: 'لوحة التحكم الإدارية مقتصرة على مسؤولي ورؤساء اللجان ومقيمي العلاقات الداخلية وقيادة التيم.', en: 'The admin dashboard is strictly restricted to Committee Heads, IR Evaluators, and Team Leadership.' },
  'admin_switch_role_prompt': { ar: 'استخدم محول الأدوار (Role Switcher) في الأعلى للتبديل لحساب مسؤول:', en: 'Use the Role Switcher at the top to test with an administrative profile:' },
  'admin_recruitment_tab': { ar: 'طلبات التعيين والاعتماد المزدوج', en: 'Recruitment' },
  'admin_members_tab': { ar: 'سجل الأعضاء', en: 'Members Directory' },
  'admin_evals_tab': { ar: 'التقييم الشهري', en: 'Monthly Evaluation' },
  'admin_ir_dist_tab': { ar: 'توزيع أعضاء IR', en: 'IR Distribution' },
  'admin_questions_tab': { ar: 'بنك الأسئلة', en: 'Questions Hub' },
  'admin_events_tab': { ar: 'إدارة الفعاليات', en: 'Events Management' },
  'admin_codes_tab': { ar: 'أكواد العضوية', en: 'Access Codes' },
  'admin_og_tab': { ar: 'التحكم الشامل OG', en: 'OG Master Panel' },
  'admin_logs_tab': { ar: 'سجل العمليات', en: 'Audit Logs' },

  // Footer
  'footer_desc': { ar: 'الكيان الطلابي الرسمي الرائد بكلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا منذ 2019.', en: 'The premier official student organization at the Faculty of Pharmacy, Delta University since 2019.' },
  'footer_quick_links': { ar: 'روابط سريعة', en: 'Quick Links' },
  'footer_contact': { ar: 'التواصل والدعم', en: 'Contact & Support' },
  'footer_rights': { ar: 'جميع الحقوق محفوظة لنشاط Aliens Student Activity', en: 'All rights reserved to Aliens Student Activity' },

  // Common Actions
  'save': { ar: 'حفظ', en: 'Save' },
  'cancel': { ar: 'إلغاء', en: 'Cancel' },
  'edit': { ar: 'تعديل', en: 'Edit' },
  'delete': { ar: 'حذف', en: 'Delete' },
  'loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'language_toggle': { ar: 'English', en: 'العربية' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aliens_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('aliens_lang', language);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
