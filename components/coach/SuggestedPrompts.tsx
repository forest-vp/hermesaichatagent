'use client';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    label: 'Analyze my goals',
    icon: '🎯',
    text: 'Look at my current goals and give me an honest assessment. What am I doing well, and where can I improve?',
  },
  {
    label: 'Help me create a plan',
    icon: '📋',
    text: 'I want to create a new goal. Help me break it down into actionable steps with realistic milestones.',
  },
  {
    label: 'Am I on track?',
    icon: '📊',
    text: 'Based on my progress so far, am I on track to achieve my goals? What adjustments should I make?',
  },
  {
    label: 'Motivate me',
    icon: '🔥',
    text: "I'm feeling a bit unmotivated. Give me some personalized motivation and remind me why I started.",
  },
];

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 py-4 animate-fade-in">
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          onClick={() => onSelect(prompt.text)}
          className="glass rounded-xl p-4 text-left hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{prompt.icon}</span>
            <span className="text-sm font-semibold text-white group-hover:text-glow transition-colors">
              {prompt.label}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">{prompt.text}</p>
        </button>
      ))}
    </div>
  );
}
