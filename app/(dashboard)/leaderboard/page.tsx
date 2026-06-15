import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Medal, Crown, TrendingUp, Zap } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'Alex M.', username: 'alexm', xp: 8450, level: 10, programs: 18, badge: 'Crown', color: 'text-warning' },
  { rank: 2, name: 'Sarah K.', username: 'sarahk', xp: 7200, level: 9, programs: 15, badge: 'Medal', color: 'text-gray-300' },
  { rank: 3, name: 'James L.', username: 'jamesl', xp: 6800, level: 9, programs: 14, badge: 'Medal', color: 'text-amber-600' },
  { rank: 4, name: 'Maria S.', username: 'marias', xp: 5900, level: 8, programs: 12, badge: null, color: '' },
  { rank: 5, name: 'David R.', username: 'davidr', xp: 5200, level: 7, programs: 11, badge: null, color: '' },
  { rank: 6, name: 'Elena W.', username: 'elenaw', xp: 4800, level: 7, programs: 10, badge: null, color: '' },
  { rank: 7, name: 'Chris P.', username: 'chrisp', xp: 4200, level: 6, programs: 9, badge: null, color: '' },
  { rank: 8, name: 'Nina T.', username: 'ninat', xp: 3900, level: 6, programs: 8, badge: null, color: '' },
  { rank: 9, name: 'You', username: 'you', xp: 0, level: 1, programs: 0, badge: null, color: 'text-primary', highlight: true },
];

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl flex items-center gap-2"><Trophy className="h-7 w-7 text-warning" /> Community Rankings</h1>
        <p className="mt-1 text-muted">See how you stack up against other learners</p>
      </div>

      {/* Top 3 */}
      <div className="grid gap-4 md:grid-cols-3">
        {LEADERBOARD.slice(0, 3).map((u, i) => (
          <Card key={i} variant="glass" padding="lg" className={`text-center ${i === 0 ? 'border-primary/20 shadow-glow-sm' : ''}`}>
            <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${i === 0 ? 'bg-gradient-to-br from-warning to-amber-600 shadow-glow' : i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 'bg-gradient-to-br from-amber-600 to-amber-700'}`}>
              {i === 0 ? <Crown className="h-7 w-7 text-white" /> : <Medal className="h-7 w-7 text-white" />}
            </div>
            <div className="text-2xl font-bold text-white mb-1">#{u.rank}</div>
            <h3 className="font-semibold text-white">{u.name}</h3>
            <p className="text-xs text-muted mb-3">@{u.username}</p>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-primary"><Zap className="h-3 w-3" /> {u.xp.toLocaleString()} XP</span>
              <span className="text-muted">Lvl {u.level}</span>
            </div>
            {!u.highlight && <Badge variant="outline" className="mt-2">{u.programs} programs</Badge>}
          </Card>
        ))}
      </div>

      {/* Full List */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        {LEADERBOARD.slice(3).map((u, i) => (
          <div key={i} className={`flex items-center justify-between px-5 py-4 ${u.highlight ? 'bg-primary/5 border-l-2 border-primary' : 'border-b border-white/5'}`}>
            <div className="flex items-center gap-4">
              <span className="w-8 text-center text-sm font-bold text-muted">#{u.rank}</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${u.highlight ? 'bg-primary text-white' : 'bg-white/5 text-muted'}`}>
                {u.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{u.name} {u.highlight && <Badge variant="primary" className="ml-2">You</Badge>}</p>
                <p className="text-xs text-muted">@{u.username} • Lvl {u.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted">{u.programs} programs</span>
              <span className="flex items-center gap-1 font-semibold text-primary"><Zap className="h-3 w-3" /> {u.xp.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
