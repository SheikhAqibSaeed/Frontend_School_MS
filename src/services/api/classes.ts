'use client';

import { legacyAuthHeaders } from '@/lib/persisted-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function getClasses() {
  return fetch(`${API_BASE}/classes`, {
    headers: legacyAuthHeaders(),
  });
}

export async function getClass(id: string) {
  return fetch(`${API_BASE}/classes/${id}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function createClass(data: any) {
  return fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateClass(id: string, data: any) {
  return fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteClass(id: string) {
  return fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
    headers: legacyAuthHeaders(),
  });
}
