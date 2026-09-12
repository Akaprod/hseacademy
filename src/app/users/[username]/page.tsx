// ============================================================================
// Page publique CV — /users/[username]
// ============================================================================
// Accessible sans authentification. Affiche le CV professionnel de l'utilisateur.
// Si le profil est privé ou n'existe pas → page 404 personnalisée.
// ============================================================================
//
// L'URL publique est hseacademy.online/users/akaprod
// (le /@ username n'est pas compatible avec Next.js App Router car @ = parallel route)
// ============================================================================

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import PublicCV from '@/components/public-cv';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await db.userProfile.findUnique({
    where: { username },
    include: { user: { select: { name: true } } },
  });

  if (!profile || !profile.profilePublic) {
    return { title: 'Profil non trouvé — HSE Academy' };
  }

  const name = profile.fullName || profile.user.name;
  const title = profile.cvTitle || `${name} — HSE Academy`;

  return {
    title: `${title} — CV HSE Academy`,
    description: profile.cvBio || `CV professionnel de ${name} sur HSE Academy`,
    openGraph: {
      title: `${title} — HSE Academy`,
      description: profile.cvBio || `CV professionnel de ${name} sur HSE Academy`,
      url: `https://hseacademy.online/users/${username}`,
      siteName: 'HSE Academy',
      type: 'profile',
    },
  };
}

export default async function CVPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const profile = await db.userProfile.findUnique({
    where: { username },
    include: { user: { select: { id: true, name: true, createdAt: true, status: true } } },
  });

  if (!profile || !profile.profilePublic) {
    notFound();
  }

  // Masquer le CV public si le compte est désactivé ou bloqué
  if (profile.user.status === 'disabled' || profile.user.status === 'blocked') {
    notFound();
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

  // Parser les 7 nouvelles rubriques CV
  let cvExperiences: any[] = [];
  let cvEducation: any[] = [];
  let cvSkillsStructured: any[] = [];
  let cvCertifications: any[] = [];
  let cvLanguages: any[] = [];
  let cvAdditionalInfo: any = {};
  let cvVolunteer: any[] = [];
  try { cvExperiences = JSON.parse(profile.cvExperiences || '[]'); } catch {}
  try { cvEducation = JSON.parse(profile.cvEducation || '[]'); } catch {}
  try { cvSkillsStructured = JSON.parse(profile.cvSkillsStructured || '[]'); } catch {}
  try { cvCertifications = JSON.parse(profile.cvCertifications || '[]'); } catch {}
  try { cvLanguages = JSON.parse(profile.cvLanguages || '[]'); } catch {}
  try { cvAdditionalInfo = JSON.parse(profile.cvAdditionalInfo || '{}'); } catch {}
  try { cvVolunteer = JSON.parse(profile.cvVolunteer || '[]'); } catch {}

  const cvData = {
    profile: {
      username: profile.username,
      fullName: profile.fullName || profile.user.name,
      avatar: profile.avatar,
      cvTitle: profile.cvTitle,
      cvBio: profile.cvBio,
      cvTemplate: profile.cvTemplate,
      cvColorPrimary: profile.cvColorPrimary,
      cvColorAccent: profile.cvColorAccent,
      cvLayout: profile.cvLayout,
      skills,
      experience,
      cvProfessionalProfile: profile.cvProfessionalProfile,
      cvExperiences,
      cvEducation,
      cvSkillsStructured,
      cvCertifications,
      cvLanguages,
      cvAdditionalInfo,
      cvVolunteer,
      // ===== CONTACT PROFESSIONNEL (transmission au composant PublicCV pour IdentityContacts) =====
      cvContactPhone: profile.cvContactPhone,
      cvContactEmail: profile.cvContactEmail,
      cvContactLocation: profile.cvContactLocation,
      // ===== DATE DE NAISSANCE (transmission au composant PublicCV pour calculateAge) =====
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
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
  };

  return <PublicCV data={cvData} />;
}
