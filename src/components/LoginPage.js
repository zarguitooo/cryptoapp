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
 