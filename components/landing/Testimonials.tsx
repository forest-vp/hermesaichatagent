"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at Stripe",
    avatar: "SC",
    avatarColor: "from-blue-500 to-cyan-500",
    quote:
      "Goalify completely changed how I approach my goals. The AI coach broke down my dream of launching a side project into daily tasks I could actually follow. Six months later, I shipped it.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Fitness Coach & Entrepreneur",
    avatar: "MJ",
    avatarColor: "from-purple-500 to-pink-500",
    quote:
      "I've tried every goal-setting app out there. Goalify is the first one that actually kept me accountable. The burnout detection alone is worth the subscription — it's saved me multiple times.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "PhD Student, Oxford",
    avatar: "ER",
    avatarColor: "from-amber-500 to-orange-500",
    quote:
      "Writing a PhD thesis felt impossible until Goalify helped me break it into weekly milestones. The progress analytics showed me I was making more progress than I thought. Finished on time!",
    rating: 5,
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

export default function Testimonials() {
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
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Loved by Achievers Worldwide
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Join thousands of people who've transformed their ambitions into achievements.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="group relative rounded-2xl bg-cards border border-white/5 p-8 card-hover"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.avatarColor} text-white text-xs font-bold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
