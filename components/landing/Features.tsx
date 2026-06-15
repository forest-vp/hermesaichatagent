"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Repeat,
  Bot,
  BarChart3,
  Trophy,
  ShieldAlert,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Goal Breakdown",
    description:
      "AI analyzes your big goals and automatically breaks them into weekly milestones and daily tasks. No more overwhelm — just clear next steps.",
  },
  {
    icon: Repeat,
    title: "Habit Tracking",
    description:
      "Build powerful habits with streak tracking, smart reminders, and science-backed consistency techniques that make progress automatic.",
  },
  {
    icon: Bot,
    title: "AI Goal Coach",
    description:
      "Your personal AI coach checks in daily, adapts to your progress, and gives you actionable advice to stay on track — like having a mentor 24/7.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Beautiful dashboards show your momentum, completion rates, and patterns. Understand what drives your success and double down on it.",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description:
      "Earn badges, unlock levels, and celebrate milestones. Our gamification engine keeps you motivated with meaningful rewards.",
  },
  {
    icon: ShieldAlert,
    title: "Burnout Detection",
    description:
      "AI monitors your pace and warns you before burnout hits. Sustainable progress beats sprint-and-crash every single time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
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
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Six powerful features working together to make goal achievement feel effortless.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative rounded-2xl bg-cards border border-white/5 p-8 card-hover"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-glow/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-glow" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
