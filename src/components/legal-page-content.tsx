'use client';

// ============================================================================
// LegalPageContent — composant réutilisable pour /refund, /privacy, /terms
// ============================================================================
//
// Charge depuis /api/legal-content?type=... :
//   - content : texte libre administé (Markdown simple ou texte)
//   - info    : infos juridiques structurées (raison sociale, ICE, RC, etc.)
//
// Règles :
//   - Si content est null : affiche un contenu générique structuré par défaut.
//     Ne JAMAIS inventer d'informations — les sections dépendant des infos
//     admin s'affichent uniquement si les champs sont présents.
//   - Aucun champ vide n'est jamais affiché comme une information réelle.
//   - Les valeurs "info" viennent du serveur filtrées (les champs vides ont
//     déjà été retirés par l'API).
// ============================================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

type LegalType = 'refund' | 'privacy' | 'terms';

interface LegalInfo {
  legalName?: string;
  commercialName?: string;
  representative?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  ice?: string;
  rc?: string;
  if?: string;
  authorizationRef?: string;
  authorityName?: string;
  cndpReceipt?: string;
}

interface LegalPageContentProps {
  type: LegalType;
  title: string;
  subtitle?: string;
  // Contenu par défaut (Markdown simple ou texte) affiché si l'admin n'a pas
  // encore renseigné le champ correspondant en DB.
  fallbackContent: string;
  // Sections structurées par défaut, qui utiliseront dynamiquement les infos
  // admin si elles sont présentes (et seront omises sinon).
  // Chaque item est render tel quel ; le composant ne modifie pas ces contenus.
  fallbackSections?: { heading: string; body: string }[];
}

// Convertit un texte simple en HTML basique : paragraphes (double-newline) +
// sauts de ligne simples. N'interprète pas de Markdown complet pour éviter
// toute injection ou d'éventuelles balises dangereuses — l'admin reste
// responsable du contenu qu'il colle dans le formulaire.
function renderSimpleText(text: string): React.ReactNode {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return paragraphs.map((para, i) => {
    const lines = para.split(/\n/);
    return (
      <p key={i} className="mb-4 leading-relaxed text-slate-700">
        {lines.map((line, j) => (
          <span key={j}>
            {line}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export default function LegalPageContent({
  type,
  title,
  subtitle,
  fallbackContent,
  fallbackSections,
}: LegalPageContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [info, setInfo] = useState<LegalInfo>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/legal-content?type=${type}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (cancelled) return;
        setContent(data.content || null);
        setInfo(data.info || {});
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [type]);

  // Affichage des informations établissement (uniquement si au moins un champ)
  const hasInfo = Object.keys(info).length > 0;

  const renderInfo = () => {
    if (!hasInfo) return null;
    return (
      <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-lg">
        <h3 className="text-sm font-semibold text-emerald-900 mb-3">
          Informations sur l&apos;établissement
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {info.legalName && (
            <div>
              <dt className="text-slate-500 inline">Raison sociale : </dt>
              <dd className="inline font-medium text-slate-800">{info.legalName}</dd>
            </div>
          )}
          {info.commercialName && (
            <div>
              <dt className="text-slate-500 inline">Nom commercial : </dt>
              <dd className="inline font-medium text-slate-800">{info.commercialName}</dd>
            </div>
          )}
          {info.representative && (
            <div>
              <dt className="text-slate-500 inline">Responsable : </dt>
              <dd className="inline font-medium text-slate-800">{info.representative}</dd>
            </div>
          )}
          {info.address && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500 inline">Adresse : </dt>
              <dd className="inline font-medium text-slate-800">
                {info.address}
                {info.city && `, ${info.city}`}
                {info.country && `, ${info.country}`}
              </dd>
            </div>
          )}
          {info.phone && (
            <div>
              <dt className="text-slate-500 inline">Téléphone : </dt>
              <dd className="inline font-medium text-slate-800">
                <a href={`tel:${info.phone}`} className="hover:text-emerald-700">{info.phone}</a>
              </dd>
            </div>
          )}
          {info.email && (
            <div>
              <dt className="text-slate-500 inline">Email : </dt>
              <dd className="inline font-medium text-slate-800">
                <a href={`mailto:${info.email}`} className="hover:text-emerald-700">{info.email}</a>
              </dd>
            </div>
          )}
          {info.website && (
            <div>
              <dt className="text-slate-500 inline">Site web : </dt>
              <dd className="inline font-medium text-slate-800">
                <a href={info.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">
                  {info.website}
                </a>
              </dd>
            </div>
          )}
          {info.ice && (
            <div>
              <dt className="text-slate-500 inline">ICE : </dt>
              <dd className="inline font-medium text-slate-800">{info.ice}</dd>
            </div>
          )}
          {info.rc && (
            <div>
              <dt className="text-slate-500 inline">RC : </dt>
              <dd className="inline font-medium text-slate-800">{info.rc}</dd>
            </div>
          )}
          {info.if && (
            <div>
              <dt className="text-slate-500 inline">IF : </dt>
              <dd className="inline font-medium text-slate-800">{info.if}</dd>
            </div>
          )}
          {info.authorizationRef && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500 inline">Autorisation : </dt>
              <dd className="inline font-medium text-slate-800">
                {info.authorizationRef}
                {info.authorityName && ` — ${info.authorityName}`}
              </dd>
            </div>
          )}
          {info.cndpReceipt && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500 inline">CNDP : </dt>
              <dd className="inline font-medium text-slate-800">{info.cndpReceipt}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Contenu temporairement indisponible</p>
          <p className="text-xs text-amber-700 mt-1">
            Veuillez réessayer ultérieurement. En cas de persistance, contactez l&apos;administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-emerald-900 mb-2">{title}</h1>
      {subtitle && <p className="text-slate-500 italic mb-8">{subtitle}</p>}

      {content ? (
        // Contenu administé — rendu tel quel (texte simple formaté en paragraphes)
        <div className="space-y-4">{renderSimpleText(content)}</div>
      ) : (
        // Contenu par défaut — utilisé tant que l'admin n'a pas renseigné le champ
        <>
          <div className="space-y-4">{renderSimpleText(fallbackContent)}</div>
          {fallbackSections && fallbackSections.length > 0 && (
            <div className="mt-8 space-y-6">
              {fallbackSections.map((section, i) => (
                <section key={i}>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{section.heading}</h2>
                  <div className="space-y-2">{renderSimpleText(section.body)}</div>
                </section>
              ))}
            </div>
          )}
          <div className="mt-6 p-4 bg-stone-100 border border-stone-200 rounded-lg text-sm text-slate-600">
            Cette page est présentée dans sa version standard. L&apos;établissement renseignera
            ultérieurement son contenu complet et personnalisé. Aucune information officielle
            ne peut être affichée tant qu&apos;elle n&apos;a pas été validée par l&apos;administration.
          </div>
        </>
      )}

      {renderInfo()}

      <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
        <p>
          Pour toute question relative à ce document, contactez l&apos;administration via la{' '}
          <Link href="/" className="text-emerald-700 hover:underline">page d&apos;accueil</Link>.
        </p>
      </div>
    </article>
  );
}
