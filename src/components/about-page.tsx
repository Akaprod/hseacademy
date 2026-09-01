'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Target, Eye, Users, Award, BookOpen, CheckCircle2, GraduationCap, Globe, Lightbulb } from 'lucide-react';

interface Stats { totalArticles: number; totalFormations: number; totalCertified: number; totalCategories: number; }

export default function AboutPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">À Propos de l&apos;IICP</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">
            L&apos;Institut International des Compétences Professionnelles (IICP) - Votre partenaire de confiance pour les formations QHSE.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : stats && (
            [
              { icon: GraduationCap, value: stats.totalFormations, label: 'Programmes de formation', color: 'text-emerald-600' },
              { icon: Award, value: stats.totalCertified, label: 'Certifications délivrées', color: 'text-amber-600' },
              { icon: BookOpen, value: stats.totalArticles, label: 'Articles publiés', color: 'text-violet-600' },
              { icon: Users, value: '500+', label: 'Diplômés formés', color: 'text-sky-600' },
            ].map((s, i) => (
              <Card key={i} className="border-0 shadow-md text-center">
                <CardContent className="p-5">
                  <s.icon className={`h-7 w-7 mx-auto mb-2 ${s.color}`} />
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-slate-200">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Notre Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Notre mission est simple : proposer des formations de haute qualité en QHSE, en parfaite adéquation avec les standards internationaux, et en intégrant les dernières évolutions réglementaires et technologiques. Nous nous engageons à former des professionnels capables de répondre aux défis actuels et futurs de la qualité, de l&apos;hygiène, de la sécurité et de l&apos;environnement.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Notre Vision</h2>
              <p className="text-slate-600 leading-relaxed">
                Devenir l&apos;institut de référence en matière de formation QHSE au Maroc et en Afrique, reconnu pour l&apos;excellence de ses programmes, la qualité de ses formateurs et le succès professionnel de ses diplômés. Nous aspirons à contribuer activement à la création d&apos;une culture de la sécurité et de la qualité dans toutes les organisations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* President message */}
        <Card className="border-slate-200 mb-16 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 gradient-emerald p-8 md:p-10 flex flex-col justify-center text-white">
              <Shield className="h-10 w-10 mb-4 text-emerald-200" />
              <h2 className="text-2xl font-bold mb-2">Mot du Président</h2>
              <p className="text-emerald-100 text-sm">La vision qui guide notre engagement</p>
            </div>
            <div className="md:w-2/3 p-8 md:p-10">
              <p className="text-slate-600 leading-relaxed mb-4">
                &ldquo;Bienvenue à l&apos;Institut International des Compétences Professionnelles. Dans un monde où les enjeux de qualité, de santé, de sécurité et d&apos;environnement sont devenus des priorités stratégiques pour toutes les organisations, il est essentiel de disposer de professionnels qualifiés et compétents.&rdquo;
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                &ldquo;Notre institut a été fondé avec la conviction qu&apos;une formation de qualité est le meilleur investissement qu&apos;une personne ou une entreprise puisse faire. Nos programmes sont conçus avec soin pour répondre aux besoins réels du marché et aux exigences des normes internationales.&rdquo;
              </p>
              <p className="text-slate-600 leading-relaxed">
                &ldquo;Nous invitons tous ceux qui souhaitent développer leurs compétences en QHSE à nous rejoindre. Ensemble, construisons un avenir plus sûr et plus durable.&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="font-bold text-slate-900">Le Président de l&apos;IICP</div>
                <div className="text-sm text-slate-500">Institut International des Compétences Professionnelles</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Nos Valeurs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Excellence', desc: 'Nous visons l\'excellence dans tout ce que nous faisons, de la conception des formations à l\'accompagnement des étudiants.' },
              { icon: Users, title: 'Engagement', desc: 'Nous nous engageons auprès de nos étudiants et de nos partenaires avec professionnalisme et intégrité.' },
              { icon: Globe, title: 'International', desc: 'Nos programmes sont alignés sur les standards internationaux (ISO) pour une reconnaissance mondiale.' },
              { icon: Lightbulb, title: 'Innovation', desc: 'Nous intégrons les dernières avancées en matière de pédagogie et de technologies QHSE.' },
            ].map((v, i) => (
              <Card key={i} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Accreditations */}
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-6 text-slate-900">Normes et Référentiels</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['ISO 9001', 'ISO 14001', 'ISO 45001', 'OHSAS 18001', 'HACCP', 'SMQSE', 'RSE', 'Lean Management'].map((n) => (
                <Badge key={n} variant="outline" className="px-4 py-2 text-sm font-medium border-emerald-200 text-emerald-700 bg-white">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                  {n}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}