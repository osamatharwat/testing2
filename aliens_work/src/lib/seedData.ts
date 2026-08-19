import { 
  Profile, 
  AccessCode, 
  DynamicQuestion, 
  Application, 
  PerformanceEvaluation, 
  EventItem, 
  GalleryItem, 
  MemberProject, 
  Internship, 
  CulturalResource, 
  AuditLog, 
  SiteSettings,
  EventRegistration,
  CommitteeEntity,
  MemoryPost
} from '../types';

export const INITIAL_COMMITTEES: CommitteeEntity[] = [
  {
    key: 'marketing',
    name: 'Marketing Committee',
    name_ar: 'لجنة التسويق والعلامة التجارية',
    tag: 'Growth & Branding',
    description: 'وضع الخطط والاستراتيجيات الترويجية لنشر فكر وتأثير Aliens داخل جامعة الدلتا وخارجها.',
    head_id: 'user-mkt-head',
    sub_head_id: 'user-mkt-sub',
    tasks: ['وضع الخطط التسويقية', 'صناعة محتوى الحملات الإعلانية', 'تحليل تفاعل الجمهور والسوق'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'media',
    name: 'Media Committee',
    name_ar: 'لجنة الميديا والإنتاج المرئي',
    tag: 'Creative Production',
    description: 'عين التيم المرئية التي توثق الرحلة وتنتج التصاميم الجرافيكية والفيديوهات السينمائية.',
    head_id: 'user-media-head',
    sub_head_id: null,
    tasks: ['تصميم الهويات البصرية والبوسترات', 'التصوير والمونتاج الاحترافي', 'تغطية الفعاليات والمؤتمرات'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'pr',
    name: 'Public Relations Committee',
    name_ar: 'لجنة العلاقات العامة والرعاية',
    tag: 'Partnerships & Sponsors',
    description: 'بناء الجسور مع شركات الأدوية الكبرى وسلاسل الصيدليات والمحاضرين لاستقطاب الرعاة.',
    head_id: 'user-pr-head',
    sub_head_id: null,
    tasks: ['استقطاب الرعاة لملتقى التوظيف', 'التنسيق مع كبار المتحدثين', 'تمثيل التيم في المحافل الرسمية'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'ir',
    name: 'Internal Relations Committee',
    name_ar: 'لجنة العلاقات الداخلية والمتابعة',
    tag: 'Team Culture & Evaluation',
    description: 'الاهتمام بالطاقم الداخلي، متابعة الأداء والتقييمات الشهرية، وإدارة التعيينات.',
    head_id: 'user-ir-head',
    sub_head_id: null,
    tasks: ['متابعة وتقييم أداء الأعضاء شهرياً', 'إجراء مقابلات التعيين والانترفيو', 'تنظيم الأنشطة التحفيزية'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'magic_hand',
    name: 'Magic Hand Committee',
    name_ar: 'لجنة الأعمال اليدوية والديكور',
    tag: 'Cosmic Atmosphere',
    description: 'تحويل الأفكار إلى ديكورات ومجسمات فضاء واقعية ومبهرة تعكس الهوية الكونية.',
    tasks: ['صناعة مجسمات الفضاء والديكورات', 'تجهيز بوابات المعارض', 'تصميم الهدايا التذكارية'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'charity',
    name: 'Charity Committee',
    name_ar: 'لجنة العمل المجتمعي والخيري',
    tag: 'Community Impact',
    description: 'تنظيم القوافل الطبية الإنسانية وحملات التبرع بالدم والمساعدات لخدمة المجتمع.',
    tasks: ['تنظيم القوافل الطبية الدورية', 'حملات التبرع بالدم والأدوية', 'التوعية الصحية المجتمعية'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'secretary',
    name: 'Secretary Committee',
    name_ar: 'لجنة السكرتارية والتنظيم الإداري',
    tag: 'Operations & Data',
    description: 'المسؤولون عن دقة البيانات، توثيق الاجتماعات، وإدارة جداول الحضور والانضباط الإداري.',
    tasks: ['إدارة قواعد بيانات الحضور والأعضاء', 'توثيق المحاضر والتقارير الرسمية', 'تنظيم المراسلات الإدارية'],
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    key: 'event_planning',
    name: 'Event Planning Committee',
    name_ar: 'لجنة تخطيط وإدارة الفعاليات',
    tag: 'Logistics & Execution',
    description: 'تخطيط الفعاليات وإدارة اللوجستيات وسير القاعات لضمان تجربة سلسة ومبهرة.',
    tasks: ['وضع الجداول الزمنية للفعاليات', 'إدارة حركة الحضور داخل القاعات', 'التنسيق اللوجستي لمسرح الفعاليات'],
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-og-1',
    email: 'og@aliensdelta.org',
    username: 'og_commander',
    full_name: 'Dr. Osama Sarwat (OG Founder)',
    role: 'og',
    position: 'Original Gangster (OG) / Super Admin',
    committee: 'leadership',
    committee_key: 'leadership',
    committee_position: 'Founder & Supreme Commander',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2019-09-01T00:00:00Z',
    bio: 'مؤسس نشاط Aliens الطلابي بكلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا عام 2019.',
    phone: '+201009988776',
    faculty_level: 'Graduated'
  },
  {
    id: 'user-team-head',
    email: 'teamhead@aliensdelta.org',
    username: 'aliens_president',
    full_name: 'أحمد محمود النجار',
    role: 'team_head',
    position: 'Team Head (Leader)',
    committee: 'leadership',
    committee_key: 'leadership',
    committee_position: 'Leader',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2023-10-01T00:00:00Z',
    bio: 'قائد النشاط الطلابي للعام الأكاديمي 2025/2026.',
    phone: '+201012345678',
    faculty_level: '5'
  },
  {
    id: 'user-mkt-head',
    email: 'mkt.head@aliensdelta.org',
    username: 'mkt_head',
    full_name: 'سارة خالد المنشاوي',
    role: 'head',
    position: 'Head of Marketing',
    committee: 'marketing',
    committee_key: 'marketing',
    committee_position: 'Head',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2024-09-01T00:00:00Z',
    phone: '+201023456789',
    faculty_level: '4'
  },
  {
    id: 'user-mkt-sub',
    email: 'mkt.sub@aliensdelta.org',
    username: 'mkt_subhead',
    full_name: 'عمر شريف الدسوقي',
    role: 'sub_head',
    position: 'Sub Head of Marketing',
    committee: 'marketing',
    committee_key: 'marketing',
    committee_position: 'Sub Head',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2024-10-01T00:00:00Z',
    phone: '+201034567890',
    faculty_level: '3'
  },
  {
    id: 'user-ir-head',
    email: 'ir.head@aliensdelta.org',
    username: 'ir_head_lead',
    full_name: 'مريم طارق السعيد',
    role: 'head',
    position: 'Head of Internal Relations',
    committee: 'ir',
    committee_key: 'ir',
    committee_position: 'Head',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2024-09-01T00:00:00Z',
    phone: '+201045678901',
    faculty_level: '4'
  },
  {
    id: 'user-ir-eval-1',
    email: 'ir.evaluator@aliensdelta.org',
    username: 'ir_evaluator_youssef',
    full_name: 'يوسف حازم خليل',
    role: 'ir',
    position: 'IR Evaluator',
    committee: 'ir',
    committee_key: 'ir',
    committee_position: 'Evaluator',
    membership_status: 'active_member',
    is_board_member: false,
    created_at: '2024-10-15T00:00:00Z',
    phone: '+201056789012',
    faculty_level: '3'
  },
  {
    id: 'user-pr-head',
    email: 'pr.head@aliensdelta.org',
    username: 'pr_head_aliens',
    full_name: 'كريم وائل الزهيري',
    role: 'head',
    position: 'Head of Public Relations',
    committee: 'pr',
    committee_key: 'pr',
    committee_position: 'Head',
    membership_status: 'active_member',
    is_board_member: true,
    created_at: '2024-09-01T00:00:00Z',
    phone: '+201067890123',
    faculty_level: '4'
  },
  {
    id: 'user-member-1',
    email: 'member.nour@aliensdelta.org',
    username: 'nour_marketing',
    full_name: 'نور الدين مصطفى',
    role: 'member',
    position: 'Marketing Specialist',
    committee: 'marketing',
    committee_key: 'marketing',
    committee_position: 'Member',
    membership_status: 'active_member',
    is_board_member: false,
    assigned_ir: 'user-ir-eval-1',
    created_at: '2024-11-01T00:00:00Z',
    phone: '+201078901234',
    faculty_level: '2'
  },
  {
    id: 'user-guest-1',
    email: 'guest.student@delta.edu.eg',
    username: 'guest_student',
    full_name: 'زياد محمد إبراهيم',
    role: 'guest',
    position: 'Registered User',
    committee: '',
    membership_status: 'registered',
    is_board_member: false,
    created_at: '2025-01-10T00:00:00Z',
    phone: '+201089012345',
    faculty_level: '1'
  }
];

export const INITIAL_ACCESS_CODES: AccessCode[] = [
  {
    id: 'code-og',
    code: 'OG-SUPREME-2026',
    committee: 'leadership',
    position: 'Leader',
    role: 'og',
    max_uses: 5,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود ترقية القيادة العليا لمؤسسي النشاط (OG Founder)'
  },
  {
    id: 'code-leader',
    code: 'LEADER-DELTA-2026',
    committee: 'leadership',
    position: 'Leader',
    role: 'team_head',
    max_uses: 5,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود ترقية قائد ورئيس النشاط الطلابي'
  },
  {
    id: 'code-data-analyst',
    code: 'DATA-ANALYST-2026',
    committee: 'secretary',
    position: 'Sub Head',
    role: 'sub_head',
    max_uses: 10,
    current_uses: 0,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود مسؤولي الداتا أناليسيز والتحليل الإحصائي'
  },
  {
    id: 'code-head-mkt',
    code: 'HEAD-MARKETING-2026',
    committee: 'marketing',
    position: 'Head',
    role: 'head',
    max_uses: 3,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود رئيس لجنة التسويق'
  },
  {
    id: 'code-head-media',
    code: 'HEAD-MEDIA-2026',
    committee: 'media',
    position: 'Head',
    role: 'head',
    max_uses: 3,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود رئيس لجنة الميديا'
  },
  {
    id: 'code-head-pr',
    code: 'HEAD-PR-2026',
    committee: 'pr',
    position: 'Head',
    role: 'head',
    max_uses: 3,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود رئيس لجنة العلاقات العامة'
  },
  {
    id: 'code-head-ir',
    code: 'HEAD-IR-2026',
    committee: 'ir',
    position: 'Head',
    role: 'head',
    max_uses: 3,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود رئيس لجنة العلاقات الداخلية'
  },
  {
    id: 'code-ir-eval',
    code: 'IR-EVALUATOR-2026',
    committee: 'ir',
    position: 'Member',
    role: 'ir',
    max_uses: 30,
    current_uses: 2,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود مقيمي ومسؤولي المتابعة بلجنة العلاقات الداخلية'
  },
  {
    id: 'code-member-gen',
    code: 'DELTA-MEMBER-2026',
    committee: 'marketing',
    position: 'Member',
    role: 'member',
    max_uses: 100,
    current_uses: 1,
    is_active: true,
    single_use: false,
    created_by: 'Dr. Osama Sarwat',
    created_at: '2026-01-01T00:00:00Z',
    notes: 'كود الانضمام العام لأعضاء تيم Aliens'
  }
];

export const INITIAL_DYNAMIC_QUESTIONS: DynamicQuestion[] = [
  // Global Base Questions
  {
    id: 'q-global-1',
    category: 'global',
    question_text: 'لماذا ترغب في الانضمام إلى Aliens Student Activity في كلية الصيدلة؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 1,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-global-2',
    category: 'global',
    question_text: 'كيف توازن بين دراستك في كلية الصيدلة والتزاماتك في النشاط الطلابي؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 2,
    created_at: '2026-01-01T00:00:00Z'
  },
  // IR Questions
  {
    id: 'q-ir-1',
    category: 'ir',
    question_text: 'كيف تتصرف إذا واجهت ضغطاً شديداً أو خلافاً مع زميل في الفريق أثناء تجهيز المعرض؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 3,
    created_at: '2026-01-01T00:00:00Z'
  },
  // Committee-Specific Questions
  {
    id: 'q-mkt-1',
    category: 'committee',
    committee_key: 'marketing',
    question_text: 'ما هي الأفكار المبتكرة التي تقترحها للترويج لملتقى التوظيف الصيدلي القادم؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-media-1',
    category: 'committee',
    committee_key: 'media',
    question_text: 'ما هي البرامج التي تجيد العمل عليها؟ (Photoshop / Premiere / Illustrator / After Effects / DaVinci) ورابط أعمالك السابقة إن وجد.',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-pr-1',
    category: 'committee',
    committee_key: 'pr',
    question_text: 'كيف تتواصل مع مسؤول HR أو مدير مصنع أدوية لإقناعه برعاية ملتقى توظيف صيدلة الدلتا؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-ir-comm-1',
    category: 'committee',
    committee_key: 'ir',
    question_text: 'ما هي معاييرك لتقييم أداء عضو متطوع، وكيف تحفزه عند تراجع نشاطه؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-magic-1',
    category: 'committee',
    committee_key: 'magic_hand',
    question_text: 'ما هي مهاراتك اليدوية في تصميم المجسمات الكونية والديكور المسرحي؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-charity-1',
    category: 'committee',
    committee_key: 'charity',
    question_text: 'هل شاركت سابقاً في قوافل طبية أو حملات تبرع بالدم؟ وكيف تنظم قافلة علاجية للقرى؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-sec-1',
    category: 'committee',
    committee_key: 'secretary',
    question_text: 'ما مدى إتقانك لبرامج Excel وجداول Google Sheets وإدارة وتدقيق قواعد البيانات؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'q-ep-1',
    category: 'committee',
    committee_key: 'event_planning',
    question_text: 'كيف تدير حركة وتوزيع 500 زائر داخل قاعة المؤتمرات دون حدوث تكدس أو ارتباك؟',
    question_type: 'textarea',
    is_required: true,
    order_index: 4,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    applicant_name: 'محمود سامي الجيار',
    phone: '01019988776',
    faculty_level: '2',
    committee_key: 'marketing',
    committee_name: 'Marketing (التسويق)',
    dynamic_answers: {
      'لماذا ترغب في الانضمام إلى Aliens Student Activity في كلية الصيدلة؟': 'أرغب في تطوير مهاراتي في التسويق الدوائي وإدارة الحملات الإعلانية.',
      'ما هي الأفكار المبتكرة التي تقترحها للترويج لملتقى التوظيف الصيدلي القادم؟': 'استخدام مقاطع Reels تفاعلية مع خريجين ناجحين وتحديات علمية تفاعلية.'
    },
    role_requested: 'Member',
    status: 'pending',
    ir_decision: 'pending',
    head_decision: 'pending',
    created_at: '2026-02-10T14:30:00Z'
  },
  {
    id: 'app-2',
    applicant_name: 'آية وائل البنداري',
    phone: '01028877665',
    faculty_level: '3',
    committee_key: 'media',
    committee_name: 'Media (الميديا والإعلام)',
    dynamic_answers: {
      'لماذا ترغب في الانضمام إلى Aliens Student Activity في كلية الصيدلة؟': 'لدي شغف بالمونتاج وتوثيق المؤتمرات الطبية.',
      'ما هي البرامج التي تجيد العمل عليها؟': 'Photoshop, Premiere Pro, After Effects (portfolio link available)'
    },
    role_requested: 'Member',
    status: 'approved',
    ir_decision: 'approve',
    ir_evaluator_id: 'user-ir-head',
    ir_evaluator_name: 'مريم طارق السعيد',
    ir_decision_note: 'ممتازة في المقابلة الشخصية ولديها بورتفوليو قوي.',
    head_decision: 'approve',
    head_evaluator_id: 'user-og-1',
    head_evaluator_name: 'Dr. Osama Sarwat',
    head_decision_note: 'معتمدة ومقبولة في الميديا.',
    created_at: '2026-02-08T11:00:00Z'
  },
  {
    id: 'app-3',
    applicant_name: 'طارق عبد المنعم الشامي',
    phone: '01037766554',
    faculty_level: '2',
    committee_key: 'marketing',
    committee_name: 'Marketing (التسويق)',
    dynamic_answers: {
      'لماذا ترغب في الانضمام إلى Aliens Student Activity في كلية الصيدلة؟': 'مهتم بإعداد المحتوى الطبي.',
      'ما هي الأفكار المبتكرة التي تقترحها للترويج لملتقى التوظيف الصيدلي القادم؟': 'توزيع بوسترات في الكلية.'
    },
    role_requested: 'Member',
    status: 'waiting_for_final_decision', // Conflict state example
    ir_decision: 'approve',
    ir_evaluator_name: 'يوسف حازم خليل',
    ir_decision_note: 'حماسه عالي جداً وملتزم.',
    head_decision: 'reject',
    head_evaluator_name: 'سارة خالد المنشاوي',
    head_decision_note: 'نحتاج خبرة عملية أكبر في التصاميم التسويقية.',
    created_at: '2026-02-12T09:20:00Z'
  }
];

export const INITIAL_EVALUATIONS: PerformanceEvaluation[] = [
  {
    id: 'eval-1',
    member_id: 'user-member-1',
    member_name: 'نور الدين مصطفى',
    member_committee: 'marketing',
    evaluator_id: 'user-ir-eval-1',
    evaluator_name: 'يوسف حازم خليل',
    evaluator_role: 'ir',
    evaluation_month: '2026-01',
    score: 92,
    criteria_scores: {
      attendance: 19,
      participation: 18,
      tasks_quality: 19,
      teamwork: 18,
      communication: 18
    },
    notes: 'أداء متميز جداً في الترويج لملتقى التوظيف والالتزام بجميع الاجتماعات الأسبوعية.',
    recommendation: 'الترشيح لتولي مسؤولية حملة السوشيال ميديا القادمة.',
    created_at: '2026-02-01T10:00:00Z'
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'event-job-fair-5',
    title: 'Delta Pharma Job Fair — Season 5 🚀',
    description: 'أكبر ملتقى توظيف صيدلي وتدريب صيفي في الدلتا بمشاركة أكثر من 25 مصنع وشركة أدوية كبرى وسلاسل صيدليات.',
    date: '2026-04-15',
    location: 'المجمع الرئيسي — جامعة الدلتا للعلوم والتكنولوجيا',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    whatsapp_groups: [
      { id: 'wg-1', title: 'جروب المعرض التوظيفي #1', link: 'https://chat.whatsapp.com/sampleJobFairGroup1', current_members: 480, max_members: 500 },
      { id: 'wg-2', title: 'جروب المعرض التوظيفي #2', link: 'https://chat.whatsapp.com/sampleJobFairGroup2', current_members: 310, max_members: 500 }
    ],
    whatsapp_group: 'https://chat.whatsapp.com/sampleJobFairGroup1',
    committee_key: 'all',
    category: 'job_fair',
    is_public: true,
    max_attendees: 1000,
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'event-clinical-masterclass',
    title: 'Advanced OTC & Clinical Cases Masterclass 🩺',
    description: 'ورشة عمل سريرية مكثفة مع كبار الاستشاريين لمناقشة أكثر من 50 حالة OTC شائعة في الصيدليات وكيفية التعامل مع التداخلات الدوائية.',
    date: '2026-03-20',
    location: 'مدرج كلية الصيدلة — قاعة د. إبراهيم بدران',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    whatsapp_groups: [
      { id: 'wg-otc-1', title: 'جروب ماستر كلاس OTC الرسمي', link: 'https://chat.whatsapp.com/sampleOTCMasterclass', current_members: 220, max_members: 500 }
    ],
    whatsapp_group: 'https://chat.whatsapp.com/sampleOTCMasterclass',
    committee_key: 'marketing',
    category: 'workshop',
    is_public: true,
    max_attendees: 300,
    created_at: '2026-01-15T00:00:00Z'
  }
];

export const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-1',
    event_id: 'event-job-fair-5',
    event_title: 'Delta Pharma Job Fair — Season 5 🚀',
    full_name: 'علي حسن السعيد',
    email: 'ali.hassan@delta.edu.eg',
    phone: '01001122334',
    faculty_level: '4',
    student_id: '202201948',
    registered_at: '2026-02-14T10:00:00Z',
    status: 'confirmed',
    ticket_code: 'TKT-DEMO-JOBFAIR5',
    notes: 'مهتم بالتقديم على شركات الأدوية العالمية'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    section_name: 'Job Fair Season 4 Highlights',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    caption: 'حضور قياسي وتكريم الرعاة في ختام ملتقى التوظيف الصيدلي الرابع.',
    likes_count: 84,
    liked_by_users: ['user-og-1', 'user-team-head', 'user-member-1'],
    comments: [
      {
        id: 'gc-1',
        gallery_id: 'gal-1',
        user_id: 'user-og-1',
        user_name: 'Dr. Osama Sarwat',
        user_role: 'og',
        comment_text: 'فخور جداً بطاقم التنظيم ومستوى التمثيل المشرف لكلية الصيدلة 🚀',
        created_at: '2026-01-20T12:00:00Z'
      }
    ],
    created_at: '2026-01-05T00:00:00Z'
  },
  {
    id: 'gal-2',
    section_name: 'Job Fair Season 4 Highlights',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    caption: 'جلسات المقابلات الفورية للطلاب مع مسؤولي الموارد البشرية لشركات الأدوية.',
    likes_count: 67,
    liked_by_users: ['user-mkt-head'],
    comments: [],
    created_at: '2026-01-05T00:00:00Z'
  },
  {
    id: 'gal-3',
    section_name: 'Cosmic Induction Day 2025',
    image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
    caption: 'يوم استقبال الأعضاء الجدد وشرح مسارات التميز في كل لجان الفضاء.',
    likes_count: 112,
    liked_by_users: ['user-team-head', 'user-ir-head'],
    comments: [],
    created_at: '2025-10-15T00:00:00Z'
  },
  {
    id: 'gal-4',
    section_name: 'Charity Medical Convoys',
    image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    caption: 'صرف الأدوية المجانية وإجراء الفحوصات الطبية لأهالي قرى الدلتا.',
    likes_count: 95,
    liked_by_users: ['user-og-1'],
    comments: [],
    created_at: '2025-12-01T00:00:00Z'
  }
];

export const INITIAL_MEMORIES: MemoryPost[] = [
  {
    id: 'mem-1',
    user_id: 'user-og-1',
    author_name: 'Dr. Osama Sarwat',
    author_avatar: 'https://ui-avatars.com/api/?name=Osama+Sarwat&background=07101d&color=39ff14',
    author_committee: 'Aliens Founder',
    memory_text: 'رحلتنا بدأت في 2019 بحلم بسيط وصادق: أن نبني بيئة تصنع قادة صيادلة حقيقيين. واليوم نرى طاقم Aliens يقود أكبر مؤتمرات الدلتا بكل فخر واحترافية. استمروا في التحليق! 🛸✨',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    likes_count: 48,
    liked_by_me: true,
    comments: [
      {
        id: 'c-1',
        memory_id: 'mem-1',
        user_id: 'user-team-head',
        author_name: 'أحمد محمود النجار',
        comment_text: 'فخورون بمسيرتك وبكل ما تعلمناه في هذه الرحلة الملهمة يا دكتور! 🚀',
        created_at: '2026-02-10T11:00:00Z'
      }
    ],
    created_at: '2026-02-09T18:00:00Z'
  }
];

export const INITIAL_PROJECTS: MemberProject[] = [
  {
    id: 'proj-1',
    user_id: 'user-member-1',
    author_name: 'نور الدين مصطفى (طالب صيدلة الدلتا)',
    project_title: 'DoseMate — Smart Drug Interaction Analyzer 💊',
    description: 'تطبيق ويب يساعد الصيادلة والطلاب في فحص التداخلات الدوائية وتعديل الجرعات لمرضى القصور الكلوي والكبدي بدقة فائقة.',
    contact_phone: '+201012345678',
    project_link: 'https://dosemate-demo.delta.edu',
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
    tags: ['Clinical Pharmacy', 'Web App', 'AI Assisted', 'Drug Interactions'],
    is_approved: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'proj-2',
    user_id: 'user-og-1',
    author_name: 'فريق بحثي من صيدلة الدلتا',
    project_title: 'DermaCosmetics Lab — Cosmeceuticals Formulas 🧴',
    description: 'مشروع تخرج طلابي لإنتاج مستحضرات عناية بالبشرة طبيعية 100% تم اختبارها معملياً واعتماد تركيباتها السريرية.',
    contact_phone: '+201023456789',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    tags: ['Cosmeceuticals', 'Formulation', 'R&D', 'Student Startup'],
    is_approved: true,
    created_at: '2026-01-20T00:00:00Z'
  }
];

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: 'int-1',
    company_name: 'Eva Pharma (إيڤا فارما)',
    title: 'Summer R&D and Quality Control Trainee',
    description: 'برنامج تدريب صيفي مدفوع لطلاب الفرق الرابعة والخامسة في مصانع الشركة بمدينة 6 أكتوبر للتدريب على خطوط الإنتاج والتحليل الدوائي.',
    location: '6th of October City, Giza',
    apply_link: 'https://careers.evapharma.com',
    deadline: '2026-05-15',
    is_exclusive_to_members: true,
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'int-2',
    company_name: 'El Ezaby Pharmacies (صيدليات العزبي)',
    title: 'Clinical & Community Pharmacist Internship',
    description: 'تدريب عملي على بروتوكولات صرف الروشتات ومتابعة الأمراض المزمنة في كبرى فروع الدلتا.',
    location: 'Mansoura & Tanta Branches',
    apply_link: 'https://elezabypharmacies.com/careers',
    deadline: '2026-04-30',
    is_exclusive_to_members: false,
    created_at: '2026-01-12T00:00:00Z'
  }
];

export const INITIAL_CULTURAL_RESOURCES: CulturalResource[] = [
  {
    id: 'cult-1',
    section_name: 'Clinical Pharmacy (الصيدلة الإكلينيكية)',
    title: 'Pharmacotherapy Handbook 11th Edition (Dipiro Guide)',
    description: 'المرجع الأشمل والأساسي لدراسة خطط العلاج الدوائي ومتابعة الحالات السريرية في المستشفيات.',
    resource_url: 'https://accesspharmacy.mhmedical.com',
    resource_type: 'book',
    is_premium_only: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cult-2',
    section_name: 'OTC Protocols (الأدوية اللاوصفية)',
    title: 'Aliens Comprehensive OTC Master Guide 2026',
    description: 'كتيب إرشادي كامل وشامل أعده أوائل خريجي صيدلة الدلتا لتشخيص وصرف أدوية الـ OTC بأمان تام.',
    resource_url: 'https://drive.google.com',
    resource_type: 'book',
    is_premium_only: true,
    created_at: '2026-01-05T00:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actor_id: 'user-og-1',
    actor_name: 'Dr. Osama Sarwat',
    action: 'SYSTEM_BOOTSTRAP',
    target: 'Aliens Space Operating System v5.0',
    new_value: 'Initial configuration, security hardening and RBAC initialized successfully.',
    timestamp: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  recruitment_status: 'open',
  recruitment_link: '#recruitment',
  pr_head_phone: '+201067890123',
  pr_sub_phone: '+201012345678',
  team_motto: 'Empowering Pharmacy Leaders, Bridging Academia with Industry.',
  announcement_banner: '🚀 باب التقديم لطاقم Aliens للعام الأكاديمي 2026 مفتوح الآن! انضم للنخبة.',
  announcement_active: true,
  hero_headline: 'Aliens Student Activity',
  hero_tagline: 'النشاط الطلابي الرائد بكلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا',
  hero_description: 'منصة كونية متكاملة لتمكين طلاب وخريجي الصيدلة، وتطوير المهارات القيادية والمهنية، وتنظيم أضخم الفعاليات وملتقيات التوظيف الصيدلي.',
  recruitment_notice: 'باب الانضمام مفتوح لجميع الفرق الدراسية بكلية الصيدلة. يتم تقييم كل مرشح بواسطة نظام الاعتماد المزدوج المستقل.',
  ir_max_members_limit: 30,
  supabase_auto_sync: true,
  warning_threshold: 60,
  warning_consecutive_months: 2,
  evaluation_criteria: [
    { key: 'attendance', label_ar: 'الحضور والالتزام بالاجتماعات', label_en: 'Attendance & Punctuality', max_points: 20, description_ar: 'الالتزام بمواعيد الميتنجات العامة والخاصة باللجنة.' },
    { key: 'participation', label_ar: 'المشاركة والتفاعل الإيجابي', label_en: 'Participation & Engagement', max_points: 20, description_ar: 'المشاركة بالأفكار وروح المبادرة أثناء الفعاليات والاجتماعات.' },
    { key: 'tasks_quality', label_ar: 'جودة وإتقان تسليم المهام', label_en: 'Task Quality & Deadlines', max_points: 20, description_ar: 'تنفيذ التكليفات في الموعد المحدد وبأعلى جودة إتقان.' },
    { key: 'teamwork', label_ar: 'العمل الجماعي وروح الفريق', label_en: 'Teamwork & Collaboration', max_points: 20, description_ar: 'التعاون مع زملائه باللجنة ودعم باقي اللجان في الفعاليات الكبرى.' },
    { key: 'communication', label_ar: 'التواصل الفعال واللباقة', label_en: 'Communication & Ethics', max_points: 20, description_ar: 'الأخلاق المهنية وسرعة الرد على قنوات التواصل الرسمية.' }
  ],
  whatsapp_templates: [
    {
      id: 'tpl-interview',
      key: 'interview_invitation',
      title_ar: '📅 دعوة المقابلة الشخصية (Interview)',
      message_template: 'مرحباً يا دكتور {applicant_name} 👽\n\nنتواصل معك من إدارة نشاط Aliens Student Activity بكلية الصيدلة — جامعة الدلتا بخصوص طلب انضمامك للجنة ({committee_name}).\n\nيسعدنا دعوتك لحضور المقابلة الشخصية (Interview) لتحديد انضمامك للطاقم الرسمي.\n🗓️ الموعد: {date_time}\n📍 المكان: {location}\n\nيرجى تأكيد الحضور بالرد على هذه الرسالة 🚀'
    },
    {
      id: 'tpl-accept',
      key: 'acceptance',
      title_ar: '🎉 إعلان القبول والترقية كعضو رسمي',
      message_template: 'ألف مبروك يا دكتور {applicant_name}! 🛸✨\n\nيسر مجلس إدارة Aliens Student Activity تهنئتك باجتياز المقابلات وقبولك رسمياً كعضو معتمد في لجنة ({committee_name}) برتبة ({role_requested}).\n\nيمكنك الآن تسجيل الدخول لمنصتنا ومتابعة خطط التدريب والمهام القادمة.\n\nWelcome aboard the Aliens Crew! 👽💚'
    },
    {
      id: 'tpl-reject',
      key: 'rejection',
      title_ar: '🙏 شكر واعتذار لطيف',
      message_template: 'مرحباً يا دكتور {applicant_name}،\n\nنشكرك جزيلاً على وقتك واهتمامك بالانضمام لنشاط Aliens Student Activity بكلية الصيدلة. نظراً لمحدودية المقاعد المتاحة في لجنة ({committee_name}) لهذا الموسم، لم نتمكن من قبول طلبك في هذه المرحلة.\n\nنتمنى لك كل التوفيق والتميز، ويسعدنا دائماً حضورك لجميع فعالياتنا ومؤتمراتنا القادمة!'
    },
    {
      id: 'tpl-ir-check',
      key: 'ir_checkin',
      title_ar: '🔍 متابعة دورية من مسؤول الـ IR',
      message_template: 'مساء الخير يا دكتور {member_name} 🌟\n\nمعاك {ir_name} مسؤول المتابعة والـ IR المسند لمتابعتك في نشاط Aliens. حابب أطمن على أخبارك وأداء مهامك في لجنة ({committee_name})، وهل بتواجه أي صعوبات نقدر نساعدك فيها؟'
    },
    {
      id: 'tpl-task',
      key: 'task_reminder',
      title_ar: '⏰ تذكير بموعد تسليم تكليف (Task)',
      message_template: 'تذكير لطيف يا دكتور {member_name} ⏳\n\nموعد تسليم تاسك لجنة ({committee_name}) هو {deadline}. برجاء رفع المطلوب قبل انتهاء الموعد للحفاظ على نقاط تقييمك الشهري وطاقة الـ XP ⚡'
    }
  ]
};
