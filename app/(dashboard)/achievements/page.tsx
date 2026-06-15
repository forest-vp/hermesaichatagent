import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, Zap, BookOpen, Flame, Star, Shield, Target, Trophy, Users, Clock } from 'lucide-react';

const ACHIEVEMENTS = [
  { icon: BookOpen, title: 'First Program', desc: 'Complete your first training program', xp: 50, unlocked: true, color: 'text-primary' },
  { icon: Flame, title: '7-Day Streak', desc: 'Train for 7 consecutive days', xp: 100, unlocked: true, color: 'text-warning' },
  { icon: Star, title: 'Level 5', desc: 'Reach level 5', xp: 200, unlocked: true, color: 'text-glow' },
  { icon: Target, title: '10 Programs', desc: 'Complete 10 training programs', xp: 500, unlocked: false, color: 'text-success' },
  { icon: Trophy, title: 'Top Ranker', desc: 'Reach top 10 on the leaderboard', xp: 1000, unlocked: false, color: 'text-warning' },
  { icon: Shield, title: 'Student Verified', desc: 'Get verified as a student', xp: 100, unlocked: false, color: 'text-primary' },
  { icon: Zap, title: 'XP Master', desc: 'Earn 5,000 total XP', xp: 500, unlocked: false, color: 'text-glow' },
  { icon: Users, title: 'Community Star', desc: 'Help 50 learners in the community', xp: 300, unlocked: false, color: 'text-purple-400' },
  { icon: Clock, title: '30-Day Streak', desc: 'Train for 30 consecutive days', xp: 500, unlocked: false, color: 'text-danger' },
  { icon: Award, title: 'Certified Pro', desc: 'Earn 5 premium certificates', xp: 750, unlocked: false, color: 'text-success' },
  { icon: Star, title: 'Level 10', desc: 'Reach the maximum level', xp: 1000, unlocked: false, color: 'text-warning' },
  { icon: Flame, title: 'Early Adopter', desc: 'Join during the first month', xp: 250, unlocked: true, color: 'text-primary' },
];

export default function AchievementsPage() {
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalXp = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl flex items-center gap-2"><Award className="h-7 w-7 text-warning" /> Achievements</h1>
        <p className="mt-1 text-muted">Track your milestones and earn XP bonuses</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card variant="glass" padding="md" className="text-center">
          <p className="text-3xl font-bold text-white">{unlocked}/{ACHIEVEMENTS.length}</p>
          <p className="text-sm text-muted">Unlocked</p>
        </Card>
        <Card variant="glass" padding="md" className="text-center">
          <p className="text-3xl font-bold text-primary">{totalXp.toLocaleString()}</p>
          <p className="text-sm text-muted">XP Earned</p>
        </Card>
        <Card variant="glass" padding="md" className="text-center">
          <p className="text-3xl font-bold text-glow">{Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%</p>
          <p className="text-sm text-muted">Completion</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => (
          <Card key={i} variant="glass" padding="lg" className={`relative ${!a.unlocked && 'opacity-50'}`}>
            {a.unlocked && <div className="absolute top-3 right-3"><Badge variant="success">Unlocked</Badge></div>}
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${a.unlocked ? 'bg-primary/10' : 'bg-white/5'}`}>
              <a.icon className={`h-6 w-6 ${a.unlocked ? a.color : 'text-muted'}`} />
            </div>
            <h3 className="font-semibold text-white mb-1">{a.title}</h3>
            <p className="text-sm text-muted mb-2">{a.desc}</p>
            <Badge variant="primary">+{a.xp} XP</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
