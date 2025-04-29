import React from 'react';
import { formatNum } from '../utils/format';

export function Leaderboard({ players }) {
  // Sort players by total value (money + token value)
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a.money + Object.values(a.portfolio).reduce((sum, token) => sum + token.tokens * token.value, 0);
    const bValue = b.money + Object.values(b.portfolio).reduce((sum, token) => sum + token.tokens * token.value, 0);
    return bValue - aValue;
  });

  return (
    <div style={{
      background: '#222',
      color: '#fff',
      width: 250,
      padding: 20,
      borderRadius: 8,
      fontFamily: 'sans-serif',
      border: '4px solid #aaa',
      marginRight: 20,
      height: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Leaderboard</h2>
      <div style={{ marginTop: 20 }}>
        {sortedPlayers.map((player, index) => {
          const totalValue = player.money + Object.values(player.portfolio).reduce(
            (sum, token) => sum + token.tokens * token.value, 0
          );
          return (
            <div key={player.id} style={{
              padding: '10px 0',
              borderBottom: '1px solid #444',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ color: '#ff9800', marginRight: 5 }}>#{index + 1}</span>
                <span style={{ fontWeight: 'bold' }}>{player.name}</span>
              </div>
              <div style={{ color: '#4caf50' }}>
                ${formatNum(totalValue)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 