// ============================================================================
// Page publique /f/[slug] — Fiche SEO d'une formation HSE Academy
// ============================================================================
// - Lookup par slug OU seoSlug (l'admin peut personnaliser l'URL SEO)
// - 404 si introuvable ou archivée (jamais exposé au public)
// - generateMetadata() produit : title, description, keywords, canonical,
//   Open Graph (course), Twitter Card, robots (parsed from seoRobots)
// - Injecte le JSON-LD Course (avec hasCourseInstance + offers) pour Google
// - Pour les diplômantes avec degreeType : ajoute EducationalOccupationalCredential
// - Maillage interne : 3-4 formations similaires du même type en bas de page
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  ArrowLeft, ArrowRight, Clock, Target, GraduationCap, MapPin, Award,
  CheckCircle2, ChevronRight, Briefcase, ShieldCheck, Building2, Users,
  CalendarDays, FileCheck, Star,
} from 'lucide-react';

// Next.js 16 + Turbopack : utiliser `revalidate = 0` au lieu de `force-dynamic`
// (force-dynamic peut causer "getVaryParamsAccumulator is not a function")
export const revalidate = 0;
export const dynamicParams = true;

interface FormationRow {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  level: string;
  duration: string;
  durationHours: string | null;
  prerequisites: string | null;
  objectives: string;
  program: string;
  price: string | null;
  priceIndividual: string | null;
  priceGroup: string | null;
  priceEnterprise: string | null;
  mode: string;
  type: string;
  coverImage: string | null;
  featured: boolean;
  order: number;
  archived: boolean;
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  seoImage: string | null;
  seoSlug: string | null;
  seoRobots: string;
  seoCanonical: string | null;
  seoOgTitle: string | null;
  seoOgDescription: string | null;
  seoOgImage: string | null;
  // Diplômantes-specific
  careerOutcomes: string;
  degreeType: string | null;
  // Certifiantes-specific
  certificateValidity: string | null;
  certificatePrefix: string | null;
  mandatoryPrerequisites: string;
  targetAudience: string | null;
  certifyingBody: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function getFormation(slug: string): Promise<FormationRow | null> {
  // Lookup par slug OU seoSlug ; exclude archived
  const f = await db.formation.findFirst({
    where: {
      OR: [{ slug }, { seoSlug: slug }],
      archived: false,
    },
  });
  return f as FormationRow | null;
}

// ----------------------------------------------------------------------------
// Level + mode + category labels (en phase avec formations-page.tsx)
// ----------------------------------------------------------------------------
const levelLabels: Record<string, string> = {
  'diplome-qualifie': 'Diplôme Qualifié QHSE',
  'technicien': 'Technicien QHSE',
  'technicien-superieur': 'Technicien Supérieur QHSE',
  'licence': 'Licence Professionnelle QHSE',
  'master': 'Master Professionnel QHSE',
  'vae': 'VAE Expertise QHSE',
  // Catégories certifiantes (surcharge du champ level)
  'sauvetage': 'Sauvetage & Incendie',
  'habilitation': 'Habilitations & CACES',
  'prevention': 'Prévention des Risques',
  'management': 'Management & Instances',
};

const levelColors: Record<string, string> = {
  'diplome-qualifie': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'technicien': 'bg-sky-100 text-sky-700 border-sky-200',
  'technicien-superieur': 'bg-violet-100 text-violet-700 border-violet-200',
  'licence': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'master': 'bg-amber-100 text-amber-700 border-amber-200',
  'vae': 'bg-rose-100 text-rose-700 border-rose-200',
  'sauvetage': 'bg-red-100 text-red-700 border-red-200',
  'habilitation': 'bg-orange-100 text-orange-700 border-orange-200',
  'prevention': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'management': 'bg-teal-100 text-teal-700 border-teal-200',
};

const modeLabels: Record<string, string> = {
  'presentiel': 'Présentiel',
  'distance': 'À distance',
  'hybride': 'Hybride',
};

// ----------------------------------------------------------------------------
// generateMetadata — full SEO meta + OG + Twitter + robots
// ----------------------------------------------------------------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const formation = await getFormation(slug);

