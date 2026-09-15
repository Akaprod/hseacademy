import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateNo } = body;

    if (!certificateNo) {
      return NextResponse.json({ error: 'Numéro de certificat requis' }, { status: 400 });
    }

    const certification = await db.certification.findUnique({
      where: { certificateNo: certificateNo.toUpperCase().trim() },
    });

    if (!certification) {
      return NextResponse.json({
        found: false,
        message: 'Aucun certificat ou diplôme trouvé avec ce numéro.',
      });
    }

    return NextResponse.json({
      found: true,
      certification: {
        certificateNo: certification.certificateNo,
        type: certification.type,
        fullName: certification.fullName,
        programName: certification.programName,
        level: certification.level,
        issuedDate: certification.issuedDate,
        expirationDate: certification.expirationDate,
        status: certification.status,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}