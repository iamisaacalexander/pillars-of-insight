import { NextResponse } from 'next/server';

// You need to set these in your environment
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper: Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
  return match ? match[1] : null;
}

// Fetch video metadata from YouTube Data API
async function fetchYouTubeMetadata(videoId: string) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error('Failed to fetch YouTube metadata');
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error('Video not found');
  return {
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
  };
}

// Define TranscriptSegment type
type TranscriptSegment = { text: string };

// Fetch transcript using youtube-transcript-api (or similar service)
async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  // For production, use a real transcript API or service
  // Placeholder: returns empty string
  // You can use a 3rd-party API like https://youtube-transcript-api.herokuapp.com/api/transcript/{videoId}
  const transcriptApi = `https://youtube-transcript-api.herokuapp.com/api/transcript/${videoId}`;
  const res = await fetch(transcriptApi);
  if (!res.ok) return '';
  const data = await res.json();
  if (Array.isArray(data)) {
    return (data as TranscriptSegment[]).map((seg) => seg.text).join(' ');
  } else if (typeof data.transcript === 'string') {
    return data.transcript;
  }
  return '';
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    if (!YOUTUBE_API_KEY) return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    const meta = await fetchYouTubeMetadata(videoId);
    const transcript = await fetchYouTubeTranscript(videoId);
    return NextResponse.json({
      videoId,
      title: meta.title,
      author: meta.author,
      thumbnailUrl: meta.thumbnailUrl,
      transcript,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch YouTube info';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
