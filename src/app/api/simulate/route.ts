import { NextResponse } from 'next/server';
import { SIMULATION_SCENARIOS } from '@/lib/constants';
import { createIncident, getSettings } from '@/lib/db';
import { Incident } from '@/types';
import { diagnoseIncidentWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { scenarioId, customData } = body;

    let newIncident: Incident;

    if (scenarioId) {
      const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) {
        return NextResponse.json(
          { success: false, error: `Scenario with id '${scenarioId}' not found.` },
          { status: 404 }
        );
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      newIncident = {
        id: `INC-${randomSuffix}`,
        title: scenario.name,
        description: scenario.description,
        channel: scenario.channel,
        category: scenario.category,
        severity: scenario.severity,
        status: 'active',
        revenueAtRisk: scenario.revenueAtRisk,
        revenueRescued: 0,
        affectedItemsCount: scenario.affectedItemsCount,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        rootCauseCode: scenario.rootCauseCode,
        storeName:
          scenario.channel === 'shopify'
            ? 'AeroStyle Direct (Shopify Plus)'
            : scenario.channel === 'amazon'
            ? 'PeakGear Outdoors (Amazon Prime)'
            : scenario.channel === 'stripe'
            ? 'Global Commerce Payments'
            : scenario.channel === 'tiktok_shop'
            ? 'TrendWave Collective'
            : 'SoundPro Audio Gear (WooCommerce)',
        customerImpact: scenario.tagline,
        rawPayload: scenario.rawPayload,
        aiDiagnosis: null, // Will run fresh diagnosis or fallback
        recoveryLogs: [],
        playbookExecuted: null,
      };
    } else if (customData) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      newIncident = {
        id: `INC-${randomSuffix}`,
        title: customData.title || 'Custom Injected Sync Failure',
        description: customData.description || 'Simulated synthetic edge case triggered via judge sandbox.',
        channel: customData.channel || 'shopify',
        category: customData.category || 'inventory_desync',
        severity: customData.severity || 'HIGH',
        status: 'active',
        revenueAtRisk: Number(customData.revenueAtRisk) || 2500,
        revenueRescued: 0,
        affectedItemsCount: Number(customData.affectedItemsCount) || 12,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        rootCauseCode: customData.rootCauseCode || 'ERR_CUSTOM_SIMULATION_TRIGGERED',
        storeName: 'Sandbox Test Storefront',
        customerImpact: 'Synthetic scenario generated for live hackathon demonstration.',
        rawPayload: customData.rawPayload || {
          synthetic_trigger: true,
          timestamp: new Date().toISOString(),
        },
        aiDiagnosis: null,
        recoveryLogs: [],
        playbookExecuted: null,
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide scenarioId or customData in request body.' },
        { status: 400 }
      );
    }

    // Run AI diagnosis right away so it is ready upon injection
    try {
      const diagnosis = await diagnoseIncidentWithGemini(newIncident);
      newIncident.aiDiagnosis = diagnosis;
    } catch {
      // If error occurs, keep diagnosis null; user can trigger it manually in UI
    }

    // Save incident
    const saved = createIncident(newIncident);

    // If autoHealCritical setting is turned on and severity is CRITICAL, can auto-trigger
    const settings = getSettings();
    if (settings.autoHealCritical && saved.severity === 'CRITICAL') {
      // Note: we can let user see it active first so they experience the simulator flow
    }

    return NextResponse.json({
      success: true,
      message: `Scenario '${saved.title}' successfully injected into live stream!`,
      incident: saved,
    });
  } catch (error: unknown) {
    console.error('Error simulating scenario:', error);
    const errorMessage = error instanceof Error ? error.message : 'Simulation failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
