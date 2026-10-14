import { AiDiagnosis, Incident } from '@/types';
import { getSettings } from './db';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

export async function diagnoseIncidentWithGemini(incident: Incident): Promise<AiDiagnosis> {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  // If no Gemini API key is configured, use the smart deterministic diagnostic engine
  if (!apiKey || apiKey.trim() === '') {
    return generateSmartFallbackDiagnosis(incident, 'Intelligent Fallback Engine (No API Key)');
  }

  try {
    const prompt = `You are ShopSync RescueOps Senior Site Reliability and E-Commerce Operations Engineer.
Analyze this e-commerce operational sync incident and return a valid JSON response with the exact schema below.

Incident Details:
- Title: ${incident.title}
- Store: ${incident.storeName}
- Channel: ${incident.channel}
- Category: ${incident.category}
- Severity: ${incident.severity}
- Revenue at Risk: $${incident.revenueAtRisk}
- Affected Items/Orders: ${incident.affectedItemsCount}
- Reported Root Cause Code: ${incident.rootCauseCode}
- Raw Payload/Trace:
${typeof incident.rawPayload === 'string' ? incident.rawPayload : JSON.stringify(incident.rawPayload, null, 2)}

Provide your response in strictly JSON format (no markdown formatting, no code fences):
{
  "summary": "2-sentence clear plain English explanation for store managers of why this failure happened",
  "technicalDiagnosis": "Deep technical analysis explaining the exact microservice failure, HTTP code, or payload conflict",
  "rootCauseCode": "Specific error code like ERR_INVENTORY_MUTEX_TIMEOUT_408 or ERR_WEBHOOK_SSL_HANDSHAKE_FAILED",
  "impactAssessment": "Detailed financial and operational assessment of the risk",
  "recommendedPlaybook": "One of: reconcile_inventory | redrive_webhook | bypass_payment_fallback | rescue_cart_vip | quarantine_price_anomaly",
  "confidenceScore": 95
}`;

    const modelName = settings.aiModel || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API returned error, switching to fallback:', response.status, errText);
      return generateSmartFallbackDiagnosis(incident, `Smart Fallback (API error ${response.status})`);
    }

    const data: GeminiResponse = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateSmartFallbackDiagnosis(incident, 'Smart Fallback (Empty response)');
    }

    // Clean JSON if model returned markdown codeblocks
    const cleaned = candidateText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'AI diagnostic completed successfully.',
      technicalDiagnosis: parsed.technicalDiagnosis || 'Payload anomaly detected in sync stream.',
      rootCauseCode: parsed.rootCauseCode || incident.rootCauseCode,
      impactAssessment: parsed.impactAssessment || `$${incident.revenueAtRisk} revenue at risk.`,
      recommendedPlaybook: parsed.recommendedPlaybook || 'reconcile_inventory',
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 95,
      isAiGenerated: true,
      modelUsed: modelName,
    };
  } catch (error) {
    console.error('Error invoking Gemini API:', error);
    return generateSmartFallbackDiagnosis(incident, 'Smart Fallback Engine (Network/Parse error)');
  }
}

function generateSmartFallbackDiagnosis(incident: Incident, fallbackReason: string): AiDiagnosis {
  // If incident already has a pre-computed scenario diagnosis, reuse it
  if (incident.aiDiagnosis) {
    return {
      ...incident.aiDiagnosis,
      modelUsed: fallbackReason,
    };
  }

  // Heuristic generation based on category & payload
  switch (incident.category) {
    case 'inventory_desync':
      return {
        summary: `Race condition between physical ERP counts and ${incident.channel} active reserves caused inventory to falsely lock up.`,
        technicalDiagnosis: `Lock acquisition timeout in distributed stock cache during multi-channel delta sync. Transaction rolled back to safety threshold.`,
        rootCauseCode: incident.rootCauseCode || 'ERR_INVENTORY_MUTEX_TIMEOUT',
        impactAssessment: `$${incident.revenueAtRisk.toLocaleString()} GMV blocked; ${incident.affectedItemsCount} units unavailable to buying customers.`,
        recommendedPlaybook: 'reconcile_inventory',
        confidenceScore: 94,
        isAiGenerated: false,
        modelUsed: fallbackReason,
      };
    case 'webhook_drop':
      return {
        summary: `Webhook delivery from ${incident.channel} failed due to handshake timeout or cryptographic signature expiration.`,
        technicalDiagnosis: `HTTP gateway returned error during order notification ingestion. Event stored in dead-letter queue without order progression.`,
        rootCauseCode: incident.rootCauseCode || 'ERR_WEBHOOK_DELIVERY_DROP',
        impactAssessment: `${incident.affectedItemsCount} customer orders caught in unpaid limbo. Fulfillment SLA at risk.`,
        recommendedPlaybook: 'redrive_webhook',
        confidenceScore: 96,
        isAiGenerated: false,
        modelUsed: fallbackReason,
      };
    case 'payment_gateway_stall':
      return {
        summary: `Payment processor dropped customer transaction authorization during multi-factor authentication challenge.`,
        technicalDiagnosis: `3DS authentication frame exceeded 180-second timeout threshold. PaymentIntent status stuck in 'requires_action'.`,
        rootCauseCode: incident.rootCauseCode || 'ERR_PAYMENT_GATEWAY_3DS_TIMEOUT',
        impactAssessment: `$${incident.revenueAtRisk.toLocaleString()} high-intent payment drop-off across ${incident.affectedItemsCount} checkouts.`,
        recommendedPlaybook: 'bypass_payment_fallback',
        confidenceScore: 95,
        isAiGenerated: false,
        modelUsed: fallbackReason,
      };
    case 'abandoned_cart_stall':
      return {
        summary: `High-value customer checkout halted after third-party API timeout during shipping or tax computation.`,
        technicalDiagnosis: `Rate engine RPC returned timeout (>5000ms), disabling the primary order submission CTA in front-end state machine.`,
        rootCauseCode: incident.rootCauseCode || 'ERR_TAX_OR_CARRIER_RPC_TIMEOUT',
        impactAssessment: `$${incident.revenueAtRisk.toLocaleString()} stalled cart with high churn risk.`,
        recommendedPlaybook: 'rescue_cart_vip',
        confidenceScore: 93,
        isAiGenerated: false,
        modelUsed: fallbackReason,
      };
    case 'price_mismatch':
    default:
      return {
        summary: `Erroneous pricing or inventory delta detected exceeding store safety guardrails.`,
        technicalDiagnosis: `Catalog anomaly detection tripped: price deviation > 50% from verified historical average.`,
        rootCauseCode: incident.rootCauseCode || 'ERR_CATALOG_ANOMALY_TRIGGERED',
        impactAssessment: `Immediate margin erosion of $${incident.revenueAtRisk.toLocaleString()} prevented through automated quarantine.`,
        recommendedPlaybook: 'quarantine_price_anomaly',
        confidenceScore: 97,
        isAiGenerated: false,
        modelUsed: fallbackReason,
      };
  }
}
