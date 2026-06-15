// ── Mock data for Analytics page ────────────────────────────────────
// Structures mirror Supabase schema so swapping in real data is a
// drop-in replacement (same field names, same shapes).

export interface Goal {
  id: string;
  title: string;
  category: 'health' | 'career' | 'learning' | 'fitness' | 'finance' | 'personal';
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number; // 0-100
  target_date: string; // ISO date
  created_at: string;
}

export interface Habit {
  id: string;
  title: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  frequency: string;
  streak: number;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string; // ISO date
  completed: boolean;
}

export interface DailyActivity {
  date: string; // ISO date
  goals_completed: number;
  habits_completed: number;
  total_activities: number;
  productivity_score: number; // 0-100
}

export interface WeeklyGoalCompletion {
  label: string; // e.g. "Week 1", "Jan", "Feb"
  completed: number;
  total: number;
}

// ── Goals by category (for pie chart) ───────────────────────────────
export const goalsByCategory = [
  { name: 'Health', value: 12, color: '#3B82F6' },
  { name: 'Career', value: 8, color: '#60A5FA' },
  { name: 'Learning', value: 15, color: '#818CF8' },
  { name: 'Fitness', value: 10, color: '#34D399' },
  { name: 'Finance', value: 6, color: '#F472B6' },
  { name: 'Personal', value: 9, color: '#FBBF24' },
];

// ── Weekly goal completions (for bar chart) ─────────────────────────
export const weeklyGoalCompletions: WeeklyGoalCompletion[] = [
  { label: 'W1', completed: 3, total: 5 },
  { label: 'W2', completed: 4, total: 6 },
  { label: 'W3', completed: 2, total: 4 },
  { label: 'W4', completed: 5, total: 7 },
  { label: 'W5', completed: 6, total: 8 },
  { label: 'W6', completed: 4, total: 5 },
  { label: 'W7', completed: 7, total: 9 },
  { label: 'W8', completed: 5, total: 6 },
  { label: 'W9', completed: 8, total: 10 },
  { label: 'W10', completed: 6, total: 7 },
  { label: 'W11', completed: 9, total: 11 },
  { label: 'W12', completed: 7, total: 8 },
];

// ── Habit consistency over time (for line chart) ────────────────────
export const habitConsistency = [
  { date: 'Jan', rate: 62 },
  { date: 'Feb', rate: 68 },
  { date: 'Mar', rate: 71 },
  { date: 'Apr', rate: 65 },
  { date: 'May', rate: 74 },
  { date: 'Jun', rate: 78 },
  { date: 'Jul', rate: 82 },
  { date: 'Aug', rate: 79 },
  { date: 'Sep', rate: 85 },
  { date: 'Oct', rate: 88 },
  { date: 'Nov', rate: 91 },
  { date: 'Dec', rate: 87 },
];

// ── Productivity score trend (for area chart) ───────────────────────
export const productivityTrend = [
  { date: 'Jan', score: 45 },
  { date: 'Feb', score: 52 },
  { date: 'Mar', score: 48 },
  { date: 'Apr', score: 61 },
  { date: 'May', score: 58 },
  { date: 'Jun', score: 67 },
  { date: 'Jul', score: 72 },
  { date: 'Aug', score: 69 },
  { date: 'Sep', score: 78 },
  { date: 'Oct', score: 82 },
  { date: 'Nov', score: 85 },
  { date: 'Dec', score: 81 },
];

// ── Daily activity heatmap data (last ~3 months) ────────────────────
// Generates 90 days of data ending today.
function generateHeatmapData(): DailyActivity[] {
  const data: DailyActivity[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    // Simulate higher activity on weekdays
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 2 : 5;
    const variance = Math.floor(Math.random() * 6);
    const total = base + variance;
    const habitsCompleted = Math.max(0, total - Math.floor(Math.random() * 3));
    const goalsCompleted = Math.max(0, total - habitsCompleted);
    const score = Math.min(100, Math.round((total / 10) * 100));

    data.push({
      date: d.toISOString().split('T')[0],
      goals_completed: goalsCompleted,
      habits_completed: habitsCompleted,
      total_activities: total,
      productivity_score: score,
    });
  }
  return data;
}

export const heatmapData = generateHeatmapData();

// ── Summary stats ───────────────────────────────────────────────────
export const summaryStats = {
  totalGoals: 60,
  completionRate: 78,
  activeHabits: 14,
  currentStreak: 12,
  productivityScore: 81,
};

// ── Insights ────────────────────────────────────────────────────────
export const insights = [
  {
    icon: '🏆',
    text: 'Your best day is Tuesday',
    detail: 'You complete 34% more tasks on Tuesdays than any other day.',
  },
  {
    icon: '📈',
    text: "You're 23% more productive than last month",
    detail: 'Your productivity score rose from 66 to 81 over the last 30 days.',
  },
  {
    icon: '🌅',
    text: 'You complete 89% of morning habits vs 45% of evening habits',
    detail: 'Consider moving critical habits to your morning routine.',
  },
  {
    icon: '🎯',
    text: `At this rate, you'll complete all goals by ${new Date(Date.now() + 45 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    detail: 'Based on your current pace of 2.3 goals per week.',
  },
];
