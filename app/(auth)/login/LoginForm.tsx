'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login')) setErrors({ general: 'Invalid email or password' });
        else setErrors({ general: error.message });
        return;
      }
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{errors.general}</div>
      )}
      <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} leftIcon={<Mail className="h-4 w-4" />} />
      <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} leftIcon={<Lock className="h-4 w-4" />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" className="w-full" loading={loading}>Sign In <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </form>
  );
}
