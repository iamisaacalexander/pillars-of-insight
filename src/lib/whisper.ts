export async function sendToWhisper(blob: Blob, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, 'audio.wav');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Whisper error:', responseText); // 👈 log server response
    throw new Error(`Transcription failed: ${response.status} - ${responseText}`);
  }

  try {
    const data = JSON.parse(responseText);
    return data.text;
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    throw new Error('Invalid JSON from Whisper');
  }
}