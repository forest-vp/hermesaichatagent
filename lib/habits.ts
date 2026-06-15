import { supabase } from '@/lib/supabase/client';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  target_count: number;
  created_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  count: number;
  created_at: string;
}

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchHabitEntries(habitId: string, startDate: string, endDate: string): Promise<HabitEntry[]> {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllEntriesForDate(date: string): Promise<HabitEntry[]> {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('date', date);

  if (error) throw error;
  return data ?? [];
}

export async function createHabit(habit: Omit<Habit, 'id' | 'created_at'>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleHabitEntry(habitId: string, date: string, targetCount: number): Promise<{ count: number }> {
  // Check if entry exists
  const { data: existing } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single();

  if (existing) {
    const newCount = existing.count >= targetCount ? 0 : existing.count + 1;
    const { data, error } = await supabase
      .from('habit_entries')
      .update({ count: newCount })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('habit_entries')
      .insert({
        habit_id: habitId,
        user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
        date,
        count: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export function calculateStreak(entries: HabitEntry[], targetCount: number): number {
  if (!entries.length) return 0;

  const sortedDates = [...new Set(entries.map(e => e.date))]
    .filter(d => {
      const entry = entries.find(e => e.date === d);
      return entry && entry.count >= targetCount;
    })
    .sort()
    .reverse();

  if (!sortedDates.length) return 0;

  let streak = 1;
  const dayMs = 86400000;

  // Check if the most recent completion is today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(sortedDates[0] + 'T00:00:00');
  const diff = (today.getTime() - mostRecent.getTime()) / dayMs;

  if (diff > 1) return 0;

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1] + 'T00:00:00');
    const prev = new Date(sortedDates[i] + 'T00:00:00');
    const d = (current.getTime() - prev.getTime()) / dayMs;

    if (d === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getWeeklyEntries(entries: HabitEntry[], endDate: Date = new Date()): HabitEntry[] {
  const week: HabitEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    week.push(entry ?? {
      id: `placeholder-${dateStr}`,
      habit_id: '',
      user_id: '',
      date: dateStr,
      count: 0,
      created_at: '',
    });
  }
  return week;
}
