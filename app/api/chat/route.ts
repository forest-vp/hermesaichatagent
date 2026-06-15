import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are the Goalify AI Coach — a warm, motivating, and intelligent goal-setting coach. You help users achieve their goals through personalized advice, actionable plans, and honest feedback.

Your capabilities:
- Analyze the user's goals and provide honest assessment of their progress and approach
- Detect patterns in behavior, habits, and goal achievement
- Provide motivation tailored to the user's situation and personality
- Suggest specific improvements to goal-setting and execution strategies
- Create detailed, actionable action plans broken into achievable steps
- Predict success probability based on the data and patterns you observe
- Offer personalized advice based on what has worked for similar goal profiles

CRITICAL RULES:
- NEVER fabricate, guess, or hallucinate data. Only reference information that the user has explicitly provided or that comes from their connected data (goals, habits, progress).
- If the user asks about their goals or progress but no data has been provided, ask them to share or connect their data first.
- Be warm and encouraging, but also honest and direct when you see areas for improvement.
- Use specific examples and actionable advice rather than generic platitudes.
- When you see data, reference it specifically. When you don't have data, say so clearly.
- Respond in a conversational, supportive tone. Use markdown formatting for readability when helpful (headers, bold, bullet points).
- Keep responses focused and under 800 words unless the topic requires more detail.
- End responses with a clear next step or question to keep the conversation going when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please set OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upstream API error (${response.status}):`, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OPENAI_API_KEY configuration.' },
          { status: 401 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `AI service error (${response.status}). Please try again later.` },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: 'No response body received from AI service' },
        { status: 502 }
      );
    }

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const event = `data: ${JSON.stringify({ content })}\n\n`;
                  controller.enqueue(encoder.encode(event));
                }
              } catch {
                // Skip unparseable SSE data
                continue;
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
