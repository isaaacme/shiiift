import { createClient } from '@supabase/supabase-js';

let _client: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (typeof window === 'undefined') return null;
  if (!_client) {
    _client = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL as string,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return _client;
}

export type ToolResult = {
  tool_id: string;
  lang: string;
  answers: Record<string, unknown>;
  score?: number;
  session_id?: string;
};

export type NewsletterSignup = {
  email: string;
  tool_id: string;
  lang: string;
  source?: string;
};

export async function saveToolResult(data: ToolResult) {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client.from('tool_results').insert(data);
  if (error) console.error('[supabase] saveToolResult:', error.message);
  return !error;
}

export async function saveNewsletterSignup(data: NewsletterSignup) {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client
    .from('newsletter_signups')
    .upsert(data, { onConflict: 'email' });
  if (error) console.error('[supabase] saveNewsletterSignup:', error.message);
  return !error;
}
