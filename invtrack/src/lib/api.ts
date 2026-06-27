import { createClient } from '@/lib/supabase/client';

const DEFAULT_API_BASE_URL = '';

type ApiEnvelope<T> = { success: boolean; data: T };

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

async function getAccessToken() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  } catch {}

  return '';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const accessToken = await getAccessToken();
  const headers = new Headers(init.headers);

  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken);

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch {
    throw new Error('Unable to reach the inventory backend. Make sure the backend server is running on port 5000.');
  }

  const text = await response.text();
  let data: { message?: string } | null = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('The inventory backend returned an unexpected response. Check that the backend server is running correctly.');
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export async function fetchEntries() {
  return request<ApiEnvelope<unknown[]>>('/api/entries');
}

export async function createEntries(items: unknown[]) {
  return request<ApiEnvelope<unknown[]>>('/api/entries', {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

export async function updateEntry(id: string, updates: Record<string, unknown>) {
  return request<ApiEnvelope<unknown>>('/api/entries/' + id, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteEntry(id: string) {
  return request<{ success: boolean }>('/api/entries/' + id, { method: 'DELETE' });
}

export async function fetchExits() {
  return request<ApiEnvelope<unknown[]>>('/api/exits');
}

export async function createExits(items: unknown[]) {
  return request<ApiEnvelope<unknown[]>>('/api/exits', {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

export async function updateExit(id: string, updates: Record<string, unknown>) {
  return request<ApiEnvelope<unknown>>('/api/exits/' + id, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteExit(id: string) {
  return request<{ success: boolean }>('/api/exits/' + id, { method: 'DELETE' });
}
