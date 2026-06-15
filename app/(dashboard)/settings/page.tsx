'use client';

import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  ShieldAlert,
  CreditCard,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import {
  ProfileSettings,
  NotificationSettings,
  AppearanceSettings,
  DangerZone,
} from '@/components/settings';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account, preferences, and data.
        </p>
      </motion.div>

      {/* Quick links */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mb-8 flex flex-wrap gap-3"
      >
        <QuickLink href="#profile" icon={<User className="h-4 w-4" />} label="Profile" />
        <QuickLink href="#notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />
        <QuickLink href="#appearance" icon={<Palette className="h-4 w-4" />} label="Appearance" />
        <QuickLink href="/settings/billing" icon={<CreditCard className="h-4 w-4" />} label="Billing" external />
        <QuickLink href="#danger" icon={<ShieldAlert className="h-4 w-4" />} label="Danger Zone" />
      </motion.div>

      {/* Settings sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} id="profile">
          <ProfileSettings />
        </motion.div>

        <motion.div variants={itemVariants} id="notifications">
          <NotificationSettings />
        </motion.div>

        <motion.div variants={itemVariants} id="appearance">
          <AppearanceSettings />
        </motion.div>

        <motion.div variants={itemVariants} id="danger">
          <DangerZone />
        </motion.div>
      </motion.div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}) {
  const classes =
    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-cards/60 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-glow/30 hover:bg-cards hover:text-white hover:shadow-glow';

  if (external) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {label}
        <Link2 className="h-3 w-3 opacity-50" />
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {icon}
      {label}
    </a>
  );
}
