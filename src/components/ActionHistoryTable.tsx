'use client';

import React from 'react';
import { ActionHistoryEntry } from '@/types';
import { CheckCircle2, History, XCircle, ShoppingBag, Package, CreditCard, Store, Flame } from 'lucide-react';
import { formatCurrency, formatTimeAgo, getChannelColor } from '@/lib/utils';

interface ActionHistoryTableProps {
  history: ActionHistoryEntry[];
}

export default function ActionHistoryTable({ history }: ActionHistoryTableProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
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

  const totalRescued = history.reduce((sum, h) => sum + (h.valueRescued || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Action & Recovery History</span>
            <span className="text-xs text-slate-400">({history.length} records)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of approved, completed, and dismissed customer recovery actions.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Rescued</span>
          <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalRescued)}</span>
        </div>
      </div>

      {/* Table */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No recovery actions have been executed yet. Completed or dismissed customer cases will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Value Rescued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((entry) => {
                const chColor = getChannelColor(entry.channel);
                const isCompleted = entry.outcome === 'COMPLETED';

                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(entry.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {entry.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${chColor.bg} ${chColor.text} ${chColor.border}`}
                      >
                        {getChannelIcon(entry.channel)}
                        <span className="capitalize">{entry.channel.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div>{entry.actionTaken}</div>
                      {entry.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/15 border border-slate-500/30 text-slate-400">
                          <XCircle className="w-3 h-3" />
                          Dismissed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {entry.valueRescued > 0 ? formatCurrency(entry.valueRescued) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
