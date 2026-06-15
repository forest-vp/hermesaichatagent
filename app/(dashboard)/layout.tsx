'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, BookOpen, Brain, Trophy, Award, GraduationCap, Settings, LogOut, Menu, X, ChevronDown, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/training', label: 'Training', icon: BookOpen },
  { href: '/coach', label: 'AI Coach', icon: Brain },
  { href: '/leaderboard', label: 'Rankings', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Award },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass-strong transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">GOALIFY</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active ? 'bg-primary/10 text-primary' : 'text-muted hover:text-white hover:bg-white/5'
                )}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-1">
          <Link href="/verify-student" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-all">
            <GraduationCap className="h-5 w-5" /> Student Verification
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-all">
            <Settings className="h-5 w-5" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted hover:text-white"><Menu className="h-6 w-6" /></button>
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted" />
            <input type="text" placeholder="Search programs..." className="w-full bg-transparent text-sm text-white placeholder:text-muted/50 focus:outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-xl p-2 text-muted hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-glow text-xs font-bold text-white">U</div>
              <ChevronDown className="h-4 w-4 text-muted" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
