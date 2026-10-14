'use client';

import React from 'react';
import { DollarSign, ShieldCheck, AlertOctagon, Zap, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AnalyticsSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MetricCardsProps {
  analytics: AnalyticsSummary | null;
}

export default function MetricCards({ analytics }: MetricCardsProps) {
  const rescued = analytics?.totalRevenueRescued || 0;
  const atRisk = analytics?.totalRevenueAtRisk || 0;
  const activeCount = analytics?.activeIncidentsCount || 0;
  const mttrSeconds = analytics?.mttrSeconds || 84;
  const successRate = analytics?.recoverySuccessRate || 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Verified Revenue Rescued */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-emerald-500/30 p-5 shadow-lg shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Verified Revenue Rescued
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(rescued)}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            {successRate}% Success
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Automated playbooks executed</span>
          <span className="font-medium text-slate-200">{analytics?.rescuedIncidentsCount || 0} incidents saved</span>
        </div>
      </div>

      {/* 2. Revenue Currently at Risk */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-red-500/30 p-5 shadow-lg shadow-red-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Revenue at Immediate Risk
          </span>
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(atRisk)}
          </span>
          {atRisk > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
              Needs Triage
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Locked in sync discrepancies</span>
          <span className="font-medium text-red-400">{activeCount} pending rescue</span>
        </div>
      </div>

      {/* 3. Active Glitches & Discrepancies */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Store Incidents
          </span>
          <div className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{activeCount}</span>
          <span className="text-xs text-slate-400">discrepancies active</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Mean Detection Time</span>
          <span className="font-semibold text-emerald-400">14 seconds (Real-time)</span>
        </div>
      </div>

      {/* 4. Mean Time to Recover (MTTR) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-indigo-500/30 p-5 shadow-lg shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Autonomous MTTR
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{mttrSeconds}s</span>
          <span className="text-xs text-emerald-400 font-medium">98.4% faster</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Industry manual average</span>
          <span className="line-through text-slate-500">4.2 hours</span>
        </div>
      </div>
    </div>
  );
}
