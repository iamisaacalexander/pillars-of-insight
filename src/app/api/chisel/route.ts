// src/app/api/chisel/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { brick, pillar, portico } = await req.json();
    // Compose a prompt for GPT-4 to act as Aurora or Echo and refine the idea
    // (You can later add persona/context if needed)
    const prompt = `You are an expert learning assistant. Given the following context, generate 1-3 concise, insightful, and supportive snippets to help refine and clarify the main idea of this brick. You may draw from the brick transcript, pillar title, portico title, and reference other bricks or relevant sources (historical, web, YouTube, etc). Each snippet should:
- Summarize or clarify a key point
- Reference supporting evidence, sources, or related works if possible
- Be short and not overwhelming

Context:
Portico: ${portico?.title || ''}
Pillar: ${pillar?.title || ''}
Brick Title: ${brick?.title || ''}
Brick Transcript: ${brick?.transcript || ''}

Respond as a JSON array of objects: [{ summary: string, source: string, videoRef?: string }].`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 401 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const data = await response.json();
    type Snippet = { summary: string; source: string; videoRef?: string };
    let snippets: Snippet[] = [];
    try {
      // Try to parse the JSON array from the model's reply
      const reply = data.choices?.[0]?.message?.content?.trim();
      snippets = JSON.parse(reply) as Snippet[];
    } catch {
      // fallback: return the raw reply as a single snippet
      snippets = [{ summary: data.choices?.[0]?.message?.content?.trim() || 'No summary', source: 'AI' }];
    }
    return NextResponse.json({ snippets });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
