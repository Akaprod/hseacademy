'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [mode, setMode] = useState<'request' | 'reset' | 'success'>(token ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenReason, setTokenReason] = useState('');

  // If token is present, verify it
  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify-reset-token?token=${token}`)
        .then(res => res.json())
        .then(data => {
          setTokenValid(data.valid);
          if (!data.valid) {
            setTokenReason(data.reason || 'Token invalide');
            setMode('request');
          }
        })
        .catch(() => {
          setTokenValid(false);
          setTokenReason('Erreur de vérification');
          setMode('request');
        });
    }
  }, [token]);

  const handleRequest = async () => {
    if (!email) { toast.error('Veuillez saisir votre email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setMode('success');
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch { toast.error('Erreur serveur'); }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!password || !confirmPassword) { toast.error('Veuillez remplir tous les champs'); return; }
    if (password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Mot de passe réinitialisé avec succès');
        setMode('success');
        // Redirect to home after 2s
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch { toast.error('Erreur serveur'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">HSE Academy</h1>
          <p className="text-sm text-slate-500 mt-1">Institut International des Compétences Professionnelles QHSE</p>
        </div>

        {mode === 'request' && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Mot de passe oublié ?</h2>
            <p className="text-sm text-slate-600 mb-6">
              Saisissez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation valable 10 minutes.
            </p>
            {tokenValid === false && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{tokenReason}. Veuillez refaire une demande.</p>
              </div>
            )}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleRequest} disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </Button>
            <div className="text-center mt-4">
              <a href="/" className="text-sm text-slate-500 hover:underline">← Retour à l'accueil</a>
            </div>
          </>
        )}

        {mode === 'reset' && tokenValid === true && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Nouveau mot de passe</h2>
            <p className="text-sm text-slate-600 mb-6">
              Choisissez un nouveau mot de passe (minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial).
            </p>
            <div className="space-y-2 mb-4">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleReset} disabled={loading}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser mon mot de passe'}
            </Button>
          </>
        )}

        {mode === 'success' && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {token ? 'Mot de passe réinitialisé !' : 'Demande envoyée !'}
            </h2>
            <p className="text-sm text-slate-600">
              {token
                ? 'Vous allez être redirigé vers l\'accueil. Vous pouvez vous connecter avec votre nouveau mot de passe.'
                : 'Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception (et vos spams). Le lien est valable 10 minutes.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-slate-400">Chargement...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
