// src/app/api/gpt/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, system } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return 401 Unauthorized if API key is missing
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
          { role: 'system', content: system || 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      // If OpenAI returns 401, forward that status
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized: Invalid OpenAI API key' }, { status: 401 });
      }
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error('No reply in GPT response:', data);
      return NextResponse.json({ error: 'No reply from GPT' }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
