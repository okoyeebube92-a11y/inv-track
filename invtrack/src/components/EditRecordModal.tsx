'use client';
// src/components/EditRecordModal.tsx
import { useState, useEffect } from 'react';
import type { StockEntry, StockExit } from '@/types';
import { todayISO } from '@/utils/inventory';

type Record = StockEntry | StockExit;

interface Props {
  record: Record | null;
  mode: 'entry' | 'exit';
  onSave: (id: string, updates: Partial<Record>) => Promise<void>;
  onClose: () => void;
}

export default function EditRecordModal({ record, mode, onSave, onClose }: Props) {
  const [form, setForm] = useState({ model: '', date: todayISO(), qty: '', unit: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (record) {
      setForm({ model: record.model, date: record.date, qty: String(record.qty), unit: record.unit });
    }
  }, [record]);

  if (!record) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!form.model.trim()) { setError('Model number is required.'); return; }
    if (!form.qty || parseInt(form.qty) < 1) { setError('Quantity must be at least 1.'); return; }
    if (!form.unit) { setError('Please select a unit.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(record!.id, { model: form.model.trim().toUpperCase(), date: form.date, qty: parseInt(form.qty), unit: form.unit as any });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit {mode === 'entry' ? 'Entry' : 'Exit'} Record</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Model Number</label>
            <input type="text" name="model" value={form.model} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity &amp; Unit</label>
            <div className="qty-row">
              <input type="number" name="qty" value={form.qty} onChange={handleChange} min="1" />
              <select name="unit" value={form.unit} onChange={handleChange}>
                <option value="">Select unit</option>
                <option value="pcs">pcs — pieces</option>
                <option value="ctn">ctn — cartons</option>
              </select>
            </div>
          </div>
          {error && <p className="form-hint-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
