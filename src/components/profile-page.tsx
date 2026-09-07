'use client';

// ============================================================================
// HSE Academy — Page de profil utilisateur
// ============================================================================
// Composant client couvrant 5 sections tabbées :
//   A. Mon compte          (email / téléphone vérifiés, déconnexion)
//   B. Mon identité        (nom verrouillé, état civil, adresse)
//   C. Mes réseaux sociaux (Facebook, LinkedIn, Twitter, Site web)
//   D. Mes formations      (progression, attestations liées)
//   E. Mes attestations    (PDF, vérification publique)
//
// Source de données : GET /api/profile → { profile, enrollments, attestations }
// Écritures : PUT /api/profile, POST /api/profile/identity, POST /api/auth/send-verification
// Toutes les écritures notifient via sonner.
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, Shield, ShieldCheck, ShieldAlert, Lock, User, Calendar,
  MapPin, Home, Facebook, Linkedin, Twitter, Globe, Award, Play,
  FileCheck, ExternalLink, Loader2, CheckCircle, BookOpen, Wallet, Upload, Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { PaymentStatusBadge, PrintPaymentModal } from '@/components/payment-components';

// ============================================================================
// TYPES
// ============================================================================

interface ProfilePageProps {
  user: { id: string; name: string; email: string; role: string } | null;
  onNavigate: (page: string, data?: Record<string, string>) => void;
  onLogout: () => void;
  initialTab?: string;
}

interface UserProfile {
  fullName?: string | null;
  fullNameValidated?: boolean;
  fullNameOriginal?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  residence?: string | null;
  address?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  phoneNormalized?: string | null;
  phoneCountry?: string | null;
  avatar?: string | null;
}

interface EnrollmentChapter { id: string }

interface EnrollmentCourse {
  id: string;
  title: string;
  slug: string;
  level: string;
  totalHours: string;
  chapters: EnrollmentChapter[];
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  currentChapter: number;
  // La DB stocke completedChapters en JSON string, mais d'autres routes le
  // renvoient déjà parsé. On accepte les deux pour ne jamais crasher.
  completedChapters: string[] | string;
  overallScore: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  course: EnrollmentCourse;
}

interface Attestation {
  id: string;
  attestationNo: string;
  serialNumber?: string | null;
  userId: string;
  courseId: string;
  enrollmentId: string;
  fullName: string;
  courseName: string;
  overallScore: number;
  issuedDate: string;
  status: string; // 'valid' | 'revoked'
  course?: { title: string; slug: string; level: string; totalHours: string };
}

interface ProfileData {
  profile: UserProfile | null;
  enrollments: Enrollment[];
  attestations: Attestation[];
}

// ============================================================================
// HELPERS
// ============================================================================

/** Formate une date ISO en français (ex : « 15 mai 2025 »). */
function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(iso);
  }
}

/** Convertit une date ISO en valeur compatible avec <input type="date"> (YYYY-MM-DD). */
function toDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

/** Parse `completedChapters` indépendamment du format (string JSON ou tableau). */
function parseCompletedChapters(raw: string[] | string | undefined | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    if (raw.trim() === '') return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Calcule le pourcentage de progression d'une inscription (0–100). */
function getProgressPercent(enrollment: Enrollment): number {
  const completed = parseCompletedChapters(enrollment.completedChapters);
  const total = enrollment?.course?.chapters?.length ?? 0;
  if (total === 0) return 0;
  const pct = Math.round((completed.length / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfilePage({ user, onNavigate, onLogout, initialTab }: ProfilePageProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || 'account');
  const [coursePayments, setCoursePayments] = useState<any[]>([]);
  const [printPayments, setPrintPayments] = useState<any[]>([]);
  const [printModalAttId, setPrintModalAttId] = useState<string | null>(null);

  // --- Wallet ---
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeMethod, setChargeMethod] = useState('paypal');
  const [charging, setCharging] = useState(false);
  const [chargeInstructions, setChargeInstructions] = useState<any>(null);
  const [chargeWhatsapp, setChargeWhatsapp] = useState('');

  // --- Payment Requests ---
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [maxRequests, setMaxRequests] = useState(10);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofRequestId, setProofRequestId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofText, setProofText] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // --- CV Public ---
  const [usernameValue, setUsernameValue] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [profilePublicValue, setProfilePublicValue] = useState(false);
  const [cvTitleValue, setCvTitleValue] = useState('');
  const [cvBioValue, setCvBioValue] = useState('');
  const [cvTemplateValue, setCvTemplateValue] = useState('emerald');
  const [cvColorPrimaryValue, setCvColorPrimaryValue] = useState('#059669');
  const [cvColorAccentValue, setCvColorAccentValue] = useState('#065f46');
  const [cvLayoutValue, setCvLayoutValue] = useState('sidebar');

  // --- Avatar ---
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync tab when initialTab changes (e.g., navigating from header dropdown)
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // --- Champs Identité ---
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [residence, setResidence] = useState('');
  const [address, setAddress] = useState('');

  // --- Champs Réseaux sociaux ---
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  // --- États d'action ---
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [validatingName, setValidatingName] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  // ---- Fetch /api/profile ----
  const fetchProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/profile', { cache: 'no-store' });
      const json = await r.json();
      if (json && !json.error) {
        setData(json as ProfileData);
      } else {
        setData({ profile: null, enrollments: [], attestations: [] });
      }
    } catch {
      setData({ profile: null, enrollments: [], attestations: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ---- Hydrate les champs formulaire quand les données arrivent ----
  useEffect(() => {
    if (!data?.profile) return;
    const p = data.profile;
    setFullName(p.fullName || user?.name || '');
    setBirthDate(toDateInputValue(p.birthDate));
    setBirthPlace(p.birthPlace || '');
    setResidence(p.residence || '');
    setAddress(p.address || '');
    setFacebook(p.facebook || '');
    setLinkedin(p.linkedin || '');
    setTwitter(p.twitter || '');
    setWebsite(p.website || '');
    // CV fields
    setUsernameValue(p.username || '');
    setProfilePublicValue(p.profilePublic || false);
    setCvTitleValue(p.cvTitle || '');
    setCvBioValue(p.cvBio || '');
    setCvTemplateValue(p.cvTemplate || 'emerald');
    setCvColorPrimaryValue(p.cvColorPrimary || '#059669');
    setCvColorAccentValue(p.cvColorAccent || '#065f46');
    setCvLayoutValue(p.cvLayout || 'sidebar');
  }, [data?.profile, user?.name]);

  // ---- Fetch wallet ----
  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance || 0);
        setWalletTransactions(data.transactions || []);
      }
    } catch { /* ignore */ }
    finally { setWalletLoading(false); }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // ---- Charge wallet (via PaymentRequest) ----
  const handleCharge = async () => {
    const num = parseFloat(chargeAmount);
    if (isNaN(num) || num < 10) {
      toast.error('Montant minimum : 10 MAD');
      return;
    }
    setCharging(true);
    try {
      const formData = new FormData();
      formData.append('amount', String(num));
      formData.append('method', chargeMethod);
      formData.append('reqType', 'wallet_charge');

      const res = await fetch('/api/payment-requests', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success('Demande créée — suivez les instructions');
        fetchRequests();
        // Récupérer les instructions de paiement depuis les settings
        const ps = await fetch('/api/payment-settings').then(r => r.json());
        const s = ps.settings || {};
        const instructions: Record<string, any> = {
          paypal: {
            title: 'Paiement PayPal',
            amount: num,
            email: s.paypalEmail || 'ouamrhar@gmail.com',
            steps: [
              `Connectez-vous à PayPal et envoyez ${num} MAD à : ${s.paypalEmail || 'ouamrhar@gmail.com'}`,
              'Ajoutez en note : "Rechargement Wallet HSE Academy"',
              'Après le paiement, allez dans "Mes Demandes" et soumettez votre preuve',
            ],
          },
          bank_transfer: {
            title: 'Virement bancaire',
            amount: num,
            bankName: s.bankName || 'À contacter',
            accountName: s.bankAccountName || 'À contacter',
            iban: s.bankIban || 'À contacter',
            swift: s.bankSwift || '',
            steps: [
              `Effectuez un virement de ${num} MAD vers :`,
              `Banque : ${s.bankName || 'À contacter'}`,
              `Titulaire : ${s.bankAccountName || 'À contacter'}`,
              `RIB : ${s.bankIban || 'À contacter'}`,
              'Après le virement, allez dans "Mes Demandes" et soumettez votre preuve',
            ],
          },
        };
        setChargeInstructions(instructions[chargeMethod] || null);
        setChargeWhatsapp(s.whatsappNumber || '+212728986565');
        setChargeAmount('');
        // NE PAS fermer le modal — laisser les instructions visibles
      } else {
        toast.error(data.error || 'Échec');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setCharging(false);
    }
  };

  // ---- Fetch payment requests ----
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch('/api/payment-requests', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPaymentRequests(data.requests || []);
        setActiveRequestsCount(data.activeCount || 0);
        setMaxRequests(data.maxActive || 10);
      }
    } catch { /* ignore */ }
    finally { setRequestsLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ---- Submit proof ----
  const handleSubmitProof = async () => {
    if (!proofRequestId) return;
    if (!proofFile && !proofText.trim()) {
      toast.error('Fournissez une preuve (image ou texte)');
      return;
    }
    setSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append('requestId', proofRequestId);
      if (proofFile) formData.append('proof', proofFile);
      if (proofText.trim()) formData.append('proofText', proofText.trim());

      const res = await fetch('/api/payment-requests', {
        method: 'PATCH',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Preuve soumise — en attente de validation');
        setProofModalOpen(false);
        setProofFile(null);
        setProofText('');
        setProofRequestId(null);
        fetchRequests();
      } else {
        toast.error(data.error || 'Échec');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSubmittingProof(false);
    }
  };

  // ---- Delete request ----
  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Supprimer cette demande ?')) return;
    try {
      const res = await fetch(`/api/payment-requests?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Demande supprimée');
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Échec');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  // ---- Save username ----
  const handleSaveUsername = async () => {
    if (usernameValue.length < 5 || usernameValue.length > 12) {
      toast.error('5 à 12 caractères requis');
      return;
    }
    setUsernameSaving(true);
    try {
      const res = await fetch('/api/profile/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameValue }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Nom d\'utilisateur enregistré');
        fetchProfile(); // recharger pour voir le lien
      } else {
        toast.error(data.error || 'Échec');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setUsernameSaving(false);
    }
  };

  // ---- Toggle profile public ----
  const handleToggleProfilePublic = async (value: boolean) => {
    try {
      await fetch('/api/profile/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePublic: value }),
      });
      toast.success(value ? 'CV rendu public' : 'CV rendu privé');
      fetchProfile();
    } catch {
      toast.error('Erreur réseau');
    }
  };

  // ---- Save CV field ----
  const handleSaveCVField = async (field: string, value: string) => {
    try {
      await fetch('/api/profile/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      toast.success('Enregistré');
    } catch {
      toast.error('Erreur réseau');
    }
  };

  // ---- Save all CV (username + cvTitle + cvBio + cvTemplate + social) ----
  const handleSaveAllCV = async () => {
    setSavingSocial(true);
    try {
      // 1. Save username si modifié
      if (usernameValue.length >= 5) {
        await fetch('/api/profile/username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameValue }),
        });
      }
      // 2. Save CV fields
      await fetch('/api/profile/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvTitle: cvTitleValue,
          cvBio: cvBioValue,
          cvTemplate: cvTemplateValue,
          cvColorPrimary: cvColorPrimaryValue,
          cvColorAccent: cvColorAccentValue,
          cvLayout: cvLayoutValue,
        }),
      });
      // 3. Save social links
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facebook, linkedin, twitter, website }),
      });
      toast.success('Tout enregistré');
      fetchProfile();
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSavingSocial(false);
    }
  };

  // ---- Avatar upload ----
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 2 MB)');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté (JPG, PNG, WebP uniquement)');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success('Photo de profil mise à jour');
        fetchProfile();
      } else {
        toast.error(data.error || 'Échec de l\'upload');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ---- Avatar delete ----
  const handleAvatarDelete = async () => {
    if (!confirm('Supprimer votre photo de profil ?')) return;
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Photo supprimée');
        fetchProfile();
      } else {
        toast.error('Échec');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  // ---- Fetch payments (placé AVANT le return conditionnel pour respecter
  // les règles des Hooks React — un Hook ne doit jamais être appelé après un
  // return conditionnel, sinon React error #310 est déclenché) ----
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [cpRes, ppRes] = await Promise.all([
          fetch('/api/courses/payments'),
          fetch('/api/attestations/printed'),
        ]);
        if (cpRes.ok) setCoursePayments(await cpRes.json());
        if (ppRes.ok) setPrintPayments(await ppRes.json());
      } catch { /* ignore */ }
    })();
  }, [user]);

  // ---- Loading state ----
  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-500">Chargement de votre profil…</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile || null;
  const enrollments = data?.enrollments || [];
  const attestations = data?.attestations || [];

  const emailVerified = !!profile?.emailVerified;
  const phoneVerified = !!profile?.phoneVerified;
  const phoneValue = profile?.phoneNormalized || 'Non renseigné';
  const hasPhone = phoneValue !== 'Non renseigné';
  const fullNameValidated = !!profile?.fullNameValidated;

  // ---- Handlers ----
  async function handleSendVerification() {
    setSendingVerification(true);
    try {
      const r = await fetch('/api/auth/send-verification', { method: 'POST' });
      const json = await r.json().catch(() => ({}));
      if (r.ok && json?.success) {
        toast.success('Email envoyé', {
          description:
            'Un email de vérification vient de vous être envoyé. Pensez à vérifier vos spams.',
        });
      } else {
        toast.error('Envoi impossible', {
          description: json?.error || 'Veuillez réessayer dans quelques instants.',
        });
      }
    } catch {
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur.',
      });
    } finally {
      setSendingVerification(false);
    }
  }

  async function handleValidateName() {
    if (!fullName.trim()) {
      toast.error('Nom requis', {
        description: 'Veuillez saisir votre nom complet.',
      });
      return;
    }
    setValidatingName(true);
    try {
      const r = await fetch('/api/profile/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      const json = await r.json().catch(() => ({}));
      if (r.ok && json?.success) {
        toast.success('Nom validé', {
          description:
            'Votre nom est désormais verrouillé et sera utilisé sur vos attestations.',
        });
        await fetchProfile();
      } else {
        toast.error('Validation impossible', {
          description: json?.error || 'Veuillez réessayer.',
        });
      }
    } catch {
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur.',
      });
    } finally {
      setValidatingName(false);
    }
  }

  async function handleSaveIdentity() {
    setSavingIdentity(true);
    try {
      const payload: Record<string, string | null> = {
        birthDate: birthDate || null,
        birthPlace: birthPlace.trim(),
        residence: residence.trim(),
        address: address.trim(),
      };
      // Le fullName n'est libre que tant qu'il n'est pas validé.
      if (!fullNameValidated && fullName.trim()) {
        payload.fullName = fullName.trim();
      }
      const r = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success('Profil enregistré', {
          description: 'Vos informations ont été mises à jour.',
        });
        await fetchProfile();
      } else {
        toast.error('Enregistrement impossible', {
          description: json?.error || 'Veuillez réessayer.',
        });
      }
    } catch {
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur.',
      });
    } finally {
      setSavingIdentity(false);
    }
  }

  async function handleSaveSocial() {
    setSavingSocial(true);
    try {
      const payload = {
        facebook: facebook.trim(),
        linkedin: linkedin.trim(),
        twitter: twitter.trim(),
        website: website.trim(),
      };
      const r = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success('Réseaux sociaux enregistrés', {
          description: 'Vos liens ont été mis à jour.',
        });
        await fetchProfile();
      } else {
        toast.error('Enregistrement impossible', {
          description: json?.error || 'Veuillez réessayer.',
        });
      }
    } catch {
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur.',
      });
    } finally {
      setSavingSocial(false);
    }
  }

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Bandeau d'en-tête */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold truncate">
                Bonjour, {profile?.fullName || user.name}
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu tabbé */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mx-1 px-1">
            <TabsList className="h-auto flex w-max min-w-full">
              <TabsTrigger value="account" className="gap-1.5">
                <Shield className="h-4 w-4" /> Mon compte
              </TabsTrigger>
              <TabsTrigger value="identity" className="gap-1.5">
                <User className="h-4 w-4" /> Mon identité
              </TabsTrigger>
              <TabsTrigger value="cv" className="gap-1.5">
                <Globe className="h-4 w-4" /> Mon CV
              </TabsTrigger>
              <TabsTrigger value="trainings" className="gap-1.5">
                <BookOpen className="h-4 w-4" /> Mes formations
              </TabsTrigger>
              <TabsTrigger value="attestations" className="gap-1.5">
                <Award className="h-4 w-4" /> Mes attestations
              </TabsTrigger>
              <TabsTrigger value="wallet" className="gap-1.5">
                <Wallet className="h-4 w-4" /> Mon Wallet
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-1.5">
                <FileCheck className="h-4 w-4" /> Mes Demandes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ============================ A: Mon compte ============================ */}
          <TabsContent value="account" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Shield className="h-5 w-5" /> Mon compte
                </CardTitle>
                <CardDescription>
                  Sécurité et accès à votre compte HSE Academy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Email
                      </div>
                      <div className="text-sm font-semibold text-slate-900 break-all">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      emailVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 w-fit'
                        : 'bg-amber-50 text-amber-700 border-amber-200 gap-1.5 w-fit'
                    }
                  >
                    {emailVerified ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5" /> Non vérifié
                      </>
                    )}
                  </Badge>
                </div>

                {/* Téléphone */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Téléphone
                      </div>
                      <div className="text-sm font-semibold text-slate-900 break-all">
                        {phoneValue}
                      </div>
                    </div>
                  </div>
                  {hasPhone && (
                    <Badge
                      variant="outline"
                      className={
                        phoneVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 w-fit'
                          : 'bg-amber-50 text-amber-700 border-amber-200 gap-1.5 w-fit'
                      }
                    >
                      {phoneVerified ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5" /> Non vérifié
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={emailVerified || sendingVerification}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {sendingVerification ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" /> Envoyer email de vérification
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Déconnexion
                  </Button>
                </div>

                {emailVerified && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    Votre adresse email est vérifiée. Aucune action supplémentaire n&apos;est requise.
                  </p>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================ B: Mon identité ============================ */}
          <TabsContent value="identity" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <User className="h-5 w-5" /> Mon identité
                </CardTitle>
                <CardDescription>
                  Ces informations apparaîtront sur vos attestations de formation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom complet — verrouillé après 1ère attestation, sinon modifiable */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  {fullNameValidated ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
                      <Lock className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-emerald-900 break-words">
                          {profile?.fullName || fullName}
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          Identité verrouillée suite à l&apos;émission d&apos;une attestation.
                          Contactez l&apos;administration pour toute correction.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Prénom Nom"
                      />
                      <Button
                        type="button"
                        onClick={handleSaveIdentity}
                        disabled={savingIdentity || !fullName.trim()}
                        variant="outline"
                        className="text-emerald-700 border-emerald-300"
                      >
                        Enregistrer le nom
                      </Button>
                      <p className="text-xs text-slate-500">
                        Votre nom restera modifiable jusqu&apos;à l&apos;obtention de votre première attestation.
                        Il sera ensuite verrouillé et utilisé tel quel sur vos attestations officielles.
                      </p>
                    </>
                  )}
                </div>

                <Separator />

                {/* État civil + adresse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" /> Date de naissance
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace" className="gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" /> Lieu de naissance
                    </Label>
                    <Input
                      id="birthPlace"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Ville, Pays"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residence" className="gap-1.5">
                      <Home className="h-4 w-4 text-slate-400" /> Résidence
                    </Label>
                    <Input
                      id="residence"
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      placeholder="Ville, Pays"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" /> Adresse
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="N°, rue, code postal"
                    />
                  </div>
                </div>

                {/* Alerte orthographe */}
                <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle className="text-amber-900">
                    Vérifiez l&apos;orthographe de votre nom
                  </AlertTitle>
                  <AlertDescription className="text-amber-800">
                    Vérifiez attentivement l&apos;orthographe de votre nom complet. Il sera utilisé
                    sur vos attestations de formation.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveIdentity}
                    disabled={savingIdentity}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {savingIdentity ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
                      </>
                    ) : (
                      <>Enregistrer mes informations</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================ C: Mon CV ============================ */}
          <TabsContent value="cv" className="mt-6">
            <div className="space-y-6">
              {/* Photo de profil */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <User className="h-5 w-5" /> Photo de profil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700 overflow-hidden border-2 border-emerald-200">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        (profile?.fullName || user?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input type="file" accept="image/jpeg,image/png,image/webp" ref={(el) => { avatarInputRef.current = el; }} className="hidden" onChange={handleAvatarUpload} />
                      <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                        {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {avatarUploading ? 'Upload...' : 'Changer la photo'}
                      </Button>
                      {profile?.avatar && (
                        <Button variant="ghost" size="sm" onClick={handleAvatarDelete} className="text-red-500 hover:bg-red-50">
                          Supprimer
                        </Button>
                      )}
                      <p className="text-xs text-slate-400">JPG, PNG ou WebP. Max 2 MB. Min 200x200px.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CV Public */}
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Globe className="h-5 w-5" /> CV Professionnel Public
                  </CardTitle>
                  <CardDescription>
                    Votre CV professionnel partageable sur les réseaux sociaux.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Username */}
                  <div>
                    <Label htmlFor="username">Lien public de votre CV</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-slate-400 bg-slate-100 border border-r-0 border-slate-200 rounded-l-md px-3 py-2">hseacademy.online/@</span>
                      <Input id="username" value={usernameValue} onChange={(e) => setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="akaprod" maxLength={12} className="rounded-l-none" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">5 à 12 caractères, lettres, chiffres et _ uniquement.</p>
                  </div>

                  {/* Lien public + toggle */}
                  {profile?.username && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-700">Votre CV : <a href={`https://hseacademy.online/@${profile.username}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">hseacademy.online/@{profile.username}</a></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`https://hseacademy.online/@${profile.username}`); toast.success('Lien copié'); }}>
                          Copier
                        </Button>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="profile-public" className="text-xs text-slate-600 cursor-pointer">Public</Label>
                          <input id="profile-public" type="checkbox" checked={profilePublicValue} onChange={(e) => { setProfilePublicValue(e.target.checked); handleToggleProfilePublic(e.target.checked); }} className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Titre + Bio + Template */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="cv-title">Titre professionnel</Label>
                      <Input id="cv-title" value={cvTitleValue} onChange={(e) => setCvTitleValue(e.target.value)} placeholder="Ex: Technicien QHSE Senior" />
                    </div>
                    <div>
                      <Label htmlFor="cv-bio">Bio courte</Label>
                      <Textarea id="cv-bio" rows={3} value={cvBioValue} onChange={(e) => setCvBioValue(e.target.value)} placeholder="Décrivez votre parcours..." />
                    </div>
                    {/* Layout du CV */}
                    <div>
                      <Label htmlFor="cv-layout">Format d'affichage</Label>
                      <Select value={cvLayoutValue} onValueChange={(v) => setCvLayoutValue(v)}>
                        <SelectTrigger id="cv-layout"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sidebar">Sidebar (colonne foncée gauche)</SelectItem>
                          <SelectItem value="centered">Centered (centré, pleine largeur)</SelectItem>
                          <SelectItem value="split">Split (2 colonnes + bande colorée)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Palette de couleurs prédéfinies */}
                    <div>
                      <Label htmlFor="cv-palette">Palette de couleurs</Label>
                      <Select value={cvTemplateValue} onValueChange={(v) => {
                        setCvTemplateValue(v);
                        // Appliquer la palette sélectionnée
                        const palettes: Record<string, {p:string;a:string}> = {
                          emerald: { p: '#059669', a: '#065f46' },
                          ocean: { p: '#0284c7', a: '#0c4a6e' },
                          sunset: { p: '#ea580c', a: '#9a3412' },
                          royal: { p: '#7c3aed', a: '#5b21b6' },
                          mono: { p: '#334155', a: '#0f172a' },
                        };
                        const pal = palettes[v] || palettes.emerald;
                        setCvColorPrimaryValue(pal.p);
                        setCvColorAccentValue(pal.a);
                      }}>
                        <SelectTrigger id="cv-palette"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emerald">🍃 Emerald (vert HSE)</SelectItem>
                          <SelectItem value="ocean">🌊 Ocean (bleu)</SelectItem>
                          <SelectItem value="sunset">🌅 Sunset (orange)</SelectItem>
                          <SelectItem value="royal">👑 Royal (violet)</SelectItem>
                          <SelectItem value="mono">⚫ Mono (gris sobre)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Couleurs personnalisées */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cv-color-primary">Couleur principale</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            id="cv-color-primary"
                            value={cvColorPrimaryValue}
                            onChange={(e) => setCvColorPrimaryValue(e.target.value)}
                            className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                          />
                          <Input
                            value={cvColorPrimaryValue}
                            onChange={(e) => setCvColorPrimaryValue(e.target.value)}
                            className="flex-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cv-color-accent">Couleur accent</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            id="cv-color-accent"
                            value={cvColorAccentValue}
                            onChange={(e) => setCvColorAccentValue(e.target.value)}
                            className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                          />
                          <Input
                            value={cvColorAccentValue}
                            onChange={(e) => setCvColorAccentValue(e.target.value)}
                            className="flex-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Réseaux sociaux intégrés au CV */}
                  <Separator />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Réseaux sociaux & liens</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="gap-1.5"><Facebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
                        <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="gap-1.5"><Linkedin className="h-4 w-4 text-sky-700" /> LinkedIn</Label>
                        <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="gap-1.5"><Twitter className="h-4 w-4 text-slate-700" /> Twitter / X</Label>
                        <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/…" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="gap-1.5"><Globe className="h-4 w-4 text-emerald-600" /> Site web</Label>
                        <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votre-site.com" />
                      </div>
                    </div>
                  </div>

                  {/* Bouton Enregistrer — à la fin, prend en compte tout */}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveAllCV} disabled={savingSocial || usernameSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {savingSocial || usernameSaving ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement…</>) : (<>Enregistrer tout</>)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================ D: Mes formations ============================ */}
          <TabsContent value="trainings" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <BookOpen className="h-5 w-5" /> Mes formations
                </CardTitle>
                <CardDescription>
                  {enrollments.length > 0
                    ? `${enrollments.length} formation(s) suivie(s).`
                    : "Vous n'êtes encore inscrit(e) à aucune formation."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Parcourez notre catalogue et démarrez votre première formation certifiante.
                    </p>
                    <Button
                      type="button"
                      onClick={() => onNavigate('training')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Voir le catalogue <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  enrollments.map((enr) => {
                    const pct = getProgressPercent(enr);
                    const completedCount = parseCompletedChapters(enr.completedChapters).length;
                    const totalChapters = enr.course?.chapters?.length ?? 0;
                    const matchingAtt = attestations.find(
                      (a) => a.enrollmentId === enr.id,
                    );

                    let statusLabel = 'Inscrite, non commencée';
                    let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
                    let actionBtn: React.ReactNode = null;

                    if (pct === 100 && totalChapters > 0) {
                      statusLabel = 'Terminée';
                      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      if (matchingAtt) {
                        actionBtn = (
                          <Button
                            asChild
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <a
                              href={`/api/courses/attestations/${matchingAtt.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileCheck className="h-4 w-4" /> Voir l&apos;attestation
                            </a>
                          </Button>
                        );
                      }
                    } else if (pct > 0) {
                      statusLabel = 'En cours';
                      statusColor = 'bg-sky-50 text-sky-700 border-sky-200';
                      actionBtn = (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onNavigate('training')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Play className="h-4 w-4" /> Continuer
                        </Button>
                      );
                    } else {
                      actionBtn = (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onNavigate('training')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Play className="h-4 w-4" /> Commencer
                        </Button>
                      );
                    }

                    return (
                      <div
                        key={enr.id}
                        className="rounded-lg border border-slate-200 p-4 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base break-words">
                              {enr.course?.title || 'Formation sans titre'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={statusColor}>
                                {statusLabel}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {completedCount} / {totalChapters} chapitres · {pct}%
                              </span>
                            </div>
                          </div>
                          {actionBtn && <div className="shrink-0">{actionBtn}</div>}
                        </div>
                        {totalChapters > 0 && (
                          <div className="mt-3">
                            <Progress value={pct} className="h-2" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================ E: Mes attestations ============================ */}
          <TabsContent value="attestations" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Award className="h-5 w-5" /> Mes attestations
                </CardTitle>
                <CardDescription>
                  {attestations.length > 0
                    ? `${attestations.length} attestation(s) délivrée(s).`
                    : 'Aucune attestation délivrée pour le moment.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {attestations.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Award className="h-7 w-7" />
                    </div>
                    <p className="text-sm text-slate-500">
                      Terminez une formation pour obtenir votre attestation officielle.
                    </p>
                  </div>
                ) : (
                  attestations.map((att) => {
                    const isRevoked = (att.status || '').toLowerCase() === 'revoked';
                    const serial = att.serialNumber || att.attestationNo || '';
                    return (
                      <div
                        key={att.id}
                        className="rounded-lg border border-slate-200 p-4 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-900 text-sm sm:text-base break-words">
                                {att.courseName || att.course?.title || 'Attestation'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5 font-mono break-all">
                                N° {serial || '—'}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                isRevoked
                                  ? 'bg-red-50 text-red-700 border-red-200 gap-1.5 w-fit'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 w-fit'
                              }
                            >
                              {isRevoked ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" /> RÉVOQUÉE
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5" /> VALIDE
                                </>
                              )}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-slate-400 uppercase tracking-wider">
                                Date d&apos;émission
                              </div>
                              <div className="font-medium text-slate-700">
                                {formatDate(att.issuedDate)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 uppercase tracking-wider">Score</div>
                              <div className="font-medium text-slate-700">
                                {att.overallScore ?? 0}%
                              </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <div className="text-slate-400 uppercase tracking-wider">
                                Bénéficiaire
                              </div>
                              <div
                                className="font-medium text-slate-700 truncate"
                                title={att.fullName}
                              >
                                {att.fullName || '—'}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              <a
                                href={`/api/courses/attestations/${att.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileCheck className="h-4 w-4" /> Télécharger PDF
                              </a>
                            </Button>
                            {serial && (
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-slate-600 hover:bg-slate-100"
                              >
                                <a
                                  href={`/verify/${encodeURIComponent(serial)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" /> Vérifier
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        {/* ============================ F: Mes paiements ============================ */}
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" /> Mes paiements
                </CardTitle>
                <CardDescription>Paiements de cours et attestations imprimées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {coursePayments.length === 0 && printPayments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">Aucun paiement enregistré</p>
                ) : (
                  <>
                    {coursePayments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.enrollment?.course?.title || 'Cours'}</p>
                          <p className="text-xs text-slate-500">{p.method === 'bank_transfer' ? 'Virement' : p.method === 'paypal' ? 'PayPal' : p.method === 'wallet' ? 'Wallet' : p.method} — {p.amount} MAD</p>
                          <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <PaymentStatusBadge status={p.status} />
                      </div>
                    ))}
                    {printPayments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Attestation imprimée</p>
                          <p className="text-xs text-slate-500">{p.method === 'bank_transfer' ? 'Virement' : p.method === 'paypal' ? 'PayPal' : p.method === 'wallet' ? 'Wallet' : p.method} — {p.amount} MAD</p>
                          <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <PaymentStatusBadge status={p.status} />
                      </div>
                    ))}
                  </>
                )}

                {/* Print payment button for validated attestations */}
                {attestations.filter(a => a.status === 'valid').length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Demander une attestation imprimée (190 MAD)</p>
                    <div className="space-y-2">
                      {attestations.filter(a => a.status === 'valid').map((att: any) => (
                        <Button key={att.id} variant="outline" size="sm" onClick={() => setPrintModalAttId(att.id)}>
                          <Award className="h-3 w-3 mr-1" /> {att.courseName || att.course?.title || 'Attestation'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        {/* ============================ G: Mon Wallet ============================ */}
          <TabsContent value="wallet" className="mt-6">
            <div className="space-y-4">
              {/* Solde */}
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Wallet className="h-5 w-5" /> Mon solde Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {walletLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-emerald-700">{walletBalance.toFixed(2)} MAD</p>
                        <p className="text-xs text-slate-500 mt-1">Solde disponible</p>
                      </div>
                      <Button
                        onClick={() => setChargeModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Recharger
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historique des transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileCheck className="h-4 w-4" /> Historique des transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {walletTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Aucune transaction pour le moment</p>
                  ) : (
                    <div className="space-y-2">
                      {walletTransactions.map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {t.type === 'charge' ? 'Rechargement' : t.type === 'purchase' ? 'Achat' : t.type === 'bonus' ? 'Bonus' : t.type === 'refund' ? 'Remboursement' : t.type}
                            </p>
                            <p className="text-xs text-slate-500">{t.description || t.paymentMethod || ''}</p>
                            <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className={`text-sm font-semibold ${t.type === 'charge' || t.type === 'bonus' || t.type === 'refund' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {t.type === 'purchase' ? '-' : '+'}{t.amount.toFixed(2)} MAD
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promotions info */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-800 font-medium mb-1">Bonus sur rechargement</p>
                  <p className="text-xs text-amber-700">Rechargez 500 MAD → +5% bonus | Rechargez 1000 MAD → +10% bonus</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        {/* ============================ H: Mes Demandes ============================ */}
          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-emerald-600" /> Mes Demandes de Paiement
                    </span>
                    <Badge variant="outline" className={activeRequestsCount >= maxRequests ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}>
                      {activeRequestsCount}/{maxRequests} actives
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Chaque demande expire après 72 heures. Soumettez votre preuve après paiement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>
                  ) : paymentRequests.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Aucune demande pour le moment</p>
                  ) : (
                    <div className="space-y-2">
                      {paymentRequests.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {r.reqType === 'wallet_charge' ? 'Rechargement Wallet' : r.reqType === 'course_payment' ? 'Paiement Cours' : 'Attestation Imprimée'} — {r.amount} MAD
                            </p>
                            <p className="text-xs text-slate-500">{r.method === 'bank_transfer' ? 'Virement' : 'PayPal'}</p>
                            <p className="text-xs text-slate-400">
                              Créée le {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' • '}
                              Expire le {new Date(r.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </p>
                            {r.description && <p className="text-xs text-slate-400 mt-1">{r.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              r.reqStatus === 'validated' ? 'bg-emerald-100 text-emerald-800' :
                              r.reqStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              r.reqStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              r.reqStatus === 'expired' ? 'bg-slate-200 text-slate-600' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {r.reqStatus === 'validated' ? 'Validé' :
                               r.reqStatus === 'rejected' ? 'Refusé' :
                               r.reqStatus === 'submitted' ? 'Preuve soumise' :
                               r.reqStatus === 'expired' ? 'Expirée' : 'En attente'}
                            </Badge>
                            {/* Submit proof button — only for pending */}
                            {r.reqStatus === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setProofRequestId(r.id); setProofModalOpen(true); }}
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              >
                                <Upload className="h-3 w-3 mr-1" /> Preuve
                              </Button>
                            )}
                            {/* Delete button — only for pending and expired */}
                            {(r.reqStatus === 'pending' || r.reqStatus === 'expired') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRequest(r.id)}
                                className="text-red-500 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {printModalAttId && (
        <PrintPaymentModal
          open={!!printModalAttId}
          onOpenChange={(v) => !v && setPrintModalAttId(null)}
          attestationId={printModalAttId}
          onSuccess={() => { setPrintModalAttId(null); }}
        />
      )}

      {/* Modal rechargement Wallet */}
      {chargeModalOpen && (
        <Dialog open={chargeModalOpen} onOpenChange={setChargeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" /> Recharger mon Wallet
              </DialogTitle>
              <DialogDescription>
                {chargeInstructions
                  ? 'Suivez les instructions ci-dessous pour effectuer le paiement.'
                  : 'Choisissez un montant et une méthode de paiement.'}
              </DialogDescription>
            </DialogHeader>

            {chargeInstructions ? (
              /* ---- ÉTAPE 2 : Instructions de paiement ---- */
              <div className="space-y-4 py-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-800 mb-2">{chargeInstructions.title}</p>
                  <div className="space-y-1">
                    {chargeInstructions.steps.map((step: string, i: number) => (
                      <p key={i} className="text-sm text-amber-700">
                        {i + 1}. {step}
                      </p>
                    ))}
                  </div>
                </div>

                {chargeInstructions.email && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">PayPal : {chargeInstructions.email}</p>
                    <p className="text-xs text-slate-500 mt-1">Envoyez {chargeInstructions.amount} MAD à cette adresse</p>
                  </div>
                )}

                {chargeInstructions.iban && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <p className="text-sm font-medium text-slate-700">Banque : {chargeInstructions.bankName}</p>
                    <p className="text-sm text-slate-600">Titulaire : {chargeInstructions.accountName}</p>
                    <p className="text-sm font-mono text-slate-700">RIB : {chargeInstructions.iban}</p>
                    {chargeInstructions.swift && <p className="text-sm text-slate-500">SWIFT : {chargeInstructions.swift}</p>}
                    {chargeInstructions.notes && <p className="text-xs text-slate-400 mt-1">{chargeInstructions.notes}</p>}
                  </div>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">Après le paiement :</p>
                  <p className="text-sm text-emerald-600">Envoyez votre preuve sur WhatsApp : <span className="font-bold">{chargeWhatsapp}</span></p>
                  <p className="text-xs text-emerald-500 mt-1">Votre solde sera crédité après validation par l'administration.</p>
                </div>
              </div>
            ) : (
              /* ---- ÉTAPE 1 : Choix montant + méthode ---- */
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="charge-amount">Montant (MAD)</Label>
                  <Input
                    id="charge-amount"
                    type="number"
                    min="10"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="Ex : 500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 10 MAD. Bonus à partir de 500 MAD.</p>
                </div>
                <div>
                  <Label htmlFor="charge-method">Méthode de paiement</Label>
                  <Select value={chargeMethod} onValueChange={setChargeMethod}>
                    <SelectTrigger id="charge-method">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {chargeAmount && parseFloat(chargeAmount) >= 1000 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700 font-medium">Bonus : +{((parseFloat(chargeAmount) || 0) * 0.10).toFixed(2)} MAD (10%)</p>
                  </div>
                )}
                {chargeAmount && parseFloat(chargeAmount) >= 500 && parseFloat(chargeAmount) < 1000 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700 font-medium">Bonus : +{((parseFloat(chargeAmount) || 0) * 0.05).toFixed(2)} MAD (5%)</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {chargeInstructions ? (
                <Button onClick={() => { setChargeModalOpen(false); setChargeInstructions(null); setChargeAmount(''); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  J'ai compris
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setChargeModalOpen(false)}>Annuler</Button>
                  <Button onClick={handleCharge} disabled={charging} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {charging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {charging ? 'Traitement...' : 'Continuer'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Preuve de paiement */}
      {proofModalOpen && (
        <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" /> Soumettre une preuve de paiement
              </DialogTitle>
              <DialogDescription>
                Uploadez une capture d'écran ou saisissez un numéro de transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="proof-file">Preuve (image ou PDF)</Label>
                <Input
                  id="proof-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                {proofFile && (
                  <p className="text-xs text-slate-500 mt-1">{proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)</p>
                )}
              </div>
              <div>
                <Label htmlFor="proof-text">Ou numéro de transaction (texte)</Label>
                <Textarea
                  id="proof-text"
                  rows={3}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Ex : N° de virement 123456789 / ID PayPal 9XK1234ABCD"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProofModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmitProof} disabled={submittingProof} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submittingProof ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {submittingProof ? 'Envoi...' : 'Soumettre'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
