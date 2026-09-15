'use client';

// ============================================================================
// HSE Academy — Page de vérification publique des attestations
// ============================================================================
//
// Cette page est le point d'entrée public pour vérifier une attestation.
// L'utilisateur saisit un numéro de série (format HSEA-AAAA-XXXXXXXX).
// Au submit, on redirige vers /verify/[serialNumber] qui interroge l'API
// officielle /api/courses/attestations/verify et affiche le résultat.
//
// Ancien système : cette page utilisait l'API legacy /api/certifications/verify
// qui vérifiait l'ancien modèle Certification avec les anciens numéros.
// Le nouveau système utilise les numéros HSEA-AAAA-XXXXXXXX (AT-P5).
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileCheck, Search, Shield } from 'lucide-react';

export default function VerificationPage() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = serialNumber.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    // Rediriger vers la page de vérification officielle
    // /verify/[serialNumber] fera l'appel API et affichera le résultat
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Vérifier une attestation</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">
            Vérifiez l&apos;authenticité d&apos;une attestation délivrée par l&apos;Institut International des Compétences Professionnelles (IICP).
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900">Vérifier une attestation</h2>
                <p className="text-sm text-slate-500">Entrez le numéro de série figurant sur votre document</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="HSEA-2026-2V6LBJ8B"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  className="pl-10 font-mono text-sm uppercase"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !serialNumber.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shrink-0"
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </Button>
            </form>

            <p className="text-xs text-slate-400 mt-3">
              Exemple : <span className="font-mono">HSEA-2026-2V6LBJ8B</span>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Le numéro de série se trouve sur votre attestation officielle,
            sous le QR code de vérification.
          </p>
        </div>
      </div>
    </div>
  );
}
