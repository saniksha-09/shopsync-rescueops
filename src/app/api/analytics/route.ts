import { NextResponse } from 'next/server';
import { getAnalyticsSummary, getAuditLogs } from '@/lib/db';
import { CONNECTED_CHANNELS } from '@/lib/constants';

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
    const auditLogs = getAuditLogs();

    return NextResponse.json({
      success: true,
      analytics: summary,
      channels: CONNECTED_CHANNELS,
      recentAuditLogs: auditLogs.slice(0, 15),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
