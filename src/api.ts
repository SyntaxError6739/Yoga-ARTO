import type { Opportunity } from './types';

type PersistedState = { saved: number[]; joined: number[] };

const visitorStorageKey = 'arto-visitor-id';

function getVisitorId() {
  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;
  const id = `visitor-${crypto.randomUUID()}`;
  window.localStorage.setItem(visitorStorageKey, id);
  return id;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

export async function loadDatabaseState() {
  const visitorId = getVisitorId();
  const [opportunityResponse, state] = await Promise.all([
    request<{ opportunities: Opportunity[] }>('/api/opportunities'),
    request<PersistedState>(`/api/state?visitorId=${encodeURIComponent(visitorId)}`)
  ]);
  return { ...state, opportunities: opportunityResponse.opportunities };
}

export async function saveExperience(opportunityId: number, saved: boolean) {
  await request('/api/saved/' + opportunityId, {
    method: 'PUT',
    body: JSON.stringify({ visitorId: getVisitorId(), saved })
  });
}

export async function addJourneyItem(opportunityId: number) {
  await request('/api/journey', {
    method: 'POST',
    body: JSON.stringify({ visitorId: getVisitorId(), opportunityId })
  });
}
