'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MetricCards from '@/components/MetricCards';
import CustomerRiskTable from '@/components/CustomerRiskTable';
import CustomerDetailModal from '@/components/CustomerDetailModal';
import ActionHistoryTable from '@/components/ActionHistoryTable';
import SimulatorModal from '@/components/SimulatorModal';
import SettingsModal from '@/components/SettingsModal';
import {
  CustomerRiskCase,
  DashboardMetrics,
  ActionHistoryEntry,
  SystemSettings,
  ChannelType,
  RiskLevel,
} from '@/types';
import { CheckCircle2, Sparkles, X, Users, History, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'alert' | 'info';
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'cases' | 'history'>('cases');
  const [cases, setCases] = useState<CustomerRiskCase[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [history, setHistory] = useState<ActionHistoryEntry[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Modals & Drawers
  const [selectedCase, setSelectedCase] = useState<CustomerRiskCase | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Processing states
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Fetch core application state
  const fetchData = useCallback(async () => {
    try {
      const [casesRes, analyticsRes, settingsRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/analytics'),
        fetch('/api/settings'),
      ]);

      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.cases || data.incidents || []);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setMetrics(data.metrics || null);
        setHistory(data.history || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action 1: Approve Action
  const handleApproveAction = async (caseId: string, notes?: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/incidents/${caseId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', notes }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Action approved for ${data.case.customerName}`, 'success');
        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(data.case);
        }
        await fetchData();
      } else {
        showToast(data.error || 'Failed to approve action', 'alert');
      }
    } catch {
      showToast('Error approving action', 'alert');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Action 2: Complete Action & Rescue
  const handleCompleteAction = async (caseId: string, actionName?: string, notes?: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/incidents/${caseId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', actionName, notes }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast(
          `✓ Rescued ${data.case.customerName} (Recovered $${data.case.value.toLocaleString()})`,
          'success'
        );

        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(data.case);
        }
        await fetchData();
      } else {
        showToast(data.error || 'Failed to complete recovery action', 'alert');
      }
    } catch {
      showToast('Error completing recovery action', 'alert');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Action 3: Dismiss Case
  const handleDismissCase = async (caseId: string, reason?: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/incidents/${caseId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', reason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Case for ${data.case.customerName} dismissed`, 'info');
        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(data.case);
        }
        await fetchData();
      } else {
        showToast(data.error || 'Failed to dismiss case', 'alert');
      }
    } catch {
      showToast('Error dismissing case', 'alert');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Action 4: Re-generate AI Recommendation
  const handleRegenerateAi = async (caseId: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch(`/api/incidents/${caseId}/diagnose`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('✓ AI recommendation updated', 'success');
        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(data.case);
        }
        await fetchData();
      } else {
        showToast(data.error || 'Failed to generate recommendation', 'alert');
      }
    } catch {
      showToast('Error generating AI recommendation', 'alert');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simulation: Preset Scenario
  const handleSimulateScenario = async (scenarioId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`⚡ Flagged Customer Injected: ${data.case.customerName}`, 'alert');
        await fetchData();
        setSelectedCase(data.case);
        setActiveTab('cases');
      } else {
        showToast(data.error || 'Failed to simulate scenario', 'alert');
      }
    } catch {
      showToast('Simulation failed', 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  // Simulation: Custom Scenario
  const handleSimulateCustom = async (customData: {
    customerName: string;
    customerEmail: string;
    channel: ChannelType;
    value: number;
    riskLevel: RiskLevel;
    flagReason: string;
    evidence: string;
    itemsDescription: string;
  }) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`⚡ Custom Case Injected: ${data.case.customerName}`, 'alert');
        await fetchData();
        setSelectedCase(data.case);
        setActiveTab('cases');
      } else {
        showToast(data.error || 'Failed to inject custom case', 'alert');
      }
    } catch {
      showToast('Simulation failed', 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  // Settings Save
  const handleSaveSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        showToast('✓ Settings updated successfully', 'success');
        await fetchData();
      }
    } catch {
      showToast('Failed to save settings', 'alert');
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset customer cases and history to clean initial sample state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/incidents', { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Reset to clean demonstration state', 'info');
        setSelectedCase(null);
        await fetchData();
      }
    } catch {
      showToast('Failed to reset demo state', 'alert');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        metrics={metrics}
        settings={settings}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Concise Manager Metrics */}
        <MetricCards metrics={metrics} />

        {/* View 1: Customer Risk Cases Queue */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            <CustomerRiskTable
              cases={cases}
              onSelectCase={(c) => setSelectedCase(c)}
            />
          </div>
        )}

        {/* View 2: Action History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <ActionHistoryTable history={history} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ShopSync RescueOps • Customer Risk & Order Recovery Engine</span>
          <span>Powered by Next.js 16 & Google Gemini AI</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CustomerDetailModal
        customerCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onApproveAction={handleApproveAction}
        onCompleteAction={handleCompleteAction}
        onDismissCase={handleDismissCase}
        onRegenerateAi={handleRegenerateAi}
        isProcessing={isProcessingAction}
        isAiLoading={isAiLoading}
      />

      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulateScenario={handleSimulateScenario}
        onSimulateCustom={handleSimulateCustom}
        isSimulating={isSimulating}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : toast.type === 'alert'
                ? 'bg-purple-950/90 border-purple-500/40 text-purple-200 shadow-purple-950/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'alert' && <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
