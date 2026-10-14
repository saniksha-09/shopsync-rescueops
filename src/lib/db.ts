import fs from 'fs';
import path from 'path';
import { Incident, AnalyticsSummary, SystemSettings, RecoveryLogStep } from '@/types';
import { INITIAL_SETTINGS } from './constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

export interface AuditLogEntry {
  id: string;
  incidentId: string;
  incidentTitle: string;
  channel: string;
  action: string;
  revenueRescued: number;
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-9014',
    title: 'Shopify Checkout Webhook Dropped on Black Friday Tier SKU',
    description: '14 successful buyer orders on Shopify did not sync to the 3PL fulfillment warehouse due to an invalid HMAC secret rotation.',
    channel: 'shopify',
    category: 'webhook_drop',
    severity: 'CRITICAL',
    status: 'active',
    revenueAtRisk: 3890,
    revenueRescued: 0,
    affectedItemsCount: 14,
    detectedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    resolvedAt: null,
    rootCauseCode: 'ERR_HMAC_SIGNATURE_MISMATCH_401',
    storeName: 'AeroStyle Direct (Shopify Plus)',
    customerImpact: '14 orders awaiting shipment notification; SLA breached in 42 minutes.',
    rawPayload: {
      webhook_id: 'wh_shp_90142_live',
      event: 'orders/paid',
      source: 'Shopify Webhooks Engine',
      endpoint: 'https://sync.aerostyle.com/api/webhooks/orders',
      http_status: 401,
      error_message: 'Unauthorized: Webhook HMAC-SHA256 signature mismatch against current tenant key',
      orders_held: ['#10941', '#10942', '#10943', '#10944', '#10945'],
      total_gmv_usd: 3890.00,
    },
    aiDiagnosis: {
      summary: 'Store admin regenerated Shopify API webhook secrets 2 hours ago, but the ingestion listener microservice was still validating against the cached previous key, rejecting 14 legitimate order payloads.',
      technicalDiagnosis: 'HMAC verification failed in auth middleware. HTTP 401 Unauthorized returned to Shopify webhook dispatch queue.',
      rootCauseCode: 'ERR_HMAC_SIGNATURE_MISMATCH_401',
      impactAssessment: '$3,890 in paid customer orders currently blocked from warehouse picking queue. Delivery timeline endangered.',
      recommendedPlaybook: 'redrive_webhook',
      confidenceScore: 97,
      isAiGenerated: true,
      modelUsed: 'gemini-1.5-flash',
    },
    recoveryLogs: [],
    playbookExecuted: null,
  },
  {
    id: 'INC-8992',
    title: 'Phantom Zero Stockout on Patagonia Down Jacket (Medium)',
    description: 'Inventory showed 0 units on Amazon Seller Central due to race condition during batch upload, while warehouse physical inventory has 45 units.',
    channel: 'amazon',
    category: 'inventory_desync',
    severity: 'HIGH',
    status: 'active',
    revenueAtRisk: 12150,
    revenueRescued: 0,
    affectedItemsCount: 45,
    detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    resolvedAt: null,
    rootCauseCode: 'ERR_DELTA_DESYNC_ZERO_OVERWRITE',
    storeName: 'PeakGear Outdoors (Amazon Prime)',
    customerImpact: 'Buy Box lost to 3rd party merchant with 2-week shipping delay.',
    rawPayload: {
      sku: 'PATAG-DOWN-M-NAVY',
      asin: 'B08K39L2MM',
      reported_inventory: 0,
      actual_erp_count: 45,
      delta_lag_seconds: 2840,
      feed_id: 'amz_feed_88921_err',
      error: 'Feed processing error: null inventory pointer defaulted to 0 on partial upload batch',
    },
    aiDiagnosis: {
      summary: 'A bulk product feed upload transmitted a null quantity field, which the Amazon SP-API parsed as 0 units instead of skipping, instantly de-listing the active Buy Box.',
      technicalDiagnosis: 'Null-pointer fallback in CSV feed parser mapped null to quantity=0. Amazon inventory API processed change at 13:42 UTC.',
      rootCauseCode: 'ERR_DELTA_DESYNC_ZERO_OVERWRITE',
      impactAssessment: '$12,150 estimated revenue loss over the weekend. Organic search rank dropped 4 positions.',
      recommendedPlaybook: 'reconcile_inventory',
      confidenceScore: 95,
      isAiGenerated: true,
      modelUsed: 'gemini-1.5-flash',
    },
    recoveryLogs: [],
    playbookExecuted: null,
  },
  {
    id: 'INC-8950',
    title: 'High-Ticket Abandoned Cart Stall: Enterprise Audio Rig',
    description: 'Cart total $4,850 abandoned at checkout after unexpected shipping carrier rate timeout on freight items.',
    channel: 'woocommerce',
    category: 'abandoned_cart_stall',
    severity: 'MEDIUM',
    status: 'active',
    revenueAtRisk: 4850,
    revenueRescued: 0,
    affectedItemsCount: 1,
    detectedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    resolvedAt: null,
    rootCauseCode: 'ERR_FREIGHT_RATING_TIMEOUT_504',
    storeName: 'SoundPro Audio Gear (WooCommerce)',
    customerImpact: 'High-intent studio buyer abandoned tab after 3 reload attempts.',
    rawPayload: {
      session_id: 'sess_woo_44021',
      cart_value: 4850.00,
      items: ['Genelec 8351B Studio Monitor Pair', 'IsoAcoustics Stand Bundle'],
      carrier_api_error: 'FedEx Freight API connection timeout > 8000ms. No shipping method returned.',
      customer_email: 'mark@loudroomstudios.com',
    },
    aiDiagnosis: {
      summary: 'FedEx Freight API experienced transient gateway latency, which prevented shipping calculations from loading and locked the checkout next-step button.',
      technicalDiagnosis: 'HTTP 504 Gateway Timeout from FedEx Freight API. Shipping rates array empty; UI validation blocked user progression.',
      rootCauseCode: 'ERR_FREIGHT_RATING_TIMEOUT_504',
      impactAssessment: '$4,850 high-margin cart abandoned. Customer active on competitor site.',
      recommendedPlaybook: 'rescue_cart_vip',
      confidenceScore: 93,
      isAiGenerated: true,
      modelUsed: 'gemini-1.5-flash',
    },
    recoveryLogs: [],
    playbookExecuted: null,
  },
  {
    id: 'INC-8910',
    title: 'TikTok Shop Algorithmic Price Inversion Quarantined',
    description: 'Automated repricer sent pricing of $14.99 instead of $149.90 for cashmere knitwear.',
    channel: 'tiktok_shop',
    category: 'price_mismatch',
    severity: 'CRITICAL',
    status: 'rescued',
    revenueAtRisk: 8640,
    revenueRescued: 8640,
    affectedItemsCount: 64,
    detectedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 178).toISOString(),
    rootCauseCode: 'ERR_PRICE_DECIMAL_SHIFT_ANOMALY',
    storeName: 'LuxeLiving Fashion (TikTok Shop)',
    customerImpact: 'Prevented viral underpriced liquidation run; zero inventory loss.',
    rawPayload: {
      sku: 'LX-CASHMERE-CREW-BEIGE',
      msrp: 149.90,
      erroneous_price: 14.99,
      variance_percentage: -90.0,
      repricer_service: 'AutoReprice-Engine-v3',
    },
    aiDiagnosis: {
      summary: 'Third-party repricing bot encountered a decimal truncation anomaly, dividing item price by 10. Autonomous price anomaly quarantine caught the discrepancy before orders were dispatched.',
      technicalDiagnosis: 'Price deviation rule triggered (>50% drop below 30-day baseline). SKU inventory automatically paused on TikTok Shop channel.',
      rootCauseCode: 'ERR_PRICE_DECIMAL_SHIFT_ANOMALY',
      impactAssessment: 'Protected $8,640 in catastrophic margin erosion.',
      recommendedPlaybook: 'quarantine_price_anomaly',
      confidenceScore: 99,
      isAiGenerated: true,
      modelUsed: 'gemini-1.5-flash',
    },
    recoveryLogs: [
      {
        id: 'step-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
        step: 'Halt purchase pipeline for affected SKU across TikTok Shop',
        status: 'completed',
        details: 'Paused listing TikTok ID 99401289',
      },
      {
        id: 'step-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
        step: 'Retrieve verified MSRP snapshot ($149.90)',
        status: 'completed',
        details: 'Snapshot #SS-8821 matched',
      },
      {
        id: 'step-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 178).toISOString(),
        step: 'Push authoritative price correction API payload',
        status: 'completed',
        details: 'Price updated to $149.90; Listing unpaused',
      },
    ],
    playbookExecuted: 'Price Anomaly Quarantine & Catalog Auto-Rollback',
  },
  {
    id: 'INC-8874',
    title: 'Stripe 3DS Biometric Verification Drop Rescue',
    description: '3 high-value international transactions failed 3DS authentication due to regional issuing bank timeout.',
    channel: 'stripe',
    category: 'payment_gateway_stall',
    severity: 'HIGH',
    status: 'rescued',
    revenueAtRisk: 5200,
    revenueRescued: 5200,
    affectedItemsCount: 3,
    detectedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 355).toISOString(),
    rootCauseCode: 'ERR_3DS_CHALLENGE_TIMEOUT',
    storeName: 'AeroStyle Direct (Shopify Plus)',
    customerImpact: 'Customers received instant alternative payment token; all 3 checkouts completed successfully.',
    rawPayload: {
      payments_affected: ['pi_3Mh81k_01', 'pi_3Mh81k_02', 'pi_3Mh81k_03'],
      amount_usd: 5200.00,
      bank: 'Barclays UK',
      decline_code: '3ds_action_timeout',
    },
    aiDiagnosis: {
      summary: 'European issuing bank 3DS iframe timed out. Automated failover triggered dynamic SMS checkout recovery links with one-touch Apple Pay.',
      technicalDiagnosis: 'Stripe PaymentIntent status requires_action exceeded 180s timeout window. Fallback playbook executed seamless secondary route.',
      rootCauseCode: 'ERR_3DS_CHALLENGE_TIMEOUT',
      impactAssessment: 'Successfully captured $5,200 in at-risk international GMV.',
      recommendedPlaybook: 'bypass_payment_fallback',
      confidenceScore: 96,
      isAiGenerated: true,
      modelUsed: 'gemini-1.5-flash',
    },
    recoveryLogs: [
      {
        id: 'step-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 358).toISOString(),
        step: 'Detect 3DS biometric drop-off',
        status: 'completed',
        details: '3 intent sessions identified',
      },
      {
        id: 'step-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 357).toISOString(),
        step: 'Switch gateway routing to secondary high-availability processor',
        status: 'completed',
        details: 'Rerouted to Adyen UK backup rail',
      },
      {
        id: 'step-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 355).toISOString(),
        step: 'Generate and dispatch high-priority recovery link',
        status: 'completed',
        details: 'All 3 buyers completed checkout within 4 minutes',
      },
    ],
    playbookExecuted: 'Payment Gateway Dynamic Failover & 3DS Fallback',
  },
];

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUDIT-101',
    incidentId: 'INC-8874',
    incidentTitle: 'Stripe 3DS Biometric Verification Drop Rescue',
    channel: 'stripe',
    action: 'Payment Gateway Dynamic Failover & 3DS Fallback',
    revenueRescued: 5200,
    timestamp: new Date(Date.now() - 1000 * 60 * 355).toISOString(),
    details: 'Autonomous playbook switched routing rail and captured 3 stalled high-ticket transactions.',
    status: 'SUCCESS',
  },
  {
    id: 'AUDIT-100',
    incidentId: 'INC-8910',
    incidentTitle: 'TikTok Shop Algorithmic Price Inversion Quarantined',
    channel: 'tiktok_shop',
    action: 'Price Anomaly Quarantine & Catalog Auto-Rollback',
    revenueRescued: 8640,
    timestamp: new Date(Date.now() - 1000 * 60 * 178).toISOString(),
    details: 'Quarantined 90% price drop anomaly and restored authoritative catalog MSRP snapshot.',
    status: 'SUCCESS',
  },
];

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getIncidents(): Incident[] {
  ensureDataDirectory();
  if (!fs.existsSync(INCIDENTS_FILE)) {
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(SEED_INCIDENTS, null, 2), 'utf-8');
    return SEED_INCIDENTS;
  }
  try {
    const raw = fs.readFileSync(INCIDENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_INCIDENTS;
  }
}

