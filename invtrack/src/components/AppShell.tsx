'use client';
// src/components/AppShell.tsx
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from './NavBar';
import Toast  from './Toast';
import { useToast }     from '@/hooks/useToast';
import { useInventory } from '@/hooks/useInventory';
import { getAllModels, getBalance, getStatus } from '@/utils/inventory';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { InventoryContext } from '@/context/InventoryContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellGuard>{children}</AppShellGuard>
    </AuthProvider>
  );
}

function AppShellGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  if (loading) {
    return <div className="app-banner app-banner-loading">Checking sign in…</div>;
  }

  if (!user) {
    return null;
  }

  return <AppShellInner>{children}</AppShellInner>;
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const inv = useInventory();
  const { toast, showToast } = useToast();

  const alertCount = useMemo(() => {
    const models = getAllModels(inv.entries, inv.exits);
    return models.filter(m => getStatus(getBalance(m, inv.entries, inv.exits)) !== 'ok').length;
  }, [inv.entries, inv.exits]);

  return (
    <InventoryContext.Provider value={{ ...inv, showToast }}>
      <NavBar alertCount={alertCount} />
      {inv.loading && (
        <div className="app-banner app-banner-loading">Loading inventory data…</div>
      )}
      {inv.error && (
        <div className="app-banner app-banner-error">
          {inv.error}
          <button className="btn btn-sm" onClick={() => inv.reload()}>Retry</button>
        </div>
      )}
      <main>{children}</main>
      <Toast message={toast.message} visible={toast.visible} />
      <style jsx>{`
        .app-banner { padding: 10px 24px; font-size: 13px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .app-banner-loading { background: var(--blue-bg, #eef4ff); color: var(--accent); }
        .app-banner-error { background: var(--red-bg); color: var(--red); }
      `}</style>
    </InventoryContext.Provider>
  );
}
