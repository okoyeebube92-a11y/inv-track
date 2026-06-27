// src/types/index.ts

export type Unit = 'pcs' | 'ctn';

export interface StockEntry {
  id: string;
  user_id: string;
  model: string;
  date: string;
  qty: number;
  unit: Unit;
  created_at: string;
}

export interface StockExit {
  id: string;
  user_id: string;
  model: string;
  date: string;
  qty: number;
  unit: Unit;
  created_at: string;
}

export type StockStatus = 'ok' | 'low' | 'none';

export interface BalanceRow {
  model: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit: Unit | '—';
  lastEntryDate: string | null;
  status: StockStatus;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: 'user' | 'admin';
}
