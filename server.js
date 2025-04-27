const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// In-memory store (for demo purposes)
let player = {
  money: 1000,
  tokens: 100,
  value: 10, // price of 1 token
  growth: 10, // percent
  demand: 20 // percent
};

app.use(cors());
app.use(express.json());

// Get player state
app.get('/api/state', (req, res) => {
  res.json({
    ...player,
    tokenValue: player.tokens * player.value // total value of player's tokens
  });
});

// Buy or sell tokens
app.post('/api/trade', (req, res) => {
  const { type, amount } = req.body;
  const amt = Number(amount);

  if (!['buy', 'sell'].includes(type) || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (type === 'buy') {
    const cost = amt * player.value;
    if (player.money < cost) {
      return res.status(400).json({ error: 'Not enough money' });
    }
    player.money -= cost;
    player.tokens += amt;
  } else if (type === 'sell') {
    if (player.tokens < amt) {
      return res.status(400).json({ error: 'Not enough tokens' });
    }
    player.money += amt * player.value;
    player.tokens -= amt;
  }

  res.json({
    ...player,
    tokenValue: player.tokens * player.value
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 