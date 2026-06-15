'use client';

import { useState } from 'react';
import { Palette, Sun, Moon, Monitor, Check, Save } from 'lucide-react';
import SettingsSection from './SettingsSection';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

const accentOptions: { value: AccentColor; label: string; color: string; ring: string }[] = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500', ring: 'ring-blue-400/50' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500', ring: 'ring-purple-400/50' },
  { value: 'green', label: 'Green', color: 'bg-emerald-500', ring: 'ring-emerald-400/50' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500', ring: 'ring-orange-400/50' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500', ring: 'ring-pink-400/50' },
];

const STORAGE_KEY = 'goalify_appearance_settings';

interface AppearanceData {
  theme: Theme;
  accentColor: AccentColor;
}

function loadAppearance(): AppearanceData {
  if (typeof window === 'undefined') return { theme: 'dark', accentColor: 'blue' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { theme: 'dark', accentColor: 'blue' };
}

export default function AppearanceSettings() {
  const [appearance, setAppearance] = useState<AppearanceData>(loadAppearance);
  const [saving, setSaving] = useState(false);

  const accentColorMap: Record<AccentColor, string> = {
    blue: '#3B82F6',
    purple: '#A855F7',
    green: '#10B981',
    orange: '#F97316',
    pink: '#EC4899',
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } finally {
      setSaving(false);
    }
  };

  const currentAccent = accentColorMap[appearance.accentColor];

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of Goalify."
      icon={<Palette className="h-4 w-4" />}
    >
      <div className="space-y-6">
        {/* Theme selector */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAppearance((prev) => ({ ...prev, theme: opt.value }))}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200',
                  appearance.theme === opt.value
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white'
                )}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color picker */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {accentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setAppearance((prev) => ({ ...prev, accentColor: opt.value }))
                }
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                  opt.color,
                  appearance.accentColor === opt.value
                    ? `ring-2 ${opt.ring} ring-offset-2 ring-offset-black scale-110`
                    : 'hover:scale-105'
                )}
                aria-label={opt.label}
              >
                {appearance.accentColor === opt.value && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview card */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Preview</label>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: currentAccent }}
              />
              <div>
                <p className="text-sm font-semibold text-white">Goalify Preview</p>
                <p className="text-xs text-muted">
                  This is how your accent color will look
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full w-3/4 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: currentAccent }}
                />
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full w-1/2 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: currentAccent, opacity: 0.6 }}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <div
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: currentAccent }}
              >
                Primary Button
              </div>
              <div
                className="rounded-md border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: currentAccent, color: currentAccent }}
              >
                Outline
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Appearance
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
