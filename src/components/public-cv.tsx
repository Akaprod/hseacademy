'use client';

// ============================================================================
// PublicCV — CV professionnel haut de gamme avec personnalisation
// ============================================================================
// 3 templates : Sidebar (épuré + colonne), Centered (pleine largeur), Split (2 colonnes)
// 5 palettes : Emerald, Ocean, Sunset, Royal, Mono
// Personnalisation : couleur principale, couleur accent, layout
// Espacement minimum : 0.5cm (~14pt) entre chaque bloc
// ============================================================================

import {
  Shield, Award, BookOpen, Calendar, Globe, Facebook, Linkedin, Twitter,
  ExternalLink, GraduationCap, CheckCircle2, Mail, Phone, MapPin,
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
// SHARED COMPONENTS
// ============================================================================
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

function FormationsSection({ enrollments, primary, light }: { enrollments: any[]; primary: string; light: string }) {
  if (!enrollments.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>Formations</h2>
      <div className="space-y-2">
        {enrollments.map((e: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: light + '40' }}>
            <div>
              <p className="font-medium text-slate-800">{e.courseTitle}</p>
              <p className="text-xs text-slate-500">{e.courseLevel} • {e.courseHours}</p>
            </div>
            <span className="text-xs font-medium" style={{ color: primary }}>{e.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttestationsSection({ attestations, primary, accent }: { attestations: any[]; primary: string; accent: string }) {
  if (!attestations.length) return null;
  return (
    <div style={{ marginBottom: '14pt' }}>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>Attestations certifiées</h2>
      <div className="space-y-2">
        {attestations.map((a: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primary + '30', backgroundColor: primary + '08' }}>
            <div>
              <p className="font-medium text-slate-800">{a.courseName}</p>
              <p className="text-xs text-slate-500">Score: {a.score}% • {new Date(a.issuedDate).toLocaleDateString('fr-FR')}</p>
            </div>
            <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: accent }}>
              <CheckCircle2 className="h-4 w-4" /> Vérifier
            </a>
          </div>
        ))}
      </div>
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
// TEMPLATE 1 : SIDEBAR (colonne gauche foncée + contenu droite)
// ============================================================================
function SidebarCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto bg-white shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-screen">
        {/* Sidebar gauche */}
        <div className="text-white p-8 space-y-6" style={{ backgroundColor: accent }}>
          {/* Avatar + Nom */}
          <div className="text-center space-y-3 pt-2">
            <div className="h-28 w-28 rounded-full mx-auto overflow-hidden border-4 flex items-center justify-center text-3xl font-bold" style={{ borderColor: primary, backgroundColor: primary + '30' }}>
              {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.fullName}</h1>
              {profile.cvTitle && <p className="text-sm opacity-80 mt-1">{profile.cvTitle}</p>}
            </div>
          </div>

          {/* Bio */}
          {profile.cvBio && (
            <div className="pt-2" style={{ borderTop: `1px solid ${primary}40` }}>
              <p className="text-sm opacity-90 leading-relaxed">{profile.cvBio}</p>
            </div>
          )}

          {/* Membre depuis */}
          <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
            <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Membre depuis</p>
            <p className="text-sm">{new Date(profile.memberSince).getFullYear()}</p>
          </div>

          {/* Réseaux sociaux */}
          {(profile.linkedin || profile.facebook || profile.twitter || profile.website) && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Réseaux</p>
              <div className="flex gap-3">
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><Linkedin className="h-5 w-5" /></a>}
                {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><Facebook className="h-5 w-5" /></a>}
                {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><Twitter className="h-5 w-5" /></a>}
                {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><Globe className="h-5 w-5" /></a>}
              </div>
            </div>
          )}

          {/* Compétences */}
          {profile.skills.length > 0 && (
            <div style={{ borderTop: `1px solid ${primary}40`, paddingTop: '14pt' }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Compétences</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: primary + '40' }}>{s}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Contenu droite */}
        <div className="col-span-2 p-8 space-y-6">
          {/* Formations */}
          {enrollments.length > 0 && (
            <div style={{ marginBottom: '14pt' }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
                <BookOpen className="h-5 w-5" /> Formations
              </h2>
              <div className="space-y-2">
                {enrollments.map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: light + '40' }}>
                    <div>
                      <p className="font-medium text-slate-800">{e.courseTitle}</p>
                      <p className="text-xs text-slate-500">{e.courseLevel} • {e.courseHours}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: primary }}>{e.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attestations */}
          {attestations.length > 0 && (
            <div style={{ marginBottom: '14pt' }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
                <Award className="h-5 w-5" /> Attestations certifiées
              </h2>
              <div className="space-y-2">
                {attestations.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primary + '30' }}>
                    <div>
                      <p className="font-medium text-slate-800">{a.courseName}</p>
                      <p className="text-xs text-slate-500">Score: {a.score}% • {new Date(a.issuedDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium hover:opacity-80" style={{ color: accent }}>
                      <CheckCircle2 className="h-4 w-4" /> Vérifier
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer username={profile.username} />
    </div>
  );
}

// ============================================================================
// TEMPLATE 2 : CENTERED (pleine largeur, centré, élégant)
// ============================================================================
function CenteredCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto py-10 px-6">
        {/* Header centré */}
        <div className="text-center space-y-4 pb-8" style={{ marginBottom: '14pt', borderBottom: `2px solid ${primary}20` }}>
          <div className="h-32 w-32 rounded-full mx-auto overflow-hidden border-4 shadow-lg flex items-center justify-center text-4xl font-bold" style={{ borderColor: primary, color: primary, backgroundColor: light }}>
            {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: accent }}>{profile.fullName}</h1>
            {profile.cvTitle && <p className="text-lg mt-1" style={{ color: primary }}>{profile.cvTitle}</p>}
          </div>
          {profile.cvBio && <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">{profile.cvBio}</p>}
          <div className="flex justify-center gap-4 pt-2">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Linkedin className="h-6 w-6" /></a>}
            {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Facebook className="h-6 w-6" /></a>}
            {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Twitter className="h-6 w-6" /></a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Globe className="h-6 w-6" /></a>}
          </div>
        </div>

        {/* Sections */}
        <SkillsSection skills={profile.skills} primary={primary} light={light} />
        <FormationsSection enrollments={enrollments} primary={primary} light={light} />
        <AttestationsSection attestations={attestations} primary={primary} accent={accent} />

        {/* Membre depuis */}
        <div className="text-center text-xs text-slate-400 pt-4" style={{ marginTop: '14pt' }}>
          Membre HSE Academy depuis {new Date(profile.memberSince).getFullYear()}
        </div>

        <Footer username={profile.username} />
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE 3 : SPLIT (2 colonnes égales, moderne avec bandes colorées)
// ============================================================================
function SplitCV({ profile, enrollments, attestations, primary, accent, bg, light }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto bg-white shadow-2xl overflow-hidden">
        {/* Header avec bande colorée */}
        <div className="h-3" style={{ backgroundColor: primary }} />
        <div className="p-8" style={{ paddingBottom: '14pt' }}>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold shrink-0" style={{ backgroundColor: light, color: primary }}>
              {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: accent }}>{profile.fullName}</h1>
              {profile.cvTitle && <p className="text-base mt-1" style={{ color: primary }}>{profile.cvTitle}</p>}
              {profile.cvBio && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{profile.cvBio}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Linkedin className="h-5 w-5" /></a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Globe className="h-5 w-5" /></a>}
              {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" style={{ color: primary }}><Facebook className="h-5 w-5" /></a>}
            </div>
          </div>
        </div>

        {/* 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Colonne gauche */}
          <div className="p-8 space-y-6" style={{ borderRight: `1px solid ${light}` }}>
            <SkillsSection skills={profile.skills} primary={primary} light={light} />
            <div style={{ marginBottom: '14pt' }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>Profil</h2>
              <div className="space-y-1 text-sm text-slate-600">
                <p>Membre HSE Academy depuis {new Date(profile.memberSince).getFullYear()}</p>
                {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70" style={{ color: primary }}><Twitter className="h-4 w-4" /> Twitter</a>}
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="p-8 space-y-6">
            <FormationsSection enrollments={enrollments} primary={primary} light={light} />
            <AttestationsSection attestations={attestations} primary={primary} accent={accent} />
          </div>
        </div>
      </div>
      <Footer username={profile.username} />
    </div>
  );
}
