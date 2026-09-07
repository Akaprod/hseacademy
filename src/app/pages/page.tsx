// ============================================================================
// Page publique /pages — Index de la base de connaissances HSE / QHSE
// ============================================================================
// Liste toutes les pages SEO publiées par l'admin. Maillage interne
// (hub page) pour crawler et internautes. Aucune authentification requise.
// ============================================================================

import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PagesIndex() {
  const pages = await db.page.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaDescription: true,
      primaryKeyword: true,
      keywords: true,
    },
  });

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Base de connaissances</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          Comprendre le HSE &amp; le QHSE : définitions, enjeux et prévention
        </h1>
        <p className="text-slate-600 leading-relaxed max-w-3xl">
          La base de connaissances HSE Academy rassemble des fiches pratiques et vérifiées sur
          l&apos;Hygiène, la Sécurité, l&apos;Environnement et la Qualité. Chaque page traite un sujet
          distinct, avec une intention de recherche claire, des références aux principes
          internationaux (OIT, ISO) et un contexte marocain lorsque cela est pertinent.
        </p>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Fiabilité prioritaire sur le SEO. Aucune information inventée.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Toutes les fiches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.length === 0 ? (
            <p className="text-slate-500 col-span-full">
              Aucune page publiée pour le moment. Revenez bientôt pour de nouvelles fiches HSE / QHSE.
            </p>
          ) : pages.map((p) => (
            <Link
              key={p.slug}
              href={`/pages/${p.slug}`}
              className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {p.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                {p.excerpt || p.metaDescription || '—'}
              </p>
              {p.primaryKeyword && (
                <div className="mt-3">
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.primaryKeyword}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
