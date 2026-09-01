'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap, Users, Award, BookOpen, ArrowRight, Shield, Star, ChevronRight,
  Target, Clock, CheckCircle2, FileCheck
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

interface Stats { totalArticles: number; totalFormations: number; totalCertified: number; totalCategories: number; }
interface Formation { id: string; title: string; slug: string; shortDescription: string; level: string; duration: string; durationHours?: string; mode: string; type?: string; priceIndividual?: string; priceGroup?: string; priceEnterprise?: string; }
interface Testimonial { id: string; name: string; role: string; company: string; content: string; rating: number; }
interface Article { id: string; title: string; slug: string; excerpt: string; category: { name: string; color: string }; viewCount: number; createdAt: string; }

const levelLabels: Record<string, string> = {
  'diplome-qualifie': 'Diplôme Qualifié',
  'technicien': 'Technicien',
  'technicien-superieur': 'Technicien Supérieur',
  'licence': 'Licence Professionnelle',
  'master': 'Master Professionnel',
  'vae': 'VAE',
  'certifiant': 'Certifiante',
};

const levelColors: Record<string, string> = {
  'diplome-qualifie': 'bg-cyan-100 text-cyan-700',
  'technicien': 'bg-sky-100 text-sky-700',
  'technicien-superieur': 'bg-violet-100 text-violet-700',
  'licence': 'bg-emerald-100 text-emerald-700',
  'master': 'bg-amber-100 text-amber-700',
  'vae': 'bg-rose-100 text-rose-700',
  'certifiant': 'bg-orange-100 text-orange-700',
};

