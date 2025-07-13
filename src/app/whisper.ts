export async function sendToWhisper(audioBlob: Blob): Promise<string | null> {
  // Convert Blob to File so the backend receives a File object
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
  const formData = new FormData();
  formData.append('file', file);
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