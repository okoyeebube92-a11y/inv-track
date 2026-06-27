'use client';
// src/hooks/useInventory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { StockEntry, StockExit } from '@/types';
import {
  createEntries as apiCreateEntries,
  createExits as apiCreateExits,
  deleteEntry as apiDeleteEntry,
  deleteExit as apiDeleteExit,
  fetchEntries,
  fetchExits,
  updateEntry as apiUpdateEntry,
  updateExit as apiUpdateExit,
} from '@/lib/api';

export function useInventory() {
  const { supabase, supabaseConfigError } = useMemo(() => {
    try {
      return { supabase: createClient(), supabaseConfigError: '' };
    } catch (error: any) {
      return { supabase: null, supabaseConfigError: error.message || 'Supabase is not configured.' };
    }
  }, []);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [exits,   setExits]   = useState<StockExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [entriesResponse, exitsResponse] = await Promise.all([fetchEntries(), fetchExits()]);
      setEntries(entriesResponse.data as StockEntry[]);
      setExits(exitsResponse.data as StockExit[]);
    } catch (err: any) {
      setError(err.message || 'Unable to load inventory data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- ENTRIES ----
  const addEntries = useCallback(async (items: Omit<StockEntry, 'id' | 'user_id' | 'created_at'>[]) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You need to sign in before saving entries.');

    const rows = items.map(i => ({ ...i, user_id: user.id }));
    const response = await apiCreateEntries(rows);
    setEntries(prev => [...(response.data as StockEntry[]), ...prev]);
  }, [supabase, supabaseConfigError]);

  const updateEntry = useCallback(async (id: string, updates: Partial<StockEntry>) => {
    const response = await apiUpdateEntry(id, updates);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...(response.data as StockEntry) } : e));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await apiDeleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // ---- EXITS ----
  const addExits = useCallback(async (items: Omit<StockExit, 'id' | 'user_id' | 'created_at'>[]) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You need to sign in before saving exits.');

    const rows = items.map(i => ({ ...i, user_id: user.id }));
    const response = await apiCreateExits(rows);
    setExits(prev => [...(response.data as StockExit[]), ...prev]);
  }, [supabase, supabaseConfigError]);

  const updateExit = useCallback(async (id: string, updates: Partial<StockExit>) => {
    const response = await apiUpdateExit(id, updates);
    setExits(prev => prev.map(e => e.id === id ? { ...e, ...(response.data as StockExit) } : e));
  }, []);

  const deleteExit = useCallback(async (id: string) => {
    await apiDeleteExit(id);
    setExits(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    entries, exits, loading, error, reload: load,
    addEntries, updateEntry, deleteEntry,
    addExits, updateExit, deleteExit,
  };
}
