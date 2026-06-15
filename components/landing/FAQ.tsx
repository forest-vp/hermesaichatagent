"use client";

import { motion } from "framer-motion";
import { Disclosure } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the AI Goal Coach work?",
    answer:
      "Our AI Goal Coach uses advanced language models to understand your goals, break them into actionable steps, and provide personalized guidance. It checks in with you regularly, adapts to your progress, and helps you overcome obstacles — like having a personal coach available 24/7.",
  },
  {
    question: "Is the free plan really free?",
    answer:
      "Yes! The free plan gives you access to 3 active goals, basic habit tracking, weekly progress reports, and our community. No credit card required. You can use it for as long as you want.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time with no questions asked. Your data will be preserved for 30 days after cancellation, so you can reactivate anytime without losing your progress.",
  },
  {
    question: "How is my data protected?",
    answer:
      "We take privacy seriously. All data is encrypted in transit and at rest. We never sell your personal information. You can export or delete your data at any time from your account settings.",
  },
  {
    question: "Does Goalify integrate with other apps?",
    answer:
      "Yes! Goalify integrates with Google Calendar, Apple Health, Notion, Slack, and more. Our Premium plan also includes API access for custom integrations with your existing tools.",
  },
  {
    question: "What makes Goalify different from other goal apps?",
    answer:
      "Goalify combines AI-powered coaching, smart goal breakdown, burnout detection, and gamification into one seamless experience. Unlike simple to-do lists, Goalify actively helps you plan, stay motivated, and adapt your approach based on real data about your progress and habits.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-glow mb-4">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted">
            Everything you need to know about Goalify.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          {faqs.map((faq) => (
            <Disclosure key={faq.question}>
              {({ open }) => (
                <div
                  className={`rounded-xl border transition-colors duration-200 ${
                    open
                      ? "bg-cards border-primary/20"
                      : "bg-cards/50 border-white/5 hover:border-white/10"
                  }`}
                >
                  <Disclosure.Button className="flex w-full items-center justify-between px-6 py-5 text-left">
                    <span className="text-sm sm:text-base font-medium text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted flex-shrink-0 transition-transform duration-200 ${
                        open ? "rotate-180 text-glow" : ""
                      }`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-5">
                    <p className="text-sm text-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
