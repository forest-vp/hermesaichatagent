'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Calendar, Globe, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const COUNTRIES = ['Albania', 'Kosovo', 'Germany', 'United States', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Other'];

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '',
    dateOfBirth: '', country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Minimum 3 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords don\'t match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            username: form.username,
            date_of_birth: form.dateOfBirth || null,
            country: form.country || null,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        if (error.message.includes('already registered')) setErrors({ email: 'This email is already registered' });
        else setErrors({ general: error.message });
        return;
      }
      setSuccess(true);
      toast.success('Account created! Check your email.');
    } catch {
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-yellow-400', 'bg-success', 'bg-emerald-300'][strength];

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
        <p className="text-muted mb-6">We sent a verification link to <span className="text-white">{form.email}</span></p>
        <Button onClick={() => router.push('/login')} className="w-full">Go to Sign In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{errors.general}</div>}
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} error={errors.firstName} leftIcon={<User className="h-4 w-4" />} />
        <Input label="Last Name" placeholder="Doe" value={form.lastName} onChange={e => update('lastName', e.target.value)} error={errors.lastName} leftIcon={<User className="h-4 w-4" />} />
      </div>
      <Input label="Username" placeholder="johndoe" value={form.username} onChange={e => update('username', e.target.value)} error={errors.username} leftIcon={<User className="h-4 w-4" />} />
      <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} leftIcon={<Mail className="h-4 w-4" />} />
      <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} error={errors.dateOfBirth} leftIcon={<Calendar className="h-4 w-4" />} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/80">Country</label>
        <div className="relative">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <select value={form.country} onChange={e => update('country', e.target.value)} className="flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="" className="bg-cards">Select country</option>
            {COUNTRIES.map(c => <option key={c} value={c} className="bg-cards">{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} error={errors.password} leftIcon={<Lock className="h-4 w-4" />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
        {form.password && (
          <div className="mt-2">
            <div className="flex gap-1">{[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-white/10'}`} />)}</div>
            <p className="mt-1 text-xs text-muted">{strengthLabel}</p>
          </div>
        )}
      </div>
      <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} error={errors.confirmPassword} leftIcon={<Lock className="h-4 w-4" />} />
      <Button type="submit" className="w-full" loading={loading}>Create Account <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </form>
  );
}
