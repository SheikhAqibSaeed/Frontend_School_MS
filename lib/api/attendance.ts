'use client';

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

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/attendance?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function createAttendance(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateAttendance(id: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteAttendance(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function bulkCreateAttendance(data: { studentId: string; status: string; date: string }[]) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/attendance/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ attendances: data }),
  });
  return response;
}

