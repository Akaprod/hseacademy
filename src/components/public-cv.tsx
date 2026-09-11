'use client';

// ============================================================================
// PublicCV — CV professionnel haut de gamme avec personnalisation
// ============================================================================
// 3 templates : Sidebar (épuré + colonne), Centered (pleine largeur), Split (2 colonnes)
// 5 palettes : Emerald, Ocean, Sunset, Royal, Mono
// Personnalisation : couleur principale, couleur accent, layout
// Espacement minimum : 0.5cm (~14pt) entre chaque bloc
//
// ARCHITECTURE (Sept 2026 — correction du bug "sections hors template"):
// - Chacune des 7 rubriques est exposée comme un sous-composant individuel
//   (ProfilProSection, ExperiencesSection, EducationSection, SkillsStructuredSection,
//    CertificationsSection, LanguagesSection, AdditionalInfoSection).
// - Chaque template décide OÙ placer chaque section dans sa propre grille.
// - Footer reste À L'EXTÉRIEUR du conteneur du template (signature CV).
// ============================================================================

import {
  Shield, Award, BookOpen, Calendar, Globe, Facebook, Linkedin, Twitter,
  ExternalLink, GraduationCap, CheckCircle2, Mail, Phone, MapPin, Briefcase,
} from 'lucide-react';

interface CVData {
  profile: {
    username: string;
    fullName: string;
    avatar?: string | null;
    cvTitle?: string | null;
    cvBio?: string | null;
    cvTemplate: string;
    cvColorPrimary?: string;
    cvColorAccent?: string;
    cvLayout?: string;
    skills: string[];
    experience: any[];
    // ===== 7 RUBRIQUES CV PROFESSIONNEL (Sept 2026) =====
    cvProfessionalProfile?: string | null;
    cvExperiences?: any[];
    cvEducation?: any[];
    cvSkillsStructured?: any[];
    cvCertifications?: any[];
    cvLanguages?: any[];
    cvAdditionalInfo?: any;
    cvVolunteer?: any[];
    // ===== CONTACT PROFESSIONNEL (Sept 2026) — autonome du compte user =====
    cvContactPhone?: string | null;
    cvContactEmail?: string | null;
    cvContactLocation?: string | null;
    // ===== ÂGE AUTOMATIQUE (Sept 2026) — calculé côté client à partir de birthDate =====
    birthDate?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    website?: string | null;
    memberSince: string;
  };
  enrollments: any[];
  attestations: any[];
}

// Palettes prédéfinies
const PALETTES: Record<string, { primary: string; accent: string; bg: string; light: string }> = {
  emerald: { primary: '#059669', accent: '#065f46', bg: '#f0fdf4', light: '#d1fae5' },
  ocean: { primary: '#0284c7', accent: '#0c4a6e', bg: '#f0f9ff', light: '#bae6fd' },
  sunset: { primary: '#ea580c', accent: '#9a3412', bg: '#fff7ed', light: '#fed7aa' },
  royal: { primary: '#7c3aed', accent: '#5b21b6', bg: '#f5f3ff', light: '#ddd6fe' },
  mono: { primary: '#334155', accent: '#0f172a', bg: '#f8fafc', light: '#e2e8f0' },
};

export default function PublicCV({ data }: { data: CVData }) {
  const { profile, enrollments, attestations } = data;

  // Résoudre les couleurs (personnalisées ou palette prédéfinie)
  const palette = PALETTES[profile.cvTemplate] || PALETTES.emerald;
  const primary = profile.cvColorPrimary || palette.primary;
  const accent = profile.cvColorAccent || palette.accent;
  const bg = palette.bg;
  const light = palette.light;

  const layout = profile.cvLayout || 'sidebar';

  if (layout === 'centered') {
    return <CenteredCV profile={profile} enrollments={enrollments} attestations={attestations} primary={primary} accent={accent} bg={bg} light={light} />;
  } else if (layout === 'split') {
    return <SplitCV profile={profile} enrollments={enrollments} attestations={attestations} primary={primary} accent={accent} bg={bg} light={light} />;
  }
  return <SidebarCV profile={profile} enrollments={enrollments} attestations={attestations} primary={primary} accent={accent} bg={bg} light={light} />;
}