  if (!formation) {
    return {
      title: 'Formation introuvable — HSE Academy',
      description: "Cette formation n'existe pas ou n'est plus disponible.",
      robots: { index: false, follow: false },
    };
  }

  const publicSlug = formation.seoSlug || formation.slug;
  const title = formation.seoTitle || `${formation.title} — HSE Academy`;
  const description = formation.seoDescription || formation.shortDescription;
  const url = `/f/${publicSlug}`;
  const keywordsList = (formation.seoKeywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // Parse "index,follow" → { index: true, follow: true }
  const robotsRaw = (formation.seoRobots || 'index,follow').toLowerCase();
  const robots = {
    index: !robotsRaw.includes('noindex'),
    follow: !robotsRaw.includes('nofollow'),
  };

  // Image fallback chain: seoOgImage → seoImage → coverImage
  const ogImage = formation.seoOgImage || formation.seoImage || formation.coverImage;

  return {
    title,
    description,
    keywords: keywordsList.length ? keywordsList : undefined,
    alternates: { canonical: formation.seoCanonical || url },
    openGraph: {
      title: formation.seoOgTitle || title,
      description: formation.seoOgDescription || description,
      url,
      type: 'website', // 'course' isn't standard OG type — falls back gracefully
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: formation.seoOgTitle || title,
      description: formation.seoOgDescription || description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots,
  };
}

// ----------------------------------------------------------------------------
// Construction du JSON-LD Course (schema.org)
// ----------------------------------------------------------------------------
function buildCourseJsonLd(f: FormationRow) {
  const publicSlug = f.seoSlug || f.slug;
  const title = f.seoTitle || f.title;
  const description = f.seoDescription || f.shortDescription;

  // Map mode → schema.org courseMode
  const courseModeMap: Record<string, string> = {
    'presentiel': 'https://schema.org/OnsiteEvent',
    'distance': 'https://schema.org/OnlineEventMode',
    'hybride': 'https://schema.org/MixedEventMode',
  };
  const courseMode = courseModeMap[f.mode] || 'https://schema.org/OnsiteEvent';

  // Course instance
  const hasCourseInstance = [{
    '@type': 'CourseInstance',
    courseMode,
    courseWorkload: f.durationHours ? `PT${f.durationHours.replace(/[^0-9]/g, '')}H` : undefined,
    inLanguage: 'fr-FR',
  }];

  // Offers — pour les diplomantes, un seul prix ; pour les certifiantes, 3 offres
  const offers: object[] = [];
  if (f.type === 'certifiante') {
    if (f.priceIndividual) {
      const p = parseFloat(f.priceIndividual);
      if (!isNaN(p)) {
        offers.push({
          '@type': 'Offer',
          name: 'Tarif individuel',
          price: p,
          priceCurrency: 'MAD',
          category: 'Education',
        });
      }
    }
    if (f.priceGroup) {
      const p = parseFloat(f.priceGroup);
      if (!isNaN(p)) {
        offers.push({
          '@type': 'Offer',
          name: 'Tarif groupe',
          price: p,
          priceCurrency: 'MAD',
          category: 'Education',
        });
      }
    }
    if (f.priceEnterprise) {
      const p = parseFloat(f.priceEnterprise);
      if (!isNaN(p)) {
        offers.push({
          '@type': 'Offer',
          name: 'Tarif entreprise',
          price: p,
          priceCurrency: 'MAD',
          category: 'Education',
        });
      }
    }
  } else {
    // Diplômante — prix unique
    if (f.price) {
      const p = parseFloat(f.price);
      if (!isNaN(p)) {
        offers.push({
          '@type': 'Offer',
          price: p,
          priceCurrency: 'MAD',
          category: 'Education',
        });
      }
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description,
    provider: {
      '@type': 'Organization',
      name: 'HSE Academy',
      sameAs: 'https://hseacademy.online',
    },
    hasCourseInstance,
    ...(offers.length > 0 ? { offers } : {}),
    inLanguage: 'fr-FR',
  };
}

// EducationalOccupationalCredential (pour diplômantes avec degreeType)
function buildCredentialJsonLd(f: FormationRow) {
  if (f.type !== 'diplomante' || !f.degreeType) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: f.degreeType,
    credentialCategory: 'qualification',
    recognizedBy: {
      '@type': 'Organization',
      name: 'HSE Academy',
    },
  };
}

// ----------------------------------------------------------------------------
// Helpers parsing
// ----------------------------------------------------------------------------
function parseArray(jsonStr: string): string[] {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------------------
// Page component
// ----------------------------------------------------------------------------
export default async function FormationSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formation = await getFormation(slug);
  if (!formation) notFound();

  const publicSlug = formation.seoSlug || formation.slug;
  const objectives = parseArray(formation.objectives);
  const program = parseArray(formation.program);
  const careerOutcomes = parseArray(formation.careerOutcomes);
  const mandatoryPrerequisites = parseArray(formation.mandatoryPrerequisites);

  // Formations similaires (même type, non archivées, hors current)
  const similarFormations = await db.formation.findMany({
    where: {
      type: formation.type,
      archived: false,
      id: { not: formation.id },
    },
    orderBy: { order: 'asc' },
    take: 4,
    select: { id: true, slug: true, seoSlug: true, title: true, shortDescription: true, level: true },
  });

  const courseLd = buildCourseJsonLd(formation);
  const credentialLd = buildCredentialJsonLd(formation);

  // Image fallback pour la cover
  const coverImage = formation.seoImage || formation.coverImage;
  const isDiplomante = formation.type === 'diplomante';

  return (
    <article className="space-y-8">
      {/* JSON-LD scripts — toujours en premier dans le <article> */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }} />
      {credentialLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(credentialLd) }} />
      )}

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-emerald-700">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/" className="hover:text-emerald-700">Formations</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 truncate">{formation.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${levelColors[formation.level] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            <GraduationCap className="h-3.5 w-3.5" />
            {levelLabels[formation.level] || formation.level}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="h-3.5 w-3.5" />
            {formation.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            <MapPin className="h-3.5 w-3.5" />
            {modeLabels[formation.mode] || formation.mode}
          </span>
          {formation.featured && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <Star className="h-3.5 w-3.5" />
              À la une
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{formation.title}</h1>
        <p className="text-lg text-slate-600 leading-relaxed">{formation.shortDescription}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Formation certifiée &mdash; HSE Academy
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Mis à jour le {formation.updatedAt.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Cover image */}
      {coverImage && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={formation.title}
            className="w-full h-auto object-cover max-h-96"
            loading="eager"
          />
        </div>
      )}

      {/* Layout 2 colonnes : contenu principal + sidebar */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Main content */}
        <div className="space-y-8 min-w-0">
          {/* Présentation du programme */}
          {formation.fullDescription && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                Présentation du programme
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{formation.fullDescription}</p>
            </section>
          )}

          {/* Objectifs pédagogiques */}
          {objectives.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Objectifs pédagogiques
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{obj}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Programme détaillé */}
          {program.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Programme détaillé
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="space-y-2">
                  {program.map((p, i) => {
                    const isSubItem = p.startsWith('  -');
                    const label = p.replace(/^  -\s*/, '');
                    return (
                      <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isSubItem ? '' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isSubItem ? '' : i + 1}
                        </div>
                        <span className={`text-sm ${isSubItem ? 'text-slate-500 pl-4' : 'text-slate-700 font-medium'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Prérequis */}
          {formation.prerequisites && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Prérequis
              </h2>
              <p className="text-slate-600 leading-relaxed">{formation.prerequisites}</p>
            </section>
          )}

          {/* Type-specific section */}
          {isDiplomante ? (
            <>
              {/* Métiers accessibles (careerOutcomes) */}
              {careerOutcomes.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Débouchés professionnels
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {careerOutcomes.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <Briefcase className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-sm text-slate-700">{m}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* Type de diplôme */}
              {formation.degreeType && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Diplôme délivré
                  </h2>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 inline-block">
                    <p className="text-emerald-800 font-semibold">{formation.degreeType}</p>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* Validité du certificat */}
              {formation.certificateValidity && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    Validité du certificat
                  </h2>
                  <p className="text-slate-600">{formation.certificateValidity}</p>
                </section>
              )}
              {/* Public cible */}
              {formation.targetAudience && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Public cible
                  </h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{formation.targetAudience}</p>
                </section>
              )}
              {/* Organisme certificateur */}
              {formation.certifyingBody && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    Organisme certificateur
                  </h2>
                  <p className="text-slate-600">{formation.certifyingBody}</p>
                </section>
              )}
              {/* Prérequis obligatoires (mandatoryPrerequisites) */}
              {mandatoryPrerequisites.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Prérequis obligatoires
                  </h2>
                  <ul className="list-disc list-inside space-y-1.5">
                    {mandatoryPrerequisites.map((p, i) => (
                      <li key={i} className="text-slate-700 text-sm">{p}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sidebar — pricing card */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {isDiplomante ? (
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tarif</div>
                <div className="text-3xl font-extrabold text-slate-900">{formation.price || 'Sur demande'}</div>
                {formation.price && (
                  <div className="text-sm text-slate-500 mt-1">Frais de formation (MAD)</div>
                )}
              </div>
            ) : (
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tarifs</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-[10px] text-blue-500 font-semibold uppercase">Individuel</div>
                    <div className="text-sm font-bold text-blue-700 mt-1">{formation.priceIndividual || 'Sur demande'}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <div className="text-[10px] text-emerald-500 font-semibold uppercase">Groupe</div>
                    <div className="text-sm font-bold text-emerald-700 mt-1">{formation.priceGroup || 'Sur demande'}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2">
                    <div className="text-[10px] text-amber-500 font-semibold uppercase">Entreprise</div>
                    <div className="text-sm font-bold text-amber-700 mt-1">{formation.priceEnterprise || 'Sur demande'}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Durée</span>
                <span className="font-medium text-slate-900">{formation.duration}</span>
              </div>
              {formation.durationHours && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Heures</span>
                  <span className="font-medium text-slate-900">{formation.durationHours}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mode</span>
                <span className="font-medium text-slate-900">{modeLabels[formation.mode] || formation.mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Niveau</span>
                <span className="font-medium text-slate-900">{levelLabels[formation.level] || formation.level}</span>
              </div>
              {formation.prerequisites && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Prérequis</span>
                  <span className="font-medium text-slate-900 text-right max-w-[180px]">{formation.prerequisites}</span>
                </div>
              )}
            </div>
            <a
              href={`/?formation=${publicSlug}&tab=${formation.type}`}
              className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg text-center text-base transition-colors"
            >
              S'inscrire à cette formation
            </a>
            <a
              href="/"
              className="block w-full text-center text-sm text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Demander des informations
            </a>
          </div>
        </aside>
      </div>

      {/* Formations similaires — maillage interne SEO */}
      {similarFormations.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Formations similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {similarFormations.map((sf) => {
              const sfPublicSlug = sf.seoSlug || sf.slug;
              return (
                <Link
                  key={sf.id}
                  href={`/f/${sfPublicSlug}`}
                  className="group flex flex-col bg-white border border-slate-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                    {levelLabels[sf.level] || sf.level}
                  </span>
                  <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors text-sm mb-2 line-clamp-2">
                    {sf.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 flex-1">{sf.shortDescription}</p>
                  <div className="mt-3 flex items-center gap-1 text-emerald-700 text-xs font-medium">
                    En savoir plus
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Lien retour */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les formations
        </Link>
      </div>
    </article>
  );
}
