'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface SectionFilters {
  classId?: string;
}

export async function getSections(filters?: SectionFilters) {
  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/sections?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function getSection(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/sections/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function createSection(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateSection(id: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/sections/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteSection(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/sections/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

