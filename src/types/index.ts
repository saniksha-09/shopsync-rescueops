export type ChannelType = 'shopify' | 'amazon' | 'woocommerce' | 'stripe' | 'tiktok_shop';

export type IncidentCategory = 
  | 'inventory_desync' 
  | 'webhook_drop' 
  | 'payment_gateway_stall' 
  | 'abandoned_cart_stall' 
  | 'price_mismatch';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'active' | 'investigating' | 'healing' | 'rescued' | 'ignored';

export interface RecoveryLogStep {
  id: string;
  timestamp: string;
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

export interface AiDiagnosis {
  summary: string;
  technicalDiagnosis: string;
  rootCauseCode: string;
  impactAssessment: string;
  recommendedPlaybook: string;
  confidenceScore: number;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  channel: ChannelType;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  revenueAtRisk: number;
  revenueRescued: number;
  affectedItemsCount: number;
  detectedAt: string;
  resolvedAt?: string | null;
  rootCauseCode: string;
  rawPayload: Record<string, unknown> | string;
  aiDiagnosis?: AiDiagnosis | null;
  recoveryLogs: RecoveryLogStep[];
  playbookExecuted?: string | null;
  customerImpact?: string;
  storeName: string;
}

export interface StoreChannelInfo {
  id: ChannelType;
  name: string;
  connected: boolean;
  icon: string;
  lastSyncAt: string;
  healthScore: number;
  activeIncidentsCount: number;
}

export interface PlaybookDefinition {
  id: string;
  name: string;
  description: string;
  category: IncidentCategory;
  estimatedRecoveryTime: string;
  steps: string[];
  actionType: 'automated' | 'semi-automated';
}

export interface SimulationScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  channel: ChannelType;
  category: IncidentCategory;
  severity: IncidentSeverity;
  revenueAtRisk: number;
  affectedItemsCount: number;
  rootCauseCode: string;
  rawPayload: Record<string, unknown>;
  defaultDiagnosis: AiDiagnosis;
  recommendedPlaybook: string;
}

export interface AnalyticsSummary {
  totalRevenueRescued: number;
  totalRevenueAtRisk: number;
  activeIncidentsCount: number;
  rescuedIncidentsCount: number;
  totalIncidentsCount: number;
  mttdSeconds: number; // Mean Time to Detect
  mttrSeconds: number; // Mean Time to Recover
  recoverySuccessRate: number; // percentage
  channelBreakdown: Record<ChannelType, { active: number; rescued: number; revenueRisk: number }>;
  categoryBreakdown: Record<IncidentCategory, number>;
}

export interface SystemSettings {
  geminiApiKey: string;
  aiModel: string;
  autoHealCritical: boolean;
  slackWebhookUrl: string;
  simulatedLatencyMs: number;
  demoMode: boolean;
}
