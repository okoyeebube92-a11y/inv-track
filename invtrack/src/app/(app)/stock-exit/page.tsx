'use client';
// src/app/(app)/stock-exit/page.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { todayISO, getBalance, getAllModels, getStatus } from '@/utils/inventory';

interface SessionItem { model: string; date: string; qty: number; unit: string; }

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    ok:   { cls: 'badge-green', label: 'In stock' },
    low:  { cls: 'badge-amber', label: 'Low stock' },
    none: { cls: 'badge-red',   label: 'No stock' },
  };
  const { cls, label } = cfg[status] || cfg.ok;
  return <span className={`badge ${cls}`}><span className={`dot dot-${status === 'ok' ? 'green' : status === 'low' ? 'amber' : 'red'}`} />{label}</span>;
}

export default function StockExitPage() {
  const { entries, exits, addExits, showToast } = useInventoryContext();
  const [form, setForm]         = useState({ model: '', date: todayISO(), qty: '', unit: '' });
  const [session, setSession]   = useState<SessionItem[]>([]);
  const [saving, setSaving]     = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // All unique models that have stock
  const allModels = useMemo(() => getAllModels(entries, exits), [entries, exits]);

  // Autocomplete — filter models by partial input
  const suggestions = useMemo(() => {
    const q = form.model.trim().toUpperCase();
    if (!q) return [];
    return allModels
      .filter(m => m.includes(q))
      .map(m => ({ model: m, balance: getBalance(m, entries, exits), status: getStatus(getBalance(m, entries, exits)) }))
      .slice(0, 8);
  }, [form.model, allModels, entries, exits]);

  // Current lookup for selected model
  const lookup = useMemo(() => {
    const m = form.model.trim().toUpperCase();
    if (!m || !allModels.includes(m)) return null;
    const balance = getBalance(m, entries, exits);
    const unit    = entries.find(e => e.model === m)?.unit ?? exits.find(e => e.model === m)?.unit ?? '';
    return { balance, unit, status: getStatus(balance) };
  }, [form.model, allModels, entries, exits]);

  const remaining = useMemo(() => {
    if (!lookup || !form.qty) return null;
    return lookup.balance - parseInt(form.qty);
  }, [lookup, form.qty]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'model') setShowDrop(true);
  }

  function selectModel(model: string) {
    const unit = entries.find(e => e.model === model)?.unit ?? exits.find(e => e.model === model)?.unit ?? '';
    setForm(prev => ({ ...prev, model, unit }));
    setShowDrop(false);
  }

  function handleClear() { setForm({ model: '', date: todayISO(), qty: '', unit: '' }); }

  function handleAdd() {
    const model = form.model.trim().toUpperCase();
    if (!model)                        { showToast('Please enter a model number.'); return; }
    if (!allModels.includes(model))    { showToast('Model not found in entries.'); return; }
    if (!form.date)                    { showToast('Please select an exit date.'); return; }
    const qty = parseInt(form.qty);
    if (!qty || qty < 1)               { showToast('Please enter a valid quantity.'); return; }
    if (!form.unit)                    { showToast('Please select a unit.'); return; }
    const balance = getBalance(model, entries, exits);
    if (qty > balance)                 { showToast(`⚠ Exceeds available stock (${balance}).`); return; }
    setSession(prev => [...prev, { model, date: form.date, qty, unit: form.unit }]);
    setForm(prev => ({ ...prev, model: '', qty: '', unit: '' }));
  }

  async function handleSave() {
    if (session.length === 0) { showToast('Nothing to save.'); return; }
    setSaving(true);
    try {
      await addExits(session);
      const count = session.length;
      setSession([]);
      handleClear();
      showToast(`✓ ${count} exit ${count === 1 ? 'record' : 'records'} saved.`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Exit</h1>
          <p className="page-sub">Record goods leaving inventory</p>
        </div>
      </div>

      <div className="two-col">
        {/* FORM */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">New Exit</span>
            <span className="badge badge-red">Exit</span>
          </div>
          <div className="card-body">
            {/* Model autocomplete */}
            <div className="form-group">
              <label className="form-label">Model Number</label>
              <div className="autocomplete-wrap" ref={dropRef}>
                <input
                  type="text" name="model" value={form.model}
                  onChange={handleChange}
                  onFocus={() => setShowDrop(true)}
                  placeholder="Type to search (e.g. S or SRX)…"
                  autoComplete="off"
                />
                {showDrop && suggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {suggestions.map(s => (
                      <div key={s.model} className="autocomplete-item" onMouseDown={() => selectModel(s.model)}>
                        <span className="session-model">{s.model}</span>
                        <span className="item-balance">{s.balance} · <StatusBadge status={s.status} /></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {lookup && (
                <div className="stock-lookup">
                  <span className="stock-lookup-label">Available: <strong>{lookup.balance} {lookup.unit}</strong></span>
                  <StatusBadge status={lookup.status} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Exit Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity &amp; Unit</label>
              <div className="qty-row">
                <input type="number" name="qty" value={form.qty} onChange={handleChange} placeholder="0" min="1" />
                <select name="unit" value={form.unit} onChange={handleChange}>
                  <option value="">Select unit</option>
                  <option value="pcs">pcs — pieces</option>
                  <option value="ctn">ctn — cartons</option>
                </select>
              </div>
              {remaining !== null && (
                <p className={remaining < 0 ? 'form-hint-error' : 'form-hint'}>
                  {remaining < 0 ? `⚠ Exceeds stock by ${Math.abs(remaining)}` : `${remaining} ${lookup?.unit} will remain`}
                </p>
              )}
            </div>

            <div className="btn-row">
              <button className="btn" onClick={handleClear}>Clear</button>
              <button className="btn btn-danger" onClick={handleAdd}>− Add to list</button>
            </div>
          </div>
        </div>

        {/* SESSION LIST */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Exit list — {session.length}</span>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save all exits'}
            </button>
          </div>
          {session.length === 0 ? (
            <div className="empty">No exits staged yet.</div>
          ) : (
            <>
              <div className="session-list-header"><span>Model</span><span>Qty</span><span>Unit</span><span /></div>
              {session.map((item, i) => (
                <div className="session-item" key={i}>
                  <div>
                    <div className="session-model">{item.model}</div>
                    <div className="session-date-sub">{item.date} · {getBalance(item.model, entries, exits) - item.qty} remaining</div>
                  </div>
                  <div className="session-qty session-qty-exit">−{item.qty}</div>
                  <span className={`badge ${item.unit === 'pcs' ? 'badge-blue' : 'badge-neutral'}`}>{item.unit}</span>
                  <button className="remove-btn" onClick={() => setSession(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .two-col { display: grid; grid-template-columns: 400px 1fr; gap: 20px; align-items: start; }
        .stock-lookup { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 8px; display: flex; align-items: center; justify-content: space-between; }
        .stock-lookup-label { font-size: 12px; color: var(--text2); }
        .stock-lookup-label strong { color: var(--text); font-weight: 600; }
        @media(max-width:780px){.two-col{grid-template-columns:1fr;}}
      `}</style>
    </div>
  );
}
