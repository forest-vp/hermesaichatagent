'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Brain, Send, Sparkles, Lightbulb, Target, TrendingUp, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  { icon: Target, text: 'Create a learning roadmap for me', color: 'text-primary' },
  { icon: TrendingUp, text: 'Analyze my progress', color: 'text-success' },
  { icon: Lightbulb, text: 'What skills should I learn next?', color: 'text-warning' },
  { icon: Brain, text: 'Give me a study plan', color: 'text-glow' },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.replace('data: ', '').replace('[DONE]', '');
            if (data && data !== '[DONE]') {
              aiContent += data;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: aiContent };
                return updated;
              });
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> AI Coach</h1>
        <p className="text-muted text-sm mt-1">Your personal AI mentor for guidance, roadmaps, and motivation</p>
      </div>

      <Card variant="glass" padding="none" className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Hello! I&apos;m your AI Coach</h3>
              <p className="text-muted mb-6 max-w-md">I can help you create learning roadmaps, analyze your progress, suggest skills, and keep you motivated.</p>
              <div className="grid gap-2 w-full max-w-md">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm text-muted hover:text-white hover:border-primary/20 hover:bg-primary/5 transition-all">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 text-white/90 border border-white/5'}`}>
                {m.role === 'assistant' && <div className="flex items-center gap-2 mb-1"><Sparkles className="h-3 w-3 text-primary" /><span className="text-xs text-primary font-medium">AI Coach</span></div>}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start"><div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div></div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask your AI coach anything..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <Button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
