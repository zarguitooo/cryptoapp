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
  const [input, setInput] = useState(10);
  const [mode, setMode] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValue, setTokenValue] = useState(0);
  const [name, setName] = useState('');
  const [corp, setCorp] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      setInput(10);
    } catch (e) {
      setError(e.message || 'Transaction failed');
    }
    setLoading(false);
  };

  const getCompanyBackground = (corpName) => {
    const background = companyBackgrounds.company_backgrounds[corpName];
    return typeof background === 'object' ? background.background : background;
  };

  const transactionValue = input * value;

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
        fontSize: '14px',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#222',
            color: '#666',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← BACK
        </button>
        <span>MONEY: {formatNum(portfolio.money)}</span>
        <span>USER</span>
      </div>

      <div style={{ 
        fontSize: '14px', 
        marginBottom: '20px',
        textAlign: 'center'
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

      <div style={{ 
        background: '#111',
        padding: '20px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          marginBottom: '5px'
        }}>
          {name}
        </div>
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          {corp}
        </div>

        <div style={{
          display: 'flex',
          marginBottom: '20px'
        }}>
          <div style={{
            flex: 1
          }}>
            <div style={{
              background: '#fff',
              color: '#000',
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              YOUR AMOUNT: {tokens}
            </div>
            <div style={{
              background: '#222',
              padding: '10px',
              borderRadius: '4px'
            }}>
              HISTORY
            </div>
          </div>
        </div>

        <div style={{
          position: 'relative',
          height: '200px',
          marginBottom: '20px',
          padding: '10px',
          background: '#111',
          overflow: 'hidden'
        }}>
          {/* Y-axis line */}
          <div style={{
            position: 'absolute',
            left: '40px',
            top: '10px',
            bottom: '30px',
            width: '1px',
            background: '#333'
          }} />
          {/* Y-axis values */}
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '10px',
            bottom: '30px',
            width: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#666',
            fontSize: '12px',
            userSelect: 'none'
          }}>
            <div>50</div>
            <div>40</div>
            <div>30</div>
            <div>20</div>
            <div>10</div>
            <div>0</div>
          </div>
          {/* X-axis line */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '10px',
            bottom: '30px',
            height: '1px',
            background: '#333'
          }} />
          {/* X-axis values */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '10px',
            bottom: '10px',
            height: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            color: '#666',
            fontSize: '12px',
            userSelect: 'none'
          }}>
            <div>0</div>
            <div>10</div>
            <div>20</div>
            <div>30</div>
            <div>40</div>
            <div>50</div>
            <div>60</div>
          </div>
          {/* Graph */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '10px',
            top: '10px',
            bottom: '30px',
            clipPath: 'inset(0 0 0 0)'
          }}>
            <MiniGraph 
              history={history} 
              color="#32CD32" 
              showAxis={false} 
              width={330} 
              height={160} 
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#32CD32',
            color: '#000',
            padding: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            + {formatNum(growth)}%
            <div style={{fontSize: '12px'}}>GROWTH</div>
          </div>
          <div style={{
            background: '#32CD32',
            color: '#000',
            padding: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            + {formatNum(demand)}%
            <div style={{fontSize: '12px'}}>DEMAND</div>
          </div>
          <div style={{
            background: '#32CD32',
            color: '#000',
            padding: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {formatNum(value)}$
            <div style={{fontSize: '12px'}}>VALUE</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            color: '#666',
            fontSize: '24px',
            fontWeight: 'bold',
            flex: 1
          }}>
            {mode === 'buy' ? 'BUY' : 'SELL'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <button
              onClick={() => setInput(Math.max(0, input - 1))}
              style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '4px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>
            <input
              type="number"
              value={input}
              onChange={e => setInput(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                background: '#fff',
                border: 'none',
                padding: '8px',
                width: '60px',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '16px'
              }}
            />
            <button
              onClick={() => setInput(input + 1)}
              style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '4px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setMode('buy')}
            style={{
              background: mode === 'buy' ? '#32CD32' : '#222',
              color: mode === 'buy' ? '#000' : '#666',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1,
              marginRight: '10px'
            }}
          >
            BUY
          </button>
          <button
            onClick={() => setMode('sell')}
            style={{
              background: mode === 'sell' ? '#32CD32' : '#222',
              color: mode === 'sell' ? '#000' : '#666',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            SELL
          </button>
        </div>

        <div style={{
          background: '#222',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '16px',
          color: mode === 'buy' ? '#ff4444' : '#32CD32'
        }}>
          {transactionValue > 0 && `${mode === 'buy' ? '-' : '+'}${formatNum(transactionValue)}$`}
        </div>

        <button
          onClick={handleTransaction}
          disabled={loading || input <= 0}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '15px',
            width: '100%',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: (loading || input <= 0) ? 0.5 : 1
          }}
        >
          CONFIRM TRANSACTION
        </button>

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