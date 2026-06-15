'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  KeyRound,
  Download,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import SettingsSection from './SettingsSection';
import { Button } from '@/components/ui/Button';

export default function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleChangePassword = () => {
    // In production: redirect to Supabase auth password change flow
    alert('Redirecting to password change... (integrate with Supabase Auth)');
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Simulate data export
      await new Promise((res) => setTimeout(res, 1500));
      // In production: trigger a download of user data from Supabase
      const blob = new Blob(
        [JSON.stringify({ export: 'Goalify data export placeholder' })],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goalify-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      // In production: call Supabase to delete user account
      await new Promise((res) => setTimeout(res, 1000));
      alert('Account deletion initiated. (integrate with Supabase)');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <>
      <SettingsSection
        title="Danger Zone"
        description="Irreversible actions. Proceed with caution."
        icon={<ShieldAlert className="h-4 w-4" />}
        variant="danger"
      >
        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Change Password</p>
                <p className="mt-0.5 text-xs text-muted">
                  Update your password to keep your account secure.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangePassword}>
              Change
            </Button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Download className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Export Data</p>
                <p className="mt-0.5 text-xs text-muted">
                  Download a copy of all your goals, habits, and data.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={exporting}
            >
              {exporting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Export
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                <Trash2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-red-100">Delete Account</p>
                <p className="mt-0.5 text-xs text-red-300/60">
                  Permanently delete your account and all associated data.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-cards p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                if (!deleting) {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }
              }}
              className="absolute right-4 top-4 text-muted hover:text-white transition-colors"
              disabled={deleting}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
            </div>

            <p className="text-sm text-white/70 mb-4">
              This action is <strong className="text-red-400">permanent and irreversible</strong>.
              All your goals, habits, streaks, and data will be permanently deleted.
            </p>

            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 mb-5">
              <p className="text-xs text-red-300/80">
                Type <span className="font-bold text-red-400">DELETE</span> below to confirm.
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mb-5 flex h-11 w-full rounded-lg border border-red-500/20 bg-white/5 px-4 text-sm text-white placeholder:text-muted/50 transition-all focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
              disabled={deleting}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
