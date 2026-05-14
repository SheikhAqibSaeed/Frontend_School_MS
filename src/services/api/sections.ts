'use client';

import { legacyAuthHeaders } from '@/lib/persisted-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface SectionFilters {
  classId?: string;
}

export async function getSections(filters?: SectionFilters) {
  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);

  return fetch(`${API_BASE}/sections?${params.toString()}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function getSection(id: string) {
  return fetch(`${API_BASE}/sections/${id}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function createSection(data: any) {
  return fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateSection(id: string, data: any) {
  return fetch(`${API_BASE}/sections/${id}`, {
    method: 'PUT',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteSection(id: string) {
  return fetch(`${API_BASE}/sections/${id}`, {
    method: 'DELETE',
    headers: legacyAuthHeaders(),
  });
}
