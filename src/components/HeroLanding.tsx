'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';

interface HeroLandingProps {
  onOpenSimulator: () => void;
}

export default function HeroLanding({ onOpenSimulator }: HeroLandingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 -right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Autonomous E-Commerce Resilience & Revenue Rescue</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Stop losing revenue to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">
                silent sync drops & phantom stockouts.
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              When webhooks drop, inventory desyncs, or checkout gateways hang, brands lose up to{' '}
              <strong className="text-white font-semibold">25% of GMV</strong> without even knowing it.
              ShopSync RescueOps intercepts operational glitches in real time, diagnoses root causes via{' '}
              <strong className="text-indigo-300 font-semibold">Gemini AI</strong>, and executes autonomous
              remediation playbooks before revenue is lost.
            </p>
          </div>

          {/* Quick Sandbox CTA for Judges */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenSimulator}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-purple-950/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/20"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Launch Live Incident Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            >
              <span>{isExpanded ? 'Hide Architecture & Flow' : 'Explore How It Works'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Architecture & Methodology Breakdown */}
        {isExpanded && (
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-sm">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <span>1. Multi-Channel Interceptor</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Continuously listens to inventory feeds and webhook logs across Shopify, Amazon FBA, WooCommerce,
                and Stripe. Flags deadlock mutexes, 429 rate limits, and 504 gateway timeouts in &lt;14 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold text-sm">
                <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <span>2. Gemini AI Root-Cause Triage</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Feeds the raw stack trace and unconsumed JSON payload into Gemini AI. Pinpoints exact code flaws
                (e.g., expired HMAC secret or null quantity pointer) and calculates instantaneous Revenue at Risk.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>3. Autonomous Playbook Healing</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Executes automated remediation scripts (re-driving dead-letter queue webhooks, clearing phantom
                inventory holds, or triggering VIP cart checkout recovery links) with 100% verified audit trails.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
