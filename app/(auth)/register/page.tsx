'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { label: string; met: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character (!@#$...)', met: /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/.test(password) },
  ];

  const metCount = checks.filter((c) => c.met).length;

  let label = '';
  let color = '';

  if (metCount <= 1) {
    label = 'Weak';
    color = 'bg-red-500';
  } else if (metCount <= 2) {
    label = 'Fair';
    color = 'bg-orange-500';
  } else if (metCount <= 3) {
    label = 'Good';
    color = 'bg-yellow-500';
  } else if (metCount <= 4) {
    label = 'Strong';
    color = 'bg-blue-500';
  } else {
    label = 'Very Strong';
    color = 'bg-green-500';
  }

  return { score: metCount, label, color, checks };
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is not strong enough';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordsMismatch) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (authError.message.includes('rate limit')) {
          setError('Too many attempts. Please try again in a moment.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
          <Mail className="h-8 w-8 text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-sm text-muted leading-relaxed">
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
            Click the link in the email to activate your account.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted">
          <p>
            Didn&apos;t receive the email? Check your spam folder, or{' '}
            <Link href="/login" className="text-primary hover:text-glow transition-colors">
              try signing in
            </Link>{' '}
            to resend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-sm text-muted">
          Start achieving your goals with Goalify
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
          }}
          icon={<User className="h-4 w-4" />}
          autoComplete="name"
          disabled={loading}
          error={errors.fullName}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          disabled={loading}
          error={errors.email}
        />

        {/* Password with strength */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              disabled={loading}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-muted hover:text-white/80 transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted">
                  {passwordStrength.label}
                </span>
              </div>
              <ul className="space-y-1">
                {passwordStrength.checks.map((check) => (
                  <li
                    key={check.label}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    {check.met ? (
                      <Check className="h-3 w-3 text-green-400 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted/40 shrink-0" />
                    )}
                    <span
                      className={
                        check.met ? 'text-white/70' : 'text-muted/50'
                      }
                    >
                      {check.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            icon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            disabled={loading}
            error={errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[34px] text-muted hover:text-white/80 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {passwordsMatch && (
            <div className="absolute right-10 top-[34px]">
              <Check className="h-4 w-4 text-green-400" />
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Terms */}
      <p className="text-center text-xs text-muted/50">
        By creating an account, you agree to our{' '}
        <Link href="#" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Sign in link */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-cards px-3 text-muted">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-glow transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
