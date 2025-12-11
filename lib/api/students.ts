'use client';

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

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/students?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function getStudent(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/students/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function createStudent(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateStudent(id: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteStudent(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

