import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Calendar, Globe, Shield, CreditCard, Settings, LogOut, Zap } from 'lucide-react';

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="h-7 w-7" /> Settings</h1>
        <p className="mt-1 text-muted">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card variant="glass" padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-glow text-2xl font-bold text-white">
            {(profile.first_name?.[0] || 'U').toUpperCase()}{(profile.last_name?.[0] || '').toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-muted">@{profile.username}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" defaultValue={profile.first_name || ''} />
          <Input label="Last Name" defaultValue={profile.last_name || ''} />
          <Input label="Username" defaultValue={profile.username || ''} />
          <Input label="Email" defaultValue={profile.email} disabled hint="Managed by authentication" />
          <Input label="Date of Birth" type="date" defaultValue={profile.date_of_birth || ''} />
          <Input label="Country" defaultValue={profile.country || ''} />
        </div>
        <Button className="mt-4">Save Changes</Button>
      </Card>

      {/* Subscription */}
      <Card variant="glass" padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Current Plan: <span className="text-primary capitalize">{profile.plan_type}</span></p>
            <p className="text-sm text-muted">{profile.is_student_verified ? 'Verified student — Premium active' : 'Upgrade for more features'}</p>
          </div>
          <Badge variant={profile.plan_type === 'free' ? 'outline' : 'primary'} className="capitalize">{profile.plan_type}</Badge>
        </div>
      </Card>

      {/* Admin Link (only for admins) */}
      {profile.role === 'admin' && (
        <Card variant="glass" padding="lg" className="border-primary/20">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Admin Panel</h2>
          <p className="text-sm text-muted mb-4">You have admin access. Manage students, users, and announcements.</p>
          <Button variant="outline" size="sm">Go to Admin Panel</Button>
        </Card>
      )}
    </div>
  );
}
