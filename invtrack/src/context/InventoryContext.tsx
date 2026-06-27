'use client';
// src/context/InventoryContext.tsx
import { createContext, useContext } from 'react';
import type { StockEntry, StockExit } from '@/types';

interface InventoryContextType {
  entries: StockEntry[];
  exits: StockExit[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addEntries: (items: any[]) => Promise<void>;
  updateEntry: (id: string, updates: Partial<StockEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addExits: (items: any[]) => Promise<void>;
  updateExit: (id: string, updates: Partial<StockExit>) => Promise<void>;
  deleteExit: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const InventoryContext = createContext<InventoryContextType | null>(null);

export function useInventoryContext() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventoryContext must be inside AppShell');
  return ctx;
}
