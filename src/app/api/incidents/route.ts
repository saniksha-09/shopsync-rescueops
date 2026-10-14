import { NextResponse } from 'next/server';
import { getIncidents, createIncident, resetDatabase } from '@/lib/db';
import { Incident } from '@/types';

export async function GET() {
  try {
    const incidents = getIncidents();
    return NextResponse.json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve incidents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.channel || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required incident fields (title, channel, category)' },
        { status: 400 }
      );
    }

    const newIncident: Incident = {
      id: body.id || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: body.title,
      description: body.description || 'Operational discrepancy detected in live store stream.',
      channel: body.channel,
      category: body.category,
      severity: body.severity || 'HIGH',
      status: 'active',
      revenueAtRisk: Number(body.revenueAtRisk) || 0,
      revenueRescued: 0,
      affectedItemsCount: Number(body.affectedItemsCount) || 1,
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      rootCauseCode: body.rootCauseCode || 'ERR_SYNC_DISCREPANCY_GENERIC',
      storeName: body.storeName || 'Primary Storefront',
      customerImpact: body.customerImpact || 'Orders or catalog visibility pending resolution.',
      rawPayload: body.rawPayload || { timestamp: new Date().toISOString() },
      aiDiagnosis: body.aiDiagnosis || null,
      recoveryLogs: [],
      playbookExecuted: null,
    };

    const created = createIncident(newIncident);
    return NextResponse.json({ success: true, incident: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to initial demo state' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
