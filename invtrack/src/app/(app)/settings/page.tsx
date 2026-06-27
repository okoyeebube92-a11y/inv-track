'use client';
// src/app/(app)/settings/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        setLoading(false);
      });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles')
      .upsert({ user_id: user.id, display_name: displayName.trim() }, { onConflict: 'user_id' });
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* PROFILE */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Profile</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={user?.email ?? ''} disabled style={{opacity:0.6,cursor:'not-allowed'}} />
              <p className="form-hint">Email cannot be changed here</p>
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. John Warehouse"
                disabled={loading}
              />
              <p className="form-hint">This name will appear in the app instead of your email</p>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        {/* ACCOUNT INFO */}
        <div className="settings-side">
          <div className="card">
            <div className="card-header"><span className="card-title">Account</span></div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">User ID</span>
                <span className="mono" style={{fontSize:11}}>{user?.id?.slice(0,8)}…</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role</span>
                <span className={`badge ${isAdmin ? 'badge-amber' : 'badge-neutral'}`}>
                  {isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Last sign in</span>
                <span style={{fontSize:12,color:'var(--text2)'}}>
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ADMIN PANEL LINK */}
          {isAdmin && (
            <div className="card admin-card">
              <div className="card-body">
                <div className="admin-card-icon">🔐</div>
                <div className="admin-card-title">Admin Panel</div>
                <p className="admin-card-desc">Manage all user records, view system-wide data, and perform bulk operations.</p>
                <Link href="/admin" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:14}}>
                  Open Admin Panel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        .settings-side { display: flex; flex-direction: column; gap: 16px; }
        .info-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.04em; }
        .admin-card { border-color: var(--amber-bg); background: #FFFDF5; }
        .admin-card-icon { font-size: 24px; margin-bottom: 8px; }
        .admin-card-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .admin-card-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }
        @media(max-width:780px){ .settings-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
