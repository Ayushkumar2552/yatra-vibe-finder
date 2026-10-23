import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { authenticate, signOutAccount } from '@/lib/auth/account.functions';
import { useAuth } from '@/components/AuthProvider';
export const Route = createFileRoute('/account')({
  validateSearch: (search: Record<string, unknown>) => ({ return_to: typeof search.return_to === 'string' && /^\/(?!\/)/.test(search.return_to) && !search.return_to.includes('\\') ? search.return_to : '/planner' }),
  component: Account,
});
function Account() {
  const { user } = useAuth();
  const { return_to } = Route.useSearch();
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await authenticate({ data: { email: String(form.get('email')), password: String(form.get('password')), signup } });
      if (result.signedIn) window.location.assign(return_to);
      else setMessage(result.message);
    } catch { setMessage('Account services are unavailable. Please try again shortly.'); }
    finally { setBusy(false); }
  };
  return <section className="mx-auto max-w-xl px-5 pb-16 pt-32"><div className="rounded-[32px] border bg-card p-8 shadow-soft"><h1 className="text-3xl font-bold">{user ? 'Your travel account' : signup ? 'Your next adventure starts here.' : 'Welcome back, traveller.'}</h1>{user ? <><p className="my-5">Signed in as {user.displayName}</p><button disabled={busy} className="rounded-full border px-6 py-3" onClick={async () => { setBusy(true); try { await signOutAccount(); window.location.assign('/'); } catch { setMessage('Could not sign out. Try again.'); setBusy(false); } }}>Sign out</button></> : <form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className="rounded-xl border bg-background p-3" /></label><label className="grid gap-2">Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} className="rounded-xl border bg-background p-3" /></label><button disabled={busy} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button><button type="button" disabled={busy} className="text-sm underline" onClick={() => { setSignup(!signup); setMessage(''); }}>{signup ? 'Already have an account? Log in' : 'New here? Create an account'}</button></form>}<p role="status" className="mt-4 text-sm">{message}</p></div></section>;
}
