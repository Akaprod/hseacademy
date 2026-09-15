'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Loader2,
  Award, User, BookOpen, Calendar, Percent, ArrowLeft, ExternalLink,
} from 'lucide-react';
import AttestationQR from '@/components/attestation-qr';

// ============================================================================
// AT-P4 : Page publique de vérification d'attestation.
// ============================================================================
//
// Route : /verify/[serialNumber]
//
// Publique : aucun cookie, aucun login, aucun rôle.
// Récupère le serialNumber depuis l'URL et appelle l'API AT-P1 comme source
// de vérité unique. NE DUPLIQUE PAS la logique DB / HMAC dans le frontend.
//
// États gérés :
//   - loading
//   - valid      ✓ ATTESTATION AUTHENTIQUE
//   - revoked    ⚠ ATTESTATION RÉVOQUÉE
//   - invalid    ✕ ATTESTATION INVALIDE  (signature mismatch)
//   - not_found  ✕ ATTESTATION INTROUVABLE
//   - error      ✕ Erreur réseau/serveur
// ============================================================================

type VerifyStatus = 'loading' | 'valid' | 'revoked' | 'invalid' | 'not_found' | 'error';

interface PublicAttestation {
  serialNumber: string;
  fullName: string;
  courseName: string;
  overallScore: number;
  issuedDate: string;
}

