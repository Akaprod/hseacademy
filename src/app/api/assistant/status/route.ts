// GET /api/assistant/status — Public, pour le widget
import { NextResponse } from 'next/server';
import { getStatus } from '@/assistant/services/config';

export async function GET() {
  try {
    const status = await getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('GET /api/assistant/status error:', error);
    return NextResponse.json({
      enabled: false, name: 'Assistant', modes: { commercial: false, user: false, admin: false },
      aiProviderConfigured: false, version: 'unknown',
    });
  }
}
