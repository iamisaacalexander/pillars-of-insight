// src/app/api/float/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { persona, contextType, contextId, durationMinutes, brick, pillar, portico } = await req.json();
    // Compose a prompt for GPT-4 to act as Aurora or Echo and create a YouTube playlist
    const personaPrompt = persona === 'echo'
      ? 'You are Echo, the Sharp Clarifier. You are analytical, precise, and slightly stoic. You excel at source recall, timelines, and critical comparisons. Quote, link, and track multiple threads. Respond in a clear, concise, and direct manner.'
      : 'You are Aurora, the Warm Light of Understanding. You are reflective, empathetic, and intuitive. You help users navigate complex emotions behind ideas, excel at philosophical synthesis, and gently challenge them. Respond in a warm, encouraging, and thoughtful tone.';
    const contextTitle = brick?.title || pillar?.title || portico?.title || '';
    const contextDesc = brick?.transcript || '';
    const prompt = `Given the topic: "${contextTitle}"${contextDesc ? `\nTranscript/Description: ${contextDesc}` : ''}, create a YouTube playlist for immersive background learning. The playlist should last about ${durationMinutes} minutes. Each video should be relevant, engaging, and flow well together. Respond as a JSON array: [{ title: string, url: string, channel: string, duration: string, why: string }].`;

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
          { role: 'system', content: personaPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const data = await response.json();
    let playlist: any[] = [];
    try {
      const reply = data.choices?.[0]?.message?.content?.trim();
      playlist = JSON.parse(reply);
    } catch {
      playlist = [{ title: 'Could not parse playlist', url: '', channel: '', duration: '', why: data.choices?.[0]?.message?.content?.trim() || '' }];
    }
    return NextResponse.json({ playlist });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