// ============================================================================
// SHARED HELPERS
// ============================================================================
function formatDate(d: string) {
  if (!d) return '';
  const [m, y] = d.split('-');
  const months = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${months[parseInt(m)] || m} ${y}`;
}

// ----------------------------------------------------------------------------
// calculateAge : calcule l'âge actuel à partir d'une birthDate ISO string.
// Robuste : pas d'effet de timezone car on extrait uniquement YYYY, MM, DD
// (pas d'objet Date dont le parsing dépend de la TZ locale).
// Retourne null si la date est absente, invalide, ou non réaliste (>= 150 ans).
// Prend correctement en compte le mois + jour d'anniversaire.
// ----------------------------------------------------------------------------
function calculateAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const dateStr = birthDate.slice(0, 10); // "YYYY-MM-DD"
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const birthYear = parseInt(match[1], 10);
  const birthMonth = parseInt(match[2], 10);
  const birthDay = parseInt(match[3], 10);
  if (!birthYear || !birthMonth || !birthDay) return null;

  const now = new Date();
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;
  const nowDay = now.getUTCDate();

  let age = nowYear - birthYear;
  const hasHadBirthdayThisYear =
    nowMonth > birthMonth ||
    (nowMonth === birthMonth && nowDay >= birthDay);
  if (!hasHadBirthdayThisYear) age -= 1;

  if (age < 0 || age >= 150) return null;
  return age;
}

function SocialLinks({ profile, color }: { profile: any; color: string }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color }}><Linkedin className="h-5 w-5" /></a>}
      {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color }}><Facebook className="h-5 w-5" /></a>}
      {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color }}><Twitter className="h-5 w-5" /></a>}
      {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color }}><Globe className="h-5 w-5" /></a>}
    </div>
  );
}

function SkillsSection({ skills, primary, light }: { skills: string[]; primary: string; light: string }) {
  if (!skills.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>Compétences</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((s: string, i: number) => (
          <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: light, color: primary }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FormationsSection et AttestationsSection ont été SUPPRIMÉES le 09 Sept 2026.
// Raison : les inscriptions/progressions (enrollments) ne doivent PLUS apparaître
// dans le CV public — seulement les attestations réellement délivrées.
// Les attestations HSE Academy (CourseAttestation status: 'valid') sont
// désormais fusionnées dans CertificationsSection avec les certifications
// ajoutées manuellement par l'utilisateur.
// ============================================================================

// ----------------------------------------------------------------------------
// IdentityContacts — lignes Téléphone / Email / Localisation à afficher
// dans le BLOC IDENTITÉ de chaque template (à côté du Nom + Titre + Âge).
// Composant réutilisable avec variants de style selon le template appelant.
// Retourne null si tous les champs de contact sont vides (pas de bloc vide).
// ----------------------------------------------------------------------------
function IdentityContacts({ profile, variant = 'split', accent }: {
  profile: any;
  variant?: 'sidebar' | 'centered' | 'split';
  accent: string;
}) {
  const hasAny = profile.cvContactPhone || profile.cvContactEmail || profile.cvContactLocation;
  if (!hasAny) return null;

  const isSidebar = variant === 'sidebar';
  const isCentered = variant === 'centered';
  const iconClass = isSidebar ? 'h-4 w-4 opacity-70 shrink-0' : 'h-4 w-4 text-slate-400 shrink-0';
  const containerClass = isCentered
    ? 'flex justify-center gap-4 flex-wrap text-sm text-slate-600'
    : `space-y-1.5 text-sm ${isSidebar ? 'opacity-90' : 'text-slate-700'}`;
  const lineClass = isCentered ? 'flex items-center gap-1.5' : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      {profile.cvContactPhone && (
        <p className={lineClass}>
          <Phone className={iconClass} />
          <span>{profile.cvContactPhone}</span>
        </p>
      )}
      {profile.cvContactEmail && (
        <p className={lineClass}>
          <Mail className={iconClass} />
          <a
            href={`mailto:${profile.cvContactEmail}`}
            className="hover:underline"
            style={{ color: isSidebar ? '#fff' : accent }}
          >
            {profile.cvContactEmail}
          </a>
        </p>
      )}
      {profile.cvContactLocation && (
        <p className={lineClass}>
          <MapPin className={iconClass} />
          <span>{profile.cvContactLocation}</span>
        </p>
      )}
    </div>
  );
}

function Footer({ username }: { username: string }) {
  return (
    <div className="text-center text-xs text-slate-300 pt-6 pb-8">
      <a href={`https://hseacademy.online/@${username}`} className="hover:underline">hseacademy.online/@{username}</a>
      <span className="mx-2">•</span>
      <span>CV hébergé sur HSE Academy</span>
    </div>
  );
}

