'use client';

import React, { useState, useMemo } from 'react';
import {
  Incident,
  ChannelType,
  IncidentSeverity,
  IncidentStatus,
} from '@/types';
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, formatTimeAgo, getSeverityBadge, getChannelColor } from '@/lib/utils';

interface IncidentQueueProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onInstantRescue: (incident: Incident) => void;
  rescuingIncidentId: string | null;
  onOpenSimulator: () => void;
}

export default function IncidentQueue({
  incidents,
  onSelectIncident,
  onInstantRescue,
  rescuingIncidentId,
  onOpenSimulator,
}: IncidentQueueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Channel filter
      if (selectedChannel !== 'all' && incident.channel !== selectedChannel) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && incident.status !== selectedStatus) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'all' && incident.severity !== selectedSeverity) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = incident.title.toLowerCase().includes(query);
        const matchesCode = incident.rootCauseCode.toLowerCase().includes(query);
        const matchesStore = incident.storeName.toLowerCase().includes(query);
        const matchesChannel = incident.channel.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesStore && !matchesChannel) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, selectedChannel, selectedStatus, selectedSeverity, searchQuery]);

  const getChannelIcon = (channel: ChannelType) => {
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
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>Live Incident Stream & Triage Feed</span>
            <span className="text-xs font-normal text-slate-400">
              ({filteredIncidents.length} of {incidents.length} shown)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed of multi-channel sync dropped webhooks, inventory desyncs, and checkout stalls.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, error code, store..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Channel Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-500 mr-1 hidden sm:inline">Channel:</span>
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'shopify', label: 'Shopify' },
            { id: 'amazon', label: 'Amazon' },
            { id: 'stripe', label: 'Stripe' },
            { id: 'woocommerce', label: 'WooCommerce' },
            { id: 'tiktok_shop', label: 'TikTok Shop' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                selectedChannel === ch.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 mr-1 hidden sm:inline">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active', badgeColor: 'text-red-400' },
            { id: 'rescued', label: 'Rescued', badgeColor: 'text-emerald-400' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                selectedStatus === st.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
              }`}
            >
              <span className={st.badgeColor}>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No matching incidents found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              All sync pipelines in this view are healthy, or your filters exclude active issues.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedChannel('all');
                  setSelectedStatus('all');
                  setSelectedSeverity('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={onOpenSimulator}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Inject Test Incident
              </button>
            </div>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const sevBadge = getSeverityBadge(incident.severity);
            const chTheme = getChannelColor(incident.channel);
            const isRescued = incident.status === 'rescued';
            const isCurrentlyRescuing = rescuingIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                className={`group relative rounded-2xl p-4 sm:p-5 transition-all border ${
                  isRescued
                    ? 'bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/30'
                    : incident.severity === 'CRITICAL'
                    ? 'bg-gradient-to-r from-red-950/20 via-slate-900/90 to-slate-900/90 border-red-500/30 hover:border-red-500/50 shadow-md shadow-red-950/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Metadata & Title */}
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* ID */}
                      <span className="font-mono font-bold text-slate-400 text-[11px]">
                        {incident.id}
                      </span>

                      {/* Severity */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sevBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sevBadge.dot} ${!isRescued ? 'animate-pulse' : ''}`} />
                        {incident.severity}
                      </span>

                      {/* Channel Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${chTheme.bg} ${chTheme.text} ${chTheme.border}`}
                      >
                        {getChannelIcon(incident.channel)}
                        <span className="capitalize">{incident.channel.replace('_', ' ')}</span>
                      </span>

                      {/* Category */}
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 font-medium">
                        {incident.category.replace(/_/g, ' ')}
                      </span>

                      {/* Status */}
                      {isRescued ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Rescued & Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Active Threat
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 ml-auto sm:ml-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(incident.detectedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectIncident(incident)}
                      className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors leading-snug line-clamp-1"
                    >
                      {incident.title}
                    </h3>

                    {/* Customer Impact & Technical Code */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">{incident.storeName}</span>
                      <span className="text-slate-600">•</span>
                      <span>{incident.customerImpact || incident.description}</span>
                      <span className="text-slate-600">•</span>
                      <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                        {incident.rootCauseCode}
                      </code>
                    </div>
                  </div>

                  {/* Right: Financial Impact & Action CTAs */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-800/80 pt-3 lg:pt-0">
                    {/* Revenue Column */}
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        {isRescued ? 'Revenue Rescued' : 'Revenue at Risk'}
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                          isRescued ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatCurrency(isRescued ? incident.revenueRescued : incident.revenueAtRisk)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {incident.affectedItemsCount} {incident.affectedItemsCount === 1 ? 'unit/order' : 'units/orders'}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Inspect / Triage */}
                      <button
                        onClick={() => onSelectIncident(incident)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Triage</span>
                      </button>

                      {/* Instant Rescue Playbook Button */}
                      {!isRescued ? (
                        <button
                          onClick={() => onInstantRescue(incident)}
                          disabled={isCurrentlyRescuing}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Zap className={`w-3.5 h-3.5 ${isCurrentlyRescuing ? 'animate-spin' : ''}`} />
                          <span>{isCurrentlyRescuing ? 'Healing...' : 'Instant Rescue'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectIncident(incident)}
                          className="px-3 py-2 text-xs font-medium rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Audit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
