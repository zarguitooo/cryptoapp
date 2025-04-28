const express = require('express');
const cors = require('cors');
const readline = require('readline');
const app = express();
const PORT = process.env.PORT || 4000;

let serverStart = Date.now();

// In-memory store for players
let players = new Map();

// In-memory store for tokens
let tokens = [
  {
    id: 'rugpull',
    name: 'RugPull Coin',
    corp: 'Rug Pull & Run LLC',
    value: 0.0001,
    growth: -99,
    demand: -100,
    history: [{ value: 0.0001, time: 0 }],
  },
  {
    id: 'ponzi',
    name: 'Ponzi Token',
    corp: 'Ponzi Scheme Palace',
    value: 1000,
    growth: 1000,
    demand: 1000,
    history: [{ value: 1000, time: 0 }],
  },
  {
    id: 'bagholder',
    name: 'BagHolder Coin',
    corp: 'Bagholder\'s Graveyard',
    value: 0.01,
    growth: -50,
    demand: -75,
    history: [{ value: 0.01, time: 0 }],
  },
  {
    id: 'margin',
    name: 'Margin Call Token',
    corp: 'Margin Call Crematorium',
    value: 500,
    growth: -25,
    demand: -50,
    history: [{ value: 500, time: 0 }],
  },
  {
    id: 'paperhands',
    name: 'PaperHands Coin',
    corp: 'Paper Hands Suicide Hotline',
    value: 0.5,
    growth: -10,
    demand: -20,
    history: [{ value: 0.5, time: 0 }],
  },
  {
    id: 'whalefood',
    name: 'WhaleFood Token',
    corp: 'Whale Food Processing Plant',
    value: 0.001,
    growth: -90,
    demand: -95,
    history: [{ value: 0.001, time: 0 }],
  },
  {
    id: 'gasfee',
    name: 'GasFee Coin',
    corp: 'Gas Fee Extortion Inc',
    value: 100,
    growth: 200,
    demand: 300,
    history: [{ value: 100, time: 0 }],
  },
  {
    id: 'moon',
    name: 'MoonOrCoffin',
    corp: 'Moon or Coffin Express',
    value: 10,
    growth: 500,
    demand: 1000,
    history: [{ value: 10, time: 0 }],
  },
  {
    id: 'degen',
    name: 'Degen Death Wish',
    corp: 'Degen\'s Death Wish',
    value: 0.1,
    growth: 1000,
    demand: 2000,
    history: [{ value: 0.1, time: 0 }],
  },
  {
    id: 'hodl',
    name: 'HODL Token',
    corp: 'HODL or Hospice',
    value: 1,
    growth: 0,
    demand: 0,
    history: [{ value: 1, time: 0 }],
  }
];

// Admin commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printHelp() {
  console.log('\nAdmin Commands:');
  console.log('  list - List all coins');
  console.log('  add <id> <name> <corp> <value> <growth> <demand> - Add a new coin');
  console.log('  delete <id> - Delete a coin');
  console.log('  help - Show this help message');
  console.log('  exit - Exit admin mode\n');
}

function handleAdminCommand(input) {
  const [command, ...args] = input.trim().split(' ');
  
  switch (command) {
    case 'list':
      console.log('\nCurrent coins:');
      tokens.forEach(token => {
        console.log(`  ${token.id}: ${token.name} (${token.corp}) - Value: ${token.value}, Growth: ${token.growth}%, Demand: ${token.demand}%`);
      });
      break;

    case 'add':
      if (args.length < 6) {
        console.log('Error: Missing arguments. Usage: add <id> <name> <corp> <value> <growth> <demand>');
        return;
      }
      const [id, name, corp, value, growth, demand] = args;
      if (tokens.some(t => t.id === id)) {
        console.log(`Error: Coin with id '${id}' already exists`);
        return;
      }
      tokens.push({
        id,
        name,
        corp,
        value: parseFloat(value),
        growth: parseFloat(growth),
        demand: parseFloat(demand),
        history: [{ value: parseFloat(value), time: Math.round((Date.now() - serverStart) / 1000) }]
      });
      console.log(`Added new coin: ${name} (${corp})`);
      break;

    case 'delete':
      if (args.length < 1) {
        console.log('Error: Missing coin id. Usage: delete <id>');
        return;
      }
      const coinId = args[0];
      const index = tokens.findIndex(t => t.id === coinId);
      if (index === -1) {
        console.log(`Error: Coin with id '${coinId}' not found`);
        return;
      }
      tokens.splice(index, 1);
      console.log(`Deleted coin: ${coinId}`);
      break;

    case 'help':
      printHelp();
      break;

    case 'exit':
      rl.close();
      break;

    default:
      console.log('Unknown command. Type "help" for available commands.');
  }
}

// Initialize a new player
function createPlayer(playerId, playerName) {
  return {
    id: playerId,
    name: playerName,
    money: 1000,
    portfolio: tokens.reduce((acc, token) => {
      acc[token.id] = {
        tokens: 0
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
    money: req.player.money,
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
    if (req.player.money < cost) {
      return res.status(400).json({ error: 'Not enough money' });
    }
    req.player.money -= cost;
    playerToken.tokens += amt;
  } else if (type === 'sell') {
    if (playerToken.tokens < amt) {
      return res.status(400).json({ error: 'Not enough tokens' });
    }
    req.player.money += amt * token.value;
    playerToken.tokens -= amt;
  }

  res.json({
    ...token,
    tokens: playerToken.tokens,
    money: req.player.money,
    tokenValue: playerToken.tokens * token.value
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the server at: http://localhost:${PORT}`);
  console.log(`Other computers can access it at: http://YOUR_LOCAL_IP:${PORT}`);
  
  rl.on('line', (input) => {
    handleAdminCommand(input);
  });
}); 