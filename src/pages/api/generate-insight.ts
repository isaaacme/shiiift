import type { APIRoute } from 'astro';
import { getPostHogServer } from '../../lib/posthog-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.GOOGLE_GEMINI_KEY || process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GEMINI_KEY is missing');
      return new Response(JSON.stringify({ error: 'Gemini API key is not configured' }), { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API returned error status:', response.status, errorText);
      return new Response(JSON.stringify({ error: `Gemini API returned error: ${response.status}` }), { status: response.status });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    const posthog = getPostHogServer();
    const sessionId = request.headers.get('X-PostHog-Session-Id');
    posthog.capture({
      distinctId: sessionId || 'anonymous',
      event: 'ai_insight_generated',
      properties: {
        $session_id: sessionId || undefined,
      },
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    console.error('Error generating AI insight:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
