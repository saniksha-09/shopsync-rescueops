import { NextResponse } from 'next/server';
import { getCustomerCases, createCustomerCase, resetDatabase } from '@/lib/db';
import { CustomerRiskCase } from '@/types';

export async function GET() {
  try {
    const cases = getCustomerCases();
    return NextResponse.json({
      success: true,
      count: cases.length,
      cases,
      // Backward compatibility for existing fetchers
      incidents: cases,
    });
  } catch (error) {
    console.error('Error fetching customer cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve customer cases' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.channel || !body.flagReason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (customerName, channel, flagReason)' },
        { status: 400 }
      );
    }

    const newCase: CustomerRiskCase = {
      id: body.id || `CASE-${Math.floor(100 + Math.random() * 900)}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail || `${body.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      customerPhone: body.customerPhone || '+1 (555) 019-2831',
      channel: body.channel,
      orderOrCartId: body.orderOrCartId || `CART-${Math.floor(1000 + Math.random() * 9000)}`,
      itemsDescription: body.itemsDescription || 'Store Merchandise Item',
      value: Number(body.value) || 250,
      riskLevel: body.riskLevel || 'HIGH',
      flagReason: body.flagReason,
      evidence: body.evidence || 'Operational checkout discrepancy flagged by store sync monitor.',
      status: 'pending_review',
      detectedAt: new Date().toISOString(),
      storeName: body.storeName || 'Primary Storefront',
      aiRecommendation: body.aiRecommendation || null,
      title: `${body.customerName} — Flagged Case`,
      revenueAtRisk: Number(body.value) || 250,
      revenueRescued: 0,
    };

    const created = createCustomerCase(newCase);
    return NextResponse.json({ success: true, case: created, incident: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer case:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer case' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to initial clean demo state' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
