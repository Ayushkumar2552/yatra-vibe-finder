export interface SessionUser { id: string; displayName: string }
export function userFromHeaders(headers: Headers): SessionUser | null {
  const id = headers.get('oai-authenticated-user-id');
  const email = headers.get('oai-authenticated-user-email');
  if (!id || !email) return null;
  let name = headers.get('oai-authenticated-user-full-name');
  if (name && headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8') {
    try { name = decodeURIComponent(name); } catch { name = null; }
  }
  return { id, displayName: name || email };
}
export function authPath(returnTo = '/planner', signOut = false) {
  let safe = '/planner';
  try {
    const url = new URL(returnTo, 'https://app.local');
    if (returnTo.startsWith('/') && !returnTo.startsWith('//') && url.origin === 'https://app.local' && !['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(url.pathname)) safe = url.pathname + url.search;
  } catch { /* Safe default. */ }
  if (import.meta.env.VITE_AUTH_PROVIDER === 'supabase') return `/account?return_to=${encodeURIComponent(safe)}`;
  return `${signOut ? '/signout-with-chatgpt' : '/signin-with-chatgpt'}?return_to=${encodeURIComponent(safe)}`;
}
