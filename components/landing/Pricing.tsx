"use client";

import { motion } from "framer-motion";
import { Check, Zap, Star } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for getting started with goal tracking.",
    features: [
      "3 active goals",
      "Basic habit tracking",
      "Weekly progress reports",
      "Community access",
      "Mobile app",
    ],
    cta: "Get Started",
    popular: false,
    glow: false,
  },
  {
    name: "Pro",
    price: "€4",
    period: "/month",
    description: "For serious goal achievers who want the full experience.",
    features: [
      "Unlimited goals",
      "Advanced habit tracking",
      "AI Goal Coach (50 messages/day)",
      "Progress analytics dashboard",
      "Achievement system",
      "Priority support",
      "Custom reminders",
    ],
    cta: "Start Pro Trial",
    popular: true,
    glow: false,
  },
  {
    name: "Premium",
    price: "€8",
    period: "/month",
    description: "For power users who want unlimited AI coaching.",
    features: [
      "Everything in Pro",
      "Unlimited AI coaching",
      "Burnout detection",
      "Advanced analytics & exports",
      "API access",
      "White-label reports",
      "Dedicated account manager",
      "Early access to features",
    ],
    cta: "Go Premium",
    popular: false,
    glow: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-glow mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.glow
                  ? "bg-gradient-to-b from-cards to-primary/5 border-2 border-primary/30 shadow-glow-lg"
                  : "bg-cards border border-white/5"
              }`}
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-glow">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-muted text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted mt-3">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-glow mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90 shadow-glow"
                    : plan.glow
                    ? "bg-white text-black hover:bg-glow hover:shadow-glow"
                    : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted mt-10"
        >
          All plans include a 14-day free trial. Cancel anytime. No credit card required to start.
        </motion.p>
      </div>
    </section>
  );
}