export default function HomePage({ onNavigate }: HomePageProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [certFormations, setCertFormations] = useState<Formation[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sRes, fRes, tRes, aRes, cRes] = await Promise.all([
          fetch('/api/stats'), fetch('/api/formations?featured=true&type=diplomante&limit=6'),
          fetch('/api/testimonials?featured=true&limit=3'), fetch('/api/articles?featured=true&limit=3'),
          fetch('/api/formations?type=certifiante'),
        ]);
        const [sData, fData, tData, aData, cData] = await Promise.all([sRes.json(), fRes.json(), tRes.json(), aRes.json(), cRes.json()]);
        setStats(sData);
        setFormations(fData.formations || []);
        setCertFormations(cData.formations || []);
        setTestimonials(tData.testimonials || []);
        setArticles(aData.articles || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* HERO */}
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 mb-6 text-sm px-3 py-1">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              Formations Diplômantes QHSE
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
              Formez-vous aux métiers du{' '}
              <span className="text-emerald-300">Qualité, Hygiène, Sécurité & Environnement</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl leading-relaxed animate-fade-in-up stagger-2">
              L&apos;Institut International des Compétences Professionnelles (IICP) vous propose des formations diplômantes
              de haute qualité, en parfaite adéquation avec les standards internationaux.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-3">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8" onClick={() => onNavigate('formations')}>
                <GraduationCap className="h-5 w-5 mr-2" />
                Découvrir nos formations
              </Button>
              <Button size="lg" className="border-2 border-white/60 bg-transparent text-white hover:bg-white/15 hover:border-white px-8" onClick={() => onNavigate('verification')}>
                <FileCheck className="h-5 w-5 mr-2" />
                Vérifier un diplôme
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* STATS */}
      <section className="relative -mt-8 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, value: stats.totalArticles, label: 'Articles QHSE', color: 'text-emerald-600 bg-emerald-50' },
              { icon: GraduationCap, value: stats.totalFormations, label: 'Formations', color: 'text-amber-600 bg-amber-50' },
              { icon: Award, value: stats.totalCertified, label: 'Diplômés Certifiés', color: 'text-violet-600 bg-violet-50' },
              { icon: Users, value: stats.totalCategories, label: 'Domaines QHSE', color: 'text-sky-600 bg-sky-50' },
            ].map((s, i) => (
              <Card key={i} className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
                  <div className={`h-11 w-11 md:h-13 md:w-13 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs md:text-sm text-slate-500 font-medium">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* FORMATIONS */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Nos Programmes</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Formations Diplômantes QHSE</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Des programmes conçus pour former des professionnels compétents, opérationnels et certifiés aux standards internationaux.
            </p>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((f, i) => (
                <Card key={f.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${levelColors[f.level] || 'bg-slate-100 text-slate-700'} text-xs font-semibold`}>
                        {levelLabels[f.level] || f.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {f.duration}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{f.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" className="text-emerald-600 p-0 h-auto hover:text-emerald-700 font-medium" onClick={() => onNavigate('formations', { slug: f.slug })}>
                        En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Badge variant="outline" className="text-xs capitalize">{f.mode}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => onNavigate('formations', { tab: 'diplomante' })} className="text-emerald-600 border-emerald-300 hover:bg-emerald-50">
              Voir toutes les formations diplômantes <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FORMATIONS CERTIFIANTES */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-3">Certifications & Attestations</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Formations Certifiantes QHSE</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Des formations courtes et certifiantes pour les entreprises, les groupes et les particuliers. CACES, SST, habilitations et bien plus.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full border shadow-sm">
                <Users className="h-4 w-4 text-blue-500" /> <span className="font-medium">Individuel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full border shadow-sm">
                <Users className="h-4 w-4 text-emerald-500" /> <span className="font-medium">Groupe</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full border shadow-sm">
                <Shield className="h-4 w-4 text-amber-500" /> <span className="font-medium">Entreprise</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certFormations.slice(0, 6).map((f, i) => (
              <Card key={f.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className="bg-orange-100 text-orange-700 text-xs font-semibold">
                      <Award className="h-3 w-3 mr-1" /> Certifiante
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {f.durationHours || f.duration}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{f.shortDescription}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                      <div className="text-[10px] text-blue-600 font-medium mb-1">Individuel</div>
                      <div className="text-sm font-bold text-blue-700">{f.priceIndividual || '—'}</div>
                    </div>
                    <div className="text-center bg-emerald-50 rounded-lg p-2">
                      <div className="text-[10px] text-emerald-600 font-medium mb-1">Groupe</div>
                      <div className="text-sm font-bold text-emerald-700">{f.priceGroup || '—'}</div>
                    </div>
                    <div className="text-center bg-amber-50 rounded-lg p-2">
                      <div className="text-[10px] text-amber-600 font-medium mb-1">Entreprise</div>
                      <div className="text-sm font-bold text-amber-700">{f.priceEnterprise || 'Sur demande'}</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium p-0 h-auto" onClick={() => onNavigate('formations', { slug: f.slug })}>
                    Voir les détails <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => onNavigate('formations', { tab: 'certifiante' })} className="text-orange-600 border-orange-300 hover:bg-orange-50">
              Voir toutes les formations certifiantes <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* WHY IICP */}
      <section className="section-padding bg-slate-50 bg-pattern-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Pourquoi l&apos;IICP ?</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Une formation d&apos;excellence reconnue</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Certifications Internationales', desc: 'Nos formations sont alignées sur les normes ISO 9001, ISO 14001 et ISO 45001.' },
              { icon: Target, title: 'Pédagogie Pratique', desc: 'Cas réels, stages en entreprise et projets professionnels concrets.' },
              { icon: Users, title: 'Experts Formateurs', desc: 'Des professionnels actifs avec une expérience terrain significative.' },
              { icon: CheckCircle2, title: 'Diplômes Reconnus', desc: 'Des diplômes valorisés par les employeurs au Maroc et à l\'international.' },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Témoignages</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Ce que disent nos diplômés</h2>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={t.id} className="border-slate-200 hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-4">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.role}{t.company ? ` - ${t.company}` : ''}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Blog QHSE</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Derniers articles</h2>
            </div>
            <Button variant="outline" onClick={() => onNavigate('blog')} className="hidden sm:flex text-emerald-600 border-emerald-300 hover:bg-emerald-50">
              Tous les articles <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Card key={a.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200" onClick={() => onNavigate('blog', { slug: a.slug })}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="text-xs font-medium" style={{ backgroundColor: a.category.color + '20', color: a.category.color, borderColor: a.category.color + '40' }}>
                        {a.category.name}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{a.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" onClick={() => onNavigate('blog')} className="text-emerald-600 border-emerald-300">
              Tous les articles <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 gradient-emerald text-white overflow-hidden">
            <CardContent className="p-10 md:p-14">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-emerald-200" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à donner un nouvel élan à votre carrière ?</h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                Rejoignez l&apos;IICP et obtenez un diplôme reconnu en QHSE. Formations en présentiel, à distance ou en mode hybride.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8" onClick={() => onNavigate('contact')}>
                  Nous contacter
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8" onClick={() => onNavigate('formations')}>
                  Voir les programmes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}