export function saveIncidents(incidents: Incident[]): void {
  ensureDataDirectory();
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2), 'utf-8');
}

export function getIncidentById(id: string): Incident | null {
  const incidents = getIncidents();
  return incidents.find((inc) => inc.id === id) || null;
}

export function createIncident(incident: Incident): Incident {
  const incidents = getIncidents();
  // Put newest at the top
  const updated = [incident, ...incidents.filter((i) => i.id !== incident.id)];
  saveIncidents(updated);
  return incident;
}

export function updateIncident(id: string, updates: Partial<Incident>): Incident | null {
  const incidents = getIncidents();
  const index = incidents.findIndex((i) => i.id === id);
  if (index === -1) return null;

  incidents[index] = { ...incidents[index], ...updates };
  saveIncidents(incidents);
  return incidents[index];
}

export function deleteIncident(id: string): boolean {
  const incidents = getIncidents();
  const filtered = incidents.filter((i) => i.id !== id);
  if (filtered.length === incidents.length) return false;
  saveIncidents(filtered);
  return true;
}

export function resetDatabase(): void {
  ensureDataDirectory();
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(SEED_INCIDENTS, null, 2), 'utf-8');
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(SEED_AUDIT_LOGS, null, 2), 'utf-8');
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

export function getAuditLogs(): AuditLogEntry[] {
  ensureDataDirectory();
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(SEED_AUDIT_LOGS, null, 2), 'utf-8');
    return SEED_AUDIT_LOGS;
  }
  try {
    const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_AUDIT_LOGS;
  }
}

