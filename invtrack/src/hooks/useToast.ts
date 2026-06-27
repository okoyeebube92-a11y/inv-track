'use client';
// src/hooks/useToast.ts
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, visible: true });
    timer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  return { toast, showToast };
}
