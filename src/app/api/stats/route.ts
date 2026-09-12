export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalArticles, totalFormations, totalCertified, totalCategories, onlineCourses, totalStudents, totalAttestations] = await Promise.all([
      db.article.count({ where: { published: true } }),
      db.formation.count(),
      db.certification.count(),
      db.category.count(),
      db.onlineCourse.count({ where: { published: true } }),
      db.enrollment.count(),
      db.courseAttestation.count(),
    ]);

    return NextResponse.json({
      totalArticles,
      totalFormations,
      totalCertified,
      totalCategories,
      onlineCourses,
      totalStudents,
      totalAttestations,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}