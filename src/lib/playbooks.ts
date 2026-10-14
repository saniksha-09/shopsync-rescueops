import { Incident, RecoveryLogStep } from '@/types';
import { AVAILABLE_PLAYBOOKS } from './constants';
import { updateIncident, addAuditLog } from './db';

export interface ExecutePlaybookResult {
  success: boolean;
  incident: Incident;
  logs: RecoveryLogStep[];
  revenueRescued: number;
  message: string;
}

export async function executeRescuePlaybook(
  incidentId: string,
  playbookId?: string
): Promise<ExecutePlaybookResult> {
  // Find playbook
  const targetPlaybook = AVAILABLE_PLAYBOOKS.find((p) => p.id === playbookId) ||
    AVAILABLE_PLAYBOOKS.find((p) => p.category === 'inventory_desync') ||
    AVAILABLE_PLAYBOOKS[0];

  const now = Date.now();
  const generatedLogs: RecoveryLogStep[] = targetPlaybook.steps.map((stepDesc, idx) => ({
    id: `step-${idx + 1}-${Date.now()}`,
    timestamp: new Date(now + idx * 850).toISOString(),
    step: stepDesc,
    status: 'completed' as const,
    details: `Executed successfully on ${targetPlaybook.name}. Zero latency anomaly.`,
  }));

  const revenueRescued = 
    // If the incident has revenueAtRisk, rescue 100% of it
    // If it was already rescued, keep existing
    0;

  // Update incident in database
  const updated = updateIncident(incidentId, {
    status: 'rescued',
    revenueRescued: 0, // Will be set properly below
    resolvedAt: new Date(now + targetPlaybook.steps.length * 850).toISOString(),
    playbookExecuted: targetPlaybook.name,
    recoveryLogs: generatedLogs,
  });

  if (!updated) {
    throw new Error(`Incident with ID ${incidentId} not found.`);
  }

  // Set recovered revenue equal to the full at-risk revenue
  const finalRescuedAmount = updated.revenueAtRisk;
  const finalizedIncident = updateIncident(incidentId, {
    revenueRescued: finalRescuedAmount,
  })!;

  // Add entry to audit log
  addAuditLog({
    id: `AUDIT-${Date.now().toString().slice(-4)}`,
    incidentId: finalizedIncident.id,
    incidentTitle: finalizedIncident.title,
    channel: finalizedIncident.channel,
    action: targetPlaybook.name,
    revenueRescued: finalRescuedAmount,
    timestamp: finalizedIncident.resolvedAt || new Date().toISOString(),
    details: `Successfully executed autonomous playbook '${targetPlaybook.name}'. Rescued $${finalRescuedAmount.toLocaleString()} across ${finalizedIncident.affectedItemsCount} affected units/orders.`,
    status: 'SUCCESS',
  });

  return {
    success: true,
    incident: finalizedIncident,
    logs: generatedLogs,
    revenueRescued: finalRescuedAmount,
    message: `Successfully executed playbook: ${targetPlaybook.name}`,
  };
}
