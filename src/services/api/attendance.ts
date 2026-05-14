'use client';

import { legacyAuthHeaders } from '@/lib/persisted-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface AttendanceFilters {
  date?: string;
  classId?: string;
  studentId?: string;
}

export async function getAttendance(filters?: AttendanceFilters) {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.studentId) params.append('studentId', filters.studentId);

  return fetch(`${API_BASE}/attendance?${params.toString()}`, {
    headers: legacyAuthHeaders(),
  });
}

export async function createAttendance(data: any) {
  return fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateAttendance(id: string, data: any) {
  return fetch(`${API_BASE}/attendance/${id}`, {
    method: 'PUT',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteAttendance(id: string) {
  return fetch(`${API_BASE}/attendance/${id}`, {
    method: 'DELETE',
    headers: legacyAuthHeaders(),
  });
}

export async function bulkCreateAttendance(data: { studentId: string; status: string; date: string }[]) {
  return fetch(`${API_BASE}/attendance/bulk`, {
    method: 'POST',
    headers: legacyAuthHeaders(true),
    body: JSON.stringify({ attendances: data }),
  });
}
