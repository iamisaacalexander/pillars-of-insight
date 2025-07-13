export async function sendToWhisper(audioBlob: Blob): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('/api/whisper', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Transcription failed:', await response.text());
      return null;
    }

    const { text } = await response.json();
    return text as string;
  } catch (error) {
    console.error('Whisper error:', error);
    return null;
  }
}