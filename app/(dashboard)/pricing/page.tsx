'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import PlanBadge from '@/components/pricing/PlanBadge';

// Types
interface UserProfile {
  id: string;
  email: string;
  plan_type: string;
  subscription_status: string;
  paddle_subscription_id: string | null;
  current_period_end: string | null;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  currentPlan?: boolean;
  buttonText: string;
  buttonDisabled?: boolean;
}

// FAQ data
const faqs = [
  {
    question: 'Can I upgrade or downgrade at any time?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, your current features remain active until the end of the billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure payment processor, Paddle. All transactions are encrypted and secure.',
  },
  {
    question: 'What happens when I cancel my subscription?',
    answer:
      'When you cancel, your subscription remains active until the end of your current billing period. After that, you&apos;ll be downgraded to the free plan. You won&apos;t be charged again.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 14-day money-back guarantee on all paid plans. If you&apos;re not satisfied, contact our support team for a full refund.',
  },
  {
    question: 'Is my data safe during payment?',
    answer:
      'Absolutely. All payments are processed through Paddle, a PCI-compliant payment processor. We never store your payment details on our servers.',
  },
  {
    question: 'Can I try Pro or Premium before committing?',
    answer:
      'Our free plan gives you access to core features so you can experience Goalify before upgrading. You can upgrade anytime to unlock more powerful features.',
  },
];

const freeFeatures = [
  'Up to 5 active goals',
  'Up to 3 habit trackers',
  'Basic streak tracking',
  'Goal categories (3)',
  'Achievement badges',
  'Basic analytics dashboard',
];

const proFeatures = [
  'Everything in Free',
  'Up to 25 active goals',
  'Unlimited habit trackers',
  'Unlimited goal categories',
  'AI Coach insights',
  'Advanced analytics & reports',
  'Export data (CSV/PDF)',
  'Priority support',
];

const premiumFeatures = [
  'Everything in Pro',
  'Unlimited goals & habits',
  'AI Coach premium features',
  'Custom analytics dashboards',
  'Team collaboration',
  'Custom integrations',
  'White-label reports',
  'Dedicated account manager',
];

export default function PricingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Determine button text based on current plan
  const getButtonText = useCallback((planId: string): string => {
    if (!profile) return planId === 'free' ? 'Your Plan' : 'Upgrade';
    const currentPlan = profile.plan_type;
    if (planId === currentPlan) return 'Current Plan';
    if (planId === 'free') return 'Downgrade';
    // Plan hierarchy: free < pro < premium
    const hierarchy = ['free', 'pro', 'premium'];
    const currentIdx = hierarchy.indexOf(currentPlan);
    const targetIdx = hierarchy.indexOf(planId);
    return targetIdx > currentIdx ? 'Upgrade' : 'Downgrade';
  }, [profile]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, plan_type, subscription_status, paddle_subscription_id, current_period_end')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const currentPlanType = profile?.plan_type ?? 'free';

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '\u20AC0',
      period: '/forever',
      description: 'Perfect for getting started with goal tracking.',
      features: freeFeatures,
      currentPlan: currentPlanType === 'free',
      buttonText: 'Current Plan',
      buttonDisabled: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '\u20AC4',
      period: '/mo',
      description: 'For serious goal achievers who want AI-powered insights.',
      features: proFeatures,
      highlighted: true,
      currentPlan: currentPlanType === 'pro',
      buttonText: getButtonText('pro'),
      buttonDisabled: currentPlanType === 'pro',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '\u20AC8',
      period: '/mo',
      description: 'For power users and teams who need everything.',
      features: premiumFeatures,
      currentPlan: currentPlanType === 'premium',
      buttonText: getButtonText('premium'),
      buttonDisabled: currentPlanType === 'premium',
    },
  ];

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') return;

    setCheckoutLoading(planId);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to upgrade your plan.');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Please sign in to upgrade your plan.');
        return;
      }

      const res = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create checkout session.');
      }

      // Redirect to Paddle checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleGetAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    setError(null);

    try {
      const token = await handleGetAuthToken();
      if (!token) {
        setError('Please sign in.');
        return;
      }

      const res = await fetch('/api/paddle/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to cancel subscription.');
      }

      // Reload profile
      window.location.reload();
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResume = async () => {
    setResumeLoading(true);
    setError(null);

    try {
      const token = await handleGetAuthToken();
      if (!token) {
        setError('Please sign in.');
        return;
      }

      const res = await fetch('/api/paddle/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to resume subscription.');
      }

      // Reload profile
      window.location.reload();
    } catch (err) {
      console.error('Resume error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume subscription.');
    } finally {
      setResumeLoading(false);
    }
  };

  const isPaidPlan = currentPlanType === 'pro' || currentPlanType === 'premium';
  const isCancelled = profile?.subscription_status === 'cancelled';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
        >
          <Sparkles className="h-4 w-4" />
          Simple, transparent pricing
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          Choose Your <span className="text-primary">Plan</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg text-muted"
        >
          Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
        </motion.p>

        {/* Current plan badge */}
        {!loading && profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <PlanBadge
              planType={profile.plan_type}
              subscriptionStatus={profile.subscription_status}
              currentPeriodEnd={profile.current_period_end ?? undefined}
            />
          </motion.div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Cards */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <PricingCard
              plan={plan}
              onSelect={handlePlanSelect}
              loading={checkoutLoading === plan.id}
            />
          </motion.div>
        ))}
      </div>

      {/* Subscription Management */}
      {isPaidPlan && profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-16"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-cards p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription Management
            </h3>

            <div className="space-y-4">
              {profile.paddle_subscription_id && (
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Subscription ID</p>
                    <p className="font-mono text-xs text-muted">{profile.paddle_subscription_id}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.subscription_status === 'active'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}>
                    {profile.subscription_status}
                  </span>
                </div>
              )}

              {profile.current_period_end && (
                <div className="rounded-xl bg-white/5 px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    Current period ends
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(profile.current_period_end).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {!isCancelled ? (
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    disabled={resumeLoading}
                    className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                  >
                    {resumeLoading ? 'Resuming...' : 'Resume Subscription'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Compare Plans
        </h2>
        <p className="mb-8 text-center text-muted">
          See exactly what&apos;s included in each plan
        </p>
        <FeatureComparison />
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-16 flex flex-wrap items-center justify-center gap-8"
      >
        <div className="flex items-center gap-2 text-sm text-muted">
          <Shield className="h-5 w-5 text-primary" />
          PCI Compliant
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <CreditCard className="h-5 w-5 text-primary" />
          Secure Payments via Paddle
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Target className="h-5 w-5 text-primary" />
          14-Day Money-Back Guarantee
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mx-auto max-w-3xl"
      >
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <p className="mb-8 text-center text-muted">
          Everything you need to know about billing
        </p>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-white/10 bg-cards transition-colors"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-white">
                  <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 px-6 py-4">
                      <p className="text-sm leading-relaxed text-white/70">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-16 text-center"
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Ready to Supercharge Your Goals?
          </h3>
          <p className="mb-6 text-muted">
            Join thousands of achievers using Goalify to track their progress and reach their dreams.
          </p>
          <button
            onClick={() => handlePlanSelect('pro')}
            disabled={currentPlanType !== 'free'}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-primary/90 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentPlanType === 'free' ? 'Start with Pro \u2014 \u20AC4/mo' : "You're Already Upgraded!"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Re-export sub-components for convenience
import PricingCard from '@/components/pricing/PricingCard';
import FeatureComparison from '@/components/pricing/FeatureComparison';
