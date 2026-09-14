// GET/PUT /api/assistant/config — Admin only
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getConfig, updateConfig } from '@/assistant/services/config';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json(await getConfig());
  } catch (error) {
    console.error('GET /api/assistant/config error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const updates: any = {};
    // Whitelist stricte
    if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;
    if (typeof body.commercialEnabled === 'boolean') updates.commercialEnabled = body.commercialEnabled;
    if (typeof body.userEnabled === 'boolean') updates.userEnabled = body.userEnabled;
    if (typeof body.adminEnabled === 'boolean') updates.adminEnabled = body.adminEnabled;
    if (typeof body.name === 'string' && body.name.length <= 100) updates.name = body.name;
    if (typeof body.welcomeMessage === 'string' && body.welcomeMessage.length <= 500) updates.welcomeMessage = body.welcomeMessage;
    if (['fr', 'en', 'ar'].includes(body.language)) updates.language = body.language;
    if (['always', 'business_hours', 'manual'].includes(body.availabilityMode)) updates.availabilityMode = body.availabilityMode;
    // Lara Config — response limits + rate limiting
    if (['simple', 'normal', 'detailed'].includes(body.responseMode)) updates.responseMode = body.responseMode;
    if (typeof body.simpleMaxWords === 'number' && body.simpleMaxWords > 0 && body.simpleMaxWords <= 500) updates.simpleMaxWords = body.simpleMaxWords;
    if (typeof body.normalMaxWords === 'number' && body.normalMaxWords > 0 && body.normalMaxWords <= 500) updates.normalMaxWords = body.normalMaxWords;
    if (typeof body.detailedMaxWords === 'number' && body.detailedMaxWords > 0 && body.detailedMaxWords <= 500) updates.detailedMaxWords = body.detailedMaxWords;
    if (typeof body.maxUserMessageLength === 'number' && body.maxUserMessageLength > 100 && body.maxUserMessageLength <= 20000) updates.maxUserMessageLength = body.maxUserMessageLength;
    if (typeof body.visitorMessageLimit === 'number' && body.visitorMessageLimit >= 0) updates.visitorMessageLimit = body.visitorMessageLimit;
    if (typeof body.userMessageLimit === 'number' && body.userMessageLimit >= 0) updates.userMessageLimit = body.userMessageLimit;
    if (typeof body.adminMessageLimit === 'number' && body.adminMessageLimit >= 0) updates.adminMessageLimit = body.adminMessageLimit;
    if (typeof body.messageLimitPeriodHours === 'number' && body.messageLimitPeriodHours > 0 && body.messageLimitPeriodHours <= 720) updates.messageLimitPeriodHours = body.messageLimitPeriodHours;
    const updated = await updateConfig(updates, auth.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/assistant/config error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
