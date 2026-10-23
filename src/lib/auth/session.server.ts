import { createServerClient } from '@supabase/ssr';
import { getCookies, getRequestHeaders, setCookie } from '@tanstack/react-start/server';
import { userFromHeaders, type SessionUser } from './identity';

export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Account services are not configured yet.');
  return createServerClient(url, key, {
    cookies: {
      getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: cookies => cookies.forEach(({ name, value, options }) => setCookie(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })),
    },
  });
}

export async function verifiedUser(): Promise<SessionUser | null> {
  // Only the Sites deployment may trust its platform-injected identity headers.
  if (process.env.AUTH_PROVIDER !== 'supabase') {
    if (process.env.RENDER || process.env.DEPLOY_TARGET === 'render') return null;
    return userFromHeaders(getRequestHeaders());
  }
  const { data, error } = await supabaseServer().auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, displayName: data.user.email ?? 'Traveller' };
}
