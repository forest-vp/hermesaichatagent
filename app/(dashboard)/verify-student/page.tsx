import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GraduationCap, Upload, Check, Clock, X, AlertCircle } from 'lucide-react';

export default async function VerifyStudentPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const isVerified = profile.is_student_verified;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GraduationCap className="h-7 w-7 text-primary" /> Student Verification</h1>
        <p className="mt-1 text-muted">Verify your student status to get Premium for free</p>
      </div>

      {isVerified ? (
        <Card variant="glass" padding="lg" className="border-success/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Check className="h-6 w-6 text-success" /></div>
            <div>
              <h3 className="font-semibold text-white">You&apos;re Verified! 🎓</h3>
              <p className="text-sm text-muted">You have full access to all Premium features.</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="glass" padding="lg">
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">Why verify?</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Get Premium features for free</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> AI Personal Trainer & Mentor</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Premium certificates</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Weekly AI reports</li>
            </ul>
          </div>
          <form className="space-y-4">
            <Input label="University Name" placeholder="e.g., University of Prishtina" />
            <Input label="Student ID" placeholder="Your student ID number" />
            <Input label="Graduation Year" type="number" placeholder="e.g., 2026" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Student Badge / ID Card</label>
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <div>
                  <Upload className="mx-auto h-8 w-8 text-muted mb-2" />
                  <p className="text-sm text-muted">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted/50 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            <Button className="w-full">Submit for Verification</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
