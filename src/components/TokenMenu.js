import React, { useState, useEffect } from 'react';
import { apiGetTokens } from '../api/api';
import { MiniGraph } from './MiniGraph';
import { formatNum } from '../utils/format';

export function TokenMenu({ onSelect, playerId, portfolio }) {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let interval = setInterval(() => {
      apiGetTokens().then(setTokens).catch(() => setError('Failed to load tokens'));
    }, 5000);
    apiGetTokens().then(setTokens).catch(() => setError('Failed to load tokens'));
    return () => clearInterval(interval);
  }, []);

  const getShortName = (name) => {
    const shortName = name.replace(/ (Coin|Token)$/, '');
    // If the name is longer than 8 characters, use initials
    if (shortName.length > 8) {
      return shortName
        .split(/(?=[A-Z])|[\s_-]/) // Split on capital letters, spaces, underscores, or hyphens
        .filter(word => word.length > 0) // Remove empty strings
        .map(word => word[0]) // Get first letter of each word
        .join(''); // Join the letters
    }
    return shortName;
  };

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.corp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      background: '#000', 
      color: '#fff', 
      width: 400, 
      padding: '20px', 
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px',
        fontSize: '14px'
      }}>
        <span>TIME</span>
        <span>MONEY: {formatNum(portfolio.money)}</span>
        <span>{portfolio.name}</span>
      </div>
      <div style={{ 
        fontSize: '14px', 
        marginBottom: '20px' 
      }}>
        TOTAL NET VALUE: {formatNum(portfolio.money)}
      </div>
      
      <div style={{ 
        position: 'relative', 
        marginBottom: '20px' 
      }}>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 search"
          style={{
            width: '100%',
            padding: '10px',
            background: '#111',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {filteredTokens.map(token => {
        const playerToken = portfolio.portfolio[token.id] || { tokens: 0 };
        return (
          <div 
            key={token.id} 
            onClick={() => onSelect(token.id)}
            style={{
              background: '#111',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  letterSpacing: '-0.5px'
                }}>
                  {getShortName(token.name)}
                </div>
                <div style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  lineHeight: '1.2'
                }}>
                  {token.name} • {token.corp}
                </div>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '5px',
                marginLeft: '10px',
                flexShrink: 0
              }}>
                <div style={{ width: '125px' }}>
                  <MiniGraph 
                    history={token.history} 
                    color={token.growth < 0 ? 'red' : '#32CD32'} 
                    width={125} 
                    height={40} 
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '5px',
                  width: '125px',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ 
                    background: '#32CD32', 
                    color: '#000', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flex: 1
                  }}>
                    +20%
                  </span>
                  <span style={{ 
                    background: '#32CD32', 
                    color: '#000', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flex: 1
                  }}>
                    +20%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
} 