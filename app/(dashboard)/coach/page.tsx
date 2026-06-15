'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/coach/ChatMessage';
import ChatInput from '@/components/coach/ChatInput';
import TypingIndicator from '@/components/coach/TypingIndicator';
import SuggestedPrompts from '@/components/coach/SuggestedPrompts';
import ChatHistory, { type ChatSession } from '@/components/coach/ChatHistory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('coach_sessions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('coach_sessions', JSON.stringify(sessions));
}

function loadMessages(sessionId: string): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`coach_messages_${sessionId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMessages(sessionId: string, messages: Message[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`coach_messages_${sessionId}`, JSON.stringify(messages));
}

export default function CoachPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    if (loaded.length > 0) {
      const last = loaded[0];
      setActiveSessionId(last.id);
      setMessages(loadMessages(last.id));
    }
  }, []);

  // Scroll to bottom when messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages whenever they change
  useEffect(() => {
    if (activeSessionId) {
      saveMessages(activeSessionId, messages);
    }
  }, [messages, activeSessionId]);

  const createNewChat = useCallback(() => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
      lastMessage: '',
      timestamp: formatTime(Date.now()),
      messageCount: 0,
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId(id);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setMessages(loadMessages(id));
    setError(null);
    setSidebarOpen(false);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveSessions(updated);
        return updated;
      });
      localStorage.removeItem(`coach_messages_${id}`);
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          setMessages(loadMessages(remaining[0].id));
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    },
    [activeSessionId, sessions]
  );

  const updateSessionMeta = useCallback(
    (sessionId: string, firstUserMsg: string, finalContent: string) => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              title:
                s.title === 'New Chat'
                  ? firstUserMsg.slice(0, 50) +
                    (firstUserMsg.length > 50 ? '...' : '')
                  : s.title,
              lastMessage: finalContent.slice(0, 60),
              timestamp: formatTime(Date.now()),
              messageCount: (s.messageCount || 0) + 2,
            };
          }
          return s;
        });
        saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      let sessionId = activeSessionId;

      // Create a new session if none exists
      if (!sessionId) {
        const id = generateId();
        const newSession: ChatSession = {
          id,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          lastMessage: content.slice(0, 60),
          timestamp: formatTime(Date.now()),
          messageCount: 1,
        };
        setSessions((prev) => {
          const updated = [newSession, ...prev];
          saveSessions(updated);
          return updated;
        });
        sessionId = id;
        setActiveSessionId(id);
        setMessages([]);
      }

      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const historyMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorMsg = 'Something went wrong';
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch {
            // response was not json
          }
          throw new Error(errorMsg);
        }

        if (!response.body) {
          throw new Error('No response from AI service');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.content;
              if (token) {
                fullContent += token;
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // skip unparseable data
            }
          }
        }

        // Update session metadata
        updateSessionMeta(sessionId, content, fullContent);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        } else {
          const errMsg =
            err instanceof Error ? err.message : 'An error occurred';
          setError(errMsg);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, activeSessionId, updateSessionMeta]
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Chat History Sidebar */}
      <ChatHistory
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 glass sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Toggle chat history"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-glow flex items-center justify-center text-lg shadow-glow">
                🤖
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  AI Goal Coach
                </h1>
                <p className="text-[11px] text-muted leading-tight">
                  Your personal goal-setting assistant
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={createNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 transition-all duration-200 text-sm text-muted hover:text-white group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:text-primary transition-colors"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-white mb-1">
                How can I help you today?
              </h2>
              <p className="text-sm text-muted mb-6 text-center max-w-md">
                I&apos;m your AI Goal Coach. I&apos;ll help you analyze your
                goals, create actionable plans, and stay motivated on your
                journey to success.
              </p>
              <SuggestedPrompts onSelect={(prompt) => sendMessage(prompt)} />
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={`${msg.timestamp}-${index}`}
                  role={msg.role}
                  content={msg.content}
                  timestamp={formatTime(msg.timestamp)}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="px-4 py-2 mx-4 my-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 px-4 py-3 bg-gradient-to-t from-black via-black to-transparent">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => {
              if (inputValue.trim() && !isLoading) {
                sendMessage(inputValue.trim());
                setInputValue('');
              }
            }}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'Your coach is thinking...'
                : 'Ask your coach anything about your goals...'
            }
          />
          <p className="text-center text-[10px] text-muted/30 mt-2">
            Goalify AI Coach &mdash; Powered by AI. Always verify critical information.
          </p>
        </div>
      </div>
    </div>
  );
}
