import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================================
// GET /api/public-profile/[username] — Récupère le profil public d'un utilisateur
// ============================================================================
// Route PUBLIQUE — aucune authentification.
// Ne renvoie QUE les informations publiques du CV.
// Si profilePublic = false → 404
// ============================================================================

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;

    const profile = await db.userProfile.findUnique({
      where: { username },
      include: {
        user: {
          select: { id: true, name: true, email: false, role: false, createdAt: true },
        },
      },
    });

    if (!profile || !profile.profilePublic) {
      return NextResponse.json({ error: 'Profil non trouvé ou privé' }, { status: 404 });
    }

    const [enrollments, attestations] = await Promise.all([
      db.enrollment.findMany({
        where: { userId: profile.userId, status: 'active' },
        include: {
          course: {
            select: { id: true, title: true, slug: true, icon: true, level: true, totalHours: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.courseAttestation.findMany({
        where: { userId: profile.userId, status: 'valid' },
        select: {
          id: true,
          courseName: true,
          overallScore: true,
          issuedDate: true,
          serialNumber: true,
        },
        orderBy: { issuedDate: 'desc' },
      }),
    ]);

    let skills: string[] = [];
    let experience: any[] = [];
    try { skills = JSON.parse(profile.cvSkills || '[]'); } catch {}
    try { experience = JSON.parse(profile.cvExperience || '[]'); } catch {}

    return NextResponse.json({
      profile: {
        username: profile.username,
        fullName: profile.fullName || profile.user.name,
        avatar: profile.avatar,
        cvTitle: profile.cvTitle,
        cvBio: profile.cvBio,
        cvTemplate: profile.cvTemplate,
        skills,
        experience,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        website: profile.website,
        memberSince: profile.user.createdAt,
      },
      enrollments: enrollments.map(e => ({
        id: e.id,
        courseTitle: e.course.title,
        courseSlug: e.course.slug,
        courseIcon: e.course.icon,
        courseLevel: e.course.level,
        courseHours: e.course.totalHours,
        progress: e.overallScore,
        status: e.status,
      })),
      attestations: attestations.map(a => ({
        id: a.id,
        courseName: a.courseName,
        score: a.overallScore,
        issuedDate: a.issuedDate,
        serialNumber: a.serialNumber,
        verifyUrl: `https://hseacademy.online/verify/${a.serialNumber}`,
      })),
    });
  } catch (error) {
    console.error('GET /api/public-profile error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
