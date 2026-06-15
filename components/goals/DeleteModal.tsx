'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteModalProps {
  isOpen: boolean;
  goalTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteModal({
  isOpen,
  goalTitle,
  onClose,
  onConfirm,
  loading = false,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Goal"
      description="This action cannot be undone."
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{goalTitle}"</span>?
            </p>
            <p className="text-xs text-muted mt-1">
              All milestones and progress data associated with this goal will be permanently removed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:shadow-none"
          >
            {loading ? 'Deleting...' : 'Delete Goal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
