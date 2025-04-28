import React, { useState, useEffect } from 'react';
import { apiGetToken, apiBuySell } from '../api/api';
import { MiniGraph } from './MiniGraph';
import { formatNum } from '../utils/format';
import companyBackgrounds from '../company-backgrounds.json';

export function TokenTrade({ tokenId, onBack, playerId, portfolio }) {
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