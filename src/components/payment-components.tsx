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
  onSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, enrollmentId, courseTitle, amount, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        toast.success(proofFile ? 'Preuve de paiement envoyée' : 'Paiement enregistré');
        onOpenChange(false);
        setMethod('');
        setProofFile(null);
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de l\'enregistrement');
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
          <DialogTitle>Paiement du cours</DialogTitle>
          <DialogDescription>
            {courseTitle} — {amount} MAD
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Méthode de paiement */}
          <div>
            <Label>Moyen de paiement</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
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

          {/* Upload preuve */}
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
interface PrintPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attestationId: string;
  onSuccess: () => void;
}

export function PrintPaymentModal({ open, onOpenChange, attestationId, onSuccess }: PrintPaymentModalProps) {
  const [method, setMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!method) {
      toast.error('Veuillez choisir un moyen de paiement');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('attestationId', attestationId);
      formData.append('method', method);
      if (proofFile) formData.append('proof', proofFile);

      const res = await fetch('/api/attestations/printed', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success(proofFile ? 'Preuve envoyée' : 'Demande enregistrée');
        onOpenChange(false);
        setMethod('');
        setProofFile(null);
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
          <DialogTitle>Attestation imprimée</DialogTitle>
          <DialogDescription>Option d'impression sur support physique — {ATTESTATION_PRINT_PRICE_MAD} MAD</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Moyen de paiement</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
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

          <div>
            <Label>Preuve de paiement</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1" />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <p>WhatsApp : {WHATSAPP_NUMBER}</p>
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
