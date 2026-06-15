import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex min-h-screen items-center justify-center bg-black bg-grid px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">GOALIFY</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-muted">Sign in to continue your training</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
