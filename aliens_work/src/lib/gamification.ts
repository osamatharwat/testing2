import { PerformanceEvaluation, Profile, Memory, CulturalPost, MemberProject, EventRegistration } from '../types';
import { AppStore } from './store';

export interface TierInfo {
  tierNumber: number;
  tierNameAr: string;
  tierNameEn: string;
  titleAr: string;
  titleEn: string;
  badgeIcon: string;
  colorClass: string;
  bgGradient: string;
  borderColor: string;
  minXP: number;
}

export interface MemberAchievement {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const TIERS: TierInfo[] = [
  {
    tierNumber: 5,
    tierNameAr: 'أسطورة المجرة',
    tierNameEn: 'Galactic Legend',
    titleAr: 'قائد الأسطول الكوني',
    titleEn: 'Grand Admiral',
    badgeIcon: '🌟',
    colorClass: 'text-amber-300',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    borderColor: 'border-amber-400/50',
    minXP: 1800
  },
  {
    tierNumber: 4,
    tierNameAr: 'رائد فضاء فائق',
    tierNameEn: 'Cosmic Pioneer',
    titleAr: 'طليعة النجوم',
    titleEn: 'Vanguard Star',
    badgeIcon: '💎',
    colorClass: 'text-cyan-300',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-cyan-400/50',
    minXP: 1200
  },
  {
    tierNumber: 3,
    tierNameAr: 'سيد المدار',
    tierNameEn: 'Orbit Master',
    titleAr: 'قائد المدار',
    titleEn: 'Orbital Commander',
    badgeIcon: '🚀',
    colorClass: 'text-emerald-300',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-400/50',
    minXP: 700
  },
  {
    tierNumber: 2,
    tierNameAr: 'مستكشف دلتا',
    tierNameEn: 'Delta Scout',
    titleAr: 'ملاح النجوم',
    titleEn: 'Starlight Voyager',
    badgeIcon: '🛸',
    colorClass: 'text-purple-300',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-purple-400/50',
    minXP: 300
  },
  {
    tierNumber: 1,
    tierNameAr: 'متدرب نجمي',
    tierNameEn: 'Star Cadet',
    titleAr: 'عضو ناشئ',
    titleEn: 'Junior Explorer',
    badgeIcon: '🌌',
    colorClass: 'text-slate-300',
    bgGradient: 'from-slate-500/20 via-slate-700/10 to-transparent',
    borderColor: 'border-slate-500/30',
    minXP: 0
  }
];

export interface GamificationSummary {
  tier: TierInfo;
  nextTier: TierInfo | null;
  totalXP: number;
  progressToNext: number;
  averageScore: number;
  totalEvaluations: number;
  latestScore: number | null;
  scoreHistory: { month: string; score: number }[];
  achievements: MemberAchievement[];
  xpBreakdown: {
    evaluationsXP: number;
    memoriesXP: number;
    culturalXP: number;
    projectsXP: number;
    eventsXP: number;
  };
  activityCounts: {
    evaluationsCount: number;
    memoriesCount: number;
    culturalCount: number;
    projectsCount: number;
    eventsCount: number;
  };
}

/**
 * Calculates member tier, cosmic XP and holistic achievements across multiple activities:
 * evaluations, memories shared, cultural contributions, projects and event attendances.
 */
export function calculateMemberTier(
  memberId: string, 
  customEvaluations?: PerformanceEvaluation[]
): GamificationSummary {
  const evaluations = customEvaluations || AppStore.getEvaluations();
  const memories = AppStore.getMemories();
  const culturalPosts = AppStore.getCulturalPosts();
  const projects = AppStore.getProjects();
  const registrations = AppStore.getEventRegistrations();
  const profiles = AppStore.getProfiles();

  const currentMember = profiles.find(p => p.id === memberId);
  const memberName = currentMember?.full_name?.toLowerCase() || '';

  // 1. Evaluation metrics
  const memberEvals = evaluations.filter(e => e.member_id === memberId);
  const sortedEvals = [...memberEvals].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const scoreSum = sortedEvals.reduce((sum, e) => sum + (e.score || 0), 0);
  const averageScore = memberEvals.length > 0 ? Math.round(scoreSum / memberEvals.length) : 0;
  const latestScore = sortedEvals.length > 0 ? sortedEvals[sortedEvals.length - 1].score : null;

  const scoreHistory = sortedEvals.map(e => ({
    month: e.evaluation_month,
    score: e.score
  }));

  // 2. Activity metrics
  const memberMemories = memories.filter((m: any) => m.user_id === memberId || m.author_id === memberId || (memberName && m.author_name?.toLowerCase().includes(memberName)));
  const memberCultural = culturalPosts.filter((c: any) => c.user_id === memberId || c.created_by_id === memberId || (memberName && c.title?.toLowerCase().includes(memberName)));
  const memberProjects = projects.filter(p => p.user_id === memberId || (memberName && p.author_name?.toLowerCase().includes(memberName)));
  const memberEvents = registrations.filter(r => r.user_id === memberId || (currentMember?.email && r.email?.toLowerCase() === currentMember.email.toLowerCase()));

  // 3. XP Computation formula
  const evaluationsXP = Math.round(scoreSum * 10); // +10 XP per score point
  const memoriesXP = memberMemories.length * 75; // +75 XP per memory
  const culturalXP = memberCultural.length * 60; // +60 XP per cultural post/topic
  const projectsXP = memberProjects.length * 150; // +150 XP per project
  const eventsXP = memberEvents.length * 50; // +50 XP per event registration

  const totalXP = evaluationsXP + memoriesXP + culturalXP + projectsXP + eventsXP;

  // 4. Tier Determination based on totalXP (and evaluation baseline)
  let currentTier = TIERS[4]; // Default Tier 1
  let nextTier: TierInfo | null = TIERS[3];

  for (let i = 0; i < TIERS.length; i++) {
    if (totalXP >= TIERS[i].minXP) {
      currentTier = TIERS[i];
      nextTier = i > 0 ? TIERS[i - 1] : null;
      break;
    }
  }

  // Calculate percentage progression to next tier
  let progressToNext = 100;
  if (nextTier) {
    const currentMin = currentTier.minXP;
    const nextMin = nextTier.minXP;
    const progressSpan = nextMin - currentMin;
    const earnedSpan = totalXP - currentMin;
    progressToNext = Math.min(100, Math.max(0, Math.round((earnedSpan / progressSpan) * 100)));
  }

  // 5. Achievements
  const achievements = generateAchievements({
    evals: memberEvals,
    memoriesCount: memberMemories.length,
    culturalCount: memberCultural.length,
    projectsCount: memberProjects.length,
    eventsCount: memberEvents.length,
    totalXP
  });

  return {
    tier: currentTier,
    nextTier,
    totalXP,
    progressToNext,
    averageScore,
    totalEvaluations: memberEvals.length,
    latestScore,
    scoreHistory,
    achievements,
    xpBreakdown: {
      evaluationsXP,
      memoriesXP,
      culturalXP,
      projectsXP,
      eventsXP
    },
    activityCounts: {
      evaluationsCount: memberEvals.length,
      memoriesCount: memberMemories.length,
      culturalCount: memberCultural.length,
      projectsCount: memberProjects.length,
      eventsCount: memberEvents.length
    }
  };
}

interface AchievementParams {
  evals: PerformanceEvaluation[];
  memoriesCount: number;
  culturalCount: number;
  projectsCount: number;
  eventsCount: number;
  totalXP: number;
}

function generateAchievements(params: AchievementParams): MemberAchievement[] {
  const { evals, memoriesCount, culturalCount, projectsCount, eventsCount, totalXP } = params;

  const hasCenturion = evals.some(e => e.score === 100);
  const hasPerfectAttendance = evals.some(e => e.criteria_scores?.attendance === 20);
  const hasPerfectQuality = evals.some(e => e.criteria_scores?.tasks_quality === 20);
  const hasPerfectTeamwork = evals.some(e => ((e.criteria_scores?.teamwork ?? 0) + (e.criteria_scores?.communication ?? 0)) >= 38);
  const highStreakCount = evals.filter(e => e.score >= 90).length;

  return [
    {
      id: 'centurion',
      titleAr: 'العلامة الكاملة (100%)',
      titleEn: 'Centurion Master',
      descAr: 'تحقيق الدرجة النهائية 100/100 في تقييم شهري رسمي.',
      descEn: 'Achieved a perfect 100/100 monthly scorecard.',
      icon: '👑',
      unlocked: hasCenturion,
      rarity: 'legendary'
    },
    {
      id: 'memory_chronicler',
      titleAr: 'مؤرخ الذكريات',
      titleEn: 'Memory Chronicler',
      descAr: 'مشاركة صور ولحظات لا تنسى على حائط ذكريات Aliens.',
      descEn: 'Shared photos and memories on the official Memories Wall.',
      icon: '📸',
      unlocked: memoriesCount >= 1,
      rarity: 'common'
    },
    {
      id: 'cultural_scholar',
      titleAr: 'المفكر الصيدلي',
      titleEn: 'Cultural Pioneer',
      descAr: 'نشر مقال أو إثراء النقاش العلمي في المجتمع الثقافي.',
      descEn: 'Contributed articles or discussions in the Cultural Hub.',
      icon: '📚',
      unlocked: culturalCount >= 1,
      rarity: 'rare'
    },
    {
      id: 'project_innovator',
      titleAr: 'مبتكر المشاريع',
      titleEn: 'Project Innovator',
      descAr: 'تدشين ونشر مشروع مميز في معرض مشاريع الأعضاء.',
      descEn: 'Published a distinguished project in the Projects Showcase.',
      icon: '💡',
      unlocked: projectsCount >= 1,
      rarity: 'epic'
    },
    {
      id: 'event_vanguard',
      titleAr: 'طليعة الفعاليات',
      titleEn: 'Event Vanguard',
      descAr: 'المشاركة الفعالة والتسجيل في فعاليات النشاط وملتقيات التوظيف.',
      descEn: 'Registered and participated in official Aliens events.',
      icon: '🎟️',
      unlocked: eventsCount >= 1,
      rarity: 'common'
    },
    {
      id: 'iron_attendance',
      titleAr: 'حضور وانضباط فولاذي',
      titleEn: 'Iron Discipline',
      descAr: 'الالتزام الكامل بالحضور وتحقيق 20/20 في معيار الانضباط.',
      descEn: 'Scored 20/20 in Attendance & Discipline.',
      icon: '🛡️',
      unlocked: hasPerfectAttendance,
      rarity: 'rare'
    },
    {
      id: 'task_commando',
      titleAr: 'جودة استثنائية',
      titleEn: 'Task Commando',
      descAr: 'تنفيذ مهام وتكليفات اللجنة بأعلى درجات الجودة 20/20.',
      descEn: 'Delivered tasks with supreme quality 20/20.',
      icon: '🎯',
      unlocked: hasPerfectQuality,
      rarity: 'rare'
    },
    {
      id: 'team_pillar',
      titleAr: 'روح الفريق والتعاون',
      titleEn: 'Team Pillar',
      descAr: 'تميز استثنائي في التواصل والعمل الجماعي مع أعضاء الفريق.',
      descEn: 'Exemplary teamwork & communication score.',
      icon: '🤝',
      unlocked: hasPerfectTeamwork,
      rarity: 'epic'
    },
    {
      id: 'cosmic_overload',
      titleAr: 'الطاقة الكونية (+1000 XP)',
      titleEn: 'Cosmic Overload',
      descAr: 'تجاوز حاجز 1000 نقطة خبرة كونية عبر مختلف الأنشطة.',
      descEn: 'Accumulated over 1,000 Cosmic XP.',
      icon: '⚡',
      unlocked: totalXP >= 1000,
      rarity: 'legendary'
    }
  ];
}
