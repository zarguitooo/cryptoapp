import React from 'react';

export function MiniGraph({ history, color = 'lime', width = 60, height = 28, showAxis = false }) {
  if (!history || history.length < 2) {
    // Generate a random placeholder graph
    let points = [];
    let y = Math.random() * (height - 10) + 5;
    for (let i = 0; i < 10; i++) {
      y += (Math.random() - 0.5) * 6;
      y = Math.max(2, Math.min(height - 2, y));
      const x = (i / 9) * (width - 2) + 1;
      points.push(`${x},${y}`);
    }
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points.join(' ')}
        />
      </svg>
    );
  }
  const min = Math.min(...history.map(h => h.value));
  const max = Math.max(...history.map(h => h.value));
  const range = max - min || 1;
  const minTime = history[0].time;
  const maxTime = history[history.length - 1].time;
  const timeRange = maxTime - minTime || 1;
  const points = history.map(h => {
    const x = ((h.time - minTime) / timeRange) * (width - 2) + 1;
    const y = height - 1 - ((h.value - min) / range) * (height - 2);
    return `${x},${y}`;
  }).join(' ');
  if (!showAxis) {
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  }
  // Axis labels for TokenTrade
  const xLabels = [0, Math.round(timeRange / 2), timeRange].map((t, i) => {
    const x = (t / timeRange) * (width - 2) + 1;
    return <text key={i} x={x} y={height} fontSize={7} fill="#aaa" textAnchor="middle">{t}s</text>;
  });
  return (
    <svg width={width} height={height + 8} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      {xLabels}
    </svg>
  );
} 