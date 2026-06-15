"use client";

import { motion } from "framer-motion";
import { Target, Flame, Users, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Target,
    title: "No Clear Plan",
    description:
      "83% of people set goals but never define the specific steps needed to achieve them. Without a roadmap, motivation fades within weeks.",
  },
  {
    icon: Flame,
    title: "Lack of Motivation",
    description:
      "Initial excitement wears off fast. Without consistent micro-wins and progress tracking, most people abandon their goals by February.",
  },
  {
    icon: Users,
    title: "No Accountability",
    description:
      "Going it alone is hard. Without someone or something holding you accountable, it's easy to skip days and lose momentum entirely.",
  },
  {
    icon: TrendingDown,
    title: "Poor Tracking",
    description:
      "What gets measured gets managed. Most people have no system to track progress, celebrate wins, or identify what's working and what's not.",
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Problem() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-glow mb-4">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Why People Fail Their Goals
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Every year, millions of people set ambitious goals. Here's why most of them never follow through.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={cardVariants}
              className="group relative rounded-2xl bg-cards border border-white/5 p-8 card-hover"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <problem.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
