import { NextResponse } from 'next/server';
import { getIncidentById, updateIncident } from '@/lib/db';
import { diagnoseIncidentWithGemini } from '@/lib/gemini';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = getIncidentById(id);

    if (!incident) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }

    const diagnosis = await diagnoseIncidentWithGemini(incident);

    // Save diagnosis to incident record
    const updated = updateIncident(id, {
      aiDiagnosis: diagnosis,
    });

    return NextResponse.json({ success: true, diagnosis, incident: updated });
  } catch (error: unknown) {
    console.error('Error generating AI diagnosis:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI diagnosis failed';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
