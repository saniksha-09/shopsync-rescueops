export type ChannelType = 'shopify' | 'amazon' | 'woocommerce' | 'stripe' | 'tiktok_shop';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseStatus = 'pending_review' | 'action_approved' | 'completed' | 'dismissed';

export interface AiRecommendation {
  actionTitle: string;
  actionType: 'recover_cart' | 'redrive_order' | 'reconcile_stock' | 'contact_customer';
  explanation: string;
  suggestedDiscount?: string;
  messageDraft: string;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface CustomerRiskCase {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  channel: ChannelType;
  orderOrCartId: string;
  itemsDescription: string;
  value: number;
  riskLevel: RiskLevel;
  flagReason: string;
  evidence: string;
  status: CaseStatus;
  detectedAt: string;
  resolvedAt?: string | null;
  storeName: string;
  aiRecommendation?: AiRecommendation | null;
  actionNotes?: string;
  completedAction?: string;
  // Backward compatibility fields
  title?: string;
  revenueAtRisk?: number;
  revenueRescued?: number;
}

export interface ActionHistoryEntry {
  id: string;
  caseId: string;
  customerName: string;
  channel: ChannelType;
  actionTaken: string;
  outcome: 'COMPLETED' | 'DISMISSED';
  valueRescued: number;
  timestamp: string;
  notes?: string;
}

export interface DashboardMetrics {
  customersNeedingAttention: number;
  highRiskCases: number;
  pendingActions: number;
  completedActions: number;
  totalValueAtRisk: number;
  totalValueRescued: number;
}

export interface SystemSettings {
  geminiApiKey: string;
  aiModel: string;
  autoApproveLowRisk: boolean;
  demoMode: boolean;
}