interface VerifyResponse {
  found: boolean;
  valid: boolean;
  status: 'valid' | 'revoked' | 'invalid' | 'not_found';
  attestation?: PublicAttestation;
  error?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function VerifyAttestationPage() {
  const params = useParams();
  const serialNumber = (params?.serialNumber as string) || '';

  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [attestation, setAttestation] = useState<PublicAttestation | null>(null);

  useEffect(() => {
    if (!serialNumber) {
      setStatus('not_found');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/courses/attestations/verify?serialNumber=${encodeURIComponent(serialNumber)}`,
          { cache: 'no-store' }
        );
        const data: VerifyResponse = await res.json();

        if (cancelled) return;

        // L'API retourne : valid | revoked | invalid | not_found
        if (data.status === 'valid' || data.status === 'revoked' || data.status === 'invalid') {
          setStatus(data.status);
          setAttestation(data.attestation || null);
        } else if (data.status === 'not_found' || !data.found) {
          setStatus('not_found');
        } else {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [serialNumber]);

  // ===========================================================================
  // RENDER : états communs (header + footer)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header institutionnel */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.svg" alt="HSE Academy" width={36} height={36} className="shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight">HSE Academy</div>
              <div className="text-[10px] text-slate-500 leading-tight font-medium">
                Institut International QHSE
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Shield className="h-4 w-4 text-emerald-600" />
            Vérification officielle
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {status === 'loading' && <LoadingState />}
        {status === 'valid' && attestation && (
          <ValidState attestation={attestation} />
        )}
        {status === 'revoked' && attestation && (
          <RevokedState attestation={attestation} />
        )}
        {status === 'revoked' && !attestation && (
          <RevokedStateMinimal serialNumber={serialNumber} />
        )}
        {status === 'invalid' && <InvalidState serialNumber={serialNumber} />}
        {status === 'not_found' && <NotFoundState serialNumber={serialNumber} />}
        {status === 'error' && <ErrorState />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HSE Academy — Institut International des Compétences Professionnelles QHSE
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Vérification officielle en ligne · hseacademy.online
          </p>
        </div>
      </footer>
    </div>
  );
}

// ===========================================================================
// ÉTAT : LOADING
// ===========================================================================
function LoadingState() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
      <Loader2 className="h-10 w-10 text-emerald-600 mx-auto mb-4 animate-spin" />
      <h2 className="text-base font-semibold text-slate-700 mb-1">
        Vérification en cours…
      </h2>
      <p className="text-sm text-slate-500">
        Interrogation de la base de données officielle
      </p>
    </div>
  );
}

// ===========================================================================
// ÉTAT : VALID ✓
// ===========================================================================
function ValidState({ attestation }: { attestation: PublicAttestation }) {
  return (
    <div className="space-y-6">
      {/* Card principale */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 overflow-hidden">
        {/* Bandeau vert */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ✓ Document authentique
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            Ce document a été vérifié et confirmé par HSE Academy
          </p>
        </div>

        {/* Données */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoField icon={<HashIcon />} label="Attestation N°" value={attestation.serialNumber} mono />
            <InfoField icon={<User className="h-4 w-4" />} label="Titulaire" value={attestation.fullName} />
            <InfoField icon={<BookOpen className="h-4 w-4" />} label="Formation" value={attestation.courseName} full />
            <InfoField icon={<Percent className="h-4 w-4" />} label="Score" value={`${attestation.overallScore}%`} />
            <InfoField icon={<Calendar className="h-4 w-4" />} label="Date de délivrance" value={formatDate(attestation.issuedDate)} />
            <InfoField
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Statut"
              value={<span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">VALIDE</span>}
            />
          </div>

          {/* QR + verify URL */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <AttestationQR serialNumber={attestation.serialNumber} />
            <div className="text-sm text-slate-600 sm:text-left text-center">
              <p className="font-medium text-slate-700">Vérification officielle</p>
              <p className="text-xs text-slate-500 mt-1">
                Scannez le QR code ou partagez l&apos;URL ci-dessous pour vérifier
                l&apos;authenticité de cette attestation à tout moment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lien retour */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

// ===========================================================================
// ÉTAT : REVOKED ⚠
// ===========================================================================
function RevokedState({ attestation }: { attestation: PublicAttestation }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ⚠ Document révoqué
        </h1>
        <p className="text-amber-100 text-sm mt-1">
          Cette attestation a été délivrée par l&apos;IICP mais n&apos;est plus considérée comme valide.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoField icon={<HashIcon />} label="Attestation N°" value={attestation.serialNumber} mono />
          <InfoField icon={<User className="h-4 w-4" />} label="Titulaire" value={attestation.fullName} />
          <InfoField icon={<BookOpen className="h-4 w-4" />} label="Formation" value={attestation.courseName} full />
          <InfoField icon={<Calendar className="h-4 w-4" />} label="Date de délivrance" value={formatDate(attestation.issuedDate)} />
          <InfoField
            icon={<ShieldAlert className="h-4 w-4" />}
            label="Statut"
            value={<span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">RÉVOQUÉE</span>}
          />
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong className="font-semibold">Attention :</strong> cette attestation
            n&apos;est plus valide. Toute utilisation à des fins professionnelles ou
            réglementaires est strictement interdite.
          </p>
        </div>
      </div>
    </div>
  );
}

function RevokedStateMinimal({ serialNumber }: { serialNumber: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ATTESTATION RÉVOQUÉE
        </h1>
        <p className="text-amber-100 text-sm mt-1">
          Cette attestation a été officiellement révoquée par HSE Academy
        </p>
      </div>
      <div className="p-6 sm:p-8">
        <InfoField icon={<HashIcon />} label="Numéro de série" value={serialNumber} mono />
      </div>
    </div>
  );
}

// ===========================================================================
// ÉTAT : INVALID ✕  (signature mismatch)
// ===========================================================================
function InvalidState({ serialNumber }: { serialNumber: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldX className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ✕ Document invalide
        </h1>
        <p className="text-red-100 text-sm mt-1">
          Le document ne correspond pas aux données officielles enregistrées
        </p>
      </div>
      <div className="p-6 sm:p-8">
        <InfoField icon={<HashIcon />} label="Numéro fourni" value={serialNumber} mono />
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong className="font-semibold">Document potentiellement falsifié.</strong>
            <br />
            Les données de ce document ne correspondent pas à la signature
            cryptographique officielle enregistrée dans notre base.
          </p>
          <p className="text-xs text-red-700 mt-3">
            Si vous êtes le titulaire légitime, contactez HSE Academy pour
            vérifier ce document.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ÉTAT : NOT FOUND ✕
// ===========================================================================
function NotFoundState({ serialNumber }: { serialNumber: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldX className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ✕ Document non trouvé
        </h1>
        <p className="text-slate-200 text-sm mt-1">
          Aucun document authentique ne correspond à ce numéro de série.
        </p>
      </div>
      <div className="p-6 sm:p-8">
        {serialNumber && (
          <InfoField icon={<HashIcon />} label="Numéro fourni" value={serialNumber} mono />
        )}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700">
            Le numéro <span className="font-mono font-semibold">{serialNumber || 'vide'}</span> ne correspond
            à aucune attestation officielle dans notre base de données.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Vérifiez le numéro inscrit sur votre document. Les numéros d&apos;attestation
            HSE Academy suivent le format <span className="font-mono">HSEA-AAAA-XXXXXXXX</span>.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ÉTAT : ERROR (réseau/serveur)
// ===========================================================================
function ErrorState() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldX className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ERREUR DE VÉRIFICATION
        </h1>
        <p className="text-slate-200 text-sm mt-1">
          Une erreur est survenue lors de la vérification
        </p>
      </div>
      <div className="p-6 sm:p-8">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700">
            Le service de vérification est temporairement indisponible ou la
            connexion a échoué.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Veuillez réessayer dans quelques instants. Si le problème persiste,
            contactez HSE Academy.
          </p>
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Réessayer la vérification
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// COMPOSANTS UTILITAIRES
// ===========================================================================
function InfoField({
  icon,
  label,
  value,
  mono = false,
  full = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <span className="text-emerald-600">{icon}</span>
        {label}
      </p>
      <p className={`text-sm font-semibold text-slate-900 break-words ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function HashIcon() {
  return <Award className="h-4 w-4" />;
}
