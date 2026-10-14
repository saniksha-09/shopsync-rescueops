'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
  AlertOctagon,
  ArrowRight,
  Sliders,
  DollarSign,
  Layers,
} from 'lucide-react';
import { SIMULATION_SCENARIOS } from '@/lib/constants';
import { ChannelType, IncidentCategory, IncidentSeverity } from '@/types';
import { formatCurrency, getChannelColor, getSeverityBadge } from '@/lib/utils';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScenario: (scenarioId: string) => Promise<void>;
  onSimulateCustom: (customData: {
    title: string;
    description: string;
    channel: ChannelType;
    category: IncidentCategory;
    severity: IncidentSeverity;
    revenueAtRisk: number;
    affectedItemsCount: number;
    rootCauseCode: string;
  }) => Promise<void>;
  isSimulating: boolean;
}

export default function SimulatorModal({
  isOpen,
  onClose,
  onSimulateScenario,
  onSimulateCustom,
  isSimulating,
}: SimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom Form state
  const [customTitle, setCustomTitle] = useState('Flash Deal Synchronizer Timeout');
  const [customChannel, setCustomChannel] = useState<ChannelType>('shopify');
  const [customCategory, setCustomCategory] = useState<IncidentCategory>('inventory_desync');
  const [customSeverity, setCustomSeverity] = useState<IncidentSeverity>('CRITICAL');
  const [customRevenue, setCustomRevenue] = useState(8500);
  const [customUnits, setCustomUnits] = useState(120);

  if (!isOpen) return null;

  const handlePresetInject = async (scenarioId: string) => {
    await onSimulateScenario(scenarioId);
    onClose();
  };

  const handleCustomInject = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSimulateCustom({
      title: customTitle,
      description: `Synthetic incident injected via Hackathon Judge Sandbox on ${customChannel}.`,
      channel: customChannel,
      category: customCategory,
      severity: customSeverity,
      revenueAtRisk: customRevenue,
      affectedItemsCount: customUnits,
      rootCauseCode: `ERR_${customCategory.toUpperCase()}_SIMULATED`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Hackathon Signature Feature</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Live Incident Simulator & Recovery Sandbox
            </h2>
            <p className="text-xs text-slate-400">
              Inject real-world high-stakes e-commerce disruptions into the telemetry stream to observe instant
              AI root-cause triage and automated playbook healing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-900/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Curated Battle-Tested Scenarios</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Incident Generator</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: PRESET SCENARIOS */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIMULATION_SCENARIOS.map((scenario) => {
                const chTheme = getChannelColor(scenario.channel);
                const sevBadge = getSeverityBadge(scenario.severity);

                return (
                  <div
                    key={scenario.id}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:bg-slate-950/80 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sevBadge.bg}`}
                        >
                          {scenario.severity}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${chTheme.bg} ${chTheme.text} ${chTheme.border}`}
                        >
                          <span className="capitalize">{scenario.channel.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {scenario.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {scenario.description}
                      </p>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-500">Revenue at Risk:</span>
                        <span className="font-bold text-red-400">{formatCurrency(scenario.revenueAtRisk)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePresetInject(scenario.id)}
                      disabled={isSimulating}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/50 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>{isSimulating ? 'Injecting Glitch...' : 'Inject Scenario into Live Stream'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CUSTOM INCIDENT GENERATOR */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomInject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Incident Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Channel */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Store Channel</label>
                  <select
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value as ChannelType)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 capitalize"
                  >
                    <option value="shopify">Shopify Plus</option>
                    <option value="amazon">Amazon Seller Central</option>
                    <option value="stripe">Stripe Payments</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="tiktok_shop">TikTok Shop</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Discrepancy Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as IncidentCategory)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="inventory_desync">Inventory Desync / Phantom Stockout</option>
                    <option value="webhook_drop">Webhook Drop / Dead-Letter Queue</option>
                    <option value="payment_gateway_stall">Payment Gateway Stall (3DS)</option>
                    <option value="abandoned_cart_stall">VIP Abandoned Cart Stall</option>
                    <option value="price_mismatch">Price Anomaly</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Severity Tier</label>
                  <select
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate GMV Bleed)</option>
                    <option value="HIGH">HIGH (Degraded Channel)</option>
                    <option value="MEDIUM">MEDIUM (Elevated Latency)</option>
                    <option value="LOW">LOW (Informational)</option>
                  </select>
                </div>

                {/* Revenue at Risk */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Revenue at Risk ($ USD)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000000"
                    value={customRevenue}
                    onChange={(e) => setCustomRevenue(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Affected Units */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Affected Orders / Units</label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={customUnits}
                    onChange={(e) => setCustomUnits(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isSimulating ? 'Injecting Anomaly...' : 'Inject Custom Synthetic Incident'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
