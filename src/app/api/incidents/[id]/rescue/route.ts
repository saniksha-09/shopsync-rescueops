import { NextResponse } from 'next/server';
import { executeRescuePlaybook } from '@/lib/playbooks';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const playbookId = body.playbookId;

    const result = await executeRescuePlaybook(id, playbookId);
    return NextResponse.json({ ...result });
  } catch (error: unknown) {
    console.error('Error executing rescue playbook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Playbook execution failed';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
