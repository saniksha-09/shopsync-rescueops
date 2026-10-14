'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroLanding from '@/components/HeroLanding';
import MetricCards from '@/components/MetricCards';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import IncidentQueue from '@/components/IncidentQueue';
import IncidentDetailModal from '@/components/IncidentDetailModal';
import SimulatorModal from '@/components/SimulatorModal';
import AuditLogModal from '@/components/AuditLogModal';
import SettingsModal from '@/components/SettingsModal';
import {
  Incident,
  AnalyticsSummary,
  StoreChannelInfo,
  SystemSettings,
  ChannelType,
  IncidentCategory,
  IncidentSeverity,
} from '@/types';
import { AuditLogEntry } from '@/lib/db';
import { Sparkles, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'alert' | 'info';
}

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [channels, setChannels] = useState<StoreChannelInfo[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Loading states
  const [rescuingIncidentId, setRescuingIncidentId] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
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

  // Fetch all core data
  const fetchData = useCallback(async () => {
    try {
      const [incRes, anaRes, setRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/analytics'),
        fetch('/api/settings'),
      ]);

      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }

      if (anaRes.ok) {
        const data = await anaRes.json();
        setAnalytics(data.analytics || null);
        setChannels(data.channels || []);
        setAuditLogs(data.recentAuditLogs || []);
      }

      if (setRes.ok) {
        const data = await setRes.json();
        setSettings(data.settings || null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Execute rescue playbook
  const handleRescuePlaybook = async (incidentId: string, playbookId: string) => {
    setRescuingIncidentId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/rescue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        showToast(
          `✓ Rescued ${data.incident.title} (Recovered $${data.revenueRescued.toLocaleString()})`,
          'success'
        );

        // Update selected incident modal if open
        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident(data.incident);
        }

        await fetchData();
      } else {
        showToast(data.error || 'Failed to execute rescue playbook', 'alert');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rescue failed';
      showToast(msg, 'alert');
    } finally {
      setRescuingIncidentId(null);
    }
  };

  // Run AI diagnosis
  const handleRunAiDiagnose = async (incidentId: string) => {
    setIsDiagnosing(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/diagnose`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('✓ Gemini AI diagnosis completed', 'success');
        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident(data.incident);
        }
        await fetchData();
      } else {
        showToast(data.error || 'Failed to complete AI diagnosis', 'alert');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI diagnosis failed';
      showToast(msg, 'alert');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Simulate preset scenario
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
        showToast(`⚡ Incident Injected: ${data.incident.title}`, 'alert');
        await fetchData();
        // Automatically open the new incident so judge sees the immediate impact
        setSelectedIncident(data.incident);
      } else {
        showToast(data.error || 'Failed to simulate scenario', 'alert');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      showToast(msg, 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  // Simulate custom scenario
  const handleSimulateCustom = async (customData: {
    title: string;
    description: string;
    channel: ChannelType;
    category: IncidentCategory;
    severity: IncidentSeverity;
    revenueAtRisk: number;
    affectedItemsCount: number;
    rootCauseCode: string;
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
        showToast(`⚡ Injected Custom Glitch: ${data.incident.title}`, 'alert');
        await fetchData();
        setSelectedIncident(data.incident);
      } else {
        showToast(data.error || 'Failed to inject custom glitch', 'alert');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      showToast(msg, 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  // Save settings
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

  // Reset demo
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo incidents, metrics, and audit logs to original clean state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/incidents', { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ System reset to clean hackathon demo state', 'info');
        setSelectedIncident(null);
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
      {/* Top Navbar */}
      <Navbar
        analytics={analytics}
        channels={channels}
        settings={settings}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Startup Hero & Architecture Walkthrough */}
        <HeroLanding onOpenSimulator={() => setIsSimulatorOpen(true)} />

        {/* Executive Metric Cards */}
        <MetricCards analytics={analytics} />

        {/* Channel & Category Visual Analytics */}
        <AnalyticsCharts analytics={analytics} />

        {/* Live Incident Queue & Triage Feed */}
        <IncidentQueue
          incidents={incidents}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onInstantRescue={(inc) =>
            handleRescuePlaybook(
              inc.id,
              inc.aiDiagnosis?.recommendedPlaybook || 'reconcile_inventory'
            )
          }
          rescuingIncidentId={rescuingIncidentId}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">ShopSync RescueOps</span>
            <span>• Built for Hackathon Demonstration</span>
          </div>
          <div>
            Powered by <strong>Next.js 16</strong>, <strong>Tailwind CSS v4</strong> & <strong>Google Gemini AI</strong>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onRunRescue={handleRescuePlaybook}
        onRunAiDiagnose={handleRunAiDiagnose}
        isRescuing={Boolean(rescuingIncidentId)}
        isDiagnosing={isDiagnosing}
      />

      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulateScenario={handleSimulateScenario}
        onSimulateCustom={handleSimulateCustom}
        isSimulating={isSimulating}
      />

      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        logs={auditLogs}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
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
