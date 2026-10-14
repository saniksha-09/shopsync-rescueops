'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  RotateCw,
  Send,
  User,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
  CheckCheck,
  Slash,
} from 'lucide-react';
import { CustomerRiskCase } from '@/types';
import { formatCurrency, formatTimeAgo, getRiskLevelBadge, getStatusBadge, getChannelColor } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CustomerDetailModalProps {
  customerCase: CustomerRiskCase | null;
  onClose: () => void;
  onApproveAction: (caseId: string, notes?: string) => Promise<void>;
  onCompleteAction: (caseId: string, actionName?: string, notes?: string) => Promise<void>;
  onDismissCase: (caseId: string, reason?: string) => Promise<void>;
  onRegenerateAi: (caseId: string) => Promise<void>;
  isProcessing: boolean;
  isAiLoading: boolean;
}

export default function CustomerDetailModal({
  customerCase,
  onClose,
  onApproveAction,
  onCompleteAction,
  onDismissCase,
  onRegenerateAi,
  isProcessing,
  isAiLoading,
}: CustomerDetailModalProps) {
  const [messageDraft, setMessageDraft] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [dismissPromptOpen, setDismissPromptOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState('');

  useEffect(() => {
    if (customerCase?.aiRecommendation?.messageDraft) {
      setMessageDraft(customerCase.aiRecommendation.messageDraft);
    } else {
      setMessageDraft('');
    }
    setManagerNotes(customerCase?.actionNotes || '');
    setDismissPromptOpen(false);
    setDismissReason('');
  }, [customerCase]);

  if (!customerCase) return null;

  const riskBadge = getRiskLevelBadge(customerCase.riskLevel);
  const statusBadge = getStatusBadge(customerCase.status);
  const chColor = getChannelColor(customerCase.channel);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageDraft);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleComplete = async () => {
    const actionName = customerCase.aiRecommendation?.actionTitle || 'Customer Recovery Completed';
    await onCompleteAction(customerCase.id, actionName, managerNotes);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleDismissConfirm = async () => {
    await onDismissCase(customerCase.id, dismissReason || 'Dismissed after review.');
    setDismissPromptOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-slate-400 font-bold">{customerCase.id}</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${riskBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                {customerCase.riskLevel} Risk
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${chColor.bg} ${chColor.text} ${chColor.border}`}
              >
                <span className="capitalize">{customerCase.channel.replace('_', ' ')}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-slate-500 text-[11px]">
                Detected {formatTimeAgo(customerCase.detectedAt)}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">{customerCase.customerName}</h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span>{customerCase.customerEmail}</span>
              {customerCase.customerPhone && (
                <>
                  <span>•</span>
                  <span>{customerCase.customerPhone}</span>
                </>
              )}
              <span>•</span>
              <span className="text-slate-300 font-medium">{customerCase.storeName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Section 1: Order & Flag Summary */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div>
                <span className="text-slate-400 text-[11px] block">Order / Cart ID</span>
                <span className="font-mono text-sm font-bold text-white">{customerCase.orderOrCartId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Cart / Order Value</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(customerCase.value)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Purchased / Reserved Items</span>
              <span className="text-slate-200 font-medium">{customerCase.itemsDescription}</span>
            </div>

            {/* Why Flagged */}
            <div className="pt-1">
              <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                Why This Customer Was Flagged
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {customerCase.flagReason}
              </p>
            </div>

            {/* Evidence */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                Evidence
              </span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {customerCase.evidence}
              </p>
            </div>
          </div>

          {/* Section 2: AI Recommendation & Next-Best Action */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Recommended Recovery Action</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                    customerCase.aiRecommendation?.isAiGenerated
                      ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                      : 'bg-blue-950/60 border-blue-800 text-blue-300'
                  }`}
                >
                  {customerCase.aiRecommendation?.modelUsed || 'Rule-Based Engine'}
                </span>

                <button
                  onClick={() => onRegenerateAi(customerCase.id)}
                  disabled={isAiLoading}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Re-run AI analysis on this customer case"
                >
                  <RotateCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'Analyzing...' : 'Re-generate'}</span>
                </button>
              </div>
            </div>

            {customerCase.aiRecommendation ? (
              <div className="space-y-2">
                <div className="text-sm font-bold text-indigo-200">
                  {customerCase.aiRecommendation.actionTitle}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {customerCase.aiRecommendation.explanation}
                </p>
                {customerCase.aiRecommendation.suggestedDiscount && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                    <span>Suggested Incentive:</span>
                    <span>{customerCase.aiRecommendation.suggestedDiscount}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Click Re-generate to produce a tailored recovery strategy.</p>
            )}
          </div>

          {/* Section 3: Personalized Support Message Draft */}
          {customerCase.aiRecommendation?.messageDraft && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">
                  Personalized Customer Outreach Draft (Editable)
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copiedMessage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMessage ? 'Copied' : 'Copy Draft'}</span>
                </button>
              </div>

              <textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                placeholder="Custom recovery message to customer..."
              />
            </div>
          )}

          {/* Dismiss prompt dialog inline */}
          {dismissPromptOpen && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 space-y-2 animate-in fade-in">
              <span className="font-semibold text-slate-200 text-xs">Dismiss Customer Case?</span>
              <input
                type="text"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="Optional reason (e.g. customer completed via phone, duplicate cart)..."
                className="w-full px-3 py-1.5 text-xs rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-600"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setDismissPromptOpen(false)}
                  className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDismissConfirm}
                  disabled={isProcessing}
                  className="px-3 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirm Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Manager Review & Action Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-400 text-xs">
            {customerCase.status === 'completed' ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Case marked as Recovered
              </span>
            ) : customerCase.status === 'dismissed' ? (
              <span className="text-slate-400 font-medium">Case dismissed</span>
            ) : customerCase.status === 'action_approved' ? (
              <span className="text-blue-400 font-medium">Action approved • Ready to finalize</span>
            ) : (
              <span>Review recommendations and select action</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {customerCase.status === 'pending_review' && (
              <>
                <button
                  onClick={() => setDismissPromptOpen(true)}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>

                <button
                  onClick={() => onApproveAction(customerCase.id, managerNotes)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Approve Action
                </button>

                <button
                  onClick={handleComplete}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/40 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>
              </>
            )}

            {customerCase.status === 'action_approved' && (
              <>
                <button
                  onClick={() => setDismissPromptOpen(true)}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>

                <button
                  onClick={handleComplete}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/40 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Execute & Complete</span>
                </button>
              </>
            )}

            {(customerCase.status === 'completed' || customerCase.status === 'dismissed') && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close Record
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
