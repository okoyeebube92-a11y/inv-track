'use client';
// src/app/(app)/history/page.tsx
import { useState, useMemo } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import EditRecordModal from '@/components/EditRecordModal';
import { fmtDate } from '@/utils/inventory';
import type { StockEntry, StockExit } from '@/types';

type Tab = 'entries' | 'exits';

export default function HistoryPage() {
  const { entries, exits, updateEntry, deleteEntry, updateExit, deleteExit, showToast } = useInventoryContext();
  const [tab, setTab]         = useState<Tab>('entries');
  const [search, setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [editing, setEditing] = useState<StockEntry | StockExit | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const records = tab === 'entries' ? entries : exits;

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchModel = !search || r.model.includes(search.toUpperCase());
      const matchFrom  = !dateFrom || r.date >= dateFrom;
      const matchTo    = !dateTo   || r.date <= dateTo;
      return matchModel && matchFrom && matchTo;
    });
  }, [records, search, dateFrom, dateTo]);

  async function handleSave(id: string, updates: any) {
    try {
      if (tab === 'entries') await updateEntry(id, updates);
      else await updateExit(id, updates);
      showToast('✓ Record updated.');
    } catch (err: any) { showToast(`Error: ${err.message}`); throw err; }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      if (tab === 'entries') await deleteEntry(id);
      else await deleteExit(id);
      showToast('✓ Record deleted.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-sub">All stock movements — filter, edit and delete records</p>
        </div>
      </div>

      {/* TABS */}
      <div className="history-tabs">
        <button className={`htab${tab === 'entries' ? ' htab-active' : ''}`} onClick={() => setTab('entries')}>
          Stock Entries <span className="htab-count">{entries.length}</span>
        </button>
        <button className={`htab${tab === 'exits' ? ' htab-active' : ''}`} onClick={() => setTab('exits')}>
          Stock Exits <span className="htab-count">{exits.length}</span>
        </button>
      </div>

      <div className="card">
        {/* FILTERS */}
        <div className="history-filters">
          <input type="text" placeholder="Search model no." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1, minWidth:160}} />
          <div className="date-range">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{width:150}} />
            <span style={{color:'var(--text3)',fontSize:13}}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{width:150}} />
          </div>
          {(search || dateFrom || dateTo) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}>
              Clear filters
            </button>
          )}
        </div>

        {/* TABLE */}
        {filtered.length === 0 ? (
          <div className="empty">No records match your filters.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model No.</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Recorded</th>
                  <th style={{width:100}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr key={record.id}>
                    <td><span className="mono">{record.model}</span></td>
                    <td style={{fontSize:13}}>{fmtDate(record.date)}</td>
                    <td style={{fontWeight:600}}>{record.qty}</td>
                    <td><span className={`badge ${record.unit === 'pcs' ? 'badge-blue' : 'badge-neutral'}`}>{record.unit}</span></td>
                    <td style={{fontSize:11,color:'var(--text3)'}}>{new Date(record.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(record)} title="Edit">✏️</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(record.id)}
                          disabled={deleting === record.id}
                          style={{color:'var(--red)'}}
                          title="Delete"
                        >
                          {deleting === record.id ? '…' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="history-footer">
          Showing {filtered.length} of {records.length} records
        </div>
      </div>

      {editing && (
        <EditRecordModal
          record={editing}
          mode={tab === 'entries' ? 'entry' : 'exit'}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <style jsx>{`
        .history-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
        .htab { padding: 10px 20px; font-size: 13px; font-weight: 600; color: var(--text2); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--font-head); display: flex; align-items: center; gap: 8px; margin-bottom: -1px; }
        .htab:hover { color: var(--text); }
        .htab-active { color: var(--accent); border-bottom-color: var(--accent); }
        .htab-count { font-size: 11px; background: var(--surface2); border-radius: 99px; padding: 1px 7px; color: var(--text3); font-weight: 500; }
        .history-filters { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .date-range { display: flex; align-items: center; gap: 8px; }
        .action-btns { display: flex; gap: 4px; }
        .history-footer { padding: 10px 16px; font-size: 12px; color: var(--text3); border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
