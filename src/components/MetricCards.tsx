'use client';

import React from 'react';
import { Users, AlertTriangle, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { DashboardMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MetricCardsProps {
  metrics: DashboardMetrics | null;
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  const needingAttention = metrics?.customersNeedingAttention ?? 0;
  const highRisk = metrics?.highRiskCases ?? 0;
  const pendingActions = metrics?.pendingActions ?? 0;
  const rescuedValue = metrics?.totalValueRescued ?? 0;
  const valueAtRisk = metrics?.totalValueAtRisk ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Customers Needing Attention */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Customers Needing Attention</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {needingAttention}
          </span>
          <span className="text-xs text-slate-400">cases open</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Value at risk</span>
          <span className="font-semibold text-amber-400">{formatCurrency(valueAtRisk)}</span>
        </div>
      </div>

      {/* 2. High-Risk Cases */}
      <div className="p-4 rounded-xl bg-slate-900 border border-red-500/20 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-red-400 font-medium">
          <span>High-Risk Cases</span>
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {highRisk}
          </span>
          <span className="text-xs text-red-300 font-medium">urgent priority</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Imminent churn risk</span>
          <span className="text-red-400 font-semibold">{highRisk > 0 ? 'Requires action' : 'None'}</span>
        </div>
      </div>

      {/* 3. Pending Actions */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Pending Actions</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {pendingActions}
          </span>
          <span className="text-xs text-slate-400">ready to review</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Awaiting approval</span>
          <span className="text-slate-300 font-semibold">{pendingActions} pending</span>
        </div>
      </div>

      {/* 4. Recovered Revenue */}
      <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
          <span>Recovered Revenue</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {formatCurrency(rescuedValue)}
          </span>
          <span className="text-xs text-emerald-400 font-medium">rescued</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Completed actions</span>
          <span className="text-emerald-400 font-semibold">{metrics?.completedActions ?? 0} rescued</span>
        </div>
      </div>
    </div>
  );
}
