import { AiRecommendation, CustomerRiskCase } from '@/types';
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

export async function generateCustomerRecoveryRecommendation(
  customerCase: CustomerRiskCase
): Promise<AiRecommendation> {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  // If no Gemini API key is configured, return the rule-based recovery recommendation
  if (!apiKey || apiKey.trim() === '') {
    return generateRuleBasedRecommendation(customerCase);
  }

  try {
    const prompt = `You are ShopSync RescueOps Senior E-Commerce Customer Recovery Specialist.
Analyze this flagged customer risk case and generate a practical next-best recovery action and personalized customer outreach message draft.

Customer Details:
- Customer Name: ${customerCase.customerName}
- Customer Email: ${customerCase.customerEmail}
- Channel: ${customerCase.channel}
- Order / Cart ID: ${customerCase.orderOrCartId}
- Cart / Order Value: $${customerCase.value}
- Items: ${customerCase.itemsDescription}
- Risk Level: ${customerCase.riskLevel}
- Flag Reason: ${customerCase.flagReason}
- Evidence: ${customerCase.evidence}

Respond strictly in valid JSON (no markdown formatting, no code fences):
{
  "actionTitle": "Specific concise action title like 'Send 1-Click Reserved Checkout with 10% Courtesy Discount'",
  "actionType": "recover_cart", // One of: recover_cart | redrive_order | reconcile_stock | contact_customer
  "explanation": "2-sentence practical explanation of why this action is recommended based on the evidence",
  "suggestedDiscount": "10% Courtesy Discount",
  "messageDraft": "Warm, professional, personalized 2-3 sentence message to the customer addressing the exact issue and providing a direct solution"
}`;

    const modelName = settings.aiModel || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API returned error, switching to rule-based fallback:', response.status);
      return generateRuleBasedRecommendation(customerCase);
    }

    const data: GeminiResponse = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateRuleBasedRecommendation(customerCase);
    }

    const cleaned = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      actionTitle: parsed.actionTitle || 'Customer Recovery Outreach',
      actionType: parsed.actionType || 'recover_cart',
      explanation: parsed.explanation || 'Practical action based on customer checkout evidence.',
      suggestedDiscount: parsed.suggestedDiscount || undefined,
      messageDraft: parsed.messageDraft || `Hi ${customerCase.customerName.split(' ')[0]}, we noticed an issue with your checkout and are here to help!`,
      isAiGenerated: true,
      modelUsed: `Gemini (${modelName})`,
    };
  } catch (error) {
    console.error('Error invoking Gemini API:', error);
    return generateRuleBasedRecommendation(customerCase);
  }
}

function generateRuleBasedRecommendation(customerCase: CustomerRiskCase): AiRecommendation {
  const firstName = customerCase.customerName.split(' ')[0] || customerCase.customerName;

  if (customerCase.flagReason.toLowerCase().includes('webhook') || customerCase.flagReason.toLowerCase().includes('unfulfilled')) {
    return {
      actionTitle: 'Re-drive Order Ingestion to Warehouse & Dispatch Confirmation',
      actionType: 'redrive_order',
      explanation: 'Customer payment is verified, but backend sync failed to trigger order creation. Re-driving prevents delivery delay and customer dispute.',
      messageDraft: `Hi ${firstName}, good news! Your payment for ${customerCase.itemsDescription} was successfully confirmed. We have routed your order (${customerCase.orderOrCartId}) directly to our packaging queue. Track your status here: https://store.com/orders/track/${customerCase.orderOrCartId}`,
      isAiGenerated: false,
      modelUsed: 'Rule-Based Smart Recovery Engine',
    };
  }

  if (customerCase.flagReason.toLowerCase().includes('tax') || customerCase.flagReason.toLowerCase().includes('shipping')) {
    return {
      actionTitle: 'Send VIP Concierge Direct Checkout with Free Expedited Shipping',
      actionType: 'contact_customer',
      explanation: 'Customer abandoned checkout after calculation latency. Offering complimentary express delivery eliminates friction and recovers high-ticket revenue.',
      suggestedDiscount: 'Free Expedited Shipping',
      messageDraft: `Hi ${firstName}, we noticed our shipping system experienced a slight delay during your visit. To ensure a smooth experience, we have unlocked free express delivery on your items (${customerCase.itemsDescription}). Finish your order in one click: https://store.com/checkout/rescue/${customerCase.orderOrCartId}`,
      isAiGenerated: false,
      modelUsed: 'Rule-Based Smart Recovery Engine',
    };
  }

  if (customerCase.flagReason.toLowerCase().includes('stock') || customerCase.flagReason.toLowerCase().includes('inventory')) {
    return {
      actionTitle: 'One-Click Reserved Checkout with 10% Loyalty Courtesy',
      actionType: 'recover_cart',
      explanation: 'Customer faced false stockout error while physical stock is available. Reserving the item and sending an apology discount secures immediate conversion.',
      suggestedDiscount: '10% OFF',
      messageDraft: `Hi ${firstName}, we apologize for the temporary inventory error you saw earlier! We have verified stock and reserved your items (${customerCase.itemsDescription}) with an exclusive 10% courtesy discount: https://store.com/rescue/${customerCase.orderOrCartId}`,
      isAiGenerated: false,
      modelUsed: 'Rule-Based Smart Recovery Engine',
    };
  }

  return {
    actionTitle: 'Personalized Customer Recovery Outreach',
    actionType: 'recover_cart',
    explanation: 'High-intent cart stalled before completion. Personalized outreach with direct checkout link offers the highest recovery probability.',
    suggestedDiscount: '5% Courtesy Discount',
    messageDraft: `Hi ${firstName}, we noticed you left some great items in your cart (${customerCase.itemsDescription}). We have saved your selection so you can pick up right where you left off: https://store.com/rescue/${customerCase.orderOrCartId}`,
    isAiGenerated: false,
    modelUsed: 'Rule-Based Smart Recovery Engine',
  };
}
