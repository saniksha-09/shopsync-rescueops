import { NextResponse } from 'next/server';
import { getDashboardMetrics, getActionHistory } from '@/lib/db';

export async function GET() {
  try {
    const metrics = getDashboardMetrics();
    const history = getActionHistory();

    return NextResponse.json({
      success: true,
      metrics,
      history,
      // Backward compatibility fields
      analytics: {
        totalRevenueRescued: metrics.totalValueRescued,
        totalRevenueAtRisk: metrics.totalValueAtRisk,
        activeIncidentsCount: metrics.customersNeedingAttention,
        rescuedIncidentsCount: metrics.completedActions,
        totalIncidentsCount: metrics.customersNeedingAttention + metrics.completedActions,
        recoverySuccessRate:
          metrics.completedActions + metrics.customersNeedingAttention > 0
            ? Math.round(
                (metrics.completedActions /
                  (metrics.completedActions + metrics.customersNeedingAttention)) *
                  100
              )
            : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
