'use client';
// src/components/NavBar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Props { alertCount: number; }

const TABS = [
  { href: '/stock-entry',   label: 'Entry' },
  { href: '/stock-exit',    label: 'Exit' },
  { href: '/balance',       label: 'Balance' },
  { href: '/history',       label: 'History' },
  { href: '/settings',      label: 'Settings' },
];

export default function NavBar({ alertCount }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, signOut, isAdmin } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/stock-entry" className="nav-logo" aria-label="INV/TRACK home">
          <span className="logo-main">INV</span><span className="logo-slash">/</span><span className="logo-main">TRACK</span>
        </Link>

        <div className="nav-tabs" aria-label="Primary navigation">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`nav-tab${pathname === tab.href ? ' active' : ''}`}
            >
              {tab.label}
              {tab.href === '/balance' && alertCount > 0 && (
                <span className="tab-badge">{alertCount}</span>
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={`nav-tab nav-tab-admin${pathname.startsWith('/admin') ? ' active' : ''}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="nav-right">
          {user && (
            <div className="nav-user" title={user.email || ''}>
              <span className="nav-user-dot" />
              <span className="nav-user-email">{user.email}</span>
            </div>
          )}
          <button className="nav-signout" onClick={handleSignOut} type="button">
            Sign out
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: rgba(255,255,255,0.96);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
        }
        .navbar-inner {
          width: 100%;
          max-width: 1180px;
          min-height: 58px;
          margin: 0 auto;
          padding: 8px 20px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 18px;
        }
        .nav-logo {
          display: inline-flex;
          align-items: baseline;
          gap: 1px;
          color: var(--accent);
          text-decoration: none;
          white-space: nowrap;
        }
        .logo-main { font-size: 15px; font-weight: 800; letter-spacing: 0; }
        .logo-slash { color: var(--text3); font-weight: 500; margin: 0 1px; }
        .nav-tabs {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-tabs::-webkit-scrollbar { display: none; }
        .nav-tab {
          min-height: 34px;
          padding: 8px 11px;
          border-radius: var(--radius-sm);
          color: var(--text2);
          font-size: 13px;
          font-weight: 650;
          text-decoration: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .nav-tab:hover { background: var(--surface2); color: var(--text); }
        .nav-tab.active { background: var(--accent-light); color: var(--accent); box-shadow: inset 0 0 0 1px rgba(26,58,92,0.08); }
        .nav-tab-admin { color: var(--amber); }
        .nav-tab-admin.active { background: var(--amber-bg); color: var(--amber); }
        .tab-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          background: var(--red-bg);
          color: var(--red);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .nav-right {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .nav-user {
          min-width: 0;
          max-width: 220px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .nav-user-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex: 0 0 auto; }
        .nav-user-email { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--text2); }
        .nav-signout {
          height: 32px;
          padding: 0 12px;
          border: 1px solid var(--border2);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text2);
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .nav-signout:hover { color: var(--red); border-color: #E6A8A8; background: var(--red-bg); }
        @media (max-width: 860px) {
          .navbar-inner { grid-template-columns: 1fr auto; gap: 8px; padding: 8px 12px 10px; }
          .nav-logo { grid-column: 1; }
          .nav-right { grid-column: 2; }
          .nav-tabs { grid-column: 1 / -1; order: 3; padding-top: 2px; }
          .nav-user { display: none; }
          .nav-tab { font-size: 12px; padding: 8px 10px; }
        }
      `}</style>
    </nav>
  );
}
