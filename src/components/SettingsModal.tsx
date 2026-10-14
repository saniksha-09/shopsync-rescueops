'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Save,
  RotateCw,
} from 'lucide-react';
import { SystemSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings | null;
  onSaveSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [autoHeal, setAutoHeal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setApiKey(settings.geminiApiKey || '');
      setModel(settings.aiModel || 'gemini-1.5-flash');
      setAutoHeal(Boolean(settings.autoHealCritical));
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveSettings({
      geminiApiKey: apiKey.trim(),
      aiModel: model,
      autoHealCritical: autoHeal,
    });
    setIsSaving(false);
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter a Google Gemini API Key first.');
      return;
    }
    setTestStatus('testing');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with the word OK.' }] }],
          }),
        }
      );
      if (res.ok) {
        setTestStatus('success');
        setTestMessage('✓ Gemini API connection verified successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(`API key validation failed: ${data.error?.message || res.statusText}`);
      }
    } catch (err: unknown) {
      setTestStatus('error');
      const msg = err instanceof Error ? err.message : 'Network error testing API key';
      setTestMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>System Configuration</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Settings & Gemini AI Engine Credentials
            </h2>
            <p className="text-xs text-slate-400">
              Configure Google AI Studio API keys, model tiers, and automated recovery policies.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Gemini AI Key Section */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Google Gemini API Configuration</span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline text-[11px]"
              >
                <span>Get free Gemini API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Gemini API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('idle');
                  }}
                  placeholder="AIzaSy..."
                  className="w-full pl-9 pr-24 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testStatus === 'testing'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Test Key'}
                </button>
              </div>

              {testStatus === 'success' && (
                <p className="text-emerald-400 font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{testMessage}</span>
                </p>
              )}
              {testStatus === 'error' && (
                <p className="text-red-400 font-medium flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{testMessage}</span>
                </p>
              )}

              <p className="text-slate-500 text-[11px] leading-relaxed pt-1">
                Zero cost! Works directly with Google AI Studio free tier. If no key is entered, ShopSync
                RescueOps runs in <strong>High-Fidelity Smart Fallback Mode</strong> so your hackathon demo never fails.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5 pt-2">
              <label className="text-slate-300 font-medium">Gemini Model Tier</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended: Ultra-fast 400ms diagnostics)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-gen frontier reasoning)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex chain of thought)</option>
              </select>
            </div>
          </div>

          {/* Autonomous SRE Policy */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-sm font-bold text-white block">Autonomous Operational Policy</span>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoHeal}
                onChange={(e) => setAutoHeal(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">
                  Enable Zero-Touch Auto-Healing for CRITICAL Incidents
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                  Automatically triggers the recommended playbook without requiring manual operator confirmation
                  when Revenue at Risk exceeds $10,000.
                </p>
              </div>
            </label>
          </div>

          {/* Connected Webhook Receivers */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-sm font-bold text-white block">Active Webhook Ingestion Proxies</span>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span>POST /api/webhooks/shopify</span>
                <span className="text-emerald-400 font-sans font-semibold">Active (Listening)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span>POST /api/webhooks/amazon-spapi</span>
                <span className="text-emerald-400 font-sans font-semibold">Active (Listening)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span>POST /api/webhooks/stripe</span>
                <span className="text-emerald-400 font-sans font-semibold">Active (Listening)</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