export function addAuditLog(entry: AuditLogEntry): void {
  ensureDataDirectory();
  const logs = getAuditLogs();
  const updated = [entry, ...logs];
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const incidents = getIncidents();

  let totalRevenueRescued = 0;
  let totalRevenueAtRisk = 0;
  let activeCount = 0;
  let rescuedCount = 0;

  const channelBreakdown = {
    shopify: { active: 0, rescued: 0, revenueRisk: 0 },
    amazon: { active: 0, rescued: 0, revenueRisk: 0 },
    woocommerce: { active: 0, rescued: 0, revenueRisk: 0 },
    stripe: { active: 0, rescued: 0, revenueRisk: 0 },
    tiktok_shop: { active: 0, rescued: 0, revenueRisk: 0 },
  };

  const categoryBreakdown = {
    inventory_desync: 0,
    webhook_drop: 0,
    payment_gateway_stall: 0,
    abandoned_cart_stall: 0,
    price_mismatch: 0,
  };

  for (const inc of incidents) {
    if (inc.status === 'rescued') {
      rescuedCount++;
      totalRevenueRescued += inc.revenueRescued || inc.revenueAtRisk;
      if (channelBreakdown[inc.channel]) {
        channelBreakdown[inc.channel].rescued++;
      }
    } else if (inc.status === 'active' || inc.status === 'investigating' || inc.status === 'healing') {
      activeCount++;
      totalRevenueAtRisk += inc.revenueAtRisk;
      if (channelBreakdown[inc.channel]) {
        channelBreakdown[inc.channel].active++;
        channelBreakdown[inc.channel].revenueRisk += inc.revenueAtRisk;
      }
    }

    if (categoryBreakdown[inc.category] !== undefined) {
      categoryBreakdown[inc.category]++;
    }
  }

  const totalIncidents = incidents.length;
  const recoverySuccessRate =
    totalIncidents > 0 ? Math.round((rescuedCount / (rescuedCount + activeCount || 1)) * 100) : 0;

  return {
    totalRevenueRescued,
    totalRevenueAtRisk,
    activeIncidentsCount: activeCount,
    rescuedIncidentsCount: rescuedCount,
    totalIncidentsCount: totalIncidents,
    mttdSeconds: 14, // 14 seconds mean time to detect
    mttrSeconds: 84, // 84 seconds mean time to recover
    recoverySuccessRate,
    channelBreakdown,
    categoryBreakdown,
  };
}
