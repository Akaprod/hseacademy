// ============================================================================
// Page publique /pages/[slug] — Rendu d'une fiche SEO HSE / QHSE
// ============================================================================
// - Charge la page depuis la base par slug (uniquement si published = true)
// - generateMetadata() produit le <title>, la meta description, Open Graph,
//   Twitter Card, robots et les mots-clés
// - Injecte le JSON-LD Article + FAQPage (si faqJson présent) pour les
//   rich snippets Google
// - Rendu du contenu Markdown (react-markdown + remark-gfm + rehype-raw)
// - 404 si page introuvable ou non publiée
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { db } from '@/lib/db';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  primaryKeyword: string | null;
  keywords: string | null;
  excerpt: string | null;
  coverImage: string | null;
  faqJson: string | null;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getPage(slug: string): Promise<PageRow | null> {
  const p = await db.page.findUnique({ where: { slug } });
  if (!p || !p.published) return null;
  return p as PageRow;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) {
    return {
      title: 'Page introuvable — HSE Academy',
      description: "Cette page n'existe pas ou n'est plus publiée.",
      robots: { index: false, follow: false },
    };
  }

  const title = page.metaTitle || page.title;
  const description = page.metaDescription || page.excerpt || `Découvrez ${page.title} — fiche HSE / QHSE publiée par HSE Academy.`;
  const url = `/pages/${page.slug}`;
  const keywordsList = [page.primaryKeyword, ...(page.keywords || '').split(',').map((k) => k.trim())]
    .filter(Boolean) as string[];

  return {
    title,
    description,
    keywords: keywordsList.length ? keywordsList : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      ...(page.coverImage ? { images: [{ url: page.coverImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(page.coverImage ? { images: [page.coverImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

// Construit le JSON-LD Article + FAQPage (si présent) pour le schema.org
function buildJsonLd(page: PageRow) {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt || undefined,
    author: { '@type': 'Organization', name: 'HSE Academy' },
    publisher: {
      '@type': 'Organization',
      name: 'HSE Academy',
      logo: { '@type': 'ImageObject', url: '/logo.png' },
    },
    datePublished: page.createdAt.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `/pages/${page.slug}` },
    ...(page.coverImage ? { image: [page.coverImage] } : {}),
    ...(page.primaryKeyword ? { keywords: page.primaryKeyword } : {}),
  };

  let faqLd: object | null = null;
  if (page.faqJson) {
    try {
      const parsed = JSON.parse(page.faqJson) as Array<{ q: string; a: string }>;
      if (Array.isArray(parsed) && parsed.length) {
        faqLd = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: parsed.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        };
      }
    } catch {
      // faqJson malformé — on l'ignore silencieusement côté rendu
    }
  }

  return { articleLd, faqLd };
}

export default async function PublicPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const { articleLd, faqLd } = buildJsonLd(page);

  // Liens internes : autres pages SEO publiées (max 6, hors page courante)
  const otherPages = await db.page.findMany({
    where: { published: true, slug: { not: page.slug } },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
    take: 6,
    select: { slug: true, title: true, primaryKeyword: true },
  });

  const keywordList = [page.primaryKeyword, ...(page.keywords || '').split(',').map((k) => k.trim())]
    .filter(Boolean) as string[];

  const faqItems: Array<{ q: string; a: string }> = (() => {
    if (!page.faqJson) return [];
    try {
      const parsed = JSON.parse(page.faqJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <article className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-emerald-700">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/pages" className="hover:text-emerald-700">Base de connaissances</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 truncate">{page.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Fiche HSE / QHSE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{page.title}</h1>
        {page.excerpt && (
          <p className="text-lg text-slate-600 leading-relaxed">{page.excerpt}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Contenu vérifié &mdash; HSE Academy
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Mis à jour le {page.updatedAt.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        {keywordList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {keywordList.map((k, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {k}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover image */}
      {page.coverImage && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full h-auto object-cover max-h-96"
            loading="eager"
          />
        </div>
      )}

      {/* Contenu Markdown
          — On supprime le premier H1 du markdown s'il existe, car on a déjà
          rendu le H1 dans le <header> ci-dessus (sinon on aurait 2 H1 en
          double, ce qui est mauvais pour le SEO). */}
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-8 sm:px-10 sm:py-12">
        <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:font-bold prose-h2:text-slate-900 prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:font-semibold prose-h3:text-slate-800 prose-p:leading-relaxed prose-a:text-emerald-700 prose-a:underline-offset-2 hover:prose-a:text-emerald-800 prose-strong:text-slate-900 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-emerald-300 prose-blockquote:bg-emerald-50/40 prose-blockquote:py-2 prose-blockquote:px-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {page.content.replace(/^#\s+.+\n?/, '')}
          </ReactMarkdown>
        </div>
      </div>

      {/* FAQ structurée (si faqJson) — également déjà rendue dans le Markdown
          ci-dessus, mais on l'affiche ici sous une forme plus lisible si les
          deux coexistent (l'admin peut choisir l'un ou l'autre). */}
      {faqItems.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">FAQ</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-800 mb-1">{item.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA formation */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Approfondir avec une formation HSE Academy</h2>
            <p className="text-sm text-emerald-800 mt-1">
              Si ce sujet vous intéresse professionnellement, découvrez les parcours diplômants QHSE
              de HSE Academy : Technicien QHSE, Licence Professionnelle, Master et VAE.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors"
          >
            Découvrir les formations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Maillage interne : autres fiches */}
      {otherPages.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Continuer dans la base de connaissances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherPages.map((p) => (
              <Link
                key={p.slug}
                href={`/pages/${p.slug}`}
                className="group flex items-start justify-between gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-all"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{p.title}</h3>
                  {p.primaryKeyword && (
                    <span className="text-xs text-emerald-600 mt-1 inline-block">{p.primaryKeyword}</span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div>
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les fiches HSE / QHSE
        </Link>
      </div>
    </article>
  );
}
