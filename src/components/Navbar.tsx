'use client';

import React from 'react';
import {
  ShieldAlert,
  Users,
  History,
  Settings as SettingsIcon,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SystemSettings, DashboardMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface NavbarProps {
  activeTab: 'cases' | 'history';
  onTabChange: (tab: 'cases' | 'history') => void;
  metrics: DashboardMetrics | null;
  settings: SystemSettings | null;
  onOpenSimulator: () => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export default function Navbar({
  activeTab,
  onTabChange,
  metrics,
  settings,
  onOpenSimulator,
  onOpenSettings,
  onResetDemo,
  isResetting,
}: NavbarProps) {
  const needingAttention = metrics?.customersNeedingAttention ?? 0;
  const hasApiKey = Boolean(settings?.geminiApiKey);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">ShopSync</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                RescueOps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Customer Risk & Order Recovery</p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => onTabChange('cases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'cases'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Flagged Customers</span>
            {needingAttention > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'cases' ? 'bg-indigo-800 text-white' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {needingAttention}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Action History</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Simulate Customer Case */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
            title="Simulate customer case for demonstration"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Simulate Case</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Configure Gemini API Key"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors disabled:opacity-50"
            title="Reset to clean demonstration data"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
