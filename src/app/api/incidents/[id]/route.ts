import { NextResponse } from 'next/server';
import { getCustomerCaseById, updateCustomerCase, deleteCustomerCase } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerCase = getCustomerCaseById(id);
    if (!customerCase) {
      return NextResponse.json({ success: false, error: 'Customer case not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: customerCase, incident: customerCase });
  } catch (error) {
    console.error('Error fetching customer case:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve customer case' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateCustomerCase(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Customer case not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: updated, incident: updated });
  } catch (error) {
    console.error('Error updating customer case:', error);
    return NextResponse.json({ success: false, error: 'Failed to update customer case' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteCustomerCase(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Customer case not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Customer case ${id} deleted` });
  } catch (error) {
    console.error('Error deleting customer case:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete customer case' }, { status: 500 });
  }
}
