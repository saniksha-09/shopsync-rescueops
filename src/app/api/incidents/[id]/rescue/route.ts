import { NextResponse } from 'next/server';
import { completeCaseAction } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actionName = body.actionName || body.playbookId || 'Instant Recovery Action';

    const result = completeCaseAction(id, actionName);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Customer case not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      case: result,
      incident: result,
      revenueRescued: result.value,
      message: `Successfully recovered customer case ${id}`,
    });
  } catch (error: unknown) {
    console.error('Error recovering case:', error);
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
