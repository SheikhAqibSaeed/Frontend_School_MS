'use client';

import { legacyAuthHeaders } from '@/lib/persisted-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface TeacherFilters {
  search?: string;
  department?: string;
}

export async function getTeachers(filters?: TeacherFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.department) params.append('department', filters.department);

  return fetch(`${API_BASE}/teachers?${params.toString()}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function getTeacher(id: string) {
  return fetch(`${API_BASE}/teachers/${id}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function createTeacher(data: any) {
  return fetch(`${API_BASE}/teachers`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateTeacher(id: string, data: any) {
  return fetch(`${API_BASE}/teachers/${id}`, {
    method: 'PUT',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteTeacher(id: string) {
  return fetch(`${API_BASE}/teachers/${id}`, {
    method: 'DELETE',
    headers: legacyAuthHeaders(),
  });
}
