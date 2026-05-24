import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const { error } = await supabase.from('tool_results').insert(data);
  if (error) console.error('[supabase] saveToolResult:', error.message);
  return !error;
}

export async function saveNewsletterSignup(data: NewsletterSignup) {
  const { error } = await supabase
    .from('newsletter_signups')
    .upsert(data, { onConflict: 'email' });
  if (error) console.error('[supabase] saveNewsletterSignup:', error.message);
  return !error;
}
