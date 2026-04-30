const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function uploadQuestions(token, formData) {
  return request('/admin/upload-questions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
}

export function getPackages() {
  return request('/packages');
}

export function getProfile(token) {
  return request('/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getTryoutQuestions(tryoutId) {
  return request(`/tryouts/${tryoutId}/questions`);
}

export function submitTryoutAnswers(tryoutId, payload) {
  const token = localStorage.getItem('token');
  return request(`/tryouts/${tryoutId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function getTryoutRanking(tryoutId) {
  return request(`/tryouts/${tryoutId}/ranking`);
}

export function getUserResults(token) {
  return request('/user/results', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
