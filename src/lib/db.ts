import fs from 'fs';
import path from 'path';
import { CustomerRiskCase, ActionHistoryEntry, DashboardMetrics, SystemSettings } from '@/types';
import { INITIAL_SETTINGS, SEED_CUSTOMER_CASES, SEED_ACTION_HISTORY } from './constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const CASES_FILE = path.join(DATA_DIR, 'customer_cases.json');
const HISTORY_FILE = path.join(DATA_DIR, 'action_history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getCustomerCases(): CustomerRiskCase[] {
  ensureDataDirectory();
  if (!fs.existsSync(CASES_FILE)) {
    fs.writeFileSync(CASES_FILE, JSON.stringify(SEED_CUSTOMER_CASES, null, 2), 'utf-8');
    return SEED_CUSTOMER_CASES;
  }
  try {
    const raw = fs.readFileSync(CASES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_CUSTOMER_CASES;
  }
}

export function saveCustomerCases(cases: CustomerRiskCase[]): void {
  ensureDataDirectory();
  fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2), 'utf-8');
}

export function getCustomerCaseById(id: string): CustomerRiskCase | null {
  const cases = getCustomerCases();
  return cases.find((c) => c.id === id) || null;
}

export function createCustomerCase(newCase: CustomerRiskCase): CustomerRiskCase {
  const cases = getCustomerCases();
  const updated = [newCase, ...cases.filter((c) => c.id !== newCase.id)];
  saveCustomerCases(updated);
  return newCase;
}

export function updateCustomerCase(id: string, updates: Partial<CustomerRiskCase>): CustomerRiskCase | null {
  const cases = getCustomerCases();
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return null;

  cases[index] = { ...cases[index], ...updates };
  saveCustomerCases(cases);
  return cases[index];
}

export function deleteCustomerCase(id: string): boolean {
  const cases = getCustomerCases();
  const filtered = cases.filter((c) => c.id !== id);
  if (filtered.length === cases.length) return false;
  saveCustomerCases(filtered);
  return true;
}

export function getActionHistory(): ActionHistoryEntry[] {
  ensureDataDirectory();
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(SEED_ACTION_HISTORY, null, 2), 'utf-8');
    return SEED_ACTION_HISTORY;
  }
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_ACTION_HISTORY;
  }
}

export function addActionHistoryEntry(entry: ActionHistoryEntry): void {
  ensureDataDirectory();
  const history = getActionHistory();
  const updated = [entry, ...history];
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

export function approveCaseAction(caseId: string, notes?: string): CustomerRiskCase | null {
  const targetCase = getCustomerCaseById(caseId);
  if (!targetCase) return null;

  const actionTitle = targetCase.aiRecommendation?.actionTitle || 'Standard Recovery Action';
  const updated = updateCustomerCase(caseId, {
    status: 'action_approved',
    actionNotes: notes || targetCase.actionNotes,
  });

  if (updated) {
    addActionHistoryEntry({
      id: `HIST-${Date.now().toString().slice(-4)}`,
      caseId: updated.id,
      customerName: updated.customerName,
      channel: updated.channel,
      actionTaken: `Approved: ${actionTitle}`,
      outcome: 'COMPLETED',
      valueRescued: 0,
      timestamp: new Date().toISOString(),
      notes: notes || 'Manager approved recommended recovery action.',
    });
  }

  return updated;
}

export function completeCaseAction(caseId: string, actionName?: string, notes?: string): CustomerRiskCase | null {
  const targetCase = getCustomerCaseById(caseId);
  if (!targetCase) return null;

  const finalAction = actionName || targetCase.aiRecommendation?.actionTitle || 'Custom Recovery Executed';
  const updated = updateCustomerCase(caseId, {
    status: 'completed',
    resolvedAt: new Date().toISOString(),
    completedAction: finalAction,
    revenueRescued: targetCase.value,
  });

  if (updated) {
    addActionHistoryEntry({
      id: `HIST-${Date.now().toString().slice(-4)}`,
      caseId: updated.id,
      customerName: updated.customerName,
      channel: updated.channel,
      actionTaken: finalAction,
      outcome: 'COMPLETED',
      valueRescued: updated.value,
      timestamp: new Date().toISOString(),
      notes: notes || 'Action executed successfully. Customer order / cart rescued.',
    });
  }

  return updated;
}

export function dismissCase(caseId: string, reason?: string): CustomerRiskCase | null {
  const targetCase = getCustomerCaseById(caseId);
  if (!targetCase) return null;

  const updated = updateCustomerCase(caseId, {
    status: 'dismissed',
    resolvedAt: new Date().toISOString(),
    actionNotes: reason || 'Dismissed by store manager.',
  });

  if (updated) {
    addActionHistoryEntry({
      id: `HIST-${Date.now().toString().slice(-4)}`,
      caseId: updated.id,
      customerName: updated.customerName,
      channel: updated.channel,
      actionTaken: 'Dismissed Case',
      outcome: 'DISMISSED',
      valueRescued: 0,
      timestamp: new Date().toISOString(),
      notes: reason || 'Flagged case dismissed after review.',
    });
  }

  return updated;
}

export function getDashboardMetrics(): DashboardMetrics {
  const cases = getCustomerCases();

  let needingAttention = 0;
  let highRisk = 0;
  let pendingActions = 0;
  let completedActions = 0;
  let totalValueAtRisk = 0;
  let totalValueRescued = 0;

  for (const c of cases) {
    if (c.status === 'pending_review') {
      needingAttention++;
      pendingActions++;
      totalValueAtRisk += c.value;
      if (c.riskLevel === 'HIGH') {
        highRisk++;
      }
    } else if (c.status === 'action_approved') {
      pendingActions++;
      totalValueAtRisk += c.value;
      if (c.riskLevel === 'HIGH') {
        highRisk++;
      }
    } else if (c.status === 'completed') {
      completedActions++;
      totalValueRescued += c.value;
    }
  }

  return {
    customersNeedingAttention: needingAttention,
    highRiskCases: highRisk,
    pendingActions,
    completedActions,
    totalValueAtRisk,
    totalValueRescued,
  };
}

export function resetDatabase(): void {
  ensureDataDirectory();
  fs.writeFileSync(CASES_FILE, JSON.stringify(SEED_CUSTOMER_CASES, null, 2), 'utf-8');
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(SEED_ACTION_HISTORY, null, 2), 'utf-8');
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(INITIAL_SETTINGS, null, 2), 'utf-8');
}

export function getSettings(): SystemSettings {
  ensureDataDirectory();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(INITIAL_SETTINGS, null, 2), 'utf-8');
    return INITIAL_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  ensureDataDirectory();
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
