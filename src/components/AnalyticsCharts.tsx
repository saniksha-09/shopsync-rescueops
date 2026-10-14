'use client';

import React from 'react';
import {
  BarChart3,
  PieChart,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { AnalyticsSummary, ChannelType, IncidentCategory } from '@/types';
import { formatCurrency, getChannelColor } from '@/lib/utils';

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary | null;
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  if (!analytics) return null;

  const channels: Array<{ id: ChannelType; name: string }> = [
    { id: 'shopify', name: 'Shopify Plus' },
    { id: 'amazon', name: 'Amazon Central' },
    { id: 'stripe', name: 'Stripe' },
    { id: 'woocommerce', name: 'WooCommerce' },
    { id: 'tiktok_shop', name: 'TikTok Shop' },
  ];

  const getChannelIcon = (id: ChannelType) => {
    switch (id) {
      case 'shopify':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'amazon':
        return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'stripe':
        return <CreditCard className="w-3.5 h-3.5 text-violet-400" />;
      case 'woocommerce':
        return <Store className="w-3.5 h-3.5 text-indigo-400" />;
      case 'tiktok_shop':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const categories: Array<{ id: IncidentCategory; label: string; count: number }> = [
    {
      id: 'inventory_desync',
      label: 'Inventory Desync / Phantom Stockouts',
      count: analytics.categoryBreakdown?.inventory_desync || 0,
    },
    {
      id: 'webhook_drop',
      label: 'Dropped Webhooks (Dead-Letter Queue)',
      count: analytics.categoryBreakdown?.webhook_drop || 0,
    },
    {
      id: 'payment_gateway_stall',
      label: 'Payment 3DS & Gateway Timeouts',
      count: analytics.categoryBreakdown?.payment_gateway_stall || 0,
    },
    {
      id: 'abandoned_cart_stall',
      label: 'VIP High-Ticket Abandoned Carts',
      count: analytics.categoryBreakdown?.abandoned_cart_stall || 0,
    },
    {
      id: 'price_mismatch',
      label: 'Catalog & Algorithmic Price Anomalies',
      count: analytics.categoryBreakdown?.price_mismatch || 0,
    },
  ];

  const totalCategoryCount = categories.reduce((acc, c) => acc + c.count, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Channel Revenue Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Exposure by Channel</h3>
              <p className="text-[11px] text-slate-400">At-risk and rescued GMV across connected storefronts</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400">
            {analytics.recoverySuccessRate}% Rescued
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {channels.map((ch) => {
            const data = analytics.channelBreakdown?.[ch.id] || { active: 0, rescued: 0, revenueRisk: 0 };
            const chTheme = getChannelColor(ch.id);

            return (
              <div key={ch.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(ch.id)}
                    <span className="font-medium text-slate-200">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {data.active > 0 && (
                      <span className="text-red-400 font-bold">
                        {formatCurrency(data.revenueRisk)} at risk
                      </span>
                    )}
                    <span className="text-slate-500">
                      ({data.rescued} rescued / {data.active} active)
                    </span>
                  </div>
                </div>

                {/* Micro bar visualizer */}
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (data.rescued / (data.rescued + data.active || 1)) * 100)}%`,
                    }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (data.active / (data.rescued + data.active || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Incident Category Frequency */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Discrepancy Category Distribution</h3>
              <p className="text-[11px] text-slate-400">Classification of e-commerce sync failure modes</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-purple-400">
            {analytics.totalIncidentsCount} Total Events
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {categories.map((cat) => {
            const percentage = Math.round((cat.count / totalCategoryCount) * 100);

            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[240px]">{cat.label}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-indigo-400">{cat.count}</span>
                    <span className="text-slate-500">({percentage}%)</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
