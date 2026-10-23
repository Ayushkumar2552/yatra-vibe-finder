import { describe, expect, it, vi } from 'vitest';
import { authPath, userFromHeaders } from '@/lib/auth/identity';
const request = vi.hoisted(() => ({ headers: new Headers() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeaders: () => request.headers, setResponseHeader: vi.fn() }));
import { verifiedUser } from '@/lib/auth/session.server';
import { runPlanner } from '@/lib/engine/planner.functions';
describe('planner authentication', () => {
 it('requires a complete platform identity', () => { expect(userFromHeaders(new Headers())).toBeNull(); expect(userFromHeaders(new Headers({'oai-authenticated-user-id':'abc'}))).toBeNull(); expect(userFromHeaders(new Headers({'oai-authenticated-user-id':'abc','oai-authenticated-user-email':'a@b.test'}))?.id).toBe('abc'); });
 it('rejects anonymous direct planner calls', async () => { await expect((runPlanner as any)({data:{search:{},weather:{}}})).rejects.toThrow('Please log in'); });
 it('keeps authentication redirects on this site', () => { expect(authPath('//evil.test')).toBe('/signin-with-chatgpt?return_to=%2Fplanner'); expect(authPath('/planner?run=true')).toContain('%2Fplanner%3Frun%3Dtrue'); });
});

describe('external deployment authentication', () => {
 it('does not trust spoofed platform identity on Render', async () => {
   vi.stubEnv('RENDER', 'true');
   request.headers = new Headers({'oai-authenticated-user-id':'attacker','oai-authenticated-user-email':'fake@example.com'});
   try { expect(await verifiedUser()).toBeNull(); }
   finally { vi.unstubAllEnvs(); request.headers = new Headers(); }
 });
 it('fails closed when Supabase credentials are missing', async () => {
   vi.stubEnv('AUTH_PROVIDER', 'supabase'); vi.stubEnv('SUPABASE_URL', ''); vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
   try { await expect(verifiedUser()).rejects.toThrow('not configured'); }
   finally { vi.unstubAllEnvs(); }
 });
});
