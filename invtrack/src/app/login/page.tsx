'use client';
// src/app/login/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('error') === 'supabase-config'
      ? 'Supabase is not configured. Set the public Supabase environment variables, then restart the frontend.'
      : '';
  });


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email)    { setError('Please enter your email.');    return; }
    if (!form.password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      router.refresh();
      router.push('/stock-entry');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">INV<span>/</span>TRACK</div>
          <p className="login-tagline">Inventory management system</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autoComplete="current-password" />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing inâ€¦' : 'Sign in'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
        .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 36px 32px; width: 100%; max-width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .login-brand { text-align: center; margin-bottom: 28px; }
        .login-logo { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--accent); }
        .login-logo span { color: var(--text3); font-weight: 400; }
        .login-tagline { font-size: 13px; color: var(--text3); margin-top: 4px; }
        .login-error { background: var(--red-bg); color: var(--red); border: 1px solid #F0AAAA; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
        .login-btn { width: 100%; justify-content: center; padding: 11px 16px; font-size: 14px; }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>;
}


