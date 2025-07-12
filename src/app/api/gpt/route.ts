// src/app/api/gpt/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OpenAI API key');
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,  // <-- backticks around Bearer ${apiKey}
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI response error:', errText);
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
