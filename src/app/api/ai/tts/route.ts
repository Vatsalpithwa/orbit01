import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'astra', speed = 1.0 } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    // Clean markdown characters from text for pristine spoken audio
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>\[\]\(\)\|]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Split text into safe chunks under 180 characters each for smooth speech chunking
    const sentences = cleanText.match(/[^.!?]+[.!?]+|\S+/g) || [cleanText];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length <= 180) {
        currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    // Take the primary chunks (up to 5 chunks for instant low-latency speech)
    const chunksToPlay = chunks.slice(0, 5);

    // Fetch audio chunks from Google TTS engine
    const audioBuffers: Buffer[] = [];
    const langCode = voice === 'astra' ? 'en-US' : 'en-GB';

    for (const chunk of chunksToPlay) {
      const encoded = encodeURIComponent(chunk);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encoded}`;

      const ttsRes = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (ttsRes.ok) {
        const arrayBuf = await ttsRes.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to synthesize neural audio' }, { status: 502 });
    }

    // Concatenate MP3 chunks
    const combinedBuffer = Buffer.concat(audioBuffers);

    return new Response(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
