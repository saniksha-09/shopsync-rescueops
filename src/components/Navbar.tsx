'use client';

import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  History,
  Settings as SettingsIcon,
  RotateCcw,
  Activity,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
} from 'lucide-react';
import { AnalyticsSummary, StoreChannelInfo, SystemSettings } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface NavbarProps {
  analytics: AnalyticsSummary | null;
  channels: StoreChannelInfo[];
  settings: SystemSettings | null;
  onOpenSimulator: () => void;
  onOpenAudit: () => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export default function Navbar({
  analytics,
  channels,
  settings,
  onOpenSimulator,
  onOpenAudit,
  onOpenSettings,
  onResetDemo,
  isResetting,
}: NavbarProps) {
  const getChannelIcon = (id: string) => {
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
      default:
        return null;
    }
  };

  const hasApiKey = Boolean(settings?.geminiApiKey);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      {/* Top Banner / Ticker */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Live Sync Stream Active</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Connected store health pills */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Connected Hubs:</span>
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/70 border border-slate-700/50"
                title={`${ch.name} (Health: ${ch.healthScore}%)`}
              >
                {getChannelIcon(ch.id)}
                <span className="text-[11px] font-medium text-slate-300">{ch.name.split(' ')[0]}</span>
                <span className="text-[10px] text-emerald-400">{ch.healthScore}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">AI Diagnostic Engine:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                hasApiKey
                  ? 'bg-purple-950/60 border-purple-800/60 text-purple-300'
                  : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
              }`}
            >
              {hasApiKey ? '✨ Gemini Cloud API' : '⚡ Smart Heuristic Mode'}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="text-[11px] text-slate-400">
            Rescued GMV: <span className="font-semibold text-emerald-400">{formatCurrency(analytics?.totalRevenueRescued || 0)}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">ShopSync</span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30">
                RescueOps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous E-Commerce Revenue Recovery</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Standout Signature Feature Launcher */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-purple-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-purple-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-semibold">Live Incident Simulator</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-white/20 text-white">
              Sandbox
            </span>
          </button>

          {/* Audit Logs */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-medium transition-colors"
            title="View Recovery Audit Trail"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Audit Trail</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-medium transition-colors"
            title="Configure Gemini API & Store Settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Reset Demo State */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors disabled:opacity-50"
            title="Reset to Fresh Demo State"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
