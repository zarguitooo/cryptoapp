import React, { useState, useEffect } from 'react';
import './App.css';
import { LoginPage } from './components/LoginPage';
import { TokenMenu } from './components/TokenMenu';
import { TokenTrade } from './components/TokenTrade';
import { apiGetPortfolio } from './api/api';

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
