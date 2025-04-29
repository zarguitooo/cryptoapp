import React, { useState } from 'react';
import { apiLogin } from '../api/api';

export function LoginPage({ onLogin }) {
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
      background: '#000', 
      color: '#fff', 
      width: 400, 
      padding: '20px', 
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        background: '#111',
        padding: '30px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '320px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          letterSpacing: '-0.5px',
          textAlign: 'center'
        }}>
          CRYPTO TRADING
        </h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '16px',
              background: '#222',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#32CD32',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
        {error && (
          <div style={{ 
            color: '#ff4444', 
            marginTop: '15px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
 