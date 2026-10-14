import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
        maskedKey: settings.geminiApiKey
          ? `${settings.geminiApiKey.slice(0, 4)}...${settings.geminiApiKey.slice(-4)}`
          : '',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = updateSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings: {
        ...updated,
        hasGeminiKey: Boolean(updated.geminiApiKey),
      },
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
