import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Code, 
  User, 
  Globe, 
  Linkedin, 
  Phone, 
  Mail, 
  MapPin,
  HelpCircle,
  TrendingUp,
  Layout,
  Printer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  gradYear: string;
  gpa: string;
  coursework: string;
}

interface ProjectItem {
  id: string;
  title: string;
  role: string;
  link: string;
  description: string;
  tools: string;
}

interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
}

interface ExtracurricularItem {
  id: string;
  organization: string;
  role: string;
  dates: string;
  description: string;
}

type TemplateId = 'harvard_ats' | 'modern_split' | 'executive_serif' | 'clinical_minimal' | 'creative_badge' | 'compact_onepage';

export const CVBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [template, setTemplate] = useState<TemplateId>('harvard_ats');
  const [accentColor, setAccentColor] = useState<string>('#059669'); // Emerald/Pharma

  // Personal Info
  const [fullName, setFullName] = useState('د. يوسف أحمد السعيد');
  const [jobTitle, setJobTitle] = useState('PharmD Candidate & Clinical Researcher | Aliens Student Activity');
  const [email, setEmail] = useState('youssef.ahmed@delta.edu.eg');
  const [phone, setPhone] = useState('+20 101 234 5678');
  const [location, setLocation] = useState('Mansoura, Egypt');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/youssef-pharma');
  const [portfolio, setPortfolio] = useState('github.com/youssef-pharma');
  const [summary, setSummary] = useState(
    'صيدلي إكلينيكي شغوف وطالب بالفرقة الرابعة بكلية الصيدلة — جامعة الدلتا. قائد سابق بلجنة التسويق في نشاط Aliens الطلابي، أمتلك خبرة عملية في بروتوكولات الأدوية اللاوصفية (OTC)، وتحليل التداخلات الدوائية، وإدارة الفعاليات الطبية والمعارض التوظيفية الكبرى.'
  );

  // Education
  const [education, setEducation] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      degree: 'Doctor of Pharmacy (PharmD) — Clinical Pharmacy Pathway',
      institution: 'Faculty of Pharmacy, Delta University for Science & Technology',
      location: 'Gamasa, Egypt',
      gradYear: 'Expected 2027',
      gpa: '3.85 / 4.00 (Excellent with Honors)',
      coursework: 'Clinical Pharmacokinetics, Therapeutics, OTC Drugs, Pharmacovigilance, Biostatistics'
    }
  ]);

  // Work Experience
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: 'exp-1',
      role: 'Clinical Community Pharmacist Trainee',
      company: 'El Ezaby Pharmacies Group',
      location: 'Mansoura, Egypt',
      startDate: 'Jul 2025',
      endDate: 'Sep 2025',
      current: false,
      bullets: [
        'Analyzed and dispensed over 1,200+ prescriptions under clinical supervision with zero medication errors.',
        'Provided comprehensive patient counseling on chronic disease management (Hypertension, Diabetes Type 2).',
        'Utilized pharmacy management software for automated inventory replenishment and drug expiry tracking.'
      ]
    },
    {
      id: 'exp-2',
      role: 'Quality Control & Formulation Intern',
      company: 'Eva Pharma Pharmaceuticals',
      location: '6th of October City, Egypt',
      startDate: 'Aug 2024',
      endDate: 'Sep 2024',
      current: false,
      bullets: [
        'Participated in Good Manufacturing Practice (GMP) quality inspections across solid dosage manufacturing lines.',
        'Conducted dissolution and disintegration rate testing for newly developed oral solid formulations.'
      ]
    }
  ]);

  // Skills
  const [clinicalSkills, setClinicalSkills] = useState('Pharmacotherapy, OTC Protocols, Drug Interactions, Patient Counseling, Clinical Trials, Pharmacovigilance');
  const [technicalSkills, setTechnicalSkills] = useState('SPSS, Excel Data Analysis, Microsoft Office Suite, Medscape, Lexicomp, Canva Pro');
  const [softSkills, setSoftSkills] = useState('Public Speaking, Leadership & Team Management, Crisis Negotiation, Time Management, Creative Problem Solving');

  // Extracurricular / Student Activity (Aliens Experience)
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>([
    {
      id: 'extra-1',
      organization: 'Aliens Student Activity — Delta University',
      role: 'Head of Marketing & Executive Board Member',
      dates: 'Oct 2024 - Present',
      description: 'Directed digital campaigns for Delta Pharma Job Fair Season 4, reaching 45,000+ impressions and coordinating with 25+ pharmaceutical companies and over 1,000 attendee students.'
    },
    {
      id: 'extra-2',
      organization: 'Aliens Charity Convoys',
      role: 'Medical Convoy Field Coordinator',
      dates: '2023 - 2024',
      description: 'Supervised free medication distribution and blood pressure/glucose screening for 500+ patients in rural Delta villages.'
    }
  ]);

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      title: 'DoseMate: Automated Renal Drug Dose Calculator',
      role: 'Lead Clinical Researcher',
      link: 'github.com/project-dosemate',
      description: 'Built a clinical decision support tool calculating Cockcroft-Gault creatinine clearance and adjusting antimicrobial dosage regimens for CKD patients.',
      tools: 'Python, Clinical Guidelines, Streamlit'
    }
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      id: 'cert-1',
      title: 'Good Clinical Practice (GCP) Certification',
      issuer: 'National Institute on Drug Abuse (NIDA)',
      date: '2025',
      credentialId: 'NIDA-GCP-884920'
    },
    {
      id: 'cert-2',
      title: 'Advanced Life Support (ALS) & Basic First Aid',
      issuer: 'Egyptian Red Crescent',
      date: '2024',
      credentialId: 'ERC-FA-2024'
    }
  ]);

  // Languages
  const [languages, setLanguages] = useState('Arabic (Native), English (Fluent - C1 Level), German (Basic A1)');

  // Preset summary suggestions
  const presetSummaries = [
    {
      title: 'طالب صيدلة إكلينيكية (PharmD)',
      text: 'طالب بالفرقة الرابعة بكلية الصيدلة (PharmD Clinical) بشغف عميق نحو الصيدلة الإكلينيكية وعلاجيات الأمراض المزمنة. أمتلك سجلاً متميزاً في الأنشطة الطلابية مع Aliens، وخبرة تدريبية عملية في كبرى سلاسل الصيدليات ومصانع الأدوية.'
    },
    {
      title: 'قائد نشاط طلابي ومسؤول تسويق دوائي',
      text: 'قائد نشاط طلابي ذو سجل حافل في إدارة اللجان وحملات الترويج الدوائي بـ Aliens Student Activity. أجمع بين المعرفة الصيدلانية الأكاديمية والمهارات القيادية وإدارة المعارض والملتقيات التوظيفية الكبرى.'
    },
    {
      title: 'باحث في الجودة والتصنيع الدوائي (QC/QA)',
      text: 'باحث صيدلي مهتم بمجالات الرقابة النوعية (Quality Control) وتطوير التركيبات الصيدلانية وفق معايير الـ GMP و ISO. شاركت في مشاريع بحثية وتدريبات ميدانية لضمان جودة المستحضرات الدوائية.'
    }
  ];

  // Real-time ATS Calculation
  const calculateATS = () => {
    let score = 30; // base score
    const suggestions: string[] = [];

    if (fullName && email && phone && location) {
      score += 15;
    } else {
      suggestions.push('أكمل جميع بيانات التواصل الأساسية (الاسم، الإيميل، الهاتف، والمدينة).');
    }

    if (summary.length > 80) {
      score += 15;
    } else {
      suggestions.push('اجعل الملخص المهني شاملاً (80 حرفاً على الأقل) مع ذكر تخصصك وأهدافك.');
    }

    if (experiences.length >= 2) {
      score += 15;
    } else {
      suggestions.push('أضف تدريبين أو خبرتين على الأقل (مثل تدريب صيدليات أو مصانع).');
    }

    if (education.length > 0) score += 10;

    if (clinicalSkills && softSkills) {
      score += 15;
    } else {
      suggestions.push('حدد مهاراتك الإكلينيكية والتقنية والشخصية بدقة.');
    }

    // Action verbs check
    const actionVerbs = ['analyzed', 'provided', 'directed', 'coordinated', 'conducted', 'built', 'supervised', 'evaluated', 'designed'];
    const fullText = JSON.stringify({ experiences, extracurriculars, projects }).toLowerCase();
    const matchedVerbs = actionVerbs.filter(v => fullText.includes(v));
    if (matchedVerbs.length >= 3) {
      score = Math.min(100, score);
    } else {
      suggestions.push('استخدم أفعال إنجاز قوية (Action Verbs) مثل: Directed, Analyzed, Coordinated.');
    }

    return { score: Math.min(100, score), suggestions };
  };

  const { score: atsScore, suggestions: atsSuggestions } = calculateATS();

  const handlePrintPDF = () => {
    window.print();
    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            Aliens Professional ATS CV Builder v6.0
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            منشئ السيرة الذاتية <span className="text-[#39ff14]">العالمي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            صمم سيرة ذاتية احترافية معتمدة من أنظمة فحص الـ ATS العالمية ومخصصة لطلاب وخريجي صيدلة الدلتا.
          </p>
        </div>

        {/* ATS Score & Download */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">ATS Score</span>
              <span className="text-xl font-black text-[#39ff14] font-mono">{atsScore}%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#39ff14]/20 border border-[#39ff14]/40 flex items-center justify-center text-xs font-black text-[#39ff14]">
              {atsScore >= 80 ? 'A+' : 'B'}
            </div>
          </div>

          <button
            onClick={handlePrintPDF}
            className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            طباعة / تصدير PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* LEFT COLUMN: Controls & Form Editor (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          
          {/* Template & Color Selector */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-cyan-400" />
                نماذج التصميم الاحترافية (6 Templates)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'harvard_ats', name: 'Harvard ATS Classic', badge: 'Top ATS' },
                { id: 'modern_split', name: 'Modern Dual-Tone', badge: 'New' },
                { id: 'executive_serif', name: 'Executive Serif', badge: 'Leadership' },
                { id: 'clinical_minimal', name: 'Clinical Minimal', badge: 'Pharma' },
                { id: 'creative_badge', name: 'Creative Grid', badge: 'Modern' },
                { id: 'compact_onepage', name: 'Compact 1-Page', badge: 'Fast' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as TemplateId)}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    template === t.id
                      ? 'bg-[#39ff14]/15 border-[#39ff14] text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-black">{t.name}</div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                    {t.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1.5 rounded-2xl bg-white/5 border border-white/10">
            {[
              { id: 'personal', label: 'البيانات', icon: User },
              { id: 'summary', label: 'الملخص', icon: FileText },
              { id: 'education', label: 'التعليم', icon: GraduationCap },
              { id: 'experience', label: 'الخبرات', icon: Briefcase },
              { id: 'skills', label: 'المهارات', icon: Code },
              { id: 'aliens', label: 'Aliens Crew', icon: Award },
              { id: 'certifications', label: 'الشهادات', icon: BookOpen },
            ].map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-[#39ff14] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content per activeSection */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            
            {/* 1. Personal Details */}
            {activeSection === 'personal' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  المعلومات الشخصية والاتصال
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الاسم الكامل (Full Name)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">المسمى المهني المستهدف (Target Title)</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">رقم الهاتف / الواتساب</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">المدينة / الموقع</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">حساب LinkedIn</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Summary & Presets */}
            {activeSection === 'summary' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    الملخص المهني (Professional Summary)
                  </h3>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 font-bold block">💡 مقترحات جاهزة بضغطة واحدة:</span>
                  <div className="space-y-2">
                    {presetSummaries.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSummary(p.text)}
                        className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#39ff14]/10 border border-white/5 hover:border-[#39ff14]/30 text-right transition-all text-xs group cursor-pointer"
                      >
                        <span className="font-black text-white group-hover:text-[#39ff14] block mb-0.5">{p.title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{p.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs leading-relaxed resize-none focus:outline-none focus:border-[#39ff14]"
                />
              </div>
            )}

            {/* 3. Education */}
            {activeSection === 'education' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    المسار التعليمي والجامعي
                  </h3>
                </div>

                {education.map((edu, idx) => (
                  <div key={edu.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">الدرجة والتخصص</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].degree = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">الجامعة والكلية</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].institution = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="المعدل التراكمي (GPA)"
                        value={edu.gpa}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].gpa = e.target.value;
                          setEducation(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="سنة التخرج المتوقعة"
                        value={edu.gradYear}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].gradYear = e.target.value;
                          setEducation(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Experience */}
            {activeSection === 'experience' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    التدريبات الميدانية والخبرات
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setExperiences(prev => [
                        ...prev,
                        {
                          id: 'exp-' + Date.now(),
                          role: 'Trainee',
                          company: 'Company / Pharmacy',
                          location: 'Egypt',
                          startDate: '2025',
                          endDate: 'Present',
                          current: false,
                          bullets: ['Key achievement or responsibility.']
                        }
                      ]);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#39ff14] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة تدريب
                  </button>
                </div>

                {experiences.map((exp, idx) => (
                  <div key={exp.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-400">خبرة #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setExperiences(prev => prev.filter(x => x.id !== exp.id))}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="المسمى الوظيفي"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[idx].role = e.target.value;
                        setExperiences(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="المؤسسة / الصيدلية"
                        value={exp.company}
                        onChange={(e) => {
                          const copy = [...experiences];
                          copy[idx].company = e.target.value;
                          setExperiences(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="الفترة الزمنية"
                        value={`${exp.startDate} - ${exp.endDate}`}
                        onChange={(e) => {
                          const copy = [...experiences];
                          copy[idx].startDate = e.target.value;
                          setExperiences(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Skills */}
            {activeSection === 'skills' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  المهارات والكفاءات (Skills Categories)
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">المهارات الصيدلانية والإكلينيكية (Clinical Skills)</label>
                  <input
                    type="text"
                    value={clinicalSkills}
                    onChange={(e) => setClinicalSkills(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">البرامج والمهارات التقنية (Technical Tools)</label>
                  <input
                    type="text"
                    value={technicalSkills}
                    onChange={(e) => setTechnicalSkills(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">المهارات الشخصية والقيادية (Soft Skills)</label>
                  <input
                    type="text"
                    value={softSkills}
                    onChange={(e) => setSoftSkills(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* 6. Aliens Crew & Extracurricular */}
            {activeSection === 'aliens' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  نشاط Aliens والعمل الطلابي والتطوعي
                </h3>

                {extracurriculars.map((extra, idx) => (
                  <div key={extra.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <input
                      type="text"
                      placeholder="الكيان / النشاط"
                      value={extra.organization}
                      onChange={(e) => {
                        const copy = [...extracurriculars];
                        copy[idx].organization = e.target.value;
                        setExtracurriculars(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="الدور واللجنة"
                      value={extra.role}
                      onChange={(e) => {
                        const copy = [...extracurriculars];
                        copy[idx].role = e.target.value;
                        setExtracurriculars(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="أبرز الإنجازات والمسؤوليات"
                      value={extra.description}
                      onChange={(e) => {
                        const copy = [...extracurriculars];
                        copy[idx].description = e.target.value;
                        setExtracurriculars(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 7. Certifications */}
            {activeSection === 'certifications' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-black text-[#39ff14] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  الشهادات والاعتمادات المهنية
                </h3>

                {certifications.map((cert, idx) => (
                  <div key={cert.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <input
                      type="text"
                      placeholder="اسم الشهادة"
                      value={cert.title}
                      onChange={(e) => {
                        const copy = [...certifications];
                        copy[idx].title = e.target.value;
                        setCertifications(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="الجهة المانحة"
                        value={cert.issuer}
                        onChange={(e) => {
                          const copy = [...certifications];
                          copy[idx].issuer = e.target.value;
                          setCertifications(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="السنة"
                        value={cert.date}
                        onChange={(e) => {
                          const copy = [...certifications];
                          copy[idx].date = e.target.value;
                          setCertifications(copy);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ATS Improvement Suggestions Box */}
          {atsSuggestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <TrendingUp className="w-4 h-4" />
                توصيات لرفع تقييم الـ ATS إلى 100%:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
                {atsSuggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live High-Fidelity Paper CV Preview (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-4">
            
            {/* Paper Preview Container */}
            <div 
              id="cv-print-area"
              className={`w-full bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl transition-all border border-slate-200 min-h-[900px] text-[13px] leading-relaxed font-sans ${
                template === 'executive_serif' ? 'font-serif' : ''
              }`}
            >
              
              {/* === TEMPLATE: HARVARD ATS CLASSIC === */}
              {template === 'harvard_ats' && (
                <div className="space-y-5 text-left" dir="ltr">
                  {/* Header */}
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">{fullName}</h1>
                    <p className="text-xs font-bold text-slate-700">{jobTitle}</p>
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-center gap-3 pt-1">
                      <span>{location}</span>
                      <span>•</span>
                      <span>{phone}</span>
                      <span>•</span>
                      <span className="font-mono">{email}</span>
                      <span>•</span>
                      <span>{linkedin}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Education
                    </h2>
                    {education.map(edu => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{edu.institution}</span>
                          <span>{edu.location}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-700 italic">
                          <span>{edu.degree}</span>
                          <span>{edu.gradYear}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold">GPA:</span> {edu.gpa} | <span className="font-semibold">Coursework:</span> {edu.coursework}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Professional Experience & Internships
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{exp.company}</span>
                          <span>{exp.location}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-700 italic">
                          <span>{exp.role}</span>
                          <span>{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 text-[11px] text-slate-700 space-y-0.5">
                          {exp.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Extracurricular Leadership (Aliens) */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Leadership & Extracurricular Activities
                    </h2>
                    {extracurriculars.map(extra => (
                      <div key={extra.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{extra.organization}</span>
                          <span>{extra.dates}</span>
                        </div>
                        <div className="text-xs text-slate-700 italic">{extra.role}</div>
                        <p className="text-[11px] text-slate-600">{extra.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Core Competencies & Skills
                    </h2>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <p><span className="font-bold text-slate-900">Clinical & Pharmaceutical:</span> {clinicalSkills}</p>
                      <p><span className="font-bold text-slate-900">Technical Tools & Software:</span> {technicalSkills}</p>
                      <p><span className="font-bold text-slate-900">Leadership & Soft Skills:</span> {softSkills}</p>
                      <p><span className="font-bold text-slate-900">Languages:</span> {languages}</p>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                      Certifications & Accreditations
                    </h2>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      {certifications.map(c => (
                        <p key={c.id}>
                          <span className="font-bold text-slate-900">{c.title}</span> — {c.issuer} ({c.date})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TEMPLATE: MODERN DUAL-TONE SPLIT === */}
              {template === 'modern_split' && (
                <div className="space-y-6 text-left" dir="ltr">
                  {/* Modern Header Banner */}
                  <div className="bg-slate-900 text-white p-6 rounded-xl space-y-2">
                    <h1 className="text-2xl font-black tracking-tight text-[#39ff14]">{fullName}</h1>
                    <p className="text-xs font-semibold text-slate-200">{jobTitle}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-300 pt-2 border-t border-white/10">
                      <span>📍 {location}</span>
                      <span>📞 {phone}</span>
                      <span>✉️ {email}</span>
                      <span>🔗 {linkedin}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Sidebar (Skills & Certs) */}
                    <div className="space-y-5 md:border-r border-slate-200 md:pr-4">
                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Clinical Skills</h3>
                        <div className="flex flex-wrap gap-1">
                          {clinicalSkills.split(',').map((s, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-800">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Tools & Tech</h3>
                        <div className="flex flex-wrap gap-1">
                          {technicalSkills.split(',').map((s, i) => (
                            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded font-medium">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Certifications</h3>
                        {certifications.map(c => (
                          <div key={c.id} className="text-[11px] space-y-0.5">
                            <p className="font-bold text-slate-900">{c.title}</p>
                            <p className="text-slate-500 text-[10px]">{c.issuer} • {c.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Main Body */}
                    <div className="md:col-span-2 space-y-5">
                      <div className="space-y-1">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Profile</h3>
                        <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Experience</h3>
                        {experiences.map(exp => (
                          <div key={exp.id} className="space-y-1 border-l-2 border-emerald-500 pl-3">
                            <div className="flex justify-between font-bold text-slate-900 text-xs">
                              <span>{exp.role}</span>
                              <span className="text-slate-500 text-[10px]">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="text-xs text-emerald-800 font-medium">{exp.company}</div>
                            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Education</h3>
                        {education.map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <div className="font-bold text-slate-900 text-xs">{edu.degree}</div>
                            <div className="text-xs text-slate-600">{edu.institution} ({edu.gradYear})</div>
                            <div className="text-[10px] text-emerald-700 font-semibold">GPA: {edu.gpa}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === OTHER TEMPLATES (EXECUTIVE, MINIMAL, CREATIVE, COMPACT) FALLBACK TO CLEAN ATS RENDER === */}
              {template !== 'harvard_ats' && template !== 'modern_split' && (
                <div className="space-y-5 text-left" dir="ltr">
                  <div className="border-b pb-3 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{fullName}</h1>
                    <p className="text-xs text-slate-600 font-medium">{jobTitle}</p>
                    <div className="text-[11px] text-slate-500 flex gap-3">
                      <span>{email}</span> • <span>{phone}</span> • <span>{location}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Executive Summary</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Experience</h3>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-xs">
                          <span>{exp.role} — {exp.company}</span>
                          <span className="text-slate-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <ul className="list-disc list-inside text-[11px] text-slate-700">
                          {exp.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Education</h3>
                    {education.map(edu => (
                      <div key={edu.id} className="text-xs space-y-0.5">
                        <p className="font-bold">{edu.degree}</p>
                        <p className="text-slate-600">{edu.institution} | GPA: {edu.gpa}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Aliens Student Activity Leadership</h3>
                    {extracurriculars.map(extra => (
                      <div key={extra.id} className="text-xs">
                        <span className="font-bold">{extra.role}</span> — {extra.organization}
                        <p className="text-[11px] text-slate-600">{extra.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Skills & Competencies</h3>
                    <p className="text-[11px] text-slate-700">{clinicalSkills}, {technicalSkills}, {softSkills}</p>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
