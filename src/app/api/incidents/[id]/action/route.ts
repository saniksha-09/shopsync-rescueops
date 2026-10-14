import { NextResponse } from 'next/server';
import { approveCaseAction, completeCaseAction, dismissCase } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action, notes, actionName, reason } = body;

    let result;

    if (action === 'approve') {
      result = approveCaseAction(id, notes);
    } else if (action === 'complete') {
      result = completeCaseAction(id, actionName, notes);
    } else if (action === 'dismiss') {
      result = dismissCase(id, reason || notes);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'approve', 'complete', or 'dismiss'." },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Customer case with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: result,
      incident: result,
      message: `Case ${id} successfully transitioned to ${result.status}`,
    });
  } catch (error: unknown) {
    console.error('Error executing case action:', error);
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
