export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatTimestamp(timestampInSeconds: number, includeTime: boolean = true): string {
  if (!timestampInSeconds) return '';
  const date = new Date(timestampInSeconds * 1000);
  if (!includeTime) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSignalBadgeColor(signalType: string): { bg: string; text: string; border: string; glow: string } {
  switch (signalType) {
    case 'STRONG_BUY':
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        glow: 'shadow-glow-bull',
      };
    case 'BUY':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/25',
        glow: 'shadow-sm',
      };
    case 'STRONG_SELL':
      return {
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        glow: 'shadow-glow-bear',
      };
    case 'SELL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/25',
        glow: 'shadow-sm',
      };
    default:
      return {
        bg: 'bg-slate-700/30',
        text: 'text-slate-300',
        border: 'border-slate-600/30',
        glow: '',
      };
  }
}
