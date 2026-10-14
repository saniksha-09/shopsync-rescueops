import { NextResponse } from 'next/server';
import { getCustomerCaseById, updateCustomerCase } from '@/lib/db';
import { generateCustomerRecoveryRecommendation } from '@/lib/gemini';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerCase = getCustomerCaseById(id);

    if (!customerCase) {
      return NextResponse.json({ success: false, error: 'Customer case not found' }, { status: 404 });
    }

    const recommendation = await generateCustomerRecoveryRecommendation(customerCase);

    const updated = updateCustomerCase(id, {
      aiRecommendation: recommendation,
    });

    return NextResponse.json({
      success: true,
      recommendation,
      case: updated,
      incident: updated,
    });
  } catch (error: unknown) {
    console.error('Error generating AI recommendation:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI recommendation failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
