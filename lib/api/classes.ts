'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function getClasses() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/classes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function getClass(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/classes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

export async function createClass(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateClass(id: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteClass(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
}

