import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { transcript, title } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 401 });
    }
    // Compose prompt for contrarian snippets
    const prompt = `Given the following video transcript and title, generate 1-3 concise contrarian or challenging perspectives ("contrarian snippets") that question, critique, or offer a different angle on the main ideas. For each snippet, provide a summary, a plausible source (real or plausible expert, publication, or school of thought), and if possible, a reference to another well-known video or work. Format as JSON array: [{ summary, source, videoRef? }].\n\nTitle: ${title}\nTranscript: ${transcript}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a critical, creative assistant who generates thoughtful contrarian perspectives for educational purposes.' },
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
    let snippets = [];
    try {
      // Try to parse JSON from the model's reply
      const text = data.choices?.[0]?.message?.content?.trim();
      snippets = JSON.parse(text);
    } catch {
      snippets = [];
    }
    return NextResponse.json({ snippets });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected hammer server error' }, { status: 500 });
  }
}
