'use client';
// src/app/(app)/balance/page.tsx
import { useState, useMemo } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { buildBalanceRows, fmtDate } from '@/utils/inventory';

type Filter = 'all' | 'ok' | 'low' | 'none';

const FILTERS: { key: Filter; label: string; cls: string }[] = [
  { key: 'all',  label: 'All',       cls: 'active-all'   },
  { key: 'ok',   label: 'In Stock',  cls: 'active-green' },
  { key: 'low',  label: 'Low Stock', cls: 'active-amber' },
  { key: 'none', label: 'No Stock',  cls: 'active-red'   },
];

export default function BalancePage() {
  const { entries, exits } = useInventoryContext();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const allRows = useMemo(() => buildBalanceRows(entries, exits), [entries, exits]);

  const rows = useMemo(() =>
    allRows
      .filter(r => filter === 'all' || r.status === filter)
      .filter(r => !search || r.model.includes(search.toUpperCase()))
      .sort((a, b) => ({ none: 0, low: 1, ok: 2 }[a.status] - { none: 0, low: 1, ok: 2 }[b.status])),
    [allRows, filter, search]
  );

  const totalIn  = entries.reduce((s, e) => s + e.qty, 0);
  const totalOut = exits.reduce((s, e) => s + e.qty, 0);
  const low  = allRows.filter(r => r.status === 'low').length;
  const none = allRows.filter(r => r.status === 'none').length;
  const noStockRows  = allRows.filter(r => r.status === 'none');
  const lowStockRows = allRows.filter(r => r.status === 'low');

  function StatusBadge({ status }: { status: string }) {
    if (status === 'ok')   return <span className="badge badge-green"><span className="dot dot-green" />In stock</span>;
    if (status === 'low')  return <span className="badge badge-amber"><span className="dot dot-amber" />Low stock</span>;
    return <span className="badge badge-red"><span className="dot dot-red" />No stock</span>;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Balance</h1>
          <p className="page-sub">Live summary — all entries, exits and current balance</p>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics">
        <div className="metric-box"><div className="metric-label">Total models</div><div className="metric-value">{allRows.length}</div><div className="metric-sub">unique SKUs</div></div>
        <div className="metric-box"><div className="metric-label">Total entered</div><div className="metric-value" style={{color:'var(--green)'}}>{totalIn}</div><div className="metric-sub">units received</div></div>
        <div className="metric-box"><div className="metric-label">Total exited</div><div className="metric-value" style={{color:'var(--red)'}}>{totalOut}</div><div className="metric-sub">units removed</div></div>
        <div className="metric-box"><div className="metric-label">Alerts</div><div className="metric-value" style={{color:'var(--amber)'}}>{low + none}</div><div className="metric-sub">{low} low · {none} empty</div></div>
      </div>

      <div className="card">
        {/* ALERT CARDS */}
        {(low + none) > 0 && (
          <div className="alert-cards">
            {noStockRows.length > 0 && (
              <div className="alert-card alert-card-red">
                <div className="alert-card-title">No stock — {noStockRows.length} item{noStockRows.length > 1 ? 's' : ''}</div>
                {noStockRows.map(r => <div className="alert-item" key={r.model}>{r.model} <span>· 0 {r.unit}</span></div>)}
              </div>
            )}
            {lowStockRows.length > 0 && (
              <div className="alert-card alert-card-amber">
                <div className="alert-card-title">Low stock — {lowStockRows.length} item{lowStockRows.length > 1 ? 's' : ''}</div>
                {lowStockRows.map(r => <div className="alert-item" key={r.model}>{r.model} <span>· {r.balance} {r.unit}</span></div>)}
              </div>
            )}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="filter-pills">
            {FILTERS.map(f => (
              <button key={f.key} className={`pill ${filter === f.key ? f.cls : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          <input type="text" placeholder="Search model no." value={search} onChange={e => setSearch(e.target.value)} style={{width:200}} />
        </div>

        {/* TABLE */}
        {rows.length === 0 ? <div className="empty">No records found.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Model No.</th><th>Last Entry</th><th>Total In</th><th>Total Out</th><th>Balance</th><th>Unit</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.model} className={row.status === 'low' ? 'row-low' : row.status === 'none' ? 'row-none' : ''}>
                    <td><span className="mono">{row.model}</span></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{fmtDate(row.lastEntryDate)}</td>
                    <td><span className="num-in">+{row.totalIn}</span></td>
                    <td><span className="num-out">−{row.totalOut}</span></td>
                    <td><span className={`num-bal ${row.status === 'none' ? 'zero' : row.status === 'low' ? 'low' : ''}`}>{row.balance}</span></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{row.unit}</td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
