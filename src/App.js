import React, { useState, useEffect } from 'react';
import './App.css';

// API call functions
async function apiGetState() {
  const res = await fetch('http://localhost:4000/api/state');
  if (!res.ok) throw new Error('Failed to fetch state');
  return res.json();
}

async function apiBuySell({ type, amount }) {
  const res = await fetch('http://localhost:4000/api/trade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, amount }),
  });
  if (!res.ok) throw new Error('Transaction failed');
  return res.json();
}

function App() {
  const [money, setMoney] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [value, setValue] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [demand, setDemand] = useState(0);
  const [input, setInput] = useState(0);
  const [mode, setMode] = useState('buy'); // 'buy' or 'sell'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValue, setTokenValue] = useState(0);

  // Fetch initial state from backend
  useEffect(() => {
    apiGetState().then(data => {
      setMoney(data.money);
      setTokens(data.tokens);
      setValue(data.value);
      setGrowth(data.growth);
      setDemand(data.demand);
      setTokenValue(data.tokenValue);
    }).catch(() => setError('Failed to load state from server'));
  }, []);

  const handleTransaction = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiBuySell({ type: mode, amount: Number(input) });
      setMoney(result.money);
      setTokens(result.tokens);
      setValue(result.value);
      setGrowth(result.growth);
      setDemand(result.demand);
      setTokenValue(result.tokenValue);
      setInput(0);
    } catch (e) {
      setError(e.message || 'Transaction failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#222', color: '#fff', width: 250, padding: 10, borderRadius: 8, fontFamily: 'sans-serif', border: '4px solid #aaa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>TIME</span>
        <span>MONEY: <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{money}</span></span>
        <span>USER</span>
      </div>
      <div style={{ fontWeight: 'bold', fontSize: 24, marginTop: 8 }}>PapaCoin</div>
      <div style={{ fontSize: 12, color: '#ccc', marginBottom: 8 }}>PapaCoin corp.</div>
      {/* Placeholder graph */}
      <div style={{ height: 60, background: '#111', margin: '8px 0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'lime', fontSize: 18 }}>[graph]</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'lime', fontSize: 16 }}>
        <span>+{growth}%<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>GROWTH</span></span>
        <span>+{demand}%<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>DEMAND</span></span>
        <span>{value}$<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>VALUE</span></span>
      </div>
      <div style={{ color: 'lime', fontSize: 12, margin: '4px 0 8px 0' }}>20% PROFIT</div>
      <div style={{ background: '#111', borderRadius: 4, padding: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span>Your K:</span>
          <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{tokens}</span>
          <span style={{ color: 'lime' }}>{tokenValue}$</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          style={{ background: mode === 'buy' ? '#ff9800' : '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', marginRight: 6, cursor: 'pointer' }}
          onClick={() => setMode('buy')}
          disabled={loading}
        >BUY</button>
        <button
          style={{ background: mode === 'sell' ? '#ff9800' : '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', marginRight: 6, cursor: 'pointer' }}
          onClick={() => setMode('sell')}
          disabled={loading}
        >SELL</button>
        <input
          type="number"
          min={0}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: 50, marginLeft: 6, borderRadius: 4, border: '1px solid #888', padding: '2px 4px' }}
          disabled={loading}
        />
      </div>
      <button
        onClick={handleTransaction}
        style={{ width: '100%', background: '#ff9800', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 0', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}
        disabled={loading || input <= 0}
      >
        {loading ? 'PROCESSING...' : 'COMPLETE TRANSACTION'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

export default App;
