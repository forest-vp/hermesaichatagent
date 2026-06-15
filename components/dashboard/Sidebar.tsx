'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Repeat,
  BarChart3,
  Sparkles,
  CreditCard,
  Settings,
  Flame,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/habits', label: 'Habits', icon: Repeat },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/coach', label: 'AI Coach', icon: Sparkles },
  { href: '/dashboard/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const planColors: Record<string, string> = {
    free: 'bg-zinc-700 text-zinc-300',
    pro: 'bg-primary/20 text-primary',
    enterprise: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col border-r border-white/5 bg-[#0a0a0f] lg:translate-x-0 lg:static lg:z-auto',
          isOpen && 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Goal<span className="text-primary">ify</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-glow'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-primary' : 'text-muted group-hover:text-white'
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white">
              G
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Guest User</p>
              <span
                className={cn(
                  'inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  planColors['pro']
                )}
              >
                Pro
              </span>
            </div>
            <button className="text-muted hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
