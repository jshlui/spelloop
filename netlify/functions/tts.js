// Proxy ElevenLabs TTS — keeps the API key server-side in a Netlify env var.
// Set ELEVENLABS_API_KEY in Netlify Dashboard > Site settings > Environment variables.
// Optional: ELEVENLABS_VOICE_ID (defaults to Adam).

const DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB'; // Adam

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'TTS not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const word = (body.word || '').trim().toLowerCase();
  if (!word || word.length > 80) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid word' }) };
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({ text: word, model_id: 'eleven_turbo_v2' }),
  });

  if (!res.ok) {
    return { statusCode: res.status, body: JSON.stringify({ error: 'ElevenLabs error ' + res.status }) };
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' },
    body: base64,
    isBase64Encoded: true,
  };
};
