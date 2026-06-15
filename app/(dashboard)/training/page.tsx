import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, Clock, Star, Users, Filter, Search } from 'lucide-react';

const PROGRAMS = [
  { title: 'Leadership & Management', category: 'Business', difficulty: 'Intermediate', lessons: 24, hours: 12, rating: 4.9, students: 2340, premium: false },
  { title: 'Full-Stack Development', category: 'Technology', difficulty: 'Advanced', lessons: 48, hours: 30, rating: 4.8, students: 1890, premium: true },
  { title: 'Public Speaking Mastery', category: 'Communication', difficulty: 'Beginner', lessons: 16, hours: 8, rating: 4.9, students: 3120, premium: false },
  { title: 'Data Science Fundamentals', category: 'Technology', difficulty: 'Intermediate', lessons: 36, hours: 20, rating: 4.7, students: 1560, premium: true },
  { title: 'Emotional Intelligence', category: 'Personal', difficulty: 'Beginner', lessons: 14, hours: 7, rating: 4.8, students: 2890, premium: false },
  { title: 'Product Management', category: 'Business', difficulty: 'Advanced', lessons: 28, hours: 15, rating: 4.6, students: 980, premium: true },
  { title: 'Creative Writing', category: 'Creative', difficulty: 'Beginner', lessons: 18, hours: 9, rating: 4.7, students: 1450, premium: false },
  { title: 'Machine Learning Basics', category: 'Technology', difficulty: 'Intermediate', lessons: 32, hours: 18, rating: 4.8, students: 1120, premium: true },
  { title: 'Negotiation Skills', category: 'Business', difficulty: 'Intermediate', lessons: 20, hours: 10, rating: 4.9, students: 2100, premium: false },
];

const CATEGORIES = ['All', 'Business', 'Technology', 'Communication', 'Personal', 'Creative'];

export default function TrainingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Training Programs</h1>
        <p className="mt-1 text-muted">AI-generated courses to level up your skills</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted" />
          <input type="text" placeholder="Search programs..." className="w-full bg-transparent text-sm text-white placeholder:text-muted/50 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted hover:text-white hover:border-white/20 transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.map((p, i) => (
          <Card key={i} variant="glass" hover padding="none" className="overflow-hidden group">
            <div className="h-36 bg-gradient-to-br from-primary/15 to-glow/5 flex items-center justify-center relative">
              <BookOpen className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
              {p.premium && <Badge variant="warning" className="absolute top-3 right-3">Premium</Badge>}
            </div>
            <div className="p-4">
              <Badge variant="primary" className="mb-2">{p.category}</Badge>
              <h3 className="font-semibold text-white mb-2">{p.title}</h3>
              <div className="flex items-center gap-3 text-xs text-muted mb-3">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {p.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.hours}h</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {p.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted flex items-center gap-1"><Users className="h-3 w-3" /> {p.students.toLocaleString()}</span>
                <Badge variant={p.difficulty === 'Beginner' ? 'success' : p.difficulty === 'Intermediate' ? 'warning' : 'danger'}>{p.difficulty}</Badge>
              </div>
              <Button className="w-full mt-4" size="sm">{p.premium ? 'Upgrade to Access' : 'Start Training'}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
