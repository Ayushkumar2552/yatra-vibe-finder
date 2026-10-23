import { useCallback, useEffect, useState } from "react";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { authPath } from '@/lib/auth/identity';
import { changeSaved, listSaved } from '@/lib/trips/storage.functions';
import { toast } from 'sonner';
const cloud = import.meta.env.VITE_AUTH_PROVIDER === 'supabase';
const KEY = "yatra:saved";
const EVT = "yatra-saved";

function read(): string[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : []; } catch { return []; }
}

export function useSaved() {
  const { user } = useAuth();
  const client = useQueryClient();
  const key = ['saved', user?.id];
  const query = useQuery({ queryKey: key, queryFn: () => listSaved(), enabled: cloud && !!user, staleTime: 30000 });
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    if (cloud) return;
    const sync = () => setIds(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((id: string) => {
    if (cloud) {
      if (!user) { window.location.assign(authPath(window.location.pathname)); return; }
      if (query.isError || !query.data) { toast.error('Saved places could not be loaded. Please try again.'); void query.refetch(); return; }
      void changeSaved({ data: { destinationId: id, saved: !query.data.includes(id) } }).then(() => client.invalidateQueries({ queryKey: key })).catch(() => toast.error('Could not save this place. Please try again.'));
      return;
    }
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }, [user, query.data, query.isError, client]);
  const visible = cloud ? (user ? query.data ?? [] : []) : ids;
  return { ids: visible, toggle, has: (id: string) => visible.includes(id) };
}
