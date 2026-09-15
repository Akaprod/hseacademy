'use client';

// ============================================================================
// Phase 3 — Payment UI Components
// ============================================================================
// Composants réutilisables pour l'affichage des paiements :
// - PaymentStatusBadge : badge coloré selon le statut
// - PaymentModal : modal de paiement (méthode + instructions + upload preuve)
// - PaymentInfo : bloc d'info prix + statut pour training-page
// ============================================================================

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CreditCard, FileCheck, Loader2, Upload, Banknote, Wallet, CheckCircle2,
  Clock, XCircle, AlertCircle, Award,
} from 'lucide-react';

// ============================================================================
// Constants (mirrored from src/lib/payment.ts for client-side display)
// ============================================================================
const COURSE_PRICE_MAD = 120;
const ATTESTATION_PRINT_PRICE_MAD = 190;
const PAYPAL_EMAIL = 'ouamrhar@gmail.com';
const WHATSAPP_NUMBER = '+212 728 986 565';

// ============================================================================
// PaymentStatusBadge
// ============================================================================
export function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    not_required: { label: 'Gratuit', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    pending: { label: 'Paiement requis', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-amber-100 text-amber-800 border-amber-200' },
    submitted: { label: 'Preuve envoyée', icon: <Clock className="h-3 w-3" />, className: 'bg-blue-100 text-blue-800 border-blue-200' },
    validated: { label: 'Payé', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { label: 'Refusé', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[status] || config.pending;
  return (
    <Badge variant="outline" className={`gap-1 ${c.className}`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ============================================================================
// PaymentModal — Modal de paiement cours (120 MAD)
// ============================================================================
interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  courseTitle: string;
  amount: number;
  onSuccess: (paymentMethod: string) => void;
}

interface WalletSuccessState {
  amount: number;
  newBalance: number;
}

export function PaymentModal({ open, onOpenChange, enrollmentId, courseTitle, amount, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState<WalletSuccessState | null>(null);
  const [proofSubmitted, setProofSubmitted] = useState<{ method: string } | null>(null);

  // Fetch wallet balance when user selects Wallet method
  const fetchWalletBalance = async () => {
    if (walletBalance !== null) return; // already fetched
    setWalletBalanceLoading(true);
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(typeof data.balance === 'number' ? data.balance : null);
      }
    } catch {
      // silent fail — wallet balance display is informational
    } finally {
      setWalletBalanceLoading(false);
    }
  };

  const handleMethodChange = (m: string) => {
    setMethod(m);
    if (m === 'wallet') {
      fetchWalletBalance();
    }
  };

  const handleSubmit = async () => {
    if (!method) {
      toast.error('Veuillez choisir un moyen de paiement');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('enrollmentId', enrollmentId);
      formData.append('method', method);
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      const res = await fetch('/api/courses/payments', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();

        if (method === 'wallet') {
          // WALLET = validation instantanée → afficher état de succès clair
          // avec le montant débité + le nouveau solde renvoyé par l'API.
          const newBalance = typeof data.walletBalance === 'number' ? data.walletBalance : 0;
          setWalletSuccess({ amount, newBalance });
          // Le toast.success est volontairement omis ici — l'état de succès
          // dans la modale remplace le toast générique.
        } else {
          // PAYPAL / VIREMENT = soumis, en attente de validation manuelle
          // → afficher état "preuve soumise" (pas "paiement reçu")
          setProofSubmitted({ method });
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
        toast.error(err.error || 'Erreur lors de l\'enregistrement');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessContinue = () => {
    // Fermer la modale ET déclencher le onSuccess avec la méthode utilisée
    // (le parent peut alors rafraîchir selectedCourse + déclencher attestation
    // si wallet validé).
    const m = method;
    // Reset state
    setWalletSuccess(null);
    setProofSubmitted(null);
    setMethod('');
    setProofFile(null);
    setWalletBalance(null);
    onOpenChange(false);
    onSuccess(m);
  };

  // === État de succès Wallet (validation instantanée) ===
  if (walletSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Paiement reçu avec succès</DialogTitle>
            <DialogDescription>
              Votre paiement Wallet a été validé instantanément.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-center space-y-2">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <p className="font-bold text-emerald-800 text-lg">
                Paiement reçu avec succès
              </p>
              <p className="text-emerald-700 text-sm">
                <span className="font-bold">{walletSuccess.amount} MAD</span> ont été débités de votre Wallet.
              </p>
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="text-xs text-emerald-600 uppercase tracking-wide">Nouveau solde</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  {walletSuccess.newBalance.toLocaleString('fr-MA')} MAD
                </p>
              </div>
              <p className="text-emerald-700 text-xs mt-3 italic">
                Merci de votre confiance.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <p className="font-semibold mb-1">Prochaine étape</p>
              <p>Votre attestation numérique va être générée automatiquement.</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSuccessContinue} className="w-full">
              <Award className="h-4 w-4 mr-2" /> Voir mon attestation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // === État "preuve soumise" pour PayPal / Virement (validation manuelle) ===
  if (proofSubmitted) {
    const methodLabel = proofSubmitted.method === 'paypal' ? 'PayPal' : 'Virement bancaire';
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preuve de paiement envoyée</DialogTitle>
            <DialogDescription>
              Votre paiement est en attente de validation par l'administration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-center space-y-2">
              <div className="flex justify-center">
                <Clock className="h-12 w-12 text-amber-600" />
              </div>
              <p className="font-bold text-amber-800 text-lg">
                Preuve {methodLabel} envoyée
              </p>
              <p className="text-amber-700 text-sm">
                Votre paiement de <span className="font-bold">{amount} MAD</span> via {methodLabel} est en attente de validation.
              </p>
              <p className="text-amber-600 text-xs mt-2">
                L'attestation numérique sera disponible dès que l'administration aura validé votre paiement (généralement sous 24-48h).
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
              <p className="font-semibold">Besoin d'aide ?</p>
              <p>Contactez-nous sur WhatsApp : {WHATSAPP_NUMBER}</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSuccessContinue} className="w-full">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // === État par défaut : sélection méthode de paiement ===
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Obtenir mon attestation numérique</DialogTitle>
          <DialogDescription>
            Vous devez payer {amount} MAD pour obtenir votre attestation numérique.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Méthode de paiement */}
          <div>
            <Label>Moyen de paiement</Label>
            <Select value={method} onValueChange={handleMethodChange}>
              <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="wallet">Wallet (solde instantané)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructions selon méthode */}
          {method === 'bank_transfer' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-slate-700">Virement bancaire — {amount} MAD</p>
              <p className="text-slate-500">RIB à venir (sera fourni par l'administration)</p>
              <p className="text-xs text-slate-400 mt-2">Effectuez le virement puis téléchargez la preuve ci-dessous.</p>
            </div>
          )}

          {method === 'paypal' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-slate-700">PayPal — {amount} MAD</p>
              <p className="text-slate-600">Envoyez le paiement à : <span className="font-mono font-bold text-emerald-700">{PAYPAL_EMAIL}</span></p>
              <p className="text-xs text-slate-400 mt-2">Après le paiement, téléchargez la capture d'écran ci-dessous.</p>
            </div>
          )}

          {method === 'wallet' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm space-y-2">
              <p className="font-semibold text-emerald-700">Wallet — {amount} MAD</p>
              <p className="text-emerald-600">Le montant sera débité de votre solde wallet et le cours sera débloqué immédiatement.</p>
              <div className="mt-2 pt-2 border-t border-emerald-200">
                <p className="text-xs text-emerald-600 uppercase tracking-wide">Solde disponible</p>
                {walletBalanceLoading ? (
                  <p className="text-emerald-700 text-sm mt-1 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Chargement...
                  </p>
                ) : walletBalance !== null ? (
                  <p className={`text-lg font-bold mt-1 ${walletBalance >= amount ? 'text-emerald-700' : 'text-red-600'}`}>
                    {walletBalance.toLocaleString('fr-MA')} MAD
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm mt-1">Solde indisponible</p>
                )}
                {walletBalance !== null && walletBalance < amount && (
                  <p className="text-red-600 text-xs mt-1">
                    Solde insuffisant. Veuillez recharger votre wallet.
                  </p>
                )}
              </div>
              <p className="text-xs text-emerald-500 mt-2">Pas de preuve requise. Validation instantanée.</p>
            </div>
          )}

          {/* Upload preuve — masqué pour wallet */}
          {method !== 'wallet' && method !== '' && (
            <div>
              <Label>Preuve de paiement (optionnel)</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {proofFile && (
                <p className="text-xs text-slate-500 mt-1">
                  Fichier sélectionné : {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          )}

          {/* WhatsApp contact */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <p className="font-semibold">Besoin d'aide ?</p>
            <p>Contactez-nous sur WhatsApp : {WHATSAPP_NUMBER}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={submitting || !method}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {proofFile ? 'Envoyer la preuve' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// PrintPaymentModal — Modal de paiement attestation imprimée (190 MAD)
// ============================================================================
// Accepte soit attestationId (si déjà émise), soit enrollmentId (sinon —
// l'API créera l'attestation numérique à la volée, car 190 MAD inclut la numérique).
interface PrintPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attestationId?: string;
  enrollmentId?: string;
  onSuccess: () => void;
}

export function PrintPaymentModal({ open, onOpenChange, attestationId, enrollmentId, onSuccess }: PrintPaymentModalProps) {
  const [method, setMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // === Champs de livraison pour l'attestation imprimée (190 MAD) ===
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const handleSubmit = async () => {
    if (!method) {
      toast.error('Veuillez choisir un moyen de paiement');
      return;
    }
    // Validation des champs de livraison obligatoires
    if (!recipientName || recipientName.trim().length < 2) {
      toast.error('Veuillez saisir votre nom complet');
      return;
    }
    if (!recipientPhone || recipientPhone.trim().length < 6) {
      toast.error('Veuillez saisir un numéro de téléphone valide');
      return;
    }
    if (!recipientAddress || recipientAddress.trim().length < 10) {
      toast.error('Veuillez saisir votre adresse de livraison complète');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      // Envoi de attestationId si dispo, sinon enrollmentId (l'API créera l'attestation à la volée)
      if (attestationId) formData.append('attestationId', attestationId);
      if (enrollmentId) formData.append('enrollmentId', enrollmentId);
      formData.append('method', method);
      formData.append('recipientName', recipientName.trim());
      formData.append('recipientPhone', recipientPhone.trim());
      formData.append('recipientAddress', recipientAddress.trim());
      if (proofFile) formData.append('proof', proofFile);

      const res = await fetch('/api/attestations/printed', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success(proofFile ? 'Preuve envoyée — attestation débloquée' : 'Demande enregistrée');
        onOpenChange(false);
        setMethod('');
        setProofFile(null);
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Obtenir mon attestation imprimée — {ATTESTATION_PRINT_PRICE_MAD} MAD</DialogTitle>
          <DialogDescription>
            Option d'impression sur support physique. Inclut automatiquement l'attestation numérique.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* === Informations de livraison obligatoires === */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <p className="font-semibold mb-1">📦 Adresse de livraison</p>
            <p>Renseignez les informations pour l'envoi postal de votre attestation imprimée.</p>
          </div>

          <div>
            <Label htmlFor="recipientName">Nom complet *</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Prénom et nom"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="recipientPhone">Numéro de téléphone *</Label>
            <Input
              id="recipientPhone"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="+212 6 12 34 56 78"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="recipientAddress">Adresse complète de livraison *</Label>
            <textarea
              id="recipientAddress"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="N°, rue, quartier, ville, code postal, pays"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <Separator className="my-2" />

          <div>
            <Label>Moyen de paiement</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="wallet">Wallet (solde instantané)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'bank_transfer' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <p className="font-semibold text-slate-700">Virement — {ATTESTATION_PRINT_PRICE_MAD} MAD</p>
              <p className="text-slate-500">RIB à venir</p>
            </div>
          )}

          {method === 'paypal' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <p className="font-semibold text-slate-700">PayPal — {ATTESTATION_PRINT_PRICE_MAD} MAD</p>
              <p className="text-slate-600">Envoyez à : <span className="font-mono font-bold text-emerald-700">{PAYPAL_EMAIL}</span></p>
            </div>
          )}

          {method === 'wallet' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
              <p className="font-semibold text-emerald-700">Wallet — {ATTESTATION_PRINT_PRICE_MAD} MAD</p>
              <p className="text-emerald-600">Débit instantané de votre solde.</p>
            </div>
          )}

          {method !== 'wallet' && method !== '' && (
            <div>
              <Label>Preuve de paiement</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1" />
            </div>
          )}

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <p>WhatsApp : {WHATSAPP_NUMBER}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={submitting || !method || !recipientName || !recipientPhone || !recipientAddress}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {proofFile ? 'Envoyer la preuve' : 'Enregistrer la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
