'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, Target, CheckCircle2, MapPin, Users, GraduationCap, ChevronRight, Briefcase, Flame, Shield, Zap, HardHat, Building2, Award, Heart, AlertTriangle, Factory, Star } from 'lucide-react';

interface FormationsPageProps {
  slug?: string;
  tab?: string;
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

interface Formation {
  id: string; title: string; slug: string; shortDescription: string; fullDescription: string;
  level: string; duration: string; durationHours?: string; prerequisites: string | null; objectives: string; program: string;
  price: string | null; priceIndividual?: string; priceGroup?: string; priceEnterprise?: string;
  mode: string; type: string; featured: boolean;
}

const levelLabels: Record<string, string> = {
  'diplome-qualifie': 'Diplôme Qualifié QHSE',
  'technicien': 'Technicien QHSE', 'technicien-superieur': 'Technicien Supérieur QHSE',
  'licence': 'Licence Professionnelle QHSE', 'master': 'Master Professionnel QHSE', 'vae': 'VAE Expertise QHSE',
  'Animateur': 'Animateur / Opérateur', 'Superviseur': 'Superviseur / Chef d\'équipe',
  'Responsable': 'Responsable QHSE', 'Manager': 'Manager / Directeur',
};
const levelColors: Record<string, string> = {
  'diplome-qualifie': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'technicien': 'bg-sky-100 text-sky-700 border-sky-200', 'technicien-superieur': 'bg-violet-100 text-violet-700 border-violet-200',
  'licence': 'bg-emerald-100 text-emerald-700 border-emerald-200', 'master': 'bg-amber-100 text-amber-700 border-amber-200',
  'vae': 'bg-rose-100 text-rose-700 border-rose-200',
  'Animateur': 'bg-blue-100 text-blue-700 border-blue-200', 'Superviseur': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Responsable': 'bg-teal-100 text-teal-700 border-teal-200', 'Manager': 'bg-orange-100 text-orange-700 border-orange-200',
};
const modeLabels: Record<string, string> = { 'presentiel': 'Présentiel', 'distance': 'À distance', 'hybride': 'Hybride' };

const certCategories = [
  { key: 'all', label: 'Toutes', icon: Shield },
  { key: 'sauvetage', label: 'Sauvetage & Incendie', icon: Flame },
  { key: 'habilitation', label: 'Habilitations & CACES', icon: Zap },
  { key: 'prevention', label: 'Prévention des Risques', icon: AlertTriangle },
  { key: 'management', label: 'Management & Instances', icon: Factory },
];

function getCertCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('sst') || t.includes('sauveteur') || t.includes('incendie') || t.includes('ssiap') || t.includes('intervention')) return 'sauvetage';
  if (t.includes('habilitation') || t.includes('caces') || t.includes('électrique')) return 'habilitation';
  if (t.includes('espace') || t.includes('chimiqu') || t.includes('prap') || t.includes('manutention') || t.includes('permis') || t.includes('conduite') || t.includes('hauteur')) return 'prevention';
  if (t.includes('amox') || t.includes('cse') || t.includes('cssct')) return 'management';
  return 'all';
}

const diplomaCategories = [
  { key: 'all', label: 'Tous les niveaux', icon: GraduationCap },
  { key: 'diplome-qualifie', label: 'Diplôme Qualifié', icon: HardHat },
  { key: 'technicien', label: 'Technicien', icon: Briefcase },
  { key: 'technicien-superieur', label: 'Technicien Supérieur', icon: Target },
  { key: 'licence', label: 'Licence Pro', icon: Award },
  { key: 'master', label: 'Master', icon: Star },
  { key: 'vae', label: 'VAE', icon: Heart },
];

