import { createServerClient } from './server';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  status: 'active' | 'completed' | 'paused';
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  icon: string | null;
  created_at: string;
};

export type HabitEntry = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  count: number;
  created_at: string;
};

export type UserStats = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  goals_completed: number;
  total_goals: number;
  habits_completed_today: number;
  total_habits: number;
  productivity_score: number;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
};

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = createServerClient();
    // Note: In a real app you'd get the user from auth.getUser()
  // For now we fetch the first profile as a placeholder
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as Profile;
}

export async function getGoals(userId?: string): Promise<Goal[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('goals')
    .select('*')
    .order('updated_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
  return (data ?? []) as Goal[];
}

export async function getRecentGoals(limit = 5): Promise<Goal[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent goals:', error);
    return [];
  }
  return (data ?? []) as Goal[];
}

export async function getHabits(): Promise<Habit[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
  return (data ?? []) as Habit[];
}

export async function getUserStats(): Promise<UserStats | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
  return data as UserStats;
}

export async function getTodayHabitEntries(): Promise<HabitEntry[]> {
  const supabase = createServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('date', today);

  if (error) {
    console.error('Error fetching today habit entries:', error);
    return [];
  }
  return (data ?? []) as HabitEntry[];
}

export async function getRecentAchievements(limit = 5): Promise<Achievement[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('unlocked_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  return (data ?? []) as Achievement[];
}
