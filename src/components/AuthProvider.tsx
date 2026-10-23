import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, LogIn } from 'lucide-react';
import { getSession } from '@/lib/auth/session.functions';
import { authPath, type SessionUser } from '@/lib/auth/identity';
interface SessionState { user: SessionUser | null; loading: boolean; error: boolean; retry: () => void }
const AuthContext = createContext<SessionState>({ user: null, loading: true, error: false, retry: () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const q = useQuery({ queryKey: ['session'], queryFn: () => getSession(), staleTime: 60000, retry: 1, refetchOnWindowFocus: 'always' });
  return <AuthContext.Provider value={{ user: q.isError ? null : q.data ?? null, loading: q.isLoading, error: q.isError, retry: () => { void q.refetch(); } }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function PlannerLoginGate() {
  const { loading, error, retry } = useAuth();
  const returnTo = typeof window === 'undefined' ? '/planner' : window.location.pathname + window.location.search;
  return <section className="mx-auto max-w-xl px-5 pb-12 pt-32"><div className="rounded-[32px] border bg-card p-8 shadow-soft">
    <span className="mb-5 inline-flex rounded-2xl bg-secondary p-4 text-accent"><ShieldCheck className="size-7" /></span>
    <h1 className="text-3xl font-bold">Your next trip starts here.</h1>
    <p className="mt-3 text-muted-foreground">Log in or sign up to find your match and set a departure alarm for the things you need to take.</p>
    {loading ? <p role="status" className="mt-6">Checking your account…</p> : error ? <div className="mt-6"><p role="alert">We couldn’t check your session.</p><button className="mt-3 rounded-full border px-5 py-3" onClick={retry}>Try again</button></div> : <>
      <a href={authPath(returnTo)} target="_top" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"><LogIn className="size-4" /> Log in / Sign up</a>
      <p className="mt-3 text-center text-xs text-muted-foreground">Secure account sign-in. New here? Create an account on the sign-in page.</p>
    </>}
  </div></section>;
}
