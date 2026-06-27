// src/utils/inventory.ts
import type { StockEntry, StockExit, StockStatus, BalanceRow } from '@/types';

export const LOW_THRESHOLD = 20;

export function fmtDate(d: string | null): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getBalance(model: string, entries: StockEntry[], exits: StockExit[]): number {
  const up = model.toUpperCase();
  const totalIn  = entries.filter(e => e.model === up).reduce((s, e) => s + e.qty, 0);
  const totalOut = exits.filter(e => e.model === up).reduce((s, e) => s + e.qty, 0);
  return totalIn - totalOut;
}

export function getUnit(model: string, entries: StockEntry[], exits: StockExit[]) {
  const up = model.toUpperCase();
  const found = [...entries, ...exits].find(e => e.model === up);
  return found?.unit ?? '—';
}

export function getAllModels(entries: StockEntry[], exits: StockExit[]): string[] {
  const set = new Set([...entries, ...exits].map(e => e.model.toUpperCase()));
  return [...set];
}

export function getStatus(balance: number): StockStatus {
  if (balance <= 0) return 'none';
  if (balance <= LOW_THRESHOLD) return 'low';
  return 'ok';
}

export function buildBalanceRows(entries: StockEntry[], exits: StockExit[]): BalanceRow[] {
  const models = getAllModels(entries, exits);
  return models.map(model => {
    const bal      = getBalance(model, entries, exits);
    const totalIn  = entries.filter(e => e.model === model).reduce((s, e) => s + e.qty, 0);
    const totalOut = exits.filter(e => e.model === model).reduce((s, e) => s + e.qty, 0);
    const unit     = getUnit(model, entries, exits) as any;
    const lastEntryDate = entries.filter(e => e.model === model).map(e => e.date).sort().reverse()[0] ?? null;
    return { model, bal, balance: bal, totalIn, totalOut, unit, lastEntryDate, status: getStatus(bal) };
  });
}
