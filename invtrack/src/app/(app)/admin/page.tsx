'use client';
// src/app/(app)/admin/page.tsx
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import EditRecordModal from '@/components/EditRecordModal';
import { fmtDate } from '@/utils/inventory';
import type { StockEntry, StockExit } from '@/types';

type Tab = 'entries' | 'exits';

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab]       = useState<Tab>('entries');
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [exits, setExits]   = useState<StockExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<StockEntry | StockExit | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast]   = useState('');

  // Block non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/stock-entry');
  }, [isAdmin, authLoading]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [e, x] = await Promise.all([
        supabase.from('entries').select('*').order('created_at', { ascending: false }),
        supabase.from('exits').select('*').order('created_at', { ascending: false }),
      ]);
      if (e.data) setEntries(e.data as StockEntry[]);
      if (x.data) setExits(x.data as StockExit[]);
      setLoading(false);
    }
    if (isAdmin) load();
  }, [isAdmin]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const records = tab === 'entries' ? entries : exits;
  const filtered = useMemo(() =>
    records.filter(r => !search || r.model.includes(search.toUpperCase())),
    [records, search]
  );

  async function handleSave(id: string, updates: any) {
    const table = tab === 'entries' ? 'entries' : 'exits';
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    if (tab === 'entries') setEntries(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    else setExits(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    showToast('✓ Record updated.');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    setDeleting(id);
    const table = tab === 'entries' ? 'entries' : 'exits';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (tab === 'entries') setEntries(prev => prev.filter(r => r.id !== id));
      else setExits(prev => prev.filter(r => r.id !== id));
      showToast('✓ Record deleted.');
    }
    setDeleting(null);
  }

  if (authLoading || !isAdmin) return null;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-sub">View and manage all records across all users</p>
        </div>
        <span className="badge badge-amber">Admin only</span>
      </div>

      {/* STATS */}
      <div className="metrics" style={{gridTemplateColumns:'repeat(2,1fr)',maxWidth:400,marginBottom:20}}>
        <div className="metric-box"><div className="metric-label">Total entries</div><div className="metric-value">{entries.length}</div></div>
        <div className="metric-box"><div className="metric-label">Total exits</div><div className="metric-value">{exits.length}</div></div>
      </div>

      {/* TABS */}
      <div className="history-tabs">
        <button className={`htab${tab === 'entries' ? ' htab-active' : ''}`} onClick={() => setTab('entries')}>
          Entries <span className="htab-count">{entries.length}</span>
        </button>
        <button className={`htab${tab === 'exits' ? ' htab-active' : ''}`} onClick={() => setTab('exits')}>
          Exits <span className="htab-count">{exits.length}</span>
        </button>
      </div>

      <div className="card">
        <div className="history-filters">
          <input type="text" placeholder="Search model no." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1,minWidth:160}} />
          <span style={{fontSize:12,color:'var(--text3)'}}>{filtered.length} records</span>
        </div>

        {loading ? (
          <div className="empty">Loading records…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No records found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model No.</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>User ID</th>
                  <th>Recorded</th>
                  <th style={{width:90}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono">{r.model}</span></td>
                    <td style={{fontSize:13}}>{fmtDate(r.date)}</td>
                    <td style={{fontWeight:600}}>{r.qty}</td>
                    <td><span className={`badge ${r.unit === 'pcs' ? 'badge-blue' : 'badge-neutral'}`}>{r.unit}</span></td>
                    <td style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>{r.user_id.slice(0,8)}…</td>
                    <td style={{fontSize:11,color:'var(--text3)'}}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r)} title="Edit">✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id)} disabled={deleting === r.id} style={{color:'var(--red)'}} title="Delete">
                          {deleting === r.id ? '…' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <EditRecordModal
          record={editing}
          mode={tab === 'entries' ? 'entry' : 'exit'}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && <div className="toast show">{toast}</div>}

      <style jsx>{`
        .history-tabs { display:flex; gap:0; margin-bottom:20px; border-bottom:1px solid var(--border); }
        .htab { padding:10px 20px; font-size:13px; font-weight:600; color:var(--text2); background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; font-family:var(--font-head); display:flex; align-items:center; gap:8px; margin-bottom:-1px; }
        .htab:hover { color:var(--text); }
        .htab-active { color:var(--accent); border-bottom-color:var(--accent); }
        .htab-count { font-size:11px; background:var(--surface2); border-radius:99px; padding:1px 7px; color:var(--text3); font-weight:500; }
        .history-filters { display:flex; align-items:center; gap:10px; padding:12px 16px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
      `}</style>
    </div>
  );
}
