'use client';

import { useState } from 'react';
import { Bell, Mail, BarChart3, Megaphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SettingsSection from './SettingsSection';
import Toggle from './Toggle';
import { Button } from '@/components/ui/Button';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
}

const STORAGE_KEY = 'goalify_notification_preferences';

function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return defaultPreferences();
}

function defaultPreferences(): NotificationPreferences {
  return {
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
  };
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadPreferences);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<'success' | 'error' | null>(null);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      // Simulate Supabase write — replace with actual API call
      await new Promise((res) => setTimeout(res, 800));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setToast('success');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('error');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const items: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive important updates about your goals and streaks via email.',
      icon: <Mail className="h-4 w-4" />,
    },
    {
      key: 'pushNotifications',
      label: 'Push Notifications',
      description: 'Get real-time alerts when you achieve milestones or break streaks.',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      key: 'weeklyReports',
      label: 'Weekly Reports',
      description: 'A summary of your progress, wins, and areas to improve every Monday.',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      key: 'marketingEmails',
      label: 'Marketing Emails',
      description: 'New feature announcements, tips, and special offers from Goalify.',
      icon: <Megaphone className="h-4 w-4" />,
    },
  ];

  return (
    <SettingsSection
      title="Notifications"
      description="Choose how and when Goalify reaches you."
      icon={<Bell className="h-4 w-4" />}
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted">{item.description}</p>
              </div>
            </div>
            <Toggle enabled={prefs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {toast === 'success' && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        {toast === 'error' && (
          <span className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" /> Failed to save
          </span>
        )}
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </SettingsSection>
  );
}
