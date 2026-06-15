'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertTriangle,
  Loader2,
  Check,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

// ── Mock data ────────────────────────────────────────────────────────
const currentPlan = {
  name: 'Pro',
  price: '$9.99',
  interval: 'month',
  status: 'active' as const,
  nextBilling: 'July 14, 2026',
  nextBillingDate: '2026-07-14',
};

const paymentMethod = {
  type: 'Visa',
  last4: '4242',
  exp: '12/27',
};

const billingHistory: BillingHistoryItem[] = [
  { id: 'inv_001', date: '2026-06-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'paid' },
  { id: 'inv_002', date: '2026-05-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'paid' },
  { id: 'inv_003', date: '2026-04-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'paid' },
  { id: 'inv_004', date: '2026-03-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'paid' },
  { id: 'inv_005', date: '2026-02-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'paid' },
  { id: 'inv_006', date: '2026-01-14', description: 'Goalify Pro — Monthly', amount: '$9.99', status: 'failed' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    interval: 'forever',
    features: ['5 active goals', 'Basic analytics', 'Email support'],
    current: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    interval: 'month',
    features: ['Unlimited goals', 'Advanced analytics', 'Priority support', 'AI insights'],
    current: true,
  },
  {
    name: 'Team',
    price: '$29.99',
    interval: 'month',
    features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard', 'Custom integrations'],
    current: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Component ────────────────────────────────────────────────────────
export default function BillingPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      alert('Subscription cancelled. (integrate with Stripe)');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link + header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your subscription and billing information.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 space-y-6"
      >
        {/* ── Current plan card ─────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
              <Badge variant="primary" className="gap-1">
                <Check className="h-3 w-3" />
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {currentPlan.name}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {currentPlan.price}
                    </span>
                    <span className="text-sm text-muted">/{currentPlan.interval}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <Calendar className="h-4 w-4" />
                    Next billing: {currentPlan.nextBilling}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/pricing">
                      <ArrowUpRight className="mr-1.5 h-4 w-4" />
                      Change Plan
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment method ─────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your default payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {paymentMethod.type} ending in {paymentMethod.last4}
                    </p>
                    <p className="text-xs text-muted">Expires {paymentMethod.exp}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Billing history table ──────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your recent invoices</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings/billing/invoices">
                  <Download className="mr-1.5 h-4 w-4" />
                  Download All
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-xs font-medium text-muted">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.03] text-sm last:border-0"
                      >
                        <td className="px-6 py-4 text-white/70">{item.date}</td>
                        <td className="px-6 py-4 text-white">{item.description}</td>
                        <td className="px-6 py-4 font-medium text-white">
                          {item.amount}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              item.status === 'paid'
                                ? 'success'
                                : item.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-primary hover:text-glow transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Plans comparison ───────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Available Plans</h2>
            <p className="text-sm text-muted">Choose the plan that fits your needs.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'rounded-2xl border p-6 transition-all',
                  plan.current
                    ? 'border-primary/40 bg-primary/5 shadow-glow'
                    : 'border-white/10 bg-cards/60 hover:border-white/20'
                )}
              >
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{plan.price}</span>
                  <span className="text-xs text-muted">/{plan.interval}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                      <Check className="h-3 w-3 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {plan.current ? (
                    <Badge variant="primary" className="w-full justify-center py-1.5">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      variant={plan.name === 'Free' ? 'outline' : 'default'}
                      size="sm"
                      className="w-full"
                    >
                      {plan.price > currentPlan.price ? (
                        <>
                          <ArrowUpRight className="mr-1.5 h-4 w-4" />
                          Upgrade
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="mr-1.5 h-4 w-4" />
                          Downgrade
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-glow transition-colors"
            >
              View detailed pricing
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Cancel subscription modal ──────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!cancelling) setShowCancelModal(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-cards p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                if (!cancelling) setShowCancelModal(false);
              }}
              className="absolute right-4 top-4 text-muted hover:text-white transition-colors"
              disabled={cancelling}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancel Subscription?</h3>
            </div>
            <p className="text-sm text-white/70 mb-4">
              You&apos;ll still have access to Pro features until{' '}
              <strong className="text-white">{currentPlan.nextBilling}</strong>.
              After that, your account will be downgraded to the Free plan.
            </p>
            <p className="text-xs text-muted mb-5">
              You can resubscribe at any time without losing your data.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Subscription
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
