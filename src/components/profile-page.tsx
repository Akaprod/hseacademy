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

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, Shield, ShieldCheck, ShieldAlert, Lock, User, Calendar,
  MapPin, Home, Facebook, Linkedin, Twitter, Globe, Award, Play,
  FileCheck, ExternalLink, Loader2, CheckCircle, BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  }, [data?.profile, user?.name]);

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

  // Fetch payments
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
              <TabsTrigger value="social" className="gap-1.5">
                <Globe className="h-4 w-4" /> Mes réseaux
              </TabsTrigger>
              <TabsTrigger value="trainings" className="gap-1.5">
                <BookOpen className="h-4 w-4" /> Mes formations
              </TabsTrigger>
              <TabsTrigger value="attestations" className="gap-1.5">
                <Award className="h-4 w-4" /> Mes attestations
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

          {/* ============================ C: Réseaux sociaux ============================ */}
          <TabsContent value="social" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Globe className="h-5 w-5" /> Mes réseaux sociaux
                </CardTitle>
                <CardDescription>
                  Ajoutez vos liens professionnels pour enrichir votre profil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="gap-1.5">
                      <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="gap-1.5">
                      <Linkedin className="h-4 w-4 text-sky-700" /> LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="gap-1.5">
                      <Twitter className="h-4 w-4 text-slate-700" /> Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="gap-1.5">
                      <Globe className="h-4 w-4 text-emerald-600" /> Site web
                    </Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://votre-site.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveSocial}
                    disabled={savingSocial}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {savingSocial ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
                      </>
                    ) : (
                      <>Enregistrer</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                          <p className="text-xs text-slate-500">{p.method === 'bank_transfer' ? 'Virement' : 'PayPal'} — {p.amount} MAD</p>
                        </div>
                        <PaymentStatusBadge status={p.status} />
                      </div>
                    ))}
                    {printPayments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Attestation imprimée</p>
                          <p className="text-xs text-slate-500">{p.method === 'bank_transfer' ? 'Virement' : 'PayPal'} — {p.amount} MAD</p>
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
    </div>
  );
}
