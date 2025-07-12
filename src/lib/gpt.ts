// src/lib/gpt.ts

export async function askGpt(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`GPT proxy failed: ${error}`);
    }

    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('GPT error:', err);
    return null;
  }
}