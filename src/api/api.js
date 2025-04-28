export async function apiLogin(name) {
  const res = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function apiGetTokens() {
  const res = await fetch('http://localhost:4000/api/tokens');
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

export async function apiGetPortfolio(playerId) {
  const res = await fetch('http://localhost:4000/api/portfolio', {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function apiGetToken(id, playerId) {
  const res = await fetch(`http://localhost:4000/api/token/${id}`, {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch token');
  return res.json();
}

export async function apiBuySell(id, { type, amount }, playerId) {
  const res = await fetch(`http://localhost:4000/api/token/${id}/trade`, {
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