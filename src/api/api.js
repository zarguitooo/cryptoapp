import { API_BASE_URL } from '../config';

export async function apiLogin(name) {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function apiGetTokens() {
  const res = await fetch(`${API_BASE_URL}/api/tokens`);
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

export async function apiGetPortfolio(playerId) {
  const res = await fetch(`${API_BASE_URL}/api/portfolio`, {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function apiGetToken(id, playerId) {
  const res = await fetch(`${API_BASE_URL}/api/token/${id}`, {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch token');
  return res.json();
}

export async function apiBuySell(id, { type, amount }, playerId) {
  const res = await fetch(`${API_BASE_URL}/api/token/${id}/trade`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-player-id': playerId
    },
    body: JSON.stringify({ type, amount }),
  });
  if (!res.ok) throw new Error('Transaction failed');
  return res.json();
}

export async function apiGetPlayers() {
  const res = await fetch(`${API_BASE_URL}/api/players`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
} 