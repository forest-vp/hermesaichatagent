import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, Brain, Trophy, Zap, TrendingUp, Clock, Star, ArrowRight, Target, Award, Users } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const firstName = profile.first_name || 'Learner';
  const xp = profile.xp || 0;
  const level = profile.level || 1;
  const streak = profile.streak || 0;
  const plan = profile.plan_type || 'free';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Welcome back, {firstName} 👋</h1>
          <p className="mt-1 text-muted">Continue your training journey. You&apos;re doing great!</p>
        </div>
        <div className="flex gap-3">
          <Link href="/training"><Button><BookOpen className="mr-2 h-4 w-4" /> Browse Programs</Button></Link>
          <Link href="/coach"><Button variant="outline"><Brain className="mr-2 h-4 w-4" /> AI Coach</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total XP', value: xp.toLocaleString(), icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Level', value: level.toString(), icon: TrendingUp, color: 'text-glow', bg: 'bg-glow/10' },
          { label: 'Day Streak', value: `${streak} 🔥`, icon: Target, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: Award, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <Card key={i} variant="glass" padding="md">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Level Progress</h2>
            <p className="text-sm text-muted">Level {level} • {xp} XP total</p>
          </div>
          <Badge variant="primary">Level {level}</Badge>
        </div>
        <div className="h-3 w-full rounded-full bg-white/5">
          <div className="h-3 rounded-full bg-gradient-to-r from-primary to-glow transition-all duration-500" style={{ width: `${Math.min((xp % 500) / 5, 100)}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">{500 - (xp % 500)} XP to Level {level + 1}</p>
      </Card>

      {/* Continue Training */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Continue Training</h2>
          <Link href="/training" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Leadership Fundamentals', category: 'Business', progress: 65, lessons: 24, completed: 15, difficulty: 'Intermediate' },
            { title: 'JavaScript Mastery', category: 'Technology', progress: 30, lessons: 32, completed: 9, difficulty: 'Advanced' },
            { title: 'Creative Thinking', category: 'Personal', progress: 80, lessons: 12, completed: 9, difficulty: 'Beginner' },
          ].map((p, i) => (
            <Card key={i} variant="glass" hover padding="none" className="overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-primary/15 to-glow/5 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary/40" />
              </div>
              <div className="p-4">
                <Badge variant="primary" className="mb-2">{p.category}</Badge>
                <h3 className="font-semibold text-white mb-1">{p.title}</h3>
                <p className="text-xs text-muted mb-3">{p.completed}/{p.lessons} lessons • {p.difficulty}</p>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted text-right">{p.progress}%</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/coach">
          <Card variant="glass" hover padding="lg" className="h-full">
            <Brain className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-white mb-1">AI Coach</h3>
            <p className="text-sm text-muted">Get personalized coaching and recommendations</p>
          </Card>
        </Link>
        <Link href="/leaderboard">
          <Card variant="glass" hover padding="lg" className="h-full">
            <Trophy className="h-8 w-8 text-warning mb-3" />
            <h3 className="font-semibold text-white mb-1">Leaderboard</h3>
            <p className="text-sm text-muted">See how you rank against other learners</p>
          </Card>
        </Link>
        <Link href="/achievements">
          <Card variant="glass" hover padding="lg" className="h-full">
            <Award className="h-8 w-8 text-success mb-3" />
            <h3 className="font-semibold text-white mb-1">Achievements</h3>
            <p className="text-sm text-muted">Track your badges and milestones</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
