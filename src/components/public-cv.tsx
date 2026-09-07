'use client';

// ============================================================================
// PublicCV — Composant de rendu du CV professionnel public
// ============================================================================
// 3 templates : modern, classic, minimal
// Affiche : nom, titre, bio, avatar, compétences, formations, attestations,
// réseaux sociaux, lien de vérification des attestations.
// ============================================================================

import {
  Shield, Award, BookOpen, Calendar, Globe, Facebook, Linkedin, Twitter,
  ExternalLink, GraduationCap, CheckCircle2,
} from 'lucide-react';

interface CVData {
  profile: {
    username: string;
    fullName: string;
    avatar?: string | null;
    cvTitle?: string | null;
    cvBio?: string | null;
    cvTemplate: string;
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

export default function PublicCV({ data }: { data: CVData }) {
  const { profile, enrollments, attestations } = data;
  const template = profile.cvTemplate || 'modern';

  if (template === 'classic') {
    return <ClassicCV profile={profile} enrollments={enrollments} attestations={attestations} />;
  } else if (template === 'minimal') {
    return <MinimalCV profile={profile} enrollments={enrollments} attestations={attestations} />;
  }
  return <ModernCV profile={profile} enrollments={enrollments} attestations={attestations} />;
}

// ============================================================================
// Template 1 : MODERNE (emerald, cards, shadows)
// ============================================================================
function ModernCV({ profile, enrollments, attestations }: { profile: any; enrollments: any[]; attestations: any[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600" />
          <div className="px-6 pb-6 -mt-16">
            <div className="flex items-end gap-4">
              <div className="h-28 w-28 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  profile.fullName?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div className="pb-2 flex-1">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                {profile.cvTitle && <p className="text-emerald-600 font-medium">{profile.cvTitle}</p>}
                <p className="text-xs text-slate-400 mt-1">Membre depuis {new Date(profile.memberSince).getFullYear()}</p>
              </div>
              <a href="https://hseacademy.online" className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 pb-2">
                <Shield className="h-3 w-3" /> HSE Academy
              </a>
            </div>
            {profile.cvBio && <p className="text-sm text-slate-600 mt-4 leading-relaxed">{profile.cvBio}</p>}
            {/* Social */}
            <div className="flex gap-3 mt-4">
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Linkedin className="h-5 w-5" /></a>}
              {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Facebook className="h-5 w-5" /></a>}
              {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800"><Twitter className="h-5 w-5" /></a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800"><Globe className="h-5 w-5" /></a>}
            </div>
          </div>
        </div>

        {/* Compétences */}
        {profile.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Formations */}
        {enrollments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" /> Formations</h2>
            <div className="space-y-3">
              {enrollments.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{e.courseTitle}</p>
                    <p className="text-xs text-slate-500">{e.courseHours || '—'} • {e.courseLevel}</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">{e.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attestations */}
        {attestations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-emerald-600" /> Attestations certifiées</h2>
            <div className="space-y-3">
              {attestations.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{a.courseName}</p>
                    <p className="text-xs text-slate-500">Score: {a.score}% • {new Date(a.issuedDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Vérifier
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-8">
          <p>CV hébergé sur <a href="https://hseacademy.online" className="text-emerald-600 hover:underline">hseacademy.online/@{profile.username}</a></p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Template 2 : CLASSIQUE (serif, sobre, colonne gauche)
// ============================================================================
function ClassicCV({ profile, enrollments, attestations }: { profile: any; enrollments: any[]; attestations: any[] }) {
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-0 rounded-lg overflow-hidden">
        {/* Colonne gauche */}
        <div className="bg-slate-800 text-white p-6 space-y-4">
          <div className="h-24 w-24 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold mx-auto overflow-hidden">
            {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-center">{profile.fullName}</h1>
            {profile.cvTitle && <p className="text-slate-400 text-center text-sm mt-1">{profile.cvTitle}</p>}
          </div>
          {profile.cvBio && <p className="text-sm text-slate-300 leading-relaxed">{profile.cvBio}</p>}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Contact</p>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white flex items-center gap-2"><Globe className="h-4 w-4" /> Site web</a>}
          </div>
          {profile.skills.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Compétences</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs">{s}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="col-span-2 p-6 space-y-6">
          {enrollments.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">Formations</h2>
              <div className="space-y-2">
                {enrollments.map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{e.courseTitle}</p>
                      <p className="text-xs text-slate-500">{e.courseLevel} • {e.courseHours}</p>
                    </div>
                    <span className="text-xs text-slate-400">{e.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {attestations.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">Attestations</h2>
              <div className="space-y-2">
                {attestations.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{a.courseName}</p>
                      <p className="text-xs text-slate-500">Score: {a.score}% • {new Date(a.issuedDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Vérifier
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs text-slate-400 pt-4 border-t border-slate-200">
            hseacademy.online/@{profile.username}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Template 3 : MINIMAL (blanc, centré, épuré)
// ============================================================================
function MinimalCV({ profile, enrollments, attestations }: { profile: any; enrollments: any[]; attestations: any[] }) {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 mx-auto overflow-hidden">
            {profile.avatar ? <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
          {profile.cvTitle && <p className="text-slate-500">{profile.cvTitle}</p>}
          {profile.cvBio && <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{profile.cvBio}</p>}
          <div className="flex justify-center gap-4 pt-2">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700"><Linkedin className="h-5 w-5" /></a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700"><Globe className="h-5 w-5" /></a>}
          </div>
        </div>

        {/* Compétences */}
        {profile.skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Compétences</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {profile.skills.map((s: string, i: number) => <span key={i} className="text-sm text-slate-600">{s}{i < profile.skills.length - 1 ? ' •' : ''}</span>)}
            </div>
          </div>
        )}

        {/* Formations */}
        {enrollments.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Formations</h2>
            <div className="space-y-1">
              {enrollments.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{e.courseTitle}</span>
                  <span className="text-slate-400">{e.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attestations */}
        {attestations.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Attestations</h2>
            <div className="space-y-2">
              {attestations.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-700">{a.courseName}</span>
                    <span className="text-slate-400 ml-2">• {a.score}%</span>
                  </div>
                  <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Vérifier
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-300 pt-4">
          hseacademy.online/@{profile.username}
        </div>
      </div>
    </div>
  );
}
