'use client';

import { legacyAuthHeaders } from '@/lib/persisted-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface StudentFilters {
  classId?: string;
  sectionId?: string;
  search?: string;
}

export async function getStudents(filters?: StudentFilters) {
  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.sectionId) params.append('sectionId', filters.sectionId);
  if (filters?.search) params.append('search', filters.search);

  return fetch(`${API_BASE}/students?${params.toString()}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function getStudent(id: string) {
  return fetch(`${API_BASE}/students/${id}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function createStudent(data: any) {
  return fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id: string, data: any) {
  return fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id: string) {
  return fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
    headers: legacyAuthHeaders(),
  });
}
