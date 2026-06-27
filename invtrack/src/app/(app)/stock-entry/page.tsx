'use client';
// src/app/(app)/stock-entry/page.tsx
import { useState } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { todayISO } from '@/utils/inventory';

interface SessionItem { model: string; date: string; qty: number; unit: string; }

export default function StockEntryPage() {
  const { entries, exits, addEntries, showToast } = useInventoryContext();
  const [form, setForm]     = useState({ model: '', date: todayISO(), qty: '', unit: '' });
  const [session, setSession] = useState<SessionItem[]>([]);
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleClear() { setForm({ model: '', date: todayISO(), qty: '', unit: '' }); }

  function handleAdd() {
    const model = form.model.trim();
    if (!model)                        { showToast('Please enter a model number.'); return; }
    if (!form.date)                    { showToast('Please select an entry date.'); return; }
    if (!form.qty || parseInt(form.qty) < 1) { showToast('Please enter a valid quantity.'); return; }
    if (!form.unit)                    { showToast('Please select a unit.'); return; }
    setSession(prev => [...prev, { model: model.toUpperCase(), date: form.date, qty: parseInt(form.qty), unit: form.unit }]);
    setForm(prev => ({ ...prev, model: '', qty: '', unit: '' }));
  }

  async function handleSave() {
    if (session.length === 0) { showToast('Nothing to save.'); return; }
    setSaving(true);
    try {
      await addEntries(session);
      const count = session.length;
      setSession([]);
      handleClear();
      showToast(`✓ ${count} ${count === 1 ? 'entry' : 'entries'} saved.`);
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
          <h1 className="page-title">Stock Entry</h1>
          <p className="page-sub">Record incoming goods into inventory</p>
        </div>
      </div>

      <div className="two-col">
        {/* FORM */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">New Entry</span>
            <span className="badge badge-blue">Entry</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Model Number</label>
              <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="e.g. MDL-10042-A" autoComplete="off" />
              <p className="form-hint">Enter the goods model number or product code</p>
            </div>
            <div className="form-group">
              <label className="form-label">Entry Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
              <p className="form-hint">Date this stock was received</p>
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
            </div>
            <div className="btn-row">
              <button className="btn" onClick={handleClear}>Clear</button>
              <button className="btn btn-primary" onClick={handleAdd}>+ Add to list</button>
            </div>
          </div>
        </div>

        {/* SESSION LIST */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Session — {session.length} {session.length === 1 ? 'entry' : 'entries'}</span>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save all'}
            </button>
          </div>
          {session.length === 0 ? (
            <div className="empty">Add items using the form, then save all at once.</div>
          ) : (
            <>
              <div className="session-list-header"><span>Model</span><span>Qty</span><span>Unit</span><span /></div>
              {session.map((item, i) => (
                <div className="session-item" key={i}>
                  <div>
                    <div className="session-model">{item.model}</div>
                    <div className="session-date-sub">{item.date}</div>
                  </div>
                  <div className="session-qty">{item.qty}</div>
                  <span className={`badge ${item.unit === 'pcs' ? 'badge-blue' : 'badge-neutral'}`}>{item.unit}</span>
                  <button className="remove-btn" onClick={() => setSession(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style jsx>{`.two-col { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; } @media(max-width:780px){.two-col{grid-template-columns:1fr;}}`}</style>
    </div>
  );
}
