"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

const conversationLines = [
  {
    role: "user" as const,
    text: "I want to run a marathon in 6 months but I've never run more than 2km.",
  },
  {
    role: "ai" as const,
    text: "That's a great goal! Let me build a personalized plan for you. 🏃‍♂️",
  },
  {
    role: "ai" as const,
    text: "📋 Here's your breakdown:\n\nMonth 1-2: Build a running habit — 3x/week, 2-5km easy runs\nMonth 3-4: Increase distance — add one long run per week up to 12km\nMonth 5: Peak training — include tempo runs, hit 18-22km long runs\nMonth 6: Taper + Race — reduce volume, trust your training",
  },
  {
    role: "ai" as const,
    text: "I'll check in every Monday to adjust your plan based on how you're feeling. Remember: consistency beats intensity. You've got this! 💪",
  },
];

const insights = [
  { label: "Weekly Progress", value: "87%", icon: TrendingUp },
  { label: "Habits Formed", value: "12", icon: CheckCircle2 },
  { label: "Streak", value: "23 days", icon: Sparkles },
];

export default function AIShowcase() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (visibleLines >= conversationLines.length) return;

    const currentLine = conversationLines[currentLineIndex];
    if (!currentLine) return;

    if (!typing) {
      const delay = currentLine.role === "user" ? 800 : 1200;
      const timer = setTimeout(() => {
        setTyping(true);
        setTypedText("");
        setCharIndex(0);
      }, delay);
      return () => clearTimeout(timer);
    }

    if (charIndex < currentLine.text.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => prev + currentLine.text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, currentLine.role === "ai" ? 15 : 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
        setCurrentLineIndex((prev) => prev + 1);
        setTyping(false);
        setTypedText("");
        setCharIndex(0);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [typing, charIndex, currentLineIndex, visibleLines]);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
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
            AI Coach
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Personal Goal Coach
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Watch how Goalify's AI transforms a vague ambition into a clear, actionable plan — in seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-cards border border-white/5 overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-cards">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <Bot className="h-4 w-4 text-glow" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Goalify AI Coach</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-glow ml-auto" />
            </div>

            {/* Chat messages */}
            <div className="p-6 space-y-4 min-h-[320px] max-h-[400px] overflow-y-auto">
              {conversationLines.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${line.role === "user" ? "justify-end" : ""}`}
                >
                  {line.role === "ai" && (
                    <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                      <Bot className="h-3.5 w-3.5 text-glow" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      line.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/5 text-white/90 rounded-bl-md"
                    }`}
                  >
                    {line.text.split("\n").map((part, j) => (
                      <span key={j}>
                        {part}
                        {j < line.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {line.role === "user" && (
                    <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <User className="h-3.5 w-3.5 text-white/60" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && typedText && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="h-3.5 w-3.5 text-glow" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/5 px-4 py-3 text-sm text-white/90 leading-relaxed">
                    {typedText.split("\n").map((part, j) => (
                      <span key={j}>
                        {part}
                        {j < typedText.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                    <span className="inline-block w-1.5 h-4 bg-glow ml-0.5 animate-pulse align-middle" />
                  </div>
                </div>
              )}

              {/* Waiting indicator */}
              {typing && !typedText && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="h-3.5 w-3.5 text-glow" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white/5 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-cards border border-white/5 p-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-glow" />
                AI Insights
              </h3>
              <div className="space-y-6">
                {insights.map((insight) => (
                  <div key={insight.label} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <insight.icon className="h-5 w-5 text-glow" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{insight.value}</div>
                      <div className="text-sm text-muted">{insight.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-glow/5 border border-primary/20 p-8">
              <h4 className="text-base font-semibold text-white mb-3">
                🎯 Pro Tip from Your AI Coach
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                "The secret to marathon training isn't running more — it's recovering better. 
                I'll optimize your rest days based on your sleep data and energy levels."
              </p>
            </div>

            <div className="rounded-2xl bg-cards border border-white/5 p-8">
              <h4 className="text-base font-semibold text-white mb-4">
                What the AI Coach Does
              </h4>
              <ul className="space-y-3">
                {[
                  "Creates personalized milestone plans",
                  "Adapts to your progress in real-time",
                  "Identifies patterns in your behavior",
                  "Sends smart, contextual check-ins",
                  "Prevents burnout before it happens",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 text-glow mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
