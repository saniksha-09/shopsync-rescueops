import { RiskLevel, CaseStatus } from '@/types';

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

export function getRiskLevelBadge(level: RiskLevel): { bg: string; text: string; dot: string } {
  switch (level) {
    case 'HIGH':
      return { bg: 'bg-red-500/10 border-red-500/30 text-red-400', text: 'text-red-400', dot: 'bg-red-500' };
    case 'MEDIUM':
      return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', text: 'text-amber-400', dot: 'bg-amber-500' };
    case 'LOW':
    default:
      return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400', dot: 'bg-emerald-500' };
  }
}

export function getStatusBadge(status: CaseStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'pending_review':
      return { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300', text: 'text-amber-300', label: 'Needs Attention' };
    case 'action_approved':
      return { bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300', text: 'text-blue-300', label: 'Action Approved' };
    case 'completed':
      return { bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', text: 'text-emerald-300', label: 'Recovered' };
    case 'dismissed':
      return { bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400', text: 'text-slate-400', label: 'Dismissed' };
  }
}
