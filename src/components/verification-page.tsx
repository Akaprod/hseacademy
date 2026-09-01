'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Search, CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react';

export default function VerificationPage() {
  const [certNo, setCertNo] = useState('');
  const [result, setResult] = useState<{
    found: boolean; message?: string;
    certification?: { certificateNo: string; type: string; fullName: string; programName: string; level: string; issuedDate: string; expirationDate: string | null; status: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!certNo.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch('/api/certifications/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateNo: certNo }),
      });
      const data = await res.json();
      setResult(data);
      setSearched(true);
    } catch {
      setResult({ found: false, message: 'Erreur serveur. Veuillez réessayer.' });
      setSearched(true);
    }
    setLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    valid: { label: 'Valide', icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    expired: { label: 'Expiré', icon: <AlertTriangle className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    revoked: { label: 'Révoqué', icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-50 border-red-200' },
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Vérification de Diplômes et Attestations</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">
            Vérifiez l&apos;authenticité d&apos;un diplôme ou d&apos;une attestation délivré(e) par l&apos;Institut International des Compétences Professionnelles (IICP).
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
                <h2 className="font-bold text-lg text-slate-900">Vérifier un document</h2>
                <p className="text-sm text-slate-500">Entrez le numéro figurant sur votre document</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ex: IICP-2024-LIC-001"
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value.toUpperCase())}
                  className="pl-10 font-mono text-sm uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <Button onClick={handleVerify} disabled={loading || !certNo.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shrink-0">
                {loading ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Exemples : IICP-2024-LIC-001, IICP-2024-MAI-001, IICP-2024-TEC-001
            </p>
          </CardContent>
        </Card>

        {/* Result */}
        {searched && result && (
          <div className="mt-8 animate-fade-in-up">
            {result.found && result.certification ? (
              <Card className="border-slate-200 shadow-lg overflow-hidden">
                <div className={`p-4 flex items-center gap-3 ${statusConfig[result.certification.status]?.color || ''}`}>
                  {statusConfig[result.certification.status]?.icon}
                  <div>
                    <div className="font-bold">{statusConfig[result.certification.status]?.label}</div>
                    <div className="text-sm opacity-80">
                      {result.certification.status === 'valid' ? 'Ce document est authentique et en cours de validité.' :
                       result.certification.status === 'expired' ? 'Ce document a expiré.' : 'Ce document a été révoqué.'}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Numéro du document', value: result.certification.certificateNo },
                      { label: 'Type', value: result.certification.type === 'diplome' ? 'Diplôme' : 'Attestation' },
                      { label: 'Nom complet', value: result.certification.fullName },
                      { label: 'Programme', value: result.certification.programName },
                      { label: 'Niveau', value: result.certification.level },
                      { label: 'Date de délivrance', value: formatDate(result.certification.issuedDate) },
                      ...(result.certification.expirationDate ? [{ label: 'Date d\'expiration', value: formatDate(result.certification.expirationDate) }] : []),
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                        <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-center">
                    <Badge variant="outline" className="text-xs text-slate-500">
                      Document vérifié le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} - IICP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <h3 className="font-bold text-red-800 text-lg mb-1">Document non trouvé</h3>
                  <p className="text-sm text-red-600">{result.message}</p>
                  <p className="text-xs text-red-400 mt-3">
                    Vérifiez que le numéro saisi correspond exactement à celui figurant sur le document.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}