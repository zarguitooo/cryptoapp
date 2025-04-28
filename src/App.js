import React, { useState, useEffect } from 'react';
import './App.css';
import companyBackgrounds from './company-backgrounds.json';

// API call functions
async function apiLogin(name) {
  const res = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

async function apiGetTokens() {
  const res = await fetch('http://localhost:4000/api/tokens');
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

async function apiGetPortfolio(playerId) {
  const res = await fetch('http://localhost:4000/api/portfolio', {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

async function apiGetToken(id, playerId) {
  const res = await fetch(`http://localhost:4000/api/token/${id}`, {
    headers: { 'x-player-id': playerId }
  });
  if (!res.ok) throw new Error('Failed to fetch token');
  return res.json();
}

async function apiBuySell(id, { type, amount }, playerId) {
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

function formatNum(n) {
  return typeof n === 'number' ? n.toFixed(2).replace(/\.00$/, '') : n;
}

function MiniGraph({ history, color = 'lime', width = 60, height = 28, showAxis = false }) {
  if (!history || history.length < 2) {
    // Generate a random placeholder graph
    let points = [];
    let y = Math.random() * (height - 10) + 5;
    for (let i = 0; i < 10; i++) {
      y += (Math.random() - 0.5) * 6;
      y = Math.max(2, Math.min(height - 2, y));
      const x = (i / 9) * (width - 2) + 1;
      points.push(`${x},${y}`);
    }
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points.join(' ')}
        />
      </svg>
    );
  }
  const min = Math.min(...history.map(h => h.value));
  const max = Math.max(...history.map(h => h.value));
  const range = max - min || 1;
  const minTime = history[0].time;
  const maxTime = history[history.length - 1].time;
  const timeRange = maxTime - minTime || 1;
  const points = history.map(h => {
    const x = ((h.time - minTime) / timeRange) * (width - 2) + 1;
    const y = height - 1 - ((h.value - min) / range) * (height - 2);
    return `${x},${y}`;
  }).join(' ');
  if (!showAxis) {
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  }
  // Axis labels for TokenTrade
  const xLabels = [0, Math.round(timeRange / 2), timeRange].map((t, i) => {
    const x = (t / timeRange) * (width - 2) + 1;
    return <text key={i} x={x} y={height} fontSize={7} fill="#aaa" textAnchor="middle">{t}s</text>;
  });
  return (
    <svg width={width} height={height + 8} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      {xLabels}
    </svg>
  );
}

function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { playerId } = await apiLogin(name);
      onLogin(playerId);
    } catch (e) {
      setError(e.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      background: '#222', 
      color: '#fff', 
      width: 300, 
      padding: 20, 
      borderRadius: 8, 
      fontFamily: 'sans-serif', 
      border: '4px solid #aaa',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: 20 }}>Crypto Trading</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #888',
            fontSize: '16px',
            background: '#333',
            color: '#fff'
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            background: '#ff9800',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}

function TokenMenu({ onSelect, playerId, portfolio }) {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let interval = setInterval(() => {
      apiGetTokens().then(setTokens).catch(() => setError('Failed to load tokens'));
    }, 5000);
    apiGetTokens().then(setTokens).catch(() => setError('Failed to load tokens'));
    return () => clearInterval(interval);
  }, []);

  const totalValue = Object.entries(portfolio.portfolio).reduce((sum, [tokenId, data]) => {
    const token = tokens.find(t => t.id === tokenId);
    return sum + (token ? data.tokens * token.value : 0);
  }, 0);

  return (
    <div style={{ background: '#222', color: '#fff', width: 270, padding: 10, borderRadius: 8, fontFamily: 'sans-serif', border: '4px solid #aaa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>TIME</span>
        <span>MONEY: <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{formatNum(portfolio.money)}</span></span>
        <span>{portfolio.name}</span>
      </div>
      <div style={{ fontSize: 12, color: '#aaa', margin: '8px 0' }}>
        Total Portfolio Value: <span style={{ color: '#fff' }}>{formatNum(totalValue + portfolio.money)}$</span>
      </div>
      <input style={{ width: '100%', margin: '8px 0', borderRadius: 4, border: '1px solid #888', padding: '2px 4px', fontSize: 14 }} placeholder="🔍" disabled />
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>ORDER IN:</div>
      {tokens.map(token => {
        const playerToken = portfolio.portfolio[token.id];
        return (
          <div key={token.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => onSelect(token.id)}>
            <div style={{ fontWeight: 'bold', fontSize: 22, color: '#fff' }}>{token.name}</div>
            <div style={{ fontSize: 12, color: '#ccc', marginBottom: 2 }}>{token.corp}</div>
            <div style={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <MiniGraph history={token.history} color={token.growth < 0 ? 'red' : 'lime'} showAxis={false} />
              <span style={{ color: token.growth < 0 ? 'red' : 'lime', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }}>
                {token.growth > 0 ? '+' : ''}{formatNum(token.growth)}% <span style={{ fontSize: 13 }}>G</span> &nbsp;
                {token.demand > 0 ? '+' : ''}{formatNum(token.demand)}% <span style={{ fontSize: 13 }}>D</span>
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
              Your holdings: {playerToken.tokens} tokens ({formatNum(playerToken.tokens * token.value)}$)
            </div>
          </div>
        );
      })}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

function TokenTrade({ tokenId, onBack, playerId, portfolio }) {
  const [tokens, setTokens] = useState(0);
  const [value, setValue] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [demand, setDemand] = useState(0);
  const [input, setInput] = useState(0);
  const [mode, setMode] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValue, setTokenValue] = useState(0);
  const [name, setName] = useState('');
  const [corp, setCorp] = useState('');
  const [history, setHistory] = useState([]);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    let interval;
    function fetchToken() {
      apiGetToken(tokenId, playerId).then(data => {
        setTokens(data.tokens);
        setValue(data.value);
        setGrowth(data.growth);
        setDemand(data.demand);
        setTokenValue(data.tokenValue);
        setName(data.name);
        setCorp(data.corp);
        setHistory(data.history || []);
      }).catch(() => setError('Failed to load token'));
    }
    fetchToken();
    interval = setInterval(fetchToken, 5000);
    return () => clearInterval(interval);
  }, [tokenId, playerId]);

  const handleTransaction = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiBuySell(tokenId, { type: mode, amount: Number(input) }, playerId);
      setTokens(result.tokens);
      setValue(result.value);
      setGrowth(result.growth);
      setDemand(result.demand);
      setTokenValue(result.tokenValue);
      setHistory(result.history || []);
      setInput(0);
    } catch (e) {
      setError(e.message || 'Transaction failed');
    }
    setLoading(false);
  };

  return (
    <div className="token-trade">
      <div style={{ background: '#222', color: '#fff', width: 250, padding: 10, borderRadius: 8, fontFamily: 'sans-serif', border: '4px solid #aaa' }}>
        <button onClick={onBack} style={{ marginBottom: 8, background: '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>← Back</button>
        <div style={{ position: 'relative' }}>
          <h2 
            style={{ margin: 0, cursor: 'help' }}
            onMouseEnter={() => setShowBackground(true)}
            onMouseLeave={() => setShowBackground(false)}
          >
            {name}
            {showBackground && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#333',
                color: '#fff',
                padding: 10,
                borderRadius: 4,
                fontSize: '0.8em',
                width: 300,
                zIndex: 1000,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                border: '1px solid #555'
              }}>
                {companyBackgrounds.company_backgrounds[corp]}
              </div>
            )}
          </h2>
          <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>{corp}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>TIME</span>
          <span>MONEY: <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{formatNum(portfolio.money)}</span></span>
          <span>{portfolio.name}</span>
        </div>
        <div style={{ height: 60, background: '#111', margin: '8px 0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MiniGraph history={history} color={growth < 0 ? 'red' : 'lime'} showAxis={true} width={120} height={50} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: growth < 0 ? 'red' : 'lime', fontSize: 16 }}>
          <span>{growth > 0 ? '+' : ''}{formatNum(growth)}%<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>GROWTH</span></span>
          <span>{demand > 0 ? '+' : ''}{formatNum(demand)}%<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>DEMAND</span></span>
          <span>{formatNum(value)}$<br /><span style={{ color: '#fff', fontWeight: 'normal', fontSize: 10 }}>VALUE</span></span>
        </div>
        <div style={{ color: growth < 0 ? 'red' : 'lime', fontSize: 12, margin: '4px 0 8px 0' }}>20% PROFIT</div>
        <div style={{ background: '#111', borderRadius: 4, padding: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Your K:</span>
            <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{formatNum(tokens)}</span>
            <span style={{ color: growth < 0 ? 'red' : 'lime' }}>{formatNum(tokenValue)}$</span>
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
    </div>
  );
}

function App() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    if (playerId) {
      // Fetch portfolio data
      const fetchPortfolio = () => {
        apiGetPortfolio(playerId)
          .then(setPortfolio)
          .catch(console.error);
      };
      fetchPortfolio();
      const interval = setInterval(fetchPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [playerId]);

  if (!playerId) {
    return <LoginPage onLogin={setPlayerId} />;
  }

  if (!portfolio) {
    return <div>Loading...</div>;
  }

  return selectedToken ? (
    <TokenTrade tokenId={selectedToken} onBack={() => setSelectedToken(null)} playerId={playerId} portfolio={portfolio} />
  ) : (
    <TokenMenu onSelect={setSelectedToken} playerId={playerId} portfolio={portfolio} />
  );
}

export default App;
