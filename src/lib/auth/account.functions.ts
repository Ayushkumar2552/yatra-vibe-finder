import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { supabaseServer } from './session.server';
export const authenticate = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), signup: z.boolean() }))
  .handler(async ({ data }) => {
    setResponseHeader('Cache-Control', 'private, no-store');
    const auth = supabaseServer().auth;
    const result = data.signup ? await auth.signUp({ email: data.email, password: data.password }) : await auth.signInWithPassword({ email: data.email, password: data.password });
    if (result.error) return { signedIn: false, message: data.signup ? 'Could not create an account. Check your details or try again later.' : 'Could not sign in. Check your email, password and email confirmation.' };
    return { signedIn: !!result.data.session, message: result.data.session ? '' : 'Check your email to confirm your account, then return here to sign in.' };
  });
export const signOutAccount = createServerFn({ method: 'POST' }).handler(async () => {
  setResponseHeader('Cache-Control', 'private, no-store');
  const { error } = await supabaseServer().auth.signOut({ scope: 'local' });
  if (error) throw new Error('Could not sign out. Please try again.');
});
