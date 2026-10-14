export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getChannelColor(channel: string): { bg: string; text: string; border: string } {
  switch (channel) {
    case 'shopify':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'amazon':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'stripe':
      return { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' };
    case 'woocommerce':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' };
    case 'tiktok_shop':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}

export function getSeverityBadge(severity: string): { bg: string; text: string; dot: string } {
  switch (severity) {
    case 'CRITICAL':
      return { bg: 'bg-red-500/15 border-red-500/30 text-red-400', text: 'text-red-400', dot: 'bg-red-500' };
    case 'HIGH':
      return { bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400', text: 'text-orange-400', dot: 'bg-orange-500' };
    case 'MEDIUM':
      return { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', text: 'text-amber-400', dot: 'bg-amber-500' };
    case 'LOW':
    default:
      return { bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', text: 'text-blue-400', dot: 'bg-blue-500' };
  }
}
