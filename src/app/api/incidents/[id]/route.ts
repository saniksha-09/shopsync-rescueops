import { NextResponse } from 'next/server';
import { getIncidentById, updateIncident, deleteIncident } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = getIncidentById(id);
    if (!incident) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, incident });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve incident' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateIncident(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, incident: updated });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ success: false, error: 'Failed to update incident' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteIncident(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Incident ${id} deleted` });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete incident' }, { status: 500 });
  }
}
