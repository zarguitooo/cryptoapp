import React, { useState, useEffect } from 'react';
import { apiGetTokens } from '../api/api';
import { MiniGraph } from './MiniGraph';
import { formatNum } from '../utils/format';

export function TokenMenu({ onSelect, playerId, portfolio }) {
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