'use client';

// ============================================================================
// InscriptionForm — Formulaire d'inscription candidat (public)
// ============================================================================
// Multi-sections :
//   1. Formation visée (niveau)
//   2. Identité (nom, prénom, genre, date naissance)
//   3. Contact (email, téléphone, adresse) — AJOUTÉ vs Google Form original
//   4. Scolarité (niveau scolaire, dernier diplôme)
//   5. Expérience HSE
//   6. Récap + submit
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  GraduationCap, User, Mail, Phone, MapPin, Calendar,
  Send, ArrowLeft, ArrowRight, CheckCircle2, Loader2,
  BookOpen, Award, ShieldCheck, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FormationData {
  id: string;
  title: string;
  slug: string;
  level: string;
  duration: string;
  prerequisites?: string | null;
  shortDescription: string;
}

// Niveaux d'inscription — correspond aux 6 formations diplômantes + VAE
const NIVEAUX_INSCRIPTION = [
  { value: 'Qualification', label: 'Qualification', desc: '2 ans — Niveau scolaire 4ème année collège' },
  { value: 'Technicien', label: 'Technicien', desc: '2 ans — Niveau 2ème année bac' },
  { value: 'Technicien Spécialisé', label: 'Technicien Spécialisé', desc: '2 ans — Baccalauréat' },
  { value: 'Licence Professionnelle', label: 'Licence Professionnelle', desc: '1 an — Bac+2' },
  { value: 'Master Professionnel', label: 'Master Professionnel', desc: '2 ans — Licence ou équivalent' },
  { value: 'VAE', label: 'VAE — Validation des Acquis', desc: 'Validation de l\'expérience professionnelle' },
];

const NIVEAUX_SCOLAIRES = [
  '3ème collège', '2ème bac', 'Baccalauréat', 'Bac + 2', 'Licence (ou Bac + 3)', 'Master', 'Doctorat',
];

const EXPERIENCES_HSE = [
  'Aucune expérience', 'Animateur', 'Superviseur', 'Responsable', 'Manager',
];

const STEPS = [
  { num: 1, label: 'Formation', icon: GraduationCap },
  { num: 2, label: 'Identité', icon: User },
  { num: 3, label: 'Contact', icon: Mail },
  { num: 4, label: 'Scolarité', icon: BookOpen },
  { num: 5, label: 'Expérience', icon: Award },
  { num: 6, label: 'Validation', icon: ShieldCheck },
];

