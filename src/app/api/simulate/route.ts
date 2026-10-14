import { NextResponse } from 'next/server';
import { createCustomerCase } from '@/lib/db';
import { CustomerRiskCase, ChannelType, RiskLevel } from '@/types';
import { generateCustomerRecoveryRecommendation } from '@/lib/gemini';

const SIMULATED_CUSTOMER_PRESETS = [
  {
    id: 'sim-flash-sale',
    name: 'Flash Sale Cart Stall — Liam Taylor',
    customerName: 'Liam Taylor',
    customerEmail: 'liam.taylor@velocityhub.co',
    customerPhone: '+1 (415) 555-0144',
    channel: 'shopify' as ChannelType,
    orderOrCartId: 'CART-9932',
    itemsDescription: 'Nike Air Zoom Pegasus 40 - Limited Edition (x2)',
    value: 980,
    riskLevel: 'HIGH' as RiskLevel,
    flagReason: 'High-traffic flash sale inventory lock timeout during final checkout step.',
    evidence: 'Cart held 2 items. Redis mutex lock acquisition timed out after 3500ms. Customer tried 3 times before abandoning.',
    storeName: 'AeroStyle Direct (Shopify Plus)',
  },
  {
    id: 'sim-stripe-drop',
    name: 'Stripe Webhook Drop — Chloe Simmons',
    customerName: 'Chloe Simmons',
    customerEmail: 'chloe.s@horizonmedia.com',
    customerPhone: '+1 (312) 555-0198',
    channel: 'stripe' as ChannelType,
    orderOrCartId: 'ORD-8841',
    itemsDescription: 'Sony WH-1000XM5 Premium ANC Headphones',
    value: 650,
    riskLevel: 'HIGH' as RiskLevel,
    flagReason: 'Customer card charged on Stripe, but webhook dropped before order was created in warehouse.',
    evidence: 'Stripe PaymentIntent pi_4Nk921 captured $650.00. No order confirmation email sent after 40 minutes.',
    storeName: 'PeakGear Electronics (Stripe / Shopify)',
  },
  {
    id: 'sim-freight-timeout',
    name: 'Carrier Rate Timeout — Robert Zhang',
    customerName: 'Robert Zhang',
    customerEmail: 'rzhang@northbridge-cap.com',
    customerPhone: '+1 (206) 555-0163',
    channel: 'woocommerce' as ChannelType,
    orderOrCartId: 'CART-7718',
    itemsDescription: 'Genelec Studio Monitors & Acoustic Isolation Bundle',
    value: 2100,
    riskLevel: 'MEDIUM' as RiskLevel,
    flagReason: 'Avalara tax & freight rating microservice timed out, disabling checkout button.',
    evidence: 'Carrier API hung for 8200ms on postal code 98101. Customer refreshed twice and closed browser tab.',
    storeName: 'SoundPro Audio Gear (WooCommerce)',
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { scenarioId, customData } = body;

    let targetPreset = SIMULATED_CUSTOMER_PRESETS.find((s) => s.id === scenarioId);

    let newCase: CustomerRiskCase;
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    if (targetPreset) {
      newCase = {
        id: `CASE-${randomSuffix}`,
        customerName: targetPreset.customerName,
        customerEmail: targetPreset.customerEmail,
        customerPhone: targetPreset.customerPhone,
        channel: targetPreset.channel,
        orderOrCartId: targetPreset.orderOrCartId,
        itemsDescription: targetPreset.itemsDescription,
        value: targetPreset.value,
        riskLevel: targetPreset.riskLevel,
        flagReason: targetPreset.flagReason,
        evidence: targetPreset.evidence,
        status: 'pending_review',
        detectedAt: new Date().toISOString(),
        storeName: targetPreset.storeName,
        title: `${targetPreset.customerName} — Flagged Case`,
        revenueAtRisk: targetPreset.value,
        revenueRescued: 0,
      };
    } else if (customData) {
      newCase = {
        id: `CASE-${randomSuffix}`,
        customerName: customData.customerName || 'Taylor Morgan',
        customerEmail: customData.customerEmail || 'tmorgan@example.com',
        customerPhone: customData.customerPhone || '+1 (555) 019-3382',
        channel: customData.channel || 'shopify',
        orderOrCartId: customData.orderOrCartId || `CART-${Math.floor(1000 + Math.random() * 9000)}`,
        itemsDescription: customData.itemsDescription || 'Store Item Bundle',
        value: Number(customData.value) || 450,
        riskLevel: customData.riskLevel || 'HIGH',
        flagReason: customData.flagReason || 'Checkout discrepancy flagged by store sync monitor.',
        evidence: customData.evidence || 'Synthetic customer risk scenario injected for demonstration.',
        status: 'pending_review',
        detectedAt: new Date().toISOString(),
        storeName: 'Primary Storefront',
        title: `${customData.customerName || 'Taylor Morgan'} — Flagged Case`,
        revenueAtRisk: Number(customData.value) || 450,
        revenueRescued: 0,
      };
    } else {
      targetPreset = SIMULATED_CUSTOMER_PRESETS[0];
      newCase = {
        id: `CASE-${randomSuffix}`,
        customerName: targetPreset.customerName,
        customerEmail: targetPreset.customerEmail,
        customerPhone: targetPreset.customerPhone,
        channel: targetPreset.channel,
        orderOrCartId: targetPreset.orderOrCartId,
        itemsDescription: targetPreset.itemsDescription,
        value: targetPreset.value,
        riskLevel: targetPreset.riskLevel,
        flagReason: targetPreset.flagReason,
        evidence: targetPreset.evidence,
        status: 'pending_review',
        detectedAt: new Date().toISOString(),
        storeName: targetPreset.storeName,
        title: `${targetPreset.customerName} — Flagged Case`,
        revenueAtRisk: targetPreset.value,
        revenueRescued: 0,
      };
    }

    // Generate recommendation immediately
    try {
      const rec = await generateCustomerRecoveryRecommendation(newCase);
      newCase.aiRecommendation = rec;
    } catch {
      // Ignored
    }

    const saved = createCustomerCase(newCase);

    return NextResponse.json({
      success: true,
      message: `Injected case for ${saved.customerName}`,
      case: saved,
      incident: saved,
    });
  } catch (error: unknown) {
    console.error('Error simulating customer case:', error);
    const errorMessage = error instanceof Error ? error.message : 'Simulation failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
