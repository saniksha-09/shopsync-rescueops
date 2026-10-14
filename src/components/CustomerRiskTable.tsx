'use client';

import React, { useState, useMemo } from 'react';
import { CustomerRiskCase, ChannelType, RiskLevel, CaseStatus } from '@/types';
import {
  Search,
  Filter,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { formatCurrency, formatTimeAgo, getRiskLevelBadge, getStatusBadge, getChannelColor } from '@/lib/utils';

interface CustomerRiskTableProps {
  cases: CustomerRiskCase[];
  onSelectCase: (customerCase: CustomerRiskCase) => void;
  onQuickApprove?: (caseId: string) => void;
}

export default function CustomerRiskTable({
  cases,
  onSelectCase,
}: CustomerRiskTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Risk filter
      if (selectedRisk !== 'all' && c.riskLevel !== selectedRisk) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && c.status !== selectedStatus) {
        return false;
      }
      // Channel filter
      if (selectedChannel !== 'all' && c.channel !== selectedChannel) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = c.customerName.toLowerCase().includes(query);
        const matchesEmail = c.customerEmail.toLowerCase().includes(query);
        const matchesOrder = c.orderOrCartId.toLowerCase().includes(query);
        const matchesReason = c.flagReason.toLowerCase().includes(query);
        const matchesItems = c.itemsDescription.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesOrder && !matchesReason && !matchesItems) {
          return false;
        }
      }
      return true;
    });
  }, [cases, selectedRisk, selectedStatus, selectedChannel, searchQuery]);

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
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, order ID, items..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 px-1.5">Risk:</span>
            {['all', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRisk(lvl)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedRisk === lvl
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 px-1.5">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'pending_review', label: 'Needs Attention' },
              { id: 'action_approved', label: 'Approved' },
              { id: 'completed', label: 'Recovered' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedStatus === st.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table / Cards */}
      <div className="space-y-2.5">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No matching customer cases found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query or filters to see other customer records.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRisk('all');
                setSelectedStatus('all');
                setSelectedChannel('all');
              }}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCases.map((c) => {
            const riskBadge = getRiskLevelBadge(c.riskLevel);
            const statusBadge = getStatusBadge(c.status);
            const chColor = getChannelColor(c.channel);

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Customer info & Reason */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Customer Name */}
                    <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {c.customerName}
                    </span>

                    {/* Channel */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${chColor.bg} ${chColor.text} ${chColor.border}`}
                    >
                      {getChannelIcon(c.channel)}
                      <span className="capitalize">{c.channel.replace('_', ' ')}</span>
                    </span>

                    {/* Risk Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${riskBadge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                      {c.riskLevel} Risk
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge.bg}`}
                    >
                      {statusBadge.label}
                    </span>

                    <span className="text-[11px] text-slate-500 ml-auto sm:ml-0">
                      {formatTimeAgo(c.detectedAt)}
                    </span>
                  </div>

                  {/* Flag Reason */}
                  <p className="text-xs text-slate-300 leading-normal">
                    {c.flagReason}
                  </p>

                  {/* Items Description & Customer Contact */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-300">{c.orderOrCartId}</span>
                    <span>•</span>
                    <span className="truncate max-w-sm">{c.itemsDescription}</span>
                    <span>•</span>
                    <span className="text-slate-500">{c.customerEmail}</span>
                  </div>
                </div>

                {/* Right: Value & Action CTA */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Value</div>
                    <div className="text-base font-bold text-white">
                      {formatCurrency(c.value)}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCase(c)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-950/40"
                  >
                    <span>Review & Act</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
