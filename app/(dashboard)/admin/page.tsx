import { getProfile } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Shield, Users, GraduationCap, CreditCard, Megaphone, Check, X, Eye } from 'lucide-react';

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card variant="glass" padding="lg" className="text-center">
          <Shield className="h-12 w-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-muted">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  const pendingStudents = [
    { id: '1', name: 'Ardi Krasniqi', university: 'University of Prishtina', student_id: 'STU-2024-001', year: 2026 },
    { id: '2', name: 'Lirije Berisha', university: 'University of Tirana', student_id: 'STU-2024-045', year: 2025 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="h-7 w-7 text-primary" /> Admin Panel</h1>
        <p className="mt-1 text-muted">Manage users, students, subscriptions, and announcements</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: '15,234', icon: Users, color: 'text-primary' },
          { label: 'Verified Students', value: '3,421', icon: GraduationCap, color: 'text-success' },
          { label: 'Active Subscriptions', value: '1,892', icon: CreditCard, color: 'text-warning' },
          { label: 'Pending Verifications', value: String(pendingStudents.length), icon: Shield, color: 'text-glow' },
        ].map((s, i) => (
          <Card key={i} variant="glass" padding="md">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5`}>
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

      {/* Pending Students */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Pending Student Verifications</h2>
          <Badge variant="warning">{pendingStudents.length} pending</Badge>
        </div>
        {pendingStudents.length === 0 ? (
          <p className="text-muted text-center py-8">No pending verifications 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingStudents.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-sm text-muted">{s.university} • ID: {s.student_id} • Grad: {s.year}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success"><Check className="h-4 w-4" /> Approve</Button>
                  <Button size="sm" variant="danger"><X className="h-4 w-4" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Announcements */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Announcements</h2>
          <Button size="sm">New Announcement</Button>
        </div>
        <div className="space-y-3">
          {[
            { title: 'New AI Training Programs Available', type: 'info', date: '2026-06-14' },
            { title: 'Student Verification System Updated', type: 'success', date: '2026-06-10' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="font-medium text-white">{a.title}</p>
                <p className="text-xs text-muted">{a.date}</p>
              </div>
              <Badge variant={a.type === 'info' ? 'primary' : 'success'}>{a.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
