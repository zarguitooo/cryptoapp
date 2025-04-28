export function formatNum(n) {
  return typeof n === 'number' ? n.toFixed(2).replace(/\.00$/, '') : n;
} 