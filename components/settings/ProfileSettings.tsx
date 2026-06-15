'use client';

import { useState, useRef } from 'react';
import { User, Mail, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SettingsSection from './SettingsSection';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Mock current user — in production, pull from Supabase auth context
const CURRENT_USER = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatarUrl: '',
};

const STORAGE_KEY = 'goalify_profile_settings';

interface ProfileData {
  name: string;
  avatarUrl: string;
}

function loadProfile(): ProfileData {
  if (typeof window === 'undefined') {
    return { name: CURRENT_USER.name, avatarUrl: CURRENT_USER.avatarUrl };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { name: CURRENT_USER.name, avatarUrl: CURRENT_USER.avatarUrl };
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<'success' | 'error' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('error');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((prev) => ({ ...prev, avatarUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    if (!profile.name.trim()) {
      setToast('error');
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      // Simulate Supabase write — replace with actual API call
      await new Promise((res) => setTimeout(res, 800));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setToast('success');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('error');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SettingsSection
      title="Profile"
      description="Your personal information and preferences."
      icon={<User className="h-4 w-4" />}
    >
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="group relative"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 bg-gradient-to-br from-primary/80 to-blue-700 transition-all group-hover:border-glow/50">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <div>
            <p className="text-sm font-medium text-white">Profile photo</p>
            <p className="mt-0.5 text-xs text-muted">
              JPG, PNG or GIF. Max 2MB.
            </p>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="mt-2 text-xs font-medium text-primary hover:text-glow transition-colors"
            >
              Upload new photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Full Name */}
        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your full name"
          icon={<User className="h-4 w-4" />}
        />

        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Email</label>
          <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-muted">
            <Mail className="h-4 w-4 text-muted" />
            <span className="text-white/70">{CURRENT_USER.email}</span>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Managed by Auth
            </span>
          </div>
          <p className="text-xs text-muted">
            To change your email, please visit your account security settings.
          </p>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {toast === 'success' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Profile updated
            </span>
          )}
          {toast === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> Please check your inputs
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