export default function InscriptionForm({ formation }: { formation: FormationData }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inscriptionId, setInscriptionId] = useState<string | null>(null);

  // Tous les champs du formulaire
  const [formationLevel, setFormationLevel] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [genre, setGenre] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [residence, setResidence] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [niveauScolaire, setNiveauScolaire] = useState('');
  const [dernierDiplome, setDernierDiplome] = useState('');
  const [experienceHSE, setExperienceHSE] = useState('');

  // Auto-sélectionner le niveau basé sur le slug de la formation
  const guessLevelFromSlug = (slug: string): string => {
    if (slug.includes('diplome-qualifie')) return 'Qualification';
    if (slug.includes('technicien-superieur')) return 'Technicien Spécialisé';
    if (slug.includes('technicien')) return 'Technicien';
    if (slug.includes('licence')) return 'Licence Professionnelle';
    if (slug.includes('master')) return 'Master Professionnel';
    if (slug.includes('vae')) return 'VAE';
    return '';
  };

  // Si formationLevel pas encore choisi, on pré-remplit avec le niveau deviné
  const effectiveFormationLevel = formationLevel || guessLevelFromSlug(formation.slug);

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!effectiveFormationLevel) return 'Veuillez sélectionner un niveau d\'inscription';
    }
    if (s === 2) {
      if (!nom.trim() || nom.trim().length < 2) return 'Nom requis';
      if (!prenom.trim() || prenom.trim().length < 2) return 'Prénom requis';
      if (!genre) return 'Genre requis';
    }
    if (s === 3) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email valide requis';
      if (!phone.trim() || phone.trim().length < 6) return 'Téléphone requis (format international recommandé)';
    }
    if (s === 4) {
      if (!niveauScolaire) return 'Niveau scolaire requis';
    }
    if (s === 5) {
      if (!experienceHSE) return 'Veuillez indiquer votre expérience en HSE';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(s => Math.min(s + 1, 6));
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
    const err = validateStep(1) || validateStep(2) || validateStep(3) || validateStep(4) || validateStep(5);
    if (err) {
      toast.error(err);
      // Aller à la première étape qui a une erreur
      if (!effectiveFormationLevel) setStep(1);
      else if (!nom || !prenom || !genre) setStep(2);
      else if (!email || !phone) setStep(3);
      else if (!niveauScolaire) setStep(4);
      else if (!experienceHSE) setStep(5);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationSlug: formation.slug,
          formationLevel: effectiveFormationLevel,
          nom: nom.trim(),
          prenom: prenom.trim(),
          genre,
          birthDate: birthDate || undefined,
          residence: residence.trim() || undefined,
          nationalite: nationalite.trim() || undefined,
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          addressStreet: addressStreet.trim() || undefined,
          addressCity: addressCity.trim() || undefined,
          addressPostalCode: addressPostalCode.trim() || undefined,
          addressCountry: addressCountry.trim() || undefined,
          niveauScolaire,
          dernierDiplome: dernierDiplome.trim() || undefined,
          experienceHSE,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la soumission');
        return;
      }
      setInscriptionId(data.inscriptionId);
      setSubmitted(true);
      toast.success('Votre demande a été enregistrée avec succès !');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Erreur réseau, veuillez réessayer');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
                Bonjour <strong>{prenom} {nom}</strong>, votre demande d'inscription pour la formation{' '}
                <strong>{formation.title}</strong> a bien été enregistrée.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Référence de votre demande</p>
                <p className="font-mono text-sm text-slate-900">{inscriptionId}</p>
              </div>
              <p className="text-slate-600 mb-6">
                Un email de confirmation a été envoyé à <strong>{email}</strong>.
                Notre équipe d'admission vous contactera dans les plus brefs délais.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/">
                  <Button>Retour à l'accueil</Button>
                </Link>
                <Link href={`/f/${formation.slug}`}>
                  <Button variant="outline">Voir la formation</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href={`/f/${formation.slug}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 mb-3">
            <ArrowLeft className="h-4 w-4" /> Retour à la formation
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Inscription — {formation.title}</h1>
          <p className="text-slate-600 mt-2">{formation.shortDescription}</p>
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

        {/* Étape 1 : Formation */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <GraduationCap className="h-5 w-5" /> Niveau d'inscription
              </CardTitle>
              <CardDescription>À quel niveau souhaitez-vous vous inscrire ?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={effectiveFormationLevel} onValueChange={setFormationLevel} className="space-y-3">
                {NIVEAUX_INSCRIPTION.map(n => (
                  <Label key={n.value} htmlFor={`niv-${n.value}`} className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    effectiveFormationLevel === n.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'
                  }`}>
                    <RadioGroupItem value={n.value} id={`niv-${n.value}`} className="mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{n.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{n.desc}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Identité */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <User className="h-5 w-5" /> Votre identité
              </CardTitle>
              <CardDescription>Veuillez renseigner vos informations personnelles</CardDescription>
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
              <div className="space-y-3">
                <Label className="font-semibold">Genre *</Label>
                <RadioGroup value={genre} onValueChange={setGenre} className="flex gap-6">
                  <Label htmlFor="genre-m" className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 hover:border-emerald-200 transition-all" >
                    <RadioGroupItem value="M" id="genre-m" />
                    <span className="font-medium">Masculin (M)</span>
                  </Label>
                  <Label htmlFor="genre-f" className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 hover:border-emerald-200 transition-all">
                    <RadioGroupItem value="F" id="genre-f" />
                    <span className="font-medium">Féminin (F)</span>
                  </Label>
                </RadioGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="font-semibold">Date de naissance</Label>
                  <Input id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalite" className="font-semibold">Nationalité</Label>
                  <Input id="nationalite" value={nationalite} onChange={e => setNationalite(e.target.value)} placeholder="Votre nationalité" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="residence" className="font-semibold">Résidence (ville / pays)</Label>
                <Input id="residence" value={residence} onChange={e => setResidence(e.target.value)} placeholder="Ex : Casablanca, Maroc" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3 : Contact */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Mail className="h-5 w-5" /> Coordonnées de contact
              </CardTitle>
              <CardDescription>
                Ces informations sont essentielles pour que notre équipe puisse vous contacter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email *
                  </Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Téléphone *
                  </Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6 XX XX XX XX" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                Format international recommandé pour le téléphone (ex : +212 pour le Maroc, +33 pour la France).
                Notre équipe d'admission vous contactera par email et/ou par téléphone.
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressStreet" className="font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Adresse
                </Label>
                <Input id="addressStreet" value={addressStreet} onChange={e => setAddressStreet(e.target.value)} placeholder="N°, rue, quartier" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressCity" className="font-semibold">Ville</Label>
                  <Input id="addressCity" value={addressCity} onChange={e => setAddressCity(e.target.value)} placeholder="Ville" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressPostalCode" className="font-semibold">Code postal</Label>
                  <Input id="addressPostalCode" value={addressPostalCode} onChange={e => setAddressPostalCode(e.target.value)} placeholder="Code postal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressCountry" className="font-semibold">Pays</Label>
                  <Input id="addressCountry" value={addressCountry} onChange={e => setAddressCountry(e.target.value)} placeholder="Pays" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 4 : Scolarité */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <BookOpen className="h-5 w-5" /> Parcours scolaire
              </CardTitle>
              <CardDescription>Votre niveau scolaire actuel et votre dernier diplôme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-semibold">Niveau scolaire *</Label>
                <RadioGroup value={niveauScolaire} onValueChange={setNiveauScolaire} className="grid sm:grid-cols-2 gap-3">
                  {NIVEAUX_SCOLAIRES.map(n => (
                    <Label key={n} htmlFor={`nscol-${n}`} className="flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer hover:border-emerald-200 transition-all">
                      <RadioGroupItem value={n} id={`nscol-${n}`} />
                      <span className="font-medium text-sm">{n}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dernierDiplome" className="font-semibold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Dernier diplôme obtenu
                </Label>
                <Input id="dernierDiplome" value={dernierDiplome} onChange={e => setDernierDiplome(e.target.value)} placeholder="Ex : Baccalauréat Sciences Expérimentales" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 5 : Expérience HSE */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Award className="h-5 w-5" /> Expérience en HSE
              </CardTitle>
              <CardDescription>Votre niveau d'expérience dans le domaine QHSE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="font-semibold">Votre expérience en HSE *</Label>
                <RadioGroup value={experienceHSE} onValueChange={setExperienceHSE} className="grid sm:grid-cols-2 gap-3">
                  {EXPERIENCES_HSE.map(e => (
                    <Label key={e} htmlFor={`exp-${e}`} className="flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:border-emerald-200 transition-all">
                      <RadioGroupItem value={e} id={`exp-${e}`} />
                      <span className="font-medium">{e}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 6 : Validation */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" /> Validation
              </CardTitle>
              <CardDescription>Vérifiez vos informations avant de soumettre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><span className="text-slate-500">Formation :</span> <strong>{formation.title}</strong></div>
                <div><span className="text-slate-500">Niveau :</span> <strong>{effectiveFormationLevel}</strong></div>
                <div><span className="text-slate-500">Nom :</span> <strong>{nom} {prenom}</strong></div>
                <div><span className="text-slate-500">Genre :</span> <strong>{genre === 'M' ? 'Masculin' : genre === 'F' ? 'Féminin' : '—'}</strong></div>
                {birthDate && <div><span className="text-slate-500">Date de naissance :</span> <strong>{new Date(birthDate).toLocaleDateString('fr-FR')}</strong></div>}
                {nationalite && <div><span className="text-slate-500">Nationalité :</span> <strong>{nationalite}</strong></div>}
                {residence && <div><span className="text-slate-500">Résidence :</span> <strong>{residence}</strong></div>}
                <div><span className="text-slate-500">Email :</span> <strong>{email}</strong></div>
                <div><span className="text-slate-500">Téléphone :</span> <strong>{phone || '—'}</strong></div>
                {addressStreet && <div><span className="text-slate-500">Adresse :</span> <strong>{addressStreet}{addressCity ? `, ${addressCity}` : ''}{addressCountry ? `, ${addressCountry}` : ''}</strong></div>}
                <div><span className="text-slate-500">Niveau scolaire :</span> <strong>{niveauScolaire || '—'}</strong></div>
                {dernierDiplome && <div><span className="text-slate-500">Dernier diplôme :</span> <strong>{dernierDiplome}</strong></div>}
                <div><span className="text-slate-500">Expérience HSE :</span> <strong>{experienceHSE || '—'}</strong></div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                En soumettant ce formulaire, vous acceptez que les informations fournies soient traitées par HSE Academy
                (Institut International des Compétences Professionnelles QHSE) aux fins d'examen de votre demande d'inscription.
                Vos données ne seront pas partagées avec des tiers. Vous pouvez exercer votre droit d'accès, de rectification
                et de suppression en nous contactant à contact@institutqhse.com.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Précédent
          </Button>
          <span className="text-sm text-slate-400">Étape {step} sur 6</span>
          {step < 6 ? (
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
