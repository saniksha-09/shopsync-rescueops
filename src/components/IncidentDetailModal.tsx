'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  Play,
  RotateCw,
  Cpu,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Incident } from '@/types';
import { AVAILABLE_PLAYBOOKS } from '@/lib/constants';
import { formatCurrency, formatTimeAgo, getSeverityBadge, getChannelColor } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onRunRescue: (incidentId: string, playbookId: string) => Promise<void>;
  onRunAiDiagnose: (incidentId: string) => Promise<void>;
  isRescuing: boolean;
  isDiagnosing: boolean;
}

export default function IncidentDetailModal({
  incident,
  onClose,
  onRunRescue,
  onRunAiDiagnose,
  isRescuing,
  isDiagnosing,
}: IncidentDetailModalProps) {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'payload' | 'playbook'>('diagnosis');

  if (!incident) return null;

  const sevBadge = getSeverityBadge(incident.severity);
  const chTheme = getChannelColor(incident.channel);
  const isRescued = incident.status === 'rescued';

  // Find recommended playbook
  const recommendedPlaybookId =
    incident.aiDiagnosis?.recommendedPlaybook ||
    (incident.category === 'inventory_desync'
      ? 'reconcile_inventory'
      : incident.category === 'webhook_drop'
      ? 'redrive_webhook'
      : incident.category === 'payment_gateway_stall'
      ? 'bypass_payment_fallback'
      : incident.category === 'abandoned_cart_stall'
      ? 'rescue_cart_vip'
      : 'quarantine_price_anomaly');

  const selectedPlaybook =
    AVAILABLE_PLAYBOOKS.find((p) => p.id === recommendedPlaybookId) || AVAILABLE_PLAYBOOKS[0];

  const handleCopy = () => {
    const text =
      typeof incident.rawPayload === 'string'
        ? incident.rawPayload
        : JSON.stringify(incident.rawPayload, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleExecutePlaybook = async () => {
    await onRunRescue(incident.id, selectedPlaybook.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">{incident.id}</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sevBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sevBadge.dot}`} />
                {incident.severity}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${chTheme.bg} ${chTheme.text} ${chTheme.border}`}
              >
                <span className="capitalize">{incident.channel.replace('_', ' ')}</span>
              </span>
              <span className="text-xs text-slate-400">Detected {formatTimeAgo(incident.detectedAt)}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{incident.title}</h2>
            <p className="text-xs text-slate-400">{incident.storeName} • {incident.customerImpact}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Impact Comparison Bar */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Gross Value at Risk</span>
              <div className="text-base font-extrabold text-red-400">
                {formatCurrency(incident.revenueAtRisk)}
              </div>
            </div>

            <div className="text-slate-600 font-bold">→</div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Revenue Rescued</span>
              <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
                {formatCurrency(isRescued ? incident.revenueRescued : 0)}
                {isRescued && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-800" />

            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-500">Affected Scope</span>
              <div className="text-xs font-medium text-slate-300">
                {incident.affectedItemsCount} {incident.affectedItemsCount === 1 ? 'item / checkout' : 'items / checkouts'}
              </div>
            </div>
          </div>

          {/* Quick status pill */}
          <div>
            {isRescued ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Rescued via {incident.playbookExecuted || 'Playbook'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Remediation Pending
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-900/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'diagnosis'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Gemini AI Root-Cause Triage</span>
          </button>

          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'playbook'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Autonomous Playbook Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('payload')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'payload'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Raw Ingestion Trace</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: AI DIAGNOSIS */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">AI Diagnostic Assessment</span>
                  <span className="text-xs text-slate-500">
                    ({incident.aiDiagnosis?.modelUsed || 'Gemini 1.5 Flash'})
                  </span>
                </div>

                <button
                  onClick={() => onRunAiDiagnose(incident.id)}
                  disabled={isDiagnosing}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                  <span>{isDiagnosing ? 'Analyzing...' : 'Re-run Gemini AI Analysis'}</span>
                </button>
              </div>

              {incident.aiDiagnosis ? (
                <div className="space-y-4">
                  {/* Executive Plain English Summary */}
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-1.5">
                    <div className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
                      Business & Operational Summary (Plain English)
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {incident.aiDiagnosis.summary}
                    </p>
                  </div>

                  {/* Deep Technical Root-Cause */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Technical Engineering Root Cause
                      </div>
                      <div className="text-xs font-semibold text-emerald-400">
                        Confidence: {incident.aiDiagnosis.confidenceScore}%
                      </div>
                    </div>
                    <p className="text-xs font-mono text-indigo-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                      {incident.aiDiagnosis.technicalDiagnosis}
                    </p>
                  </div>

                  {/* Financial & Customer Risk Assessment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <span className="text-slate-500 font-medium block mb-1">Financial Exposure</span>
                      <span className="text-slate-200 font-semibold">{incident.aiDiagnosis.impactAssessment}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <span className="text-slate-500 font-medium block mb-1">Recommended Healing Strategy</span>
                      <span className="text-indigo-400 font-semibold">{selectedPlaybook.name}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-3">No AI diagnostic record found yet for this event.</p>
                  <button
                    onClick={() => onRunAiDiagnose(incident.id)}
                    disabled={isDiagnosing}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    {isDiagnosing ? 'Running AI Engine...' : 'Run Gemini AI Diagnostics'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLAYBOOK RUNNER */}
          {activeTab === 'playbook' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Target Playbook
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedPlaybook.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPlaybook.description}</p>
                </div>

                {!isRescued ? (
                  <button
                    onClick={handleExecutePlaybook}
                    disabled={isRescuing}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Play className={`w-4 h-4 fill-white ${isRescuing ? 'animate-spin' : ''}`} />
                    <span>{isRescuing ? 'Remediating...' : 'Execute Rescue Playbook'}</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Successfully Remediated</span>
                  </div>
                )}
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Execution Workflow & Audit Steps
                </div>

                <div className="space-y-2 border border-slate-800 rounded-2xl p-4 bg-slate-950/60">
                  {selectedPlaybook.steps.map((step, idx) => {
                    const isExecuted = isRescued;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                          isExecuted
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                            : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isExecuted
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isExecuted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <span className={isExecuted ? 'font-semibold text-white' : ''}>{step}</span>
                          {isExecuted && (
                            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                              ✓ Verified with 200 OK telemetry
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Before vs After Impact Scorecard */}
              {isRescued && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border border-emerald-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    <span>Before vs. After Recovery Impact</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 text-[11px]">Revenue at Risk Before:</span>
                      <div className="text-red-400 font-bold line-through">{formatCurrency(incident.revenueAtRisk)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Revenue Rescued After:</span>
                      <div className="text-emerald-400 font-bold">{formatCurrency(incident.revenueRescued)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Downstream SLA Status:</span>
                      <div className="text-white font-semibold">100% On Schedule</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW PAYLOAD */}
          {activeTab === 'payload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Raw Ingestion Payload / Dead-Letter Queue
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-80 leading-relaxed">
                {typeof incident.rawPayload === 'string'
                  ? incident.rawPayload
                  : JSON.stringify(incident.rawPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Incident Root Cause Code: <code className="text-white font-mono">{incident.rootCauseCode}</code>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
