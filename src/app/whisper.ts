export async function sendToWhisper(audioBlob: Blob): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transcription failed:', errorData);
      return null;
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Whisper error:', error);
    return null;
  }
}