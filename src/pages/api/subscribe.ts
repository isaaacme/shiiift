import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, name, source } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.MAILERLITE_API_KEY || import.meta.env.MAILERLITE_KEY || process.env.MAILERLITE_API_KEY || process.env.MAILERLITE_KEY;
    if (!apiKey) {
      console.error('MAILERLITE_KEY is missing');
      return new Response(JSON.stringify({ error: 'MailerLite API key is not configured' }), { status: 500 });
    }

    const groupId = import.meta.env.MAILERLITE_GROUP_ID || import.meta.env.MAILERLITE_GROUP || process.env.MAILERLITE_GROUP_ID || process.env.MAILERLITE_GROUP;

    const payload: any = { email };
    if (name || source) {
      payload.fields = {};
      if (name) payload.fields.name = name;
      if (source) payload.fields.source = source;
    }
    if (groupId) {
      payload.groups = [groupId];
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailerLite API returned error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `MailerLite API error: ${response.status}` }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    console.error('Error in /api/subscribe:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
