'use client';

import React from 'react';
import { X, History, ShieldCheck, DollarSign, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { AuditLogEntry } from '@/lib/db';
import { formatCurrency, formatTimeAgo, getChannelColor } from '@/lib/utils';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export default function AuditLogModal({ isOpen, onClose, logs }: AuditLogModalProps) {
  if (!isOpen) return null;

  const totalRescued = logs.reduce((acc, curr) => acc + (curr.revenueRescued || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Immutable Audit Trail</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recovery Operations & Playbook Audit Log
            </h2>
            <p className="text-xs text-slate-400">
              Comprehensive log of autonomous interventions, inventory reconciles, and revenue restored.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Rescued Bar */}
        <div className="px-6 py-3 bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Cumulative Verified GMV Rescued via Audit Trail:</span>
          <span className="text-sm font-extrabold text-emerald-400">{formatCurrency(totalRescued)}</span>
        </div>

        {/* Log Entries */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit logs recorded yet. Execute an automated rescue playbook to see audit entries.
            </div>
          ) : (
            logs.map((log) => {
              const chTheme = getChannelColor(log.channel);

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{log.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${chTheme.bg} ${chTheme.text} ${chTheme.border}`}
                      >
                        <span className="capitalize">{log.channel.replace('_', ' ')}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(log.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{log.incidentTitle}</h4>
                      <div className="text-xs text-indigo-400 font-medium mt-0.5">
                        Action: {log.action}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{log.details}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Rescued</div>
                      <div className="text-sm font-extrabold text-emerald-400">
                        {formatCurrency(log.revenueRescued)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
