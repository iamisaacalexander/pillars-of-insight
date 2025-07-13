import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: use edge runtime for faster response

export async function POST(req: Request) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    // Accept both 'file' and 'audio' keys for compatibility
    const file = formData.get('file') || formData.get('audio');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 401 });
    }

    // Prepare form data for OpenAI Whisper
    const openaiForm = new FormData();
    openaiForm.append('file', file, 'recording.webm');
    openaiForm.append('model', 'whisper-1');
    openaiForm.append('response_format', 'text');
    // Optionally: openaiForm.append('language', 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiForm,
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized: Invalid OpenAI API key' }, { status: 401 });
      }
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const transcript = await response.text();
    return NextResponse.json({ text: transcript });
  } catch (err) {
    console.error('Whisper server error:', err);
    return NextResponse.json({ error: 'Unexpected Whisper server error' }, { status: 500 });
  }
}
