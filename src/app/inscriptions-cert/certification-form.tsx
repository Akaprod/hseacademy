'use client';

// ============================================================================
// CertificationForm — Formulaire de demande pour formation certifiante
// ============================================================================
// 3 modes :
//   - individuel (contact <24h)
//   - groupe (liste d'attente — contact quand groupe prêt)
//   - entreprise (contact <24h)
//
// Champs communs : nom, prénom, email, téléphone
// Champs spécifiques :
//   - entreprise : nom entreprise
//   - groupe : nombre de personnes (min 2)
//
// Champs formation :
//   - Liste déroulante des 14 formations certifiantes
//   - OU "Autre" + texte libre si non trouvée
//
// Mode de formation : Présentiel / En ligne / Hybride (radio)
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Award, User, Mail, Phone, MapPin, Building2, Users,
  Send, ArrowLeft, ArrowRight, CheckCircle2, Loader2,
  Clock, Calendar, Briefcase, GraduationCap,
  ShieldCheck, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// Types
// ============================================================================
type Mode = 'individuel' | 'groupe' | 'entreprise';
type ModeFormation = 'presentiel' | 'ligne' | 'hybride';

interface FormationItem {
  slug: string;
  title: string;
}

interface CertificationFormProps {
  formations: FormationItem[];
  preselectedFormation: { slug: string; title: string } | null;
  initialMode: Mode;
}

// ============================================================================
// Mode configuration — visuel + éditorial
// ============================================================================
const MODE_CONFIG: Record<Mode, {
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  badgeColor: string;
  badgeBg: string;
  shortDesc: string;
  longDesc: string;
  ctaLabel: string;
}> = {
  individuel: {
    label: 'Individuel',
    icon: User,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    shortDesc: 'Vous inscrivez seul(e)',
    longDesc: 'Inscrivez-vous individuellement à une session de formation. Notre équipe vous contacte dans les 24 heures maximum pour finaliser votre inscription.',
    ctaLabel: 'S\'inscrire individuellement',
  },
  groupe: {
    label: 'Groupe',
    icon: Users,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    shortDesc: 'Plusieurs participants',
    longDesc: 'Inscrivez un groupe de participants (à partir de 2 personnes). Vous êtes ajouté(e) à notre liste d\'attente — dès qu\'un groupe est constitué, nous vous contactons pour fixer les détails (date, lieu, mode).',
    ctaLabel: 'S\'inscrire en groupe',
  },
  entreprise: {
    label: 'Entreprise',
    icon: Building2,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    shortDesc: 'Formation sur mesure',
    longDesc: 'Demandez une formation sur mesure pour vos collaborateurs. Notre équipe commerciale vous contacte dans les 24 heures maximum pour échanger sur vos besoins et modalités (présentiel, en ligne, sur site).',
    ctaLabel: 'Demander pour mon entreprise',
  },
};

const MODE_FORMATION_LABELS: Record<ModeFormation, string> = {
  presentiel: 'Présentiel',
  ligne: 'En ligne',
  hybride: 'Hybride',
};

const STEPS = [
  { num: 1, label: 'Type', icon: Briefcase },
  { num: 2, label: 'Formation', icon: GraduationCap },
  { num: 3, label: 'Identité', icon: User },
  { num: 4, label: 'Validation', icon: ShieldCheck },
];

