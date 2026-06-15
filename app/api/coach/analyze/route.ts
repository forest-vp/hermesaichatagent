import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ANALYSIS_SYSTEM_PROMPT = `You are the Goalify AI Coach, an expert in goal-setting and personal development analysis. You provide honest, data-driven assessments of users' goals and habits.

CRITICAL: NEVER fabricate or guess data. Only analyze what the user explicitly provides in their request. If information is missing, note it in your analysis.

You must respond with a JSON object in exactly this structure (no other text):
{
  "overallAssessment": string - A 2-3 sentence honest assessment of the user's current goal-setting approach and progress,
  "strengths": string[] - 3-5 specific things the user is doing well, based on actual data provided,
  "areasForImprovement": string[] - 3-5 specific areas where the user could improve, based on actual data provided,
  "actionItems": string[] - 3-5 concrete, actionable next steps the user should take,
  "successProbability": number - A number between 0-100 representing the estimated probability of achieving their goals, based solely on provided data,
  "motivationalNote": string - A short, personalized motivational message to encourage the user
}

If little or no data is provided, be honest about the limitations of your analysis and suggest what data would help provide better insights.`;

interface GoalData {
  title: string;
  description?: string;
  category?: string;
  targetDate?: string;
  progress?: number;
  status?: string;
}

interface HabitData {
  name: string;
  frequency?: string;
  streak?: number;
  completionRate?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goals, habits } = body as { goals?: GoalData[]; habits?: HabitData[] };

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

    // Build the user message from provided data
    let userMessage = 'Please analyze my goals and habits:\n\n';

    if (goals && goals.length > 0) {
      userMessage += '## My Goals:\n';
      goals.forEach((goal, i) => {
        userMessage += `${i + 1}. **${goal.title}**`;
        if (goal.description) userMessage += ` — ${goal.description}`;
        if (goal.category) userMessage += ` [${goal.category}]`;
        if (goal.status) userMessage += ` (Status: ${goal.status})`;
        if (goal.progress !== undefined) userMessage += ` — ${goal.progress}% complete`;
        if (goal.targetDate) userMessage += ` (Target: ${goal.targetDate})`;
        userMessage += '\n';
      });
      userMessage += '\n';
    }

    if (habits && habits.length > 0) {
      userMessage += '## My Habits:\n';
      habits.forEach((habit, i) => {
        userMessage += `${i + 1}. **${habit.name}**`;
        if (habit.frequency) userMessage += ` — ${habit.frequency}`;
        if (habit.streak !== undefined) userMessage += ` (Streak: ${habit.streak} days)`;
        if (habit.completionRate !== undefined) userMessage += ` (${habit.completionRate}% completion rate)`;
        userMessage += '\n';
      });
    }

    if ((!goals || goals.length === 0) && (!habits || habits.length === 0)) {
      userMessage += 'I have not provided any goals or habits data yet. Please give me a general analysis framework and ask me to share my goals and habits for a personalized analysis.';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upstream API error (${response.status}):`, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OPENAI_API_KEY.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `AI service error (${response.status}). Please try again later.` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 502 }
      );
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse AI response as JSON:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis response' },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);

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
