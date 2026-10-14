'use client';

import React, { useState } from 'react';
import { X, Sparkles, User, ShoppingBag, CreditCard, Store, Flame, Zap } from 'lucide-react';
import { ChannelType, RiskLevel } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScenario: (scenarioId: string) => Promise<void>;
  onSimulateCustom: (customData: {
    customerName: string;
    customerEmail: string;
    channel: ChannelType;
    value: number;
    riskLevel: RiskLevel;
    flagReason: string;
    evidence: string;
    itemsDescription: string;
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

  // Custom case state
  const [name, setName] = useState('Taylor Morgan');
  const [email, setEmail] = useState('taylor.m@example.com');
  const [channel, setChannel] = useState<ChannelType>('shopify');
  const [value, setValue] = useState(720);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');
  const [reason, setReason] = useState('Customer session terminated after repeated payment gateway decline.');
  const [evidence, setEvidence] = useState('Customer attempted checkout twice; 3DS challenge frame failed to load.');
  const [items, setItems] = useState('Premium Merino Wool Sweaters (x2)');

  if (!isOpen) return null;

  const handlePreset = async (id: string) => {
    await onSimulateScenario(id);
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSimulateCustom({
      customerName: name,
      customerEmail: email,
      channel,
      value,
      riskLevel,
      flagReason: reason,
      evidence,
      itemsDescription: items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demonstration Sandbox</span>
            </div>
            <h3 className="text-base font-bold text-white">Simulate Customer Risk Case</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inject a realistic customer checkout disruption to demonstrate the recovery workflow.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Preset Scenarios
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Customer Case
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              {[
                {
                  id: 'sim-flash-sale',
                  name: 'Liam Taylor — Flash Sale Stalled Cart',
                  channel: 'Shopify Plus',
                  value: 980,
                  risk: 'HIGH',
                  desc: 'High-traffic sneaker drop inventory lock timed out at final checkout step.',
                },
                {
                  id: 'sim-stripe-drop',
                  name: 'Chloe Simmons — Unfulfilled Paid Order',
                  channel: 'Stripe',
                  value: 650,
                  risk: 'HIGH',
                  desc: 'Payment captured on Stripe, but webhook dropped before order was created in warehouse.',
                },
                {
                  id: 'sim-freight-timeout',
                  name: 'Robert Zhang — Carrier Timeout Abandonment',
                  channel: 'WooCommerce',
                  value: 2100,
                  risk: 'MEDIUM',
                  desc: 'Avalara tax & shipping calculation microservice hung for 8.2s, locking submit button.',
                },
              ].map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{s.name}</span>
                      <span className="text-[10px] text-slate-400">({s.channel})</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-normal">{s.desc}</p>
                    <div className="text-[11px] font-semibold text-emerald-400">
                      Cart Value: {formatCurrency(s.value)}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePreset(s.id)}
                    disabled={isSimulating}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isSimulating ? 'Injecting...' : 'Inject Case'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Customer Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as ChannelType)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    <option value="shopify">Shopify</option>
                    <option value="amazon">Amazon</option>
                    <option value="stripe">Stripe</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="tiktok_shop">TikTok</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Cart Value ($)</label>
                  <input
                    type="number"
                    min="10"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Items Description</label>
                <input
                  type="text"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Why Was This Customer Flagged?</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Evidence</label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={2}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSimulating ? 'Injecting Case...' : 'Inject Custom Case'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
