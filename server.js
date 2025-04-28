const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

let serverStart = Date.now();

// In-memory store for players
let players = new Map();

// In-memory store for tokens
let tokens = [
  {
    id: 'papa',
    name: 'PapaCoin',
    corp: 'PapaCoin corp.',
    value: 10,
    growth: 10,
    demand: 20,
    history: [{ value: 10, time: 0 }],
  },
  {
    id: 'merca',
    name: 'MercaCoin',
    corp: 'MercaCoin corp.',
    value: 15,
    growth: 30,
    demand: 30,
    history: [{ value: 15, time: 0 }],
  },
  {
    id: 'jose',
    name: 'JoseCoin',
    corp: 'JoseCoin corp.',
    value: 5,
    growth: -89,
    demand: -40,
    history: [{ value: 5, time: 0 }],
  },
  {
    id: 'ginko',
    name: 'GinkoCoin',
    corp: 'GinkoCoin corp.',
    value: 8,
    growth: 20,
    demand: 45,
    history: [{ value: 8, time: 0 }],
  }
];

// Initialize a new player
function createPlayer(playerId, playerName) {
  return {
    id: playerId,
    name: playerName,
    money: 1000,
    portfolio: tokens.reduce((acc, token) => {
      acc[token.id] = {
        tokens: 0,
        money: 1000
      };
      return acc;
    }, {})
  };
}

// Update token values every 5 seconds
setInterval(() => {
  const now = Math.round((Date.now() - serverStart) / 1000);
  tokens.forEach(token => {
    // Randomly change value by -5% to +5%
    const changePercent = (Math.random() * 10 - 5) / 100;
    let newValue = token.value * (1 + changePercent);
    newValue = Math.max(1, Math.round(newValue * 100) / 100); // Prevent negative or zero value, round to 2 decimals
    token.value = newValue;
    token.history.push({ value: newValue, time: now });
    if (token.history.length > 30) token.history.shift(); // Keep last 30 points
  });
}, 5000);

app.use(cors());
app.use(express.json());

// Player authentication middleware
const authenticatePlayer = (req, res, next) => {
  const playerId = req.headers['x-player-id'];
  if (!playerId) {
    return res.status(401).json({ error: 'Player ID required' });
  }
  if (!players.has(playerId)) {
    return res.status(404).json({ error: 'Player not found' });
  }
  req.player = players.get(playerId);
  next();
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Player name required' });
  }

  // Check if player already exists
  const existingPlayer = Array.from(players.values()).find(p => p.name === name);
  if (existingPlayer) {
    return res.json({ playerId: existingPlayer.id });
  }

  // Create new player
  const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
  players.set(playerId, createPlayer(playerId, name));
  res.json({ playerId });
});

// List all tokens (for menu)
app.get('/api/tokens', (req, res) => {
  res.json(tokens.map(t => ({
    id: t.id,
    name: t.name,
    corp: t.corp,
    value: t.value,
    growth: t.growth,
    demand: t.demand,
    history: t.history
  })));
});

// Get player's portfolio
app.get('/api/portfolio', authenticatePlayer, (req, res) => {
  res.json(req.player);
});

// Get state for a single token
app.get('/api/token/:id', authenticatePlayer, (req, res) => {
  const token = tokens.find(t => t.id === req.params.id);
  if (!token) return res.status(404).json({ error: 'Token not found' });
  
  const playerToken = req.player.portfolio[token.id];
  res.json({
    ...token,
    tokens: playerToken.tokens,
    money: playerToken.money,
    tokenValue: playerToken.tokens * token.value
  });
});

// Buy or sell for a single token
app.post('/api/token/:id/trade', authenticatePlayer, (req, res) => {
  const token = tokens.find(t => t.id === req.params.id);
  if (!token) return res.status(404).json({ error: 'Token not found' });
  
  const { type, amount } = req.body;
  const amt = Number(amount);
  if (!['buy', 'sell'].includes(type) || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const playerToken = req.player.portfolio[token.id];
  
  if (type === 'buy') {
    const cost = amt * token.value;
    if (playerToken.money < cost) {
      return res.status(400).json({ error: 'Not enough money' });
    }
    playerToken.money -= cost;
    playerToken.tokens += amt;
  } else if (type === 'sell') {
    if (playerToken.tokens < amt) {
      return res.status(400).json({ error: 'Not enough tokens' });
    }
    playerToken.money += amt * token.value;
    playerToken.tokens -= amt;
  }

  res.json({
    ...token,
    tokens: playerToken.tokens,
    money: playerToken.money,
    tokenValue: playerToken.tokens * token.value
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 