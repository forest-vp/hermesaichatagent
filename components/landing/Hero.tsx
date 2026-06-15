"use client";

import { motion } from "framer-motion";
import { Zap, Play } from "lucide-react";

const stats = [
  { value: "10K+", label: "Users" },
  { value: "50K+", label: "Goals Completed" },
  { value: "95%", label: "Success Rate" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-glow/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-glow/3 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Icon with glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 inline-flex"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse-glow" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 shadow-glow">
              <Zap className="h-10 w-10 text-glow" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
        >
          <span className="gradient-text">Goalify</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl lg:text-2xl text-muted max-w-2xl mx-auto mb-10"
        >
          Turn your dreams into achievable goals.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button className="w-full sm:w-auto text-base font-semibold text-black bg-white rounded-xl px-8 py-4 hover:bg-glow hover:shadow-glow transition-all duration-300 hover:scale-105">
            Start Free
          </button>
          <button className="w-full sm:w-auto text-base font-medium text-white border border-white/20 rounded-xl px-8 py-4 hover:border-glow/50 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
            <Play className="h-4 w-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="glass rounded-2xl px-8 py-6 max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center flex items-center gap-12">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted mt-1">{stat.label}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden sm:block h-8 w-px bg-white/10 last:hidden" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
