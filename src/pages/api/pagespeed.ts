import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const targetUrl = url.searchParams.get('url');
    const strategy = url.searchParams.get('strategy') || 'desktop';

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.GOOGLE_PAGESPEED_KEY || process.env.GOOGLE_PAGESPEED_KEY || import.meta.env.GOOGLE_API_PAGESPEED || process.env.GOOGLE_API_PAGESPEED;
    const base = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    
    const psiUrl = `${base}?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}${keyParam}`;
    const response = await fetch(psiUrl);

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'RATE_LIMITED' }), { status: 429 });
    }

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `PageSpeed API error: ${response.status}`, details: errText }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/pagespeed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