export default function FormationsPage({ slug, tab, onNavigate }: FormationsPageProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selected, setSelected] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diplomante' | 'certifiante'>(
    (tab === 'certifiante' || tab === 'diplomante') ? tab as 'diplomante' | 'certifiante' : 'diplomante'
  );
  const [activeCategory, setActiveCategory] = useState('all');
  const isEnterprise = slug?.startsWith('__level__');
  const enterpriseLevel = isEnterprise ? slug?.replace('__level__', '') : null;
  const diplomaFormations = formations.filter(f => f.type === 'diplomante');
  const certFormations = formations.filter(f => f.type === 'certifiante');
  const filteredDiploma = activeCategory === 'all' ? diplomaFormations : diplomaFormations.filter(f => f.level === activeCategory);
  const filteredCert = activeCategory === 'all' ? certFormations : certFormations.filter(f => getCertCategory(f.title) === activeCategory);
  const activeFormations = activeTab === 'diplomante' ? filteredDiploma : filteredCert;

  useEffect(() => {
    async function fetchFormations() {
      try {
        const res = await fetch('/api/formations');
        const data = await res.json();
        setFormations(data.formations || []);
        if (slug && !isEnterprise) {
          const found = (data.formations || []).find((f: Formation) => f.slug === slug);
          if (found) {
            setSelected(found);
            setActiveTab(found.type as 'diplomante' | 'certifiante');
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchFormations();
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selected]);

  if (selected) {
    const objectives: string[] = JSON.parse(selected.objectives || '[]');
    const program: string[] = JSON.parse(selected.program || '[]');
    return (
      <div className="min-h-screen">
        {/* Hero */}
        <section className="gradient-hero text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-emerald-200 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour aux formations
            </button>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`${levelColors[selected.level] || ''} text-sm font-semibold px-3 py-1`}>
                {levelLabels[selected.level] || selected.level}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white text-sm">
                <Clock className="h-3.5 w-3.5 mr-1" />{selected.duration}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white text-sm capitalize">
                <MapPin className="h-3.5 w-3.5 mr-1" />{modeLabels[selected.mode] || selected.mode}
              </Badge>
              {selected.prerequisites && (
                <Badge variant="outline" className="border-white/30 text-white text-sm">
                  <Target className="h-3.5 w-3.5 mr-1" />Prérequis : {selected.prerequisites}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{selected.title}</h1>
            <p className="text-lg text-slate-200 max-w-3xl leading-relaxed">{selected.shortDescription}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-slate-900">Présentation du programme</h2>
                <p className="text-slate-600 leading-relaxed">{selected.fullDescription}</p>
              </div>

              {/* Objectives */}
              {objectives.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-600" />Objectifs pédagogiques
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program */}
              {program.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />Programme détaillé
                  </h2>
                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        {program.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {p.startsWith('  -') ? '' : i + 1}
                            </div>
                            <span className={`text-sm ${p.startsWith('  -') ? 'text-slate-500 pl-4' : 'text-slate-700 font-medium'}`}>
                              {p.replace(/^  -\s*/, '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-slate-200 sticky top-28">
                <CardContent className="p-6 space-y-4">
                  {selected.type === 'certifiante' ? (
                    <>
                      <div className="text-center pb-4 border-b border-slate-100">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tarifs</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-[10px] text-blue-500 font-semibold uppercase">Individuel</div>
                            <div className="text-base font-bold text-blue-700 mt-1">{selected.priceIndividual || 'Sur demande'}</div>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <div className="text-[10px] text-emerald-500 font-semibold uppercase">Groupe</div>
                            <div className="text-base font-bold text-emerald-700 mt-1">{selected.priceGroup || 'Sur demande'}</div>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3">
                            <div className="text-[10px] text-amber-500 font-semibold uppercase">Entreprise</div>
                            <div className="text-base font-bold text-amber-700 mt-1">{selected.priceEnterprise || 'Sur demande'}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center pb-4 border-b border-slate-100">
                      <div className="text-3xl font-extrabold text-slate-900">{selected.price || 'Sur demande'}</div>
                      <div className="text-sm text-slate-500 mt-1">Frais de formation</div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Durée</span>
                      <span className="font-medium text-slate-900">{selected.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Mode</span>
                      <span className="font-medium text-slate-900 capitalize">{modeLabels[selected.mode] || selected.mode}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Niveau</span>
                      <span className="font-medium text-slate-900">{levelLabels[selected.level] || selected.level}</span>
                    </div>
                    {selected.prerequisites && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Prérequis</span>
                        <span className="font-medium text-slate-900">{selected.prerequisites}</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base" onClick={() => onNavigate('contact')}>
                    Demander des informations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Nos Formations QHSE</h1>
          <p className="text-slate-200 max-w-2xl mx-auto mb-8">
            Des formations diplômantes et certifiantes, conçues pour répondre aux exigences des entreprises et aux standards internationaux.
          </p>
          {/* TABS */}
          <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1.5 gap-1">
            <button onClick={() => { setActiveTab('diplomante'); setActiveCategory('all'); }} className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'diplomante' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <GraduationCap className="h-4 w-4 inline mr-2" />Formations Diplômantes ({diplomaFormations.length})
            </button>
            <button onClick={() => { setActiveTab('certifiante'); setActiveCategory('all'); }} className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'certifiante' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <Award className="h-4 w-4 inline mr-2" />Formations Certifiantes ({certFormations.length})
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : activeTab === 'diplomante' ? (
          /* ═══ FORMATIONS DIPLOMANTES ═══ */
          <div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {diplomaCategories.map(cat => {
                const count = cat.key === 'all' ? diplomaFormations.length : diplomaFormations.filter(f => f.level === cat.key).length;
                if (count === 0 && cat.key !== 'all') return null;
                return (
                  <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeCategory === cat.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}>
                    <cat.icon className="h-3.5 w-3.5" />{cat.label} ({count})
                  </button>
                );
              })}
            </div>
            {filteredDiploma.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Aucune formation dans cette catégorie</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiploma.map((f, i) => (
              <Card key={f.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setSelected(f)}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`${levelColors[f.level] || ''} text-xs font-semibold`}>
                      {levelLabels[f.level] || f.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />{f.duration}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{f.shortDescription}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-sm font-semibold text-emerald-600">{f.price || 'Sur demande'}</span>
                    <span className="text-emerald-600 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                      Détails <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
            )}
          </div>
        ) : (
          /* ═══ FORMATIONS CERTIFIANTES ═══ */
          <div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {certCategories.map(cat => {
                const count = cat.key === 'all' ? certFormations.length : certFormations.filter(f => getCertCategory(f.title) === cat.key).length;
                if (count === 0 && cat.key !== 'all') return null;
                return (
                  <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeCategory === cat.key ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-700'}`}>
                    <cat.icon className="h-3.5 w-3.5" />{cat.label} ({count})
                  </button>
                );
              })}
            </div>
            {/* Info banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 mb-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Shield className="h-7 w-7" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold">Certifications & Attestations QHSE</h3>
                  <p className="text-white/80 text-sm mt-1">Formations disponibles en individuel, en groupe ou pour votre entreprise. Délivrance d'attestations et habilitations réglementaires.</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/80 text-white border-0"><Users className="h-3 w-3 mr-1" />Individuel</Badge>
                  <Badge className="bg-emerald-500/80 text-white border-0"><Users className="h-3 w-3 mr-1" />Groupe</Badge>
                  <Badge className="bg-white/20 text-white border-0"><Building2 className="h-3 w-3 mr-1" />Entreprise</Badge>
                </div>
              </div>
            </div>

            {filteredCert.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Aucune formation dans cette catégorie</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCert.map((f, i) => (
                <Card key={f.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelected(f)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className="bg-orange-100 text-orange-700 text-xs font-semibold">
                        <Award className="h-3 w-3 mr-1" />Certifiante
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />{f.durationHours || f.duration}
                      </Badge>
                      {f.featured && <Badge className="bg-amber-100 text-amber-700 text-xs"><Zap className="h-3 w-3 mr-0.5" />Populaire</Badge>}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{f.shortDescription}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center bg-blue-50 rounded-lg py-2 px-1">
                        <div className="text-[9px] text-blue-500 font-semibold">Individuel</div>
                        <div className="text-xs font-bold text-blue-700 mt-0.5">{f.priceIndividual || '—'}</div>
                      </div>
                      <div className="text-center bg-emerald-50 rounded-lg py-2 px-1">
                        <div className="text-[9px] text-emerald-500 font-semibold">Groupe</div>
                        <div className="text-xs font-bold text-emerald-700 mt-0.5">{f.priceGroup || '—'}</div>
                      </div>
                      <div className="text-center bg-amber-50 rounded-lg py-2 px-1">
                        <div className="text-[9px] text-amber-500 font-semibold">Entreprise</div>
                        <div className="text-xs font-bold text-amber-700 mt-0.5">{f.priceEnterprise || 'Sur demande'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{modeLabels[f.mode] || f.mode}</span>
                      <span className="text-orange-600 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                        Détails <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}