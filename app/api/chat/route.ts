import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    const systemPrompt = `You are the Goalify AI Coach — a personal development and training mentor. Your role:
- Help users create personalized learning roadmaps
- Analyze their progress and suggest improvements
- Recommend training programs based on their goals
- Provide motivation and accountability
- Answer questions about personal development
- Be warm, encouraging, but direct and actionable

Goalify is an AI-powered training platform. Users take AI-generated training programs, earn XP, level up, and compete on leaderboards. Students get Premium free.

Never make up specific user data unless provided. Ask clarifying questions when needed.`;

    const response = await fetch(
      `${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) { controller.close(); return; }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
            for (const line of lines) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                const content = data.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(`data: ${content}\n\n`));
              } catch {}
            }
          }
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
