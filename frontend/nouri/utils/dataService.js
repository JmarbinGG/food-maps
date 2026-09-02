import aiChatService from './services/aiChatService.js';

function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function apiGet(path) {
  const token = getToken();
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const dataService = {
  getCenters: () => apiGet('/api/centers'),
  getListings: () => apiGet('/api/listings/get'),
  getUserProfile: async (userId) => {
    const token = getToken();
    const res = await fetch('/api/user/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  uploadFile: (file, _bucket) => aiChatService.uploadImage(file, getUserIdFromToken()),
};

export default dataService;
