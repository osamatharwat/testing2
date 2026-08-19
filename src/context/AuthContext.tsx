import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, Role, MembershipStatus, CommitteeKey } from '../types';
import { AppStore } from '../lib/store';
import { getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  currentProfile: Profile | null;
  isAuthenticated: boolean;
  isTeamMember: boolean;
  login: (identifier: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string,
    username: string,
    email: string,
    pass: string,
    accessCode?: string,
    avatarUrl?: string
  ) => Promise<{ success: boolean; error?: string; isMember?: boolean }>;
  logout: () => void;
  switchProfile: (profileId: string) => void;
  updateProfileData: (updates: Partial<Profile>) => void;
  refreshProfiles: () => void;
  allProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'aliens_current_user_id_v5';
const REMEMBER_ME_KEY = 'aliens_remember_me_v5';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = getSupabaseClient();
  const cloudAuthEnabled = !!supabase;
  const [profiles, setProfiles] = useState<Profile[]>(() => AppStore.getProfiles());
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const toProfile = (row: any): Profile => ({
    id: row.id,
    email: row.email || '',
    username: row.username || row.email?.split('@')[0] || '',
    full_name: row.full_name || 'Aliens Member',
    avatar_url: row.avatar_url || undefined,
    role: String(row.role || 'member').toLowerCase() as Role,
    position: row.position || row.committee_position || 'Member',
    committee: (row.committee || row.committee_key || '') as CommitteeKey | '',
    committee_key: (row.committee_key || row.committee || '') as CommitteeKey | '',
    committee_position: row.committee_position || row.position || undefined,
    membership_status: String(row.role || 'member').toLowerCase() === 'guest' ? 'guest' : 'active_member',
    is_board_member: ['og', 'team_head', 'team_sub_head', 'head', 'sub_head'].includes(String(row.role || '').toLowerCase()),
    assigned_ir: row.assigned_ir || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || undefined,
    bio: row.bio || undefined,
    phone: row.phone || undefined
  });

  const setGuest = () => {
    const guest = AppStore.getProfiles().find(p => p.role === 'guest') || null;
    setCurrentProfile(guest);
    if (guest) localStorage.setItem(CURRENT_USER_KEY, guest.id);
    else localStorage.removeItem(CURRENT_USER_KEY);
  };

  const loadCloudProfile = async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
    if (!data) return null;
    return toProfile(data);
  };

  const refreshProfiles = async () => {
    if (cloudAuthEnabled && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      if (!error && data) setProfiles(data.map(toProfile));
      return;
    }

    const p = AppStore.getProfiles();
    setProfiles(p);
    const savedId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedId) {
      const found = p.find(item => item.id === savedId);
      if (found) {
        setCurrentProfile(found);
        return;
      }
    }
    setGuest();
  };

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      if (cloudAuthEnabled && supabase) {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        if (data.session?.user) {
          const profile = await loadCloudProfile(data.session.user.id);
          if (mounted && profile) setCurrentProfile(profile);
          else if (mounted) setGuest();
        } else {
          setGuest();
        }
        await refreshProfiles();
      } else {
        await refreshProfiles();
      }
    };
    void boot();

    const handleStoreChange = () => {
      if (!cloudAuthEnabled) {
        const p = AppStore.getProfiles();
        setProfiles(p);
      }
    };
    window.addEventListener('aliens_store_change', handleStoreChange);
    window.addEventListener('storage', handleStoreChange);

    let unsubscribe: (() => void) | undefined;
    if (cloudAuthEnabled && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          if (mounted) setGuest();
          return;
        }
        const profile = await loadCloudProfile(session.user.id);
        if (mounted) {
          if (profile) setCurrentProfile(profile);
          else setGuest();
          await refreshProfiles();
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }

    return () => {
      mounted = false;
      window.removeEventListener('aliens_store_change', handleStoreChange);
      window.removeEventListener('storage', handleStoreChange);
      unsubscribe?.();
    };
  }, []);

  const login = async (identifier: string, pass: string, rememberMe = true) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean || !pass) return { success: false, error: 'يرجى إدخال البريد/اسم المستخدم وكلمة المرور' };

    if (cloudAuthEnabled && supabase) {
      let email = clean;
      if (!clean.includes('@')) {
        const { data: profile, error } = await supabase.from('profiles').select('email').eq('username', clean).maybeSingle();
        if (error || !profile?.email) return { success: false, error: 'اسم المستخدم غير موجود أو غير مرتبط بحساب سحابي.' };
        email = profile.email.toLowerCase();
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { success: false, error: 'بيانات الدخول غير صحيحة أو الحساب غير مفعل.' };
      if (!rememberMe) sessionStorage.setItem(REMEMBER_ME_KEY, 'true');
      return { success: true };
    }

    if (!(import.meta as any).env?.DEV && (import.meta as any).env?.VITE_DEMO_MODE !== 'true') {
      return { success: false, error: 'تسجيل الدخول المحلي معطل في النسخة المنشورة. فعّل Supabase Authentication للنشر.' };
    }

    const pList = AppStore.getProfiles();
    const found = pList.find(p => p.email.toLowerCase() === clean || p.username.toLowerCase() === clean);
    if (!found) return { success: false, error: 'المستخدم غير موجود في وضع المعاينة المحلية.' };
    setCurrentProfile(found);
    localStorage.setItem(CURRENT_USER_KEY, found.id);
    return { success: true };
  };

  const signup = async (fullName: string, username: string, email: string, pass: string, accessCode?: string, avatarUrl?: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    if (!fullName.trim() || !cleanUser || !cleanEmail || !pass) return { success: false, error: 'جميع الحقول الأساسية مطلوبة' };

    if (cloudAuthEnabled && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { full_name: fullName.trim(), username: cleanUser, avatar_url: avatarUrl || null } }
      });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'تعذر إنشاء الحساب.' };
      const pendingNote = accessCode?.trim() ? ' تم استلام كود العضوية للمراجعة الإدارية؛ لا يتم منح صلاحيات من المتصفح.' : '';
      return { success: true, isMember: false, error: `تم إنشاء الحساب بنجاح.${pendingNote}` };
    }

    if (!(import.meta as any).env?.DEV && (import.meta as any).env?.VITE_DEMO_MODE !== 'true') {
      return { success: false, error: 'إنشاء الحساب المحلي معطل في النسخة المنشورة. فعّل Supabase Authentication للنشر.' };
    }

    const pList = AppStore.getProfiles();
    if (pList.some(p => p.username.toLowerCase() === cleanUser)) return { success: false, error: 'اسم المستخدم مسجل بالفعل.' };
    if (pList.some(p => p.email.toLowerCase() === cleanEmail)) return { success: false, error: 'البريد الإلكتروني مسجل بالفعل.' };

    const newProfile: Profile = {
      id: 'user-' + Date.now(),
      email: cleanEmail,
      username: cleanUser,
      full_name: fullName.trim(),
      avatar_url: avatarUrl || undefined,
      role: 'guest',
      position: 'Guest Student',
      committee: '',
      committee_key: '',
      committee_position: 'Guest Student',
      membership_status: 'guest',
      is_board_member: false,
      assigned_ir: null,
      created_at: new Date().toISOString()
    };
    AppStore.saveProfile(newProfile);
    setCurrentProfile(newProfile);
    localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
    return { success: true, isMember: false };
  };

  const logout = () => {
    if (cloudAuthEnabled && supabase) void supabase.auth.signOut();
    else setGuest();
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(REMEMBER_ME_KEY);
  };

  const switchProfile = (profileId: string) => {
    if (cloudAuthEnabled || (!(import.meta as any).env?.DEV) && (import.meta as any).env?.VITE_DEMO_MODE !== 'true') return;
    const p = AppStore.getProfiles().find(item => item.id === profileId);
    if (p) {
      setCurrentProfile(p);
      localStorage.setItem(CURRENT_USER_KEY, p.id);
    }
  };

  const updateProfileData = (updates: Partial<Profile>) => {
    if (!currentProfile) return;
    if (cloudAuthEnabled && supabase) {
      const safe = {
        full_name: updates.full_name,
        username: updates.username,
        avatar_url: updates.avatar_url,
        bio: updates.bio,
        phone: updates.phone,
        committee: updates.committee,
        committee_key: updates.committee_key,
        committee_position: updates.committee_position,
        position: updates.position
      };
      void supabase.from('profiles').update(safe).eq('id', currentProfile.id).then(({ error }) => {
        if (error) console.error('Profile update failed:', error);
      });
    } else {
      const updated = { ...currentProfile, ...updates };
      AppStore.saveProfile(updated);
      setCurrentProfile(updated);
    }
  };

  const isAuthenticated = !!currentProfile && currentProfile.role !== 'guest';
  const isTeamMember = currentProfile?.membership_status === 'active_member';

  return (
    <AuthContext.Provider value={{ currentProfile, isAuthenticated, isTeamMember, login, signup, logout, switchProfile, updateProfileData, refreshProfiles, allProfiles: profiles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