// ============================================================================
// Component
// ============================================================================
export default function CertificationForm({
  formations,
  preselectedFormation,
  initialMode,
}: CertificationFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  // === État du formulaire ===
  const [mode, setMode] = useState<Mode>(initialMode);
  const [formationSlug, setFormationSlug] = useState<string>(preselectedFormation?.slug || '');
  const [isOther, setIsOther] = useState<boolean>(!preselectedFormation);
  const [formationOther, setFormationOther] = useState<string>('');
  const [modeFormation, setModeFormation] = useState<ModeFormation>('presentiel');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [nbPersonnes, setNbPersonnes] = useState<number>(2);

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!mode) return 'Veuillez sélectionner un type d\'inscription';
    }
    if (s === 2) {
      if (!isOther && !formationSlug) return 'Veuillez sélectionner une formation';
      if (isOther && !formationOther.trim()) return 'Veuillez saisir le nom de la formation';
    }
    if (s === 3) {
      if (!nom.trim() || nom.trim().length < 2) return 'Nom requis';
      if (!prenom.trim() || prenom.trim().length < 2) return 'Prénom requis';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email valide requis';
      if (mode === 'entreprise' && (!entreprise.trim() || entreprise.trim().length < 2)) {
        return 'Nom de l\'entreprise requis';
      }
      if (mode === 'groupe' && (!nbPersonnes || nbPersonnes < 2)) {
        return 'Nombre de personnes minimum 2 pour un groupe';
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(s => Math.min(s + 1, 4));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const err = validateStep(1) || validateStep(2) || validateStep(3);
    if (err) {
      toast.error(err);
      if (!mode) setStep(1);
      else if (!isOther && !formationSlug) setStep(2);
      else if (isOther && !formationOther.trim()) setStep(2);
      else setStep(3);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/certification-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          formationSlug: isOther ? null : formationSlug,
          formationOther: isOther ? formationOther.trim() : null,
          modeFormation,
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          entreprise: mode === 'entreprise' ? entreprise.trim() : undefined,
          nbPersonnes: mode === 'groupe' ? nbPersonnes : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la soumission');
        return;
      }
      setRequestId(data.requestId);
      setSubmitted(true);
      toast.success('Votre demande a été enregistrée avec succès !');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Erreur réseau, veuillez réessayer');
    } finally {
      setSubmitting(false);
    }
  };

  // === Écran de confirmation ===
  if (submitted) {
    const cfg = MODE_CONFIG[mode];
    const formationLabel = !isOther
      ? formations.find(f => f.slug === formationSlug)?.title || formationSlug
      : formationOther.trim();

    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-emerald-200 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-4">Demande envoyée avec succès</h1>
              <p className="text-slate-700 text-lg mb-6">
                Bonjour <strong>{prenom} {nom}</strong>, votre demande a bien été enregistrée.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6 text-left space-y-2">
                <div className="flex items-start gap-3">
                  <cfg.icon className={`h-5 w-5 ${cfg.color} mt-0.5 shrink-0`} />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Type d'inscription</div>
                    <div className="font-semibold text-slate-900">{cfg.label}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Formation</div>
                    <div className="font-semibold text-slate-900">{formationLabel}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Mode de formation</div>
                    <div className="font-semibold text-slate-900">{MODE_FORMATION_LABELS[modeFormation]}</div>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg p-4 ${cfg.bg} border ${cfg.border} mb-6`}>
                <p className={`text-sm ${cfg.color} text-left`}>{cfg.longDesc}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Référence de votre demande</p>
                <p className="font-mono text-sm text-slate-900">{requestId}</p>
              </div>
              <p className="text-slate-600 mb-6">
                Un email de confirmation a été envoyé à <strong>{email}</strong>.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/">
                  <Button>Retour à l'accueil</Button>
                </Link>
                <Link href="/?page=formations">
                  <Button variant="outline">Voir les autres formations</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const cfg = MODE_CONFIG[mode];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 mb-3">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Inscription à une formation certifiante</h1>
          <p className="text-slate-600 mt-2">
            Déposez votre demande — notre équipe vous contactera selon le type d'inscription choisi.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center gap-2 min-w-fit">
                <div className={`flex flex-col items-center gap-2 ${i > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                    isActive ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' :
                    isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-emerald-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-12 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Étape 1 : Type d'inscription */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Briefcase className="h-5 w-5" /> Quel type d'inscription ?
              </CardTitle>
              <CardDescription>
                Choisissez le type d'inscription qui correspond à votre situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(MODE_CONFIG) as Mode[]).map(m => {
                const c = MODE_CONFIG[m];
                const Icon = c.icon;
                const isActive = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      isActive ? `${c.border} ${c.bg} shadow-sm` : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.badgeBg} ${c.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{c.label}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.badgeBg} ${c.color} font-medium`}>
                            {m === 'individuel' ? 'Contact 24h' : m === 'groupe' ? 'Liste d\'attente' : 'Contact 24h'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{c.shortDesc}</p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{c.longDesc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isActive ? `${c.border} ${c.bg}` : 'border-slate-300'
                      }`}>
                        {isActive && <CheckCircle2 className={`h-4 w-4 ${c.color}`} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Formation */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <GraduationCap className="h-5 w-5" /> Quelle formation cherchez-vous ?
              </CardTitle>
              <CardDescription>
                Choisissez parmi nos 14 formations certifiantes, ou saisissez le nom d'une formation que vous ne trouvez pas dans la liste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Toggle : liste vs autre */}
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { setIsOther(false); setFormationOther(''); }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    !isOther ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className={`h-5 w-5 ${!isOther ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900">Choisir dans la liste</span>
                  </div>
                  <p className="text-xs text-slate-500">14 formations certifiantes disponibles</p>
                </button>
                <button
                  onClick={() => { setIsOther(true); setFormationSlug(''); }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isOther ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`h-5 w-5 ${isOther ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900">Autre formation</span>
                  </div>
                  <p className="text-xs text-slate-500">Vous ne trouvez pas ? Saisissez son nom</p>
                </button>
              </div>

              {/* Liste des 14 formations */}
              {!isOther && (
                <div className="space-y-3">
                  <Label className="font-semibold text-slate-700">Sélectionnez votre formation</Label>
                  <RadioGroup
                    value={formationSlug}
                    onValueChange={setFormationSlug}
                    className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-lg"
                  >
                    {formations.map(f => (
                      <label
                        key={f.slug}
                        htmlFor={`f-${f.slug}`}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                          formationSlug === f.slug ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:border-slate-300 bg-white'
                        }`}
                      >
                        <RadioGroupItem
                          value={f.slug}
                          id={`f-${f.slug}`}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-sm font-medium text-slate-700 flex-1">{f.title}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  {formations.length === 0 && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                      Aucune formation certifiante disponible pour le moment. Veuillez utiliser l'option "Autre formation".
                    </p>
                  )}
                </div>
              )}

              {/* Autre formation : texte libre */}
              {isOther && (
                <div className="space-y-2">
                  <Label htmlFor="formationOther" className="font-semibold text-slate-700">
                    Nom de la formation recherchée
                  </Label>
                  <Input
                    id="formationOther"
                    value={formationOther}
                    onChange={e => setFormationOther(e.target.value)}
                    placeholder="Ex : Habilitation B1V, Formation spécifique..."
                  />
                  <p className="text-xs text-slate-500">
                    Précisez le nom ou la thématique de la formation que vous cherchez. Notre équipe vous proposera une solution adaptée.
                  </p>
                </div>
              )}

              {/* Mode de formation */}
              <div className="space-y-3 border-t border-slate-200 pt-5">
                <Label className="font-semibold text-slate-700">Mode de formation souhaité</Label>
                <RadioGroup
                  value={modeFormation}
                  onValueChange={(v) => setModeFormation(v as ModeFormation)}
                  className="grid sm:grid-cols-3 gap-3"
                >
                  {(['presentiel', 'ligne', 'hybride'] as ModeFormation[]).map(m => (
                    <label
                      key={m}
                      htmlFor={`mf-${m}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        modeFormation === m ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <RadioGroupItem value={m} id={`mf-${m}`} />
                      <span className="font-medium text-sm">{MODE_FORMATION_LABELS[m]}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Tarif */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Tarif
                </p>
                <div className="text-lg font-bold text-blue-900">Sur demande</div>
                <p className="text-xs text-blue-700 mt-1">
                  Le tarif vous sera communiqué par notre équipe après étude de votre demande,
                  selon le type d'inscription (Individuel / Groupe / Entreprise) et le mode de formation choisi.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3 : Identité + Contact + champs spécifiques */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <User className="h-5 w-5" /> Vos informations
              </CardTitle>
              <CardDescription>
                {mode === 'groupe'
                  ? 'Vos coordonnées + le nombre de participants à inscrire'
                  : mode === 'entreprise'
                  ? 'Vos coordonnées + le nom de votre entreprise'
                  : 'Vos coordonnées pour que notre équipe vous contacte'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="font-semibold">Nom *</Label>
                  <Input id="nom" value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="font-semibold">Prénom *</Label>
                  <Input id="prenom" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Votre prénom" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email *
                  </Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Téléphone
                  </Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6 XX XX XX XX" />
                </div>
              </div>

              {/* Champs spécifiques au mode */}
              {mode === 'entreprise' && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <Label htmlFor="entreprise" className="font-semibold flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Nom de l'entreprise *
                  </Label>
                  <Input
                    id="entreprise"
                    value={entreprise}
                    onChange={e => setEntreprise(e.target.value)}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              )}

              {mode === 'groupe' && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <Label htmlFor="nbPersonnes" className="font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Nombre de personnes à inscrire *
                  </Label>
                  <Input
                    id="nbPersonnes"
                    type="number"
                    min={2}
                    value={nbPersonnes}
                    onChange={e => setNbPersonnes(Math.max(2, parseInt(e.target.value) || 2))}
                  />
                  <p className="text-xs text-slate-500">
                    Minimum 2 personnes pour une inscription groupe. Le tarif sera communiqué après étude de votre demande.
                  </p>
                </div>
              )}

              {/* Note sur le mode */}
              <div className={`rounded-lg p-4 ${cfg.bg} border ${cfg.border}`}>
                <p className={`text-sm ${cfg.color} flex items-start gap-2`}>
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>À noter :</strong> {cfg.longDesc}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 4 : Validation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" /> Validation
              </CardTitle>
              <CardDescription>
                Vérifiez vos informations avant de soumettre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <div className="text-slate-500 text-xs uppercase">Type d'inscription</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <cfg.icon className="h-4 w-4" /> {cfg.label}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase">Formation</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {!isOther
                      ? formations.find(f => f.slug === formationSlug)?.title || formationSlug
                      : formationOther.trim()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase">Mode de formation</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{MODE_FORMATION_LABELS[modeFormation]}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase">Nom complet</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{nom} {prenom}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase">Email</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{email}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase">Téléphone</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{phone || '—'}</div>
                </div>
                {mode === 'entreprise' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Entreprise</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{entreprise}</div>
                  </div>
                )}
                {mode === 'groupe' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Nombre de personnes</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{nbPersonnes}</div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                En soumettant ce formulaire, vous acceptez que les informations fournies soient traitées par HSE Academy
                (IICP QHSE) aux fins d'examen de votre demande. Vos données ne seront pas partagées avec des tiers.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Précédent
          </Button>
          <span className="text-sm text-slate-400">Étape {step} sur 4</span>
          {step < 4 ? (
            <Button onClick={nextStep} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              Suivant <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Envoi…</> : <><Send className="h-4 w-4 mr-1.5" /> Soumettre ma demande</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