// ============================================================================
// 7 RUBRIQUES CV PROFESSIONNEL — sous-composants individuels
// Chacun retourne null si vide → invisible dans le template.
// ============================================================================

// 1. Profil professionnel (présentation détaillée) — SUPPRIMÉ (en doublon avec cvBio du Card parent)
// Le composant ProfilProSection a été retiré. Le champ DB cvProfessionalProfile
// reste conservé pour rétro-compatibilité (données déjà saisies non perdues).

// 2. Expériences professionnelles
// Prop `noBorderLeft` : quand true, supprime la ligne verticale (border-l-2) devant chaque
// expérience. Utilisé par les templates à 2 colonnes (SidebarCV, SplitCV) pour un rendu
// plus propre. Le template CenteredCV garde les lignes (effet timeline élégant en pleine largeur).
function ExperiencesSection({ profile, primary, accent, noBorderLeft = false }: { profile: any; primary: string; accent: string; noBorderLeft?: boolean }) {
  if (!profile.cvExperiences?.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
        <Briefcase className="h-5 w-5" /> Expériences professionnelles
      </h2>
      <div className="space-y-3">
        {profile.cvExperiences.map((exp: any, i: number) => (
          <div key={i} className={noBorderLeft ? 'pl-0' : 'border-l-2 pl-3'} style={noBorderLeft ? undefined : { borderColor: primary }}>
            <div className="flex items-baseline justify-between">
              <p className="font-medium text-slate-800">{exp.jobTitle}</p>
              <span className="text-xs text-slate-500">
                {formatDate(exp.startDate)} — {exp.current ? "Aujourd'hui" : formatDate(exp.endDate)}
              </span>
            </div>
            <p className="text-sm text-slate-600">{exp.company}{exp.location ? ` • ${exp.location}` : ''}{exp.contractType ? ` • ${exp.contractType}` : ''}</p>
            {exp.description && <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{exp.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Formation & Diplômes
// Prop `noBorderLeft` : même logique que ExperiencesSection.
function EducationSection({ profile, primary, accent, noBorderLeft = false }: { profile: any; primary: string; accent: string; noBorderLeft?: boolean }) {
  if (!profile.cvEducation?.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
        <GraduationCap className="h-5 w-5" /> Formation & Diplômes
      </h2>
      <div className="space-y-3">
        {profile.cvEducation.map((edu: any, i: number) => (
          <div key={i} className={noBorderLeft ? 'pl-0' : 'border-l-2 pl-3'} style={noBorderLeft ? undefined : { borderColor: primary }}>
            <div className="flex items-baseline justify-between">
              <p className="font-medium text-slate-800">{edu.degree}</p>
              <span className="text-xs text-slate-500">{edu.inProgress ? 'En cours' : formatDate(edu.graduationDate)}</span>
            </div>
            <p className="text-sm text-slate-600">{[edu.degreeType, edu.field].filter(Boolean).join(' — ')}</p>
            <p className="text-sm text-slate-500">{edu.institution}{edu.location ? ` • ${edu.location}` : ''}</p>
            {edu.description && <p className="text-sm text-slate-600 mt-1">{edu.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Compétences structurées (affichage "tags" avec niveau)
function SkillsStructuredSection({ profile, accent, primary, light, titleSize = 'text-lg' }:
  { profile: any; accent: string; primary: string; light: string; titleSize?: string }) {
  if (!profile.cvSkillsStructured?.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className={`${titleSize} font-bold mb-3`} style={{ color: accent }}>Compétences</h2>
      <div className="flex flex-wrap gap-2">
        {profile.cvSkillsStructured.map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: light }}>
            <span className="text-sm font-medium" style={{ color: accent }}>{s.name}</span>
            {s.level && <span className="text-xs" style={{ color: primary }}>{s.level}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Certifications & Attestations (fusion : certifications manuelles + attestations HSE Academy)
// Les attestations HSE Academy sont intégrées dans la même section que les
// certifications ajoutées manuellement par l'utilisateur, conformément à la
// demande du 09 Sept 2026 : ne pas créer de section "Formations HSE Academy"
// séparée, ne pas afficher les inscriptions/progressions (uniquement les
// attestations réellement délivrées = CourseAttestation avec status: 'valid').
// Les attestations HSE Academy portent un badge "HSE Academy" pour les distinguer.
function CertificationsSection({ profile, attestations, primary, accent, light }: {
  profile: any;
  attestations?: any[];
  primary: string;
  accent: string;
  light: string;
}) {
  const hasManual = profile.cvCertifications?.length > 0;
  const hasAttestations = attestations?.length > 0;
  if (!hasManual && !hasAttestations) return null;

  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
        <Award className="h-5 w-5" /> Certifications & Attestations
      </h2>
      <div className="space-y-2">
        {/* Certifications ajoutées manuellement par l'utilisateur */}
        {profile.cvCertifications?.map((c: any, i: number) => (
          <div key={`cert-${i}`} className="flex items-start justify-between p-2 rounded-lg" style={{ backgroundColor: light + '40' }}>
            <div>
              <p className="font-medium text-sm text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-500">{c.issuer} • {formatDate(c.date)}{c.number ? ` • ${c.number}` : ''}</p>
              {c.expiryDate && !c.noExpiry && <p className="text-xs text-slate-400">Expire: {formatDate(c.expiryDate)}</p>}
            </div>
            {c.verifyUrl && (
              <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: accent }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Vérifier
              </a>
            )}
          </div>
        ))}

        {/* Attestations HSE Academy réellement délivrées (CourseAttestation status: 'valid') */}
        {attestations?.map((a: any, i: number) => (
          <div key={`att-${i}`} className="flex items-start justify-between p-2 rounded-lg border" style={{ borderColor: primary + '30', backgroundColor: primary + '08' }}>
            <div>
              <p className="font-medium text-sm text-slate-800">
                {a.courseName}
                <span
                  className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wide"
                  style={{ backgroundColor: primary, color: '#fff' }}
                >
                  HSE Academy
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Score: {a.score}% • {new Date(a.issuedDate).toLocaleDateString('fr-FR')}
                {a.serialNumber ? ` • ${a.serialNumber}` : ''}
              </p>
            </div>
            {a.verifyUrl && (
              <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 font-medium hover:opacity-80" style={{ color: accent }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Vérifier
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Langues
function LanguagesSection({ profile, accent, light, titleSize = 'text-lg' }:
  { profile: any; accent: string; light: string; titleSize?: string }) {
  if (!profile.cvLanguages?.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className={`${titleSize} font-bold mb-3 flex items-center gap-2`} style={{ color: accent }}>
        <Globe className="h-5 w-5" /> Langues
      </h2>
      <div className="space-y-2">
        {profile.cvLanguages.map((l: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{l.language === 'Autre' ? l.languageOther : l.language}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: light, color: accent }}>{l.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. Informations complémentaires (permis, mobilité, bénévolat, intérêts)
function AdditionalInfoSection({ profile, accent, light, titleSize = 'text-lg' }:
  { profile: any; accent: string; light: string; titleSize?: string }) {
  const info = profile.cvAdditionalInfo;
  if (!info || typeof info !== 'object') return null;
  // Si l'objet est vide → on n'affiche rien
  const hasContent =
    (info.drivingLicenses?.length > 0) ||
    info.mobility ||
    info.availability ||
    info.professionalProjects ||
    (info.volunteerExperiences?.length > 0) ||
    (info.interests?.length > 0);
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className={`${titleSize} font-bold mb-3`} style={{ color: accent }}>Informations complémentaires</h2>
      <div className="space-y-2 text-sm">
        {info.drivingLicenses?.length > 0 && (
          <p className="text-slate-600"><strong className="text-slate-700">Permis:</strong> {info.drivingLicenses.join(', ')}</p>
        )}
        {info.mobility && (
          <p className="text-slate-600"><strong className="text-slate-700">Mobilité:</strong> {info.mobility}</p>
        )}
        {info.availability && (
          <p className="text-slate-600"><strong className="text-slate-700">Disponibilité:</strong> {info.availability}</p>
        )}
        {info.professionalProjects && (
          <p className="text-slate-600 whitespace-pre-line"><strong className="text-slate-700">Projets:</strong> {info.professionalProjects}</p>
        )}
        {info.volunteerExperiences?.length > 0 && (
          <div>
            <p className="text-slate-700 font-medium">Bénévolat:</p>
            {info.volunteerExperiences.map((v: any, i: number) => (
              <p key={i} className="text-slate-600 ml-3">• {v.role} — {v.organization} ({formatDate(v.startDate)} — {v.current ? "Aujourd'hui" : formatDate(v.endDate)})</p>
            ))}
          </div>
        )}
        {info.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <p className="text-slate-700 font-medium w-full">Centres d'intérêt:</p>
            {info.interests.map((int: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: light, color: accent }}>{int}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE 1 : SIDEBAR (colonne gauche foncée + contenu droite)
// Architecture d'intégration :
//   - Sidebar gauche (couleur accent foncée) :
//       • Compétences (skills legacy OU cvSkillsStructured si dispo)
//       • Langues
//       • Infos complémentaires (permis, mobilité, centres d'intérêt)
//   - Contenu droite :
//       • Profil professionnel (en tête du contenu)
//       • Expériences professionnelles
//       • Formation & Diplômes
//       • Formations HSE Academy (enrollments)
//       • Certifications & Attestations (cv)
//       • Attestations HSE Academy
// ============================================================================
function SidebarCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto bg-white shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-screen">
        {/* ====== Sidebar gauche ====== */}
        <div className="text-white p-8 space-y-6" style={{ backgroundColor: accent }}>
          {/* BLOC IDENTITÉ — Avatar + Nom + Titre + Âge + Contacts (regroupés visuellement) */}
          <div className="text-center space-y-3 pt-2">
            <div className="h-28 w-28 rounded-full mx-auto overflow-hidden border-4 flex items-center justify-center text-3xl font-bold" style={{ borderColor: primary, backgroundColor: primary + '30' }}>
              {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              {/* 1. NOM PRÉNOM */}
              <h1 className="text-xl font-bold">{profile.fullName}</h1>
              {/* 2. TITRE PROFESSIONNEL */}
              {profile.cvTitle && <p className="text-sm opacity-80 mt-1">{profile.cvTitle}</p>}
              {/* 3. ÂGE AUTOMATIQUE (calculé côté client à partir de birthDate) */}
              {calculateAge(profile.birthDate) !== null && (
                <p className="text-sm opacity-70 mt-0.5">{calculateAge(profile.birthDate)} ans</p>
              )}
              {/* 4. CONTACTS PROFESSIONNELS (autonomes du compte user) */}
              <div className="mt-3">
                <IdentityContacts profile={profile} variant="sidebar" accent={accent} />
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.cvBio && (
            <div className="pt-2" style={{ borderTop: `1px solid ${primary}40` }}>
              <p className="text-sm opacity-90 leading-relaxed">{profile.cvBio}</p>
            </div>
          )}

          {/* Membre depuis — SUPPRIMÉ (info non pertinente pour un CV professionnel) */}

          {/* Réseaux sociaux — affichés avec labels pour plus de lisibilité */}
          {(profile.linkedin || profile.facebook || profile.twitter || profile.website) && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Réseaux</p>
              <div className="space-y-2">
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100"><Linkedin className="h-4 w-4 shrink-0" /> LinkedIn</a>}
                {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100"><Facebook className="h-4 w-4 shrink-0" /> Facebook</a>}
                {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100"><Twitter className="h-4 w-4 shrink-0" /> Twitter / X</a>}
                {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100"><Globe className="h-4 w-4 shrink-0" /> Site web</a>}
              </div>
            </div>
          )}

          {/* Compétences — priorité aux structurées si présentes, sinon legacy */}
          {(profile.cvSkillsStructured?.length > 0 || profile.skills.length > 0) && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Compétences</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.cvSkillsStructured?.length > 0
                  ? profile.cvSkillsStructured.map((s: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: primary + '40' }}>
                      {s.name}{s.level ? ` · ${s.level}` : ''}
                    </span>
                  ))
                  : profile.skills.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: primary + '40' }}>{s}</span>
                  ))
                }
              </div>
            </div>
          )}

          {/* Langues — dans la sidebar (info secondaire du CV) */}
          {profile.cvLanguages?.length > 0 && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Langues
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.cvLanguages.map((l: any, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: primary + '40' }}>
                    {l.language === 'Autre' ? l.languageOther : l.language}{l.level ? ` · ${l.level}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Infos complémentaires — dans la sidebar (infos perso) */}
          {profile.cvAdditionalInfo && typeof profile.cvAdditionalInfo === 'object' &&
            (
              (profile.cvAdditionalInfo.drivingLicenses?.length > 0) ||
              profile.cvAdditionalInfo.mobility ||
              profile.cvAdditionalInfo.availability ||
              profile.cvAdditionalInfo.professionalProjects ||
              (profile.cvAdditionalInfo.interests?.length > 0) ||
              (profile.cvAdditionalInfo.volunteerExperiences?.length > 0)
            ) && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Informations</p>
              <div className="space-y-1 text-sm opacity-90">
                {profile.cvAdditionalInfo.drivingLicenses?.length > 0 && (
                  <p>Permis : {profile.cvAdditionalInfo.drivingLicenses.join(', ')}</p>
                )}
                {profile.cvAdditionalInfo.mobility && (
                  <p>Mobilité : {profile.cvAdditionalInfo.mobility}</p>
                )}
                {profile.cvAdditionalInfo.availability && (
                  <p>Disponibilité : {profile.cvAdditionalInfo.availability}</p>
                )}
                {profile.cvAdditionalInfo.interests?.length > 0 && (
                  <p>Centres d&apos;intérêt : {profile.cvAdditionalInfo.interests.join(', ')}</p>
                )}
                {profile.cvAdditionalInfo.volunteerExperiences?.length > 0 && (
                  <div>
                    <p className="font-medium">Bénévolat :</p>
                    {profile.cvAdditionalInfo.volunteerExperiences.map((v: any, i: number) => (
                      <p key={i} className="text-xs opacity-80">{v.role} — {v.organization}</p>
                    ))}
                  </div>
                )}
                {profile.cvAdditionalInfo.professionalProjects && (
                  <p className="whitespace-pre-line">Projets : {profile.cvAdditionalInfo.professionalProjects}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ====== Contenu droite ====== */}
        <div className="col-span-2 sidebar-cv-content p-8 space-y-6">
          {/* 1. Profil professionnel — SUPPRIMÉ (doublon avec Bio courte du Card parent) */}
          {/* Contact professionnel — intégré au bloc identité dans la sidebar gauche (IdentityContacts) */}

          {/* 2. Expériences professionnelles — noBorderLeft car template à 2 colonnes */}
          <ExperiencesSection profile={profile} primary={primary} accent={accent} noBorderLeft />

          {/* 3. Formation & Diplômes (cv) — noBorderLeft car template à 2 colonnes */}
          <EducationSection profile={profile} primary={primary} accent={accent} noBorderLeft />

          {/* 4. Certifications + Attestations HSE Academy (fusionnées dans la même section) */}
          <CertificationsSection profile={profile} attestations={attestations} primary={primary} accent={accent} light={light} />
        </div>
      </div>
      <Footer username={profile.username} />
    </div>
  );
}

// ============================================================================
// TEMPLATE 2 : CENTERED (pleine largeur, centré, élégant)
// Architecture d'intégration :
//   Toutes les sections s'enchaînent verticalement dans le conteneur centré,
//   AVANT la signature "Membre depuis".
//   Ordre logique d'un CV :
//     1. Profil professionnel (intro)
//     2. Expériences professionnelles
//     3. Formation & Diplômes (cv)
//     4. Compétences (structurées OU legacy)
//     5. Certifications (cv)
//     6. Langues
//     7. Infos complémentaires
//     8. Formations HSE Academy (enrollments) — savoir académique de la plateforme
//     9. Attestations HSE Academy — distinctions
//    10. Membre depuis (signature)
// ============================================================================
function CenteredCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto py-10 px-6">
        {/* BLOC IDENTITÉ — Avatar + Nom + Titre + Âge + Bio + Contacts + Réseaux (regroupés visuellement) */}
        <div className="text-center space-y-4 pb-8" style={{ marginBottom: '14pt', borderBottom: `2px solid ${primary}20` }}>
          <div className="h-32 w-32 rounded-full mx-auto overflow-hidden border-4 shadow-lg flex items-center justify-center text-4xl font-bold" style={{ borderColor: primary, color: primary, backgroundColor: light }}>
            {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            {/* 1. NOM PRÉNOM */}
            <h1 className="text-3xl font-bold" style={{ color: accent }}>{profile.fullName}</h1>
            {/* 2. TITRE PROFESSIONNEL */}
            {profile.cvTitle && <p className="text-lg mt-1" style={{ color: primary }}>{profile.cvTitle}</p>}
            {/* 3. ÂGE AUTOMATIQUE (calculé côté client à partir de birthDate) */}
            {calculateAge(profile.birthDate) !== null && (
              <p className="text-sm mt-1 text-slate-500">{calculateAge(profile.birthDate)} ans</p>
            )}
          </div>
          {/* 4. CONTACTS PROFESSIONNELS (autonomes du compte user) — centrés, sur une ligne si possible */}
          <IdentityContacts profile={profile} variant="centered" accent={accent} />
          {/* Bio */}
          {profile.cvBio && <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">{profile.cvBio}</p>}
          {/* Réseaux sociaux — avec labels pour plus de lisibilité */}
          <div className="flex justify-center gap-4 flex-wrap pt-2">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: primary }}><Linkedin className="h-5 w-5" /> LinkedIn</a>}
            {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: primary }}><Facebook className="h-5 w-5" /> Facebook</a>}
            {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: primary }}><Twitter className="h-5 w-5" /> Twitter / X</a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: primary }}><Globe className="h-5 w-5" /> Site web</a>}
          </div>
        </div>

        {/* 1. Profil professionnel — SUPPRIMÉ (doublon avec Bio courte) */}
        {/* Contact professionnel — intégré au bloc identité ci-dessus (IdentityContacts) */}

        {/* 2. Expériences */}
        <ExperiencesSection profile={profile} primary={primary} accent={accent} />

        {/* 3. Formation & Diplômes (cv) */}
        <EducationSection profile={profile} primary={primary} accent={accent} />

        {/* 4. Compétences — structurées prioritaires, fallback legacy */}
        {profile.cvSkillsStructured?.length > 0 ? (
          <SkillsStructuredSection profile={profile} accent={accent} primary={primary} light={light} />
        ) : (
          <SkillsSection skills={profile.skills} primary={primary} light={light} />
        )}

        {/* 5. Certifications + Attestations HSE Academy (fusionnées dans la même section) */}
        <CertificationsSection profile={profile} attestations={attestations} primary={primary} accent={accent} light={light} />

        {/* 6. Langues */}
        <LanguagesSection profile={profile} accent={accent} light={light} />

        {/* 7. Infos complémentaires */}
        <AdditionalInfoSection profile={profile} accent={accent} light={light} />

        {/* FormationsSection et AttestationsSection supprimées — les inscriptions
            non terminées ne s'affichent plus ; les attestations HSE Academy réellement
            délivrées sont fusionnées dans CertificationsSection ci-dessus */}

        {/* Membre depuis — SUPPRIMÉ (info non pertinente pour un CV professionnel) */}
      </div>
      <Footer username={profile.username} />
    </div>
  );
}

// ============================================================================
// TEMPLATE 3 : SPLIT (2 colonnes égales, moderne avec bandes colorées)
// Architecture d'intégration :
//   Colonne gauche (side info — compétences, profil, langues, infos perso) :
//     • Profil HSE Academy (membre depuis + réseaux)
//     • Compétences (structurées OU legacy)
//     • Langues
//     • Informations complémentaires
//   Colonne droite (corps professionnel — expériences, formations) :
//     • Profil professionnel (cv) — intro du corps
//     • Expériences professionnelles
//     • Formation & Diplômes (cv)
//     • Formations HSE Academy (enrollments)
//     • Certifications (cv)
//     • Attestations HSE Academy
// ============================================================================
function SplitCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto bg-white shadow-2xl overflow-hidden">
        {/* Header avec bande colorée */}
        <div className="h-3" style={{ backgroundColor: primary }} />
        <div className="p-8" style={{ paddingBottom: '14pt' }}>
          {/* BLOC IDENTITÉ — Avatar + Nom + Titre + Âge + Bio + Contacts (regroupés visuellement) */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold shrink-0" style={{ backgroundColor: light, color: primary }}>
              {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              {/* 1. NOM PRÉNOM */}
              <h1 className="text-2xl font-bold" style={{ color: accent }}>{profile.fullName}</h1>
              {/* 2. TITRE PROFESSIONNEL */}
              {profile.cvTitle && <p className="text-base mt-1" style={{ color: primary }}>{profile.cvTitle}</p>}
              {/* 3. ÂGE AUTOMATIQUE (calculé côté client à partir de birthDate) */}
              {calculateAge(profile.birthDate) !== null && (
                <p className="text-sm mt-1 text-slate-500">{calculateAge(profile.birthDate)} ans</p>
              )}
              {/* 4. CONTACTS PROFESSIONNELS (autonomes du compte user) — alignés à gauche, verticaux */}
              <div className="mt-3">
                <IdentityContacts profile={profile} variant="split" accent={accent} />
              </div>
              {/* Bio */}
              {profile.cvBio && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{profile.cvBio}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Linkedin className="h-5 w-5" /></a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Globe className="h-5 w-5" /></a>}
              {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Facebook className="h-5 w-5" /></a>}
            </div>
            {/* Note : les réseaux sociaux avec labels complets sont affichés dans la colonne gauche */}
          </div>
        </div>

        {/* 2 colonnes — ratio 40/60 pour donner plus d'espace au corps professionnel (droite)
            qui contient Expériences, Formation, Certifications (descriptions longues).
            La colonne gauche (Compétences, Langues, Infos) est plus courte visuellement.
            Utilise la classe CSS personnalisée .split-cv-grid (globals.css) car Tailwind v4
            ne génère pas correctement grid-cols-[2fr_3fr]. */}
        <div className="grid grid-cols-1 split-cv-grid gap-0">
          {/* ====== Colonne gauche — side info ====== */}
          <div className="p-8 space-y-6" style={{ borderRight: `1px solid ${light}` }}>
            {/* Compétences — structurées prioritaires, fallback legacy */}
            {profile.cvSkillsStructured?.length > 0 ? (
              <SkillsStructuredSection profile={profile} accent={accent} primary={primary} light={light} />
            ) : (
              <SkillsSection skills={profile.skills} primary={primary} light={light} />
            )}

            {/* Profil HSE Academy — SUPPRIMÉ (info "Membre depuis" non pertinente pour un CV professionnel) */}

            {/* Réseaux sociaux — affichés avec labels dans la colonne side info */}
            {(profile.linkedin || profile.facebook || profile.twitter || profile.website) && (
              <div style={{ marginBottom: '14pt' }}>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>Réseaux</h2>
                <div className="space-y-2 text-sm text-slate-600">
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70" style={{ color: primary }}><Linkedin className="h-4 w-4 shrink-0" /> LinkedIn</a>}
                  {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70" style={{ color: primary }}><Facebook className="h-4 w-4 shrink-0" /> Facebook</a>}
                  {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70" style={{ color: primary }}><Twitter className="h-4 w-4 shrink-0" /> Twitter / X</a>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70" style={{ color: primary }}><Globe className="h-4 w-4 shrink-0" /> Site web</a>}
                </div>
              </div>
            )}

            {/* Contact professionnel — supprimé de la colonne gauche, désormais intégré
                au bloc identité dans le header (IdentityContacts variant="split") */}

            {/* Langues */}
            <LanguagesSection profile={profile} accent={accent} light={light} />

            {/* Informations complémentaires */}
            <AdditionalInfoSection profile={profile} accent={accent} light={light} />
          </div>

          {/* ====== Colonne droite — corps professionnel ====== */}
          <div className="p-8 space-y-6">
            {/* Profil professionnel — SUPPRIMÉ (doublon avec Bio courte) */}
            {/* Expériences professionnelles — noBorderLeft car template à 2 colonnes */}
            <ExperiencesSection profile={profile} primary={primary} accent={accent} noBorderLeft />

            {/* Formation & Diplômes (cv) — noBorderLeft car template à 2 colonnes */}
            <EducationSection profile={profile} primary={primary} accent={accent} noBorderLeft />

            {/* FormationsSection supprimée — les inscriptions/progressions ne s'affichent plus
                dans le CV public (uniquement les attestations réellement délivrées, fusionnées
                dans CertificationsSection ci-dessous) */}

            {/* Certifications (manuelles) + Attestations HSE Academy (status: 'valid') — fusionnées */}
            <CertificationsSection profile={profile} attestations={attestations} primary={primary} accent={accent} light={light} />

            {/* AttestationsSection supprimée — fusionnée dans CertificationsSection ci-dessus */}
          </div>
        </div>
      </div>
      <Footer username={profile.username} />
    </div>
  );
}
