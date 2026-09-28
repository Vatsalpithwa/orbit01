import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Default demo guest profile for immediate zero-friction testing
export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_7781',
  email: 'alex.chen.orbit@gmail.com',
  fullName: 'Alex Chen',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  preferredMentor: 'astra',
  careerGoal: 'Principal AI Systems Architect',
  skillLevel: 'intermediate',
  dailyFocusTargetMinutes: 75,
  studyPreferences: {
    dailyReminder: true,
    audioChimes: true,
    darkTheme: true,
    preferredLanguage: 'English',
  },
  createdAt: new Date().toISOString(),
};

// Storage key for persistent guest session
const LOCAL_STORAGE_USER_KEY = 'orbit_user_profile';
const LOCAL_STORAGE_SESSION_KEY = 'orbit_session_token';

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  // 1. Try real Supabase auth if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          return {
            id: profile.id,
            email: profile.email || session.user.email || '',
            fullName: profile.full_name || session.user.user_metadata?.full_name || 'User',
            avatarUrl: profile.avatar_url || session.user.user_metadata?.avatar_url || '',
            preferredMentor: profile.preferred_mentor || 'astra',
            careerGoal: profile.career_goal || 'Full Stack AI Engineer',
            skillLevel: profile.skill_level || 'intermediate',
            dailyFocusTargetMinutes: profile.daily_focus_target_minutes || 60,
            studyPreferences: profile.study_preferences || {
              dailyReminder: true,
              audioChimes: true,
              darkTheme: true,
            },
            createdAt: profile.created_at,
          };
        }
      }
    } catch (err) {
      console.warn('Supabase session fetch error, falling back to local session:', err);
    }
  }

  // 2. Fall back to local persistent storage
  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  // If no user saved yet, check if there is an active session
  const hasSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
  if (hasSession === 'true') {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
    return DEFAULT_DEMO_USER;
  }

  return null;
}

export async function signInWithGoogleOAuth(): Promise<{ url?: string; error?: any }> {
  if (isSupabaseConfigured() && supabase) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) return { error };
    return { url: data?.url };
  }

  // Demo mode instant Google Auth simulation
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
  }
  return { url: '/dashboard' };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const current = (await getCurrentUserProfile()) || DEFAULT_DEMO_USER;
  const updated: UserProfile = { ...current, ...updates };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: updated.id,
        email: updated.email,
        full_name: updated.fullName,
        avatar_url: updated.avatarUrl,
        preferred_mentor: updated.preferredMentor,
        career_goal: updated.careerGoal,
        skill_level: updated.skillLevel,
        daily_focus_target_minutes: updated.dailyFocusTargetMinutes,
        study_preferences: updated.studyPreferences,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase profile update sync error:', e);
    }
  }

  return updated;
}
