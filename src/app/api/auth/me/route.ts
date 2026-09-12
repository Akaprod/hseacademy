import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, avatar: true, bio: true,
    },
  });
  if (!user) {
    return NextResponse.json({ user: null });
  }
  // Inclure le profil
  const profile = await db.userProfile.findUnique({
    where: { userId: user.id },
    select: {
      fullName: true, fullNameValidated: true,
      emailVerified: true, phoneVerified: true,
      phoneNormalized: true, phoneCountry: true,
      avatar: true, birthDate: true, birthPlace: true,
      residence: true, address: true,
      facebook: true, linkedin: true, twitter: true, website: true,
    },
  });
  return NextResponse.json({ user: { ...user, profile } });
}
