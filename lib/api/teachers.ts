'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface TeacherFilters {
  search?: string;
  department?: string;
}

export async function getTeachers(filters?: TeacherFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.department) params.append('department', filters.department);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teachers?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function getTeacher(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teachers/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function createTeacher(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateTeacher(id: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teachers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteTeacher(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teachers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

