'use client';

// ============================================================================
// CV Sections — 7 rubriques du CV professionnel
// ============================================================================
// Composant réutilisable contenant tous les sous-formulaires des 7 rubriques :
//   1. Profil professionnel (présentation détaillée)
//   2. Expériences professionnelles (add/edit/delete)
//   3. Formation & Diplômes (add/edit/delete)
//   4. Compétences (add/edit/delete, avec niveau + catégorie)
//   5. Certifications & Attestations (add/edit/delete)
//   6. Langues (add/edit/delete)
//   7. Informations complémentaires (permis, mobilité, disponibilité, projets, bénévolat, centres d'intérêt)
//
// Persistance : POST /api/profile/username (PATCH) — chaque section se sauvegarde
// individuellement via un appel PATCH qui n'envoie QUE la section modifiée.
//
// RÈGLE ABSOLUE : ne pas casser l'existant. Les champs cvTitle, cvBio, cvSkills,
// cvExperience, cvTemplate, cvColorPrimary, cvColorAccent, cvLayout, username,
// profilePublic, avatar, fullName, réseaux sociaux — sont TOUJOURS gérés par
// profile-page.tsx et NE SONT PAS touchés par ce composant.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Loader2, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Award, Globe, Settings, FileText, Heart,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ============================================================================
// TYPES (pour les 7 rubriques)
// ============================================================================

interface Experience {
  id: string; // identifiant unique pour React key
  jobTitle: string;
  company: string;
  location: string;
  startDate: string; // "MM-YYYY"
  endDate: string;   // "MM-YYYY" ou ""
  current: boolean;  // travaille actuellement
  contractType: string;
  contractTypeOther: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  degreeType: string;
  degreeTypeOther: string;
  field: string;
  institution: string;
  location: string;
  graduationDate: string; // "MM-YYYY"
  inProgress: boolean;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: string; // Débutant, Notions, Intermédiaire, Avancé, Expert
  category: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string; // "MM-YYYY"
  number: string;
  verifyUrl: string;
  expiryDate: string; // "MM-YYYY"
  noExpiry: boolean;
  // source: 'manual' | 'iicp' (réservé pour intégration future)
  source?: string;
}

interface Language {
  id: string;
  language: string;
  languageOther: string;
  level: string;
}

interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface AdditionalInfo {
  drivingLicenses: string[]; // multi-sélection
  drivingLicenseOther: string;
  mobility: string;
  availability: string;
  professionalProjects: string;
  volunteerExperiences: VolunteerExperience[];
  interests: string[]; // tags
}

// ============================================================================
// HELPER — normalise un objet AdditionalInfo partiellement rempli (par ex. "{}"
// en DB) en garantissant que TOUS les champs sont présents avec le bon type.
// Sans cette normalisation, info.drivingLicenses ou info.interests peuvent
// être undefined, et info.drivingLicenses.includes(l) génère l'erreur runtime
// "Cannot read properties of undefined (reading 'includes')" qui crash le tab CV.
// ============================================================================
function normalizeAdditionalInfo(i: any): AdditionalInfo {
  return {
    drivingLicenses: Array.isArray(i?.drivingLicenses) ? i.drivingLicenses : [],
    drivingLicenseOther: typeof i?.drivingLicenseOther === 'string' ? i.drivingLicenseOther : '',
    mobility: typeof i?.mobility === 'string' ? i.mobility : '',
    availability: typeof i?.availability === 'string' ? i.availability : '',
    professionalProjects: typeof i?.professionalProjects === 'string' ? i.professionalProjects : '',
    volunteerExperiences: Array.isArray(i?.volunteerExperiences) ? i.volunteerExperiences : [],
    interests: Array.isArray(i?.interests) ? i.interests : [],
  };
}

interface CVSectionsProps {
  profile: any; // le profile chargé depuis /api/profile
  onChanged?: () => void; // callback pour recharger le profile après save
}

// ============================================================================
// HELPER — génère un ID unique pour les nouveaux items
// ============================================================================
function newId(): string {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// ============================================================================
// HELPER — parse JSON safe (retourne [] ou {} si invalide)
// ============================================================================
function parseJsonSafe<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
}

// ============================================================================
// HELPER — save PATCH sur /api/profile/username
// ============================================================================
async function patchCV(data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch('/api/profile/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Échec de l\'enregistrement');
      return false;
    }
    return true;
  } catch {
    toast.error('Erreur réseau');
    return false;
  }
}

// ============================================================================
// COMPOSANTS UI RÉUTILISABLES
// ============================================================================

// Sélecteur Mois/Année
function MonthYearInput({ value, onChange, placeholder = "MM-AAAA", disabled = false }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const months = [
    { v: '01', l: 'Jan' }, { v: '02', l: 'Fév' }, { v: '03', l: 'Mar' },
    { v: '04', l: 'Avr' }, { v: '05', l: 'Mai' }, { v: '06', l: 'Juin' },
    { v: '07', l: 'Juil' }, { v: '08', l: 'Août' }, { v: '09', l: 'Sep' },
    { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Déc' },
  ];
  // Value format: "MM-YYYY"
  const [month, year] = value.split('-');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i));
  return (
    <div className="flex gap-2">
      <Select value={month || ''} onValueChange={(m) => onChange(`${m}-${year || ''}`)} disabled={disabled}>
        <SelectTrigger className="flex-1"><SelectValue placeholder="Mois" /></SelectTrigger>
        <SelectContent>
          {months.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={year || ''} onValueChange={(y) => onChange(`${month || ''}-${y}`)} disabled={disabled}>
        <SelectTrigger className="flex-1"><SelectValue placeholder="Année" /></SelectTrigger>
        <SelectContent>
          {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// Carte d'item avec boutons éditer/supprimer
function ItemCard({ title, subtitle, date, onEdit, onDelete, isEditing, children }: {
  title: string;
  subtitle?: string;
  date?: string;
  onEdit?: () => void;
  onDelete: () => void;
  isEditing?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
      {(title || subtitle || date) && !isEditing && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title && <p className="font-medium text-slate-800 truncate">{title}</p>}
            {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
            {date && <p className="text-xs text-slate-400 mt-0.5">{date}</p>}
          </div>
          {onEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 shrink-0" onClick={onEdit} title="Modifier">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 shrink-0" onClick={onDelete} title="Supprimer">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      {isEditing ? children : null}
      {!isEditing && children}
    </div>
  );
}

// Bouton "Ajouter"
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="border-dashed w-full">
      <Plus className="h-4 w-4 mr-2" /> {label}
    </Button>
  );
}

// ============================================================================
// SECTION 1 (anciennement « Profil professionnel ») — SUPPRIMÉE
// ============================================================================
// La section « Profil professionnel » (champ cvProfessionalProfile) a été
// supprimée car elle était en doublon visuel avec la « Bio courte » (champ
// cvBio) du Card parent. Le champ DB cvProfessionalProfile est conservé pour
// rétro-compatibilité (données déjà saisies non perdues) mais n'est plus
// éditable ni affiché. L'API PATCH /api/profile/username accepte toujours ce
// champ sans erreur.
// ============================================================================
// ============================================================================
// SECTION 2 — EXPÉRIENCES PROFESSIONNELLES
// ============================================================================
function SectionExperiences({ initial, onSave }: { initial: Experience[]; onSave: (v: Experience[]) => void }) {
  const [items, setItems] = useState<Experience[]>(initial || []);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setItems(initial || []), [initial]);

  const handleAdd = () => {
    const id = newId();
    setItems([...items, {
      id, jobTitle: '', company: '', location: '', startDate: '', endDate: '',
      current: false, contractType: '', contractTypeOther: '', description: '',
    }]);
    setEditing(id);
    setOpen(true);
  };

  const handleUpdate = (id: string, patch: Partial<Experience>) => {
    setItems(items.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    const newItems = items.filter(it => it.id !== id);
    setItems(newItems);
    handleSave(newItems);
  };

  const handleSave = async (toSave: Experience[]) => {
    setSaving(true);
    // Validation : chaque experience doit avoir au moins un jobTitle
    const cleaned = toSave.map(it => ({ ...it, jobTitle: it.jobTitle.trim() })).filter(it => it.jobTitle);
    const ok = await patchCV({ cvExperiences: cleaned });
    setSaving(false);
    if (ok) {
      toast.success(`${cleaned.length} expérience(s) enregistrée(s)`);
      onSave(cleaned);
      setEditing(null);
    }
  };

  const contractTypes = ['CDI', 'CDD', 'Intérim', 'Freelance', 'Stage', 'Alternance', 'Consultant', 'Bénévolat', 'Autre'];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <Briefcase className="h-5 w-5" /> Expériences professionnelles
                {items.length > 0 && <Badge variant="secondary" className="ml-2">{items.length}</Badge>}
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune expérience. Cliquez sur "Ajouter" pour commencer.</p>}
            {items.map(it => (
              <ItemCard
                key={it.id}
                title={it.jobTitle || 'Nouvelle expérience'}
                subtitle={it.company || ''}
                date={`${it.startDate || '?'} — ${it.current ? 'Aujourd\'hui' : (it.endDate || '?')}`}
                onEdit={() => setEditing(it.id === editing ? null : it.id)}
                onDelete={() => handleDelete(it.id)}
                isEditing={editing === it.id}
              >
                {editing === it.id && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label>Poste occupé *</Label>
                      <Input value={it.jobTitle} onChange={(e) => handleUpdate(it.id, { jobTitle: e.target.value })} placeholder="Ex: Responsable HSE" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Entreprise / Organisation</Label>
                        <Input value={it.company} onChange={(e) => handleUpdate(it.id, { company: e.target.value })} placeholder="Ex: Entreprise XYZ" />
                      </div>
                      <div>
                        <Label>Localisation</Label>
                        <Input value={it.location} onChange={(e) => handleUpdate(it.id, { location: e.target.value })} placeholder="Ex: Casablanca, Maroc" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date de début</Label>
                        <MonthYearInput value={it.startDate} onChange={(v) => handleUpdate(it.id, { startDate: v })} />
                      </div>
                      <div>
                        <Label>Date de fin</Label>
                        <MonthYearInput value={it.endDate} onChange={(v) => handleUpdate(it.id, { endDate: v })} disabled={it.current} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox" id={`current-${it.id}`} checked={it.current}
                        onChange={(e) => handleUpdate(it.id, { current: e.target.checked, endDate: e.target.checked ? '' : it.endDate })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`current-${it.id}`} className="text-sm font-normal cursor-pointer">Je travaille actuellement à ce poste</Label>
                    </div>
                    <div>
                      <Label>Type de contrat</Label>
                      <Select value={it.contractType} onValueChange={(v) => handleUpdate(it.id, { contractType: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                        <SelectContent>
                          {contractTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {it.contractType === 'Autre' && (
                        <Input className="mt-2" value={it.contractTypeOther} onChange={(e) => handleUpdate(it.id, { contractTypeOther: e.target.value })} placeholder="Précisez le type de contrat" />
                      )}
                    </div>
                    <div>
                      <Label>Description / Missions</Label>
                      <Textarea rows={3} value={it.description} onChange={(e) => handleUpdate(it.id, { description: e.target.value })} placeholder="Décrivez vos principales missions, responsabilités et réalisations." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Annuler</Button>
                      <Button size="sm" onClick={() => handleSave(items)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer
                      </Button>
                    </div>
                  </div>
                )}
              </ItemCard>
            ))}
            <AddButton label="Ajouter une expérience" onClick={handleAdd} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// SECTION 3 — FORMATION & DIPLÔMES
// ============================================================================
function SectionEducation({ initial, onSave }: { initial: Education[]; onSave: (v: Education[]) => void }) {
  const [items, setItems] = useState<Education[]>(initial || []);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setItems(initial || []), [initial]);

  const handleAdd = () => {
    const id = newId();
    setItems([...items, {
      id, degree: '', degreeType: '', degreeTypeOther: '', field: '',
      institution: '', location: '', graduationDate: '', inProgress: false, description: '',
    }]);
    setEditing(id);
    setOpen(true);
  };

  const handleUpdate = (id: string, patch: Partial<Education>) => {
    setItems(items.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce diplôme ?')) return;
    const newItems = items.filter(it => it.id !== id);
    setItems(newItems);
    handleSave(newItems);
  };

  const handleSave = async (toSave: Education[]) => {
    setSaving(true);
    const cleaned = toSave.map(it => ({ ...it, degree: it.degree.trim() })).filter(it => it.degree);
    const ok = await patchCV({ cvEducation: cleaned });
    setSaving(false);
    if (ok) {
      toast.success(`${cleaned.length} diplôme(s) enregistré(s)`);
      onSave(cleaned);
      setEditing(null);
    }
  };

  const degreeTypes = ['Baccalauréat', 'Certificat', 'Technicien', 'Technicien Spécialisé', 'DUT', 'BTS', 'Licence', 'Licence Professionnelle', 'Master', 'Master Professionnel', 'Doctorat', 'Formation professionnelle', 'Autre'];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <GraduationCap className="h-5 w-5" /> Formation &amp; Diplômes
                {items.length > 0 && <Badge variant="secondary" className="ml-2">{items.length}</Badge>}
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucun diplôme. Cliquez sur "Ajouter" pour commencer.</p>}
            {items.map(it => (
              <ItemCard
                key={it.id}
                title={it.degree || 'Nouveau diplôme'}
                subtitle={`${it.degreeType}${it.field ? ' — ' + it.field : ''}${it.institution ? ' — ' + it.institution : ''}`}
                date={it.inProgress ? 'En cours' : (it.graduationDate || '')}
                onEdit={() => setEditing(it.id === editing ? null : it.id)}
                onDelete={() => handleDelete(it.id)}
                isEditing={editing === it.id}
              >
                {editing === it.id && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label>Intitulé du diplôme / formation *</Label>
                      <Input value={it.degree} onChange={(e) => handleUpdate(it.id, { degree: e.target.value })} placeholder="Ex: Technicien Spécialisé en QHSE" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type de diplôme</Label>
                        <Select value={it.degreeType} onValueChange={(v) => handleUpdate(it.id, { degreeType: v })}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                          <SelectContent>
                            {degreeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {it.degreeType === 'Autre' && (
                          <Input className="mt-2" value={it.degreeTypeOther} onChange={(e) => handleUpdate(it.id, { degreeTypeOther: e.target.value })} placeholder="Précisez le type" />
                        )}
                      </div>
                      <div>
                        <Label>Domaine / Spécialité</Label>
                        <Input value={it.field} onChange={(e) => handleUpdate(it.id, { field: e.target.value })} placeholder="Ex: Qualité, Hygiène, Sécurité et Environnement" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Établissement</Label>
                        <Input value={it.institution} onChange={(e) => handleUpdate(it.id, { institution: e.target.value })} placeholder="Ex: IICP" />
                      </div>
                      <div>
                        <Label>Ville / Pays</Label>
                        <Input value={it.location} onChange={(e) => handleUpdate(it.id, { location: e.target.value })} placeholder="Ex: Casablanca, Maroc" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox" id={`inprogress-${it.id}`} checked={it.inProgress}
                        onChange={(e) => handleUpdate(it.id, { inProgress: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`inprogress-${it.id}`} className="text-sm font-normal cursor-pointer">Formation en cours</Label>
                    </div>
                    {!it.inProgress && (
                      <div>
                        <Label>Date d'obtention</Label>
                        <MonthYearInput value={it.graduationDate} onChange={(v) => handleUpdate(it.id, { graduationDate: v })} />
                      </div>
                    )}
                    <div>
                      <Label>Description (facultatif)</Label>
                      <Textarea rows={2} value={it.description} onChange={(e) => handleUpdate(it.id, { description: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Annuler</Button>
                      <Button size="sm" onClick={() => handleSave(items)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer
                      </Button>
                    </div>
                  </div>
                )}
              </ItemCard>
            ))}
            <AddButton label="Ajouter un diplôme" onClick={handleAdd} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// SECTION 4 — COMPÉTENCES
// ============================================================================
function SectionSkills({ initial, onSave }: { initial: Skill[]; onSave: (v: Skill[]) => void }) {
  const [items, setItems] = useState<Skill[]>(initial || []);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState<Skill | null>(null);

  useEffect(() => setItems(initial || []), [initial]);

  const handleAdd = () => {
    setNewSkill({ id: newId(), name: '', level: 'Notions', category: 'Technique' });
    setOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!newSkill || !newSkill.name.trim()) {
      toast.error('Le nom de la compétence est requis');
      return;
    }
    const updated = [...items, newSkill];
    setItems(updated);
    setNewSkill(null);
    setSaving(true);
    const ok = await patchCV({ cvSkillsStructured: updated });
    setSaving(false);
    if (ok) {
      toast.success('Compétence ajoutée');
      onSave(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    setSaving(true);
    const ok = await patchCV({ cvSkillsStructured: updated });
    setSaving(false);
    if (ok) {
      toast.success('Compétence supprimée');
      onSave(updated);
    }
  };

  const suggestions = {
    QHSE: ['Gestion des risques', 'Analyse des risques', 'Audit HSE', 'ISO 45001', 'ISO 9001', 'ISO 14001', 'Évaluation des risques', 'Sécurité incendie', 'Travail en hauteur', 'LOTO', 'Gestion des déchets', 'Premiers secours'],
    Informatique: ['Microsoft Word', 'Microsoft Excel', 'PowerPoint', 'WordPress', 'HTML', 'CSS', 'JavaScript', 'PHP', 'SQL'],
    Marketing: ['SEO', 'Réseaux sociaux', 'Community Management', 'Google Ads', 'Content Marketing'],
  };
  const categories = ['Technique', 'Professionnelle', 'Informatique', 'Management', 'Communication', 'Autre'];
  const levels = ['Débutant', 'Notions', 'Intermédiaire', 'Avancé', 'Expert'];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <Settings className="h-5 w-5" /> Compétences
                {items.length > 0 && <Badge variant="secondary" className="ml-2">{items.length}</Badge>}
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune compétence. Cliquez sur "Ajouter" pour commencer.</p>}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {items.map(it => (
                  <div key={it.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                    <span className="text-sm font-medium text-emerald-800">{it.name}</span>
                    <Badge variant="outline" className="text-xs bg-white">{it.level}</Badge>
                    {it.category && it.category !== 'Technique' && <Badge variant="outline" className="text-xs bg-white">{it.category}</Badge>}
                    <button onClick={() => handleDelete(it.id)} className="text-slate-400 hover:text-red-600" title="Supprimer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newSkill && (
              <div className="border border-emerald-200 rounded-lg p-4 space-y-3 bg-emerald-50/50">
                <div>
                  <Label>Nom de la compétence *</Label>
                  <Input value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="Ex: Audit HSE" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...(suggestions.QHSE || []), ...(suggestions.Informatique || [])].slice(0, 8).map(s => (
                      <button key={s} onClick={() => setNewSkill({ ...newSkill, name: s })} className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-emerald-400">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Niveau</Label>
                    <Select value={newSkill.level} onValueChange={(v) => setNewSkill({ ...newSkill, level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={newSkill.category} onValueChange={(v) => setNewSkill({ ...newSkill, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setNewSkill(null)}>Annuler</Button>
                  <Button size="sm" onClick={handleConfirmAdd} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Ajouter
                  </Button>
                </div>
              </div>
            )}
            {!newSkill && <AddButton label="Ajouter une compétence" onClick={handleAdd} />}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// SECTION 5 — CERTIFICATIONS &amp; ATTESTATIONS
// ============================================================================
function SectionCertifications({ initial, onSave }: { initial: Certification[]; onSave: (v: Certification[]) => void }) {
  const [items, setItems] = useState<Certification[]>(initial || []);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setItems(initial || []), [initial]);

  const handleAdd = () => {
    const id = newId();
    setItems([...items, {
      id, name: '', issuer: '', date: '', number: '', verifyUrl: '',
      expiryDate: '', noExpiry: false, source: 'manual',
    }]);
    setEditing(id);
    setOpen(true);
  };

  const handleUpdate = (id: string, patch: Partial<Certification>) => {
    setItems(items.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer cette certification ?')) return;
    const newItems = items.filter(it => it.id !== id);
    setItems(newItems);
    handleSave(newItems);
  };

  const handleSave = async (toSave: Certification[]) => {
    setSaving(true);
    const cleaned = toSave.map(it => ({ ...it, name: it.name.trim() })).filter(it => it.name);
    const ok = await patchCV({ cvCertifications: cleaned });
    setSaving(false);
    if (ok) {
      toast.success(`${cleaned.length} certification(s) enregistrée(s)`);
      onSave(cleaned);
      setEditing(null);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <Award className="h-5 w-5" /> Certifications &amp; Attestations
                {items.length > 0 && <Badge variant="secondary" className="ml-2">{items.length}</Badge>}
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune certification. Cliquez sur "Ajouter" pour commencer.</p>}
            {items.map(it => (
              <ItemCard
                key={it.id}
                title={it.name || 'Nouvelle certification'}
                subtitle={it.issuer}
                date={it.date}
                onEdit={() => setEditing(it.id === editing ? null : it.id)}
                onDelete={() => handleDelete(it.id)}
                isEditing={editing === it.id}
              >
                {editing === it.id && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label>Nom de la certification *</Label>
                      <Input value={it.name} onChange={(e) => handleUpdate(it.id, { name: e.target.value })} placeholder="Ex: ISO 45001 – Système de management de la santé et sécurité au travail" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Organisme délivreur</Label>
                        <Input value={it.issuer} onChange={(e) => handleUpdate(it.id, { issuer: e.target.value })} placeholder="Ex: IICP" />
                      </div>
                      <div>
                        <Label>Date d'obtention</Label>
                        <MonthYearInput value={it.date} onChange={(v) => handleUpdate(it.id, { date: v })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Numéro de certification (facultatif)</Label>
                        <Input value={it.number} onChange={(e) => handleUpdate(it.id, { number: e.target.value })} />
                      </div>
                      <div>
                        <Label>URL de vérification (facultatif)</Label>
                        <Input type="url" value={it.verifyUrl} onChange={(e) => handleUpdate(it.id, { verifyUrl: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox" id={`noexpiry-${it.id}`} checked={it.noExpiry}
                        onChange={(e) => handleUpdate(it.id, { noExpiry: e.target.checked, expiryDate: e.target.checked ? '' : it.expiryDate })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`noexpiry-${it.id}`} className="text-sm font-normal cursor-pointer">Cette certification n'expire pas</Label>
                    </div>
                    {!it.noExpiry && (
                      <div>
                        <Label>Date d'expiration (optionnelle)</Label>
                        <MonthYearInput value={it.expiryDate} onChange={(v) => handleUpdate(it.id, { expiryDate: v })} />
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Annuler</Button>
                      <Button size="sm" onClick={() => handleSave(items)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer
                      </Button>
                    </div>
                  </div>
                )}
              </ItemCard>
            ))}
            <AddButton label="Ajouter une certification" onClick={handleAdd} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// SECTION 6 — LANGUES
// ============================================================================
function SectionLanguages({ initial, onSave }: { initial: Language[]; onSave: (v: Language[]) => void }) {
  const [items, setItems] = useState<Language[]>(initial || []);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLang, setNewLang] = useState<Language | null>(null);

  useEffect(() => setItems(initial || []), [initial]);

  const handleAdd = () => {
    setNewLang({ id: newId(), language: '', languageOther: '', level: 'Intermédiaire' });
    setOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!newLang || (!newLang.language && !newLang.languageOther)) {
      toast.error('Veuillez sélectionner une langue');
      return;
    }
    const updated = [...items, newLang];
    setItems(updated);
    setNewLang(null);
    setSaving(true);
    const ok = await patchCV({ cvLanguages: updated });
    setSaving(false);
    if (ok) {
      toast.success('Langue ajoutée');
      onSave(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette langue ?')) return;
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    setSaving(true);
    const ok = await patchCV({ cvLanguages: updated });
    setSaving(false);
    if (ok) {
      toast.success('Langue supprimée');
      onSave(updated);
    }
  };

  const languageOptions = ['Arabe', 'Français', 'Anglais', 'Espagnol', 'Amazigh', 'Allemand', 'Italien', 'Portugais', 'Chinois', 'Japonais', 'Russe', 'Turc', 'Autre'];
  const languageLevels = ['Langue maternelle', 'Courant', 'Professionnel', 'Intermédiaire', 'Élémentaire / Débutant'];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <Globe className="h-5 w-5" /> Langues
                {items.length > 0 && <Badge variant="secondary" className="ml-2">{items.length}</Badge>}
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune langue. Cliquez sur "Ajouter" pour commencer.</p>}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {items.map(it => (
                  <div key={it.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                    <span className="text-sm font-medium text-emerald-800">{it.language === 'Autre' ? it.languageOther : it.language}</span>
                    <Badge variant="outline" className="text-xs bg-white">{it.level}</Badge>
                    <button onClick={() => handleDelete(it.id)} className="text-slate-400 hover:text-red-600" title="Supprimer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newLang && (
              <div className="border border-emerald-200 rounded-lg p-4 space-y-3 bg-emerald-50/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Langue *</Label>
                    <Select value={newLang.language} onValueChange={(v) => setNewLang({ ...newLang, language: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        {languageOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {newLang.language === 'Autre' && (
                      <Input className="mt-2" value={newLang.languageOther} onChange={(e) => setNewLang({ ...newLang, languageOther: e.target.value })} placeholder="Précisez la langue" />
                    )}
                  </div>
                  <div>
                    <Label>Niveau</Label>
                    <Select value={newLang.level} onValueChange={(v) => setNewLang({ ...newLang, level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languageLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setNewLang(null)}>Annuler</Button>
                  <Button size="sm" onClick={handleConfirmAdd} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Ajouter
                  </Button>
                </div>
              </div>
            )}
            {!newLang && <AddButton label="Ajouter une langue" onClick={handleAdd} />}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// SECTION 7 — INFORMATIONS COMPLÉMENTAIRES
// ============================================================================
function SectionAdditionalInfo({ initial, onSave }: { initial: AdditionalInfo; onSave: (v: AdditionalInfo) => void }) {
  const [info, setInfo] = useState<AdditionalInfo>(normalizeAdditionalInfo(initial));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState<VolunteerExperience | null>(null);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    setInfo(normalizeAdditionalInfo(initial));
  }, [initial]);

  const handleSave = async (toSave: AdditionalInfo) => {
    setSaving(true);
    const ok = await patchCV({ cvAdditionalInfo: toSave });
    setSaving(false);
    if (ok) {
      toast.success('Informations complémentaires enregistrées');
      onSave(toSave);
    }
  };

  const licenseOptions = ['Aucun', 'AM', 'A', 'A1', 'A2', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'Autre'];
  const mobilityOptions = ['Locale', 'Nationale', 'Internationale', 'Aucune mobilité', 'Autre'];
  const availabilityOptions = ['Immédiate', 'Préavis requis', 'Disponible prochainement', 'À définir'];
  const interestSuggestions = ['Sport', 'Lecture', 'Technologie', 'Voyages', 'Environnement', 'Photographie', 'Musique', 'Bénévolat'];

  const toggleLicense = (l: string) => {
    let updated: string[];
    if (info.drivingLicenses.includes(l)) {
      updated = info.drivingLicenses.filter(x => x !== l);
    } else {
      // Si "Aucun" est sélectionné, on ne garde que Aucun
      if (l === 'Aucun') updated = ['Aucun'];
      else updated = [...info.drivingLicenses.filter(x => x !== 'Aucun'), l];
    }
    setInfo({ ...info, drivingLicenses: updated });
  };

  const addInterest = (i: string) => {
    if (!i.trim()) return;
    if (!info.interests.includes(i.trim())) {
      setInfo({ ...info, interests: [...info.interests, i.trim()] });
    }
    setNewInterest('');
  };

  const removeInterest = (i: string) => {
    setInfo({ ...info, interests: info.interests.filter(x => x !== i) });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                <Heart className="h-5 w-5" /> Informations complémentaires
              </CardTitle>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-5">
            {/* Permis de conduire */}
            <div>
              <Label className="text-sm font-semibold">Permis de conduire</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {licenseOptions.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleLicense(l)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      info.drivingLicenses.includes(l)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {info.drivingLicenses.includes('Autre') && (
                <Input className="mt-2" value={info.drivingLicenseOther} onChange={(e) => setInfo({ ...info, drivingLicenseOther: e.target.value })} placeholder="Précisez le permis" />
              )}
            </div>

            <Separator />

            {/* Mobilité + Disponibilité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Mobilité géographique</Label>
                <Select value={info.mobility} onValueChange={(v) => setInfo({ ...info, mobility: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {mobilityOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Disponibilité</Label>
                <Select value={info.availability} onValueChange={(v) => setInfo({ ...info, availability: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Projets professionnels */}
            <div>
              <Label className="text-sm font-semibold">Projets professionnels</Label>
              <Textarea
                rows={3}
                value={info.professionalProjects}
                onChange={(e) => setInfo({ ...info, professionalProjects: e.target.value })}
                placeholder="Décrivez vos objectifs et projets professionnels..."
                className="mt-1"
              />
            </div>

            <Separator />

            {/* Bénévolat */}
            <div>
              <Label className="text-sm font-semibold">Bénévolat</Label>
              <div className="space-y-2 mt-2">
                {info.volunteerExperiences.map((v, i) => (
                  <div key={v.id} className="flex items-start justify-between gap-2 border border-slate-200 rounded-lg p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-800">{v.role || 'Bénévole'} — {v.organization || ''}</p>
                      <p className="text-xs text-slate-500">{v.startDate || '?'} — {v.current ? 'Aujourd\'hui' : (v.endDate || '?')}</p>
                      {v.description && <p className="text-xs text-slate-600 mt-1">{v.description}</p>}
                    </div>
                    <button onClick={() => {
                      const updated = { ...info, volunteerExperiences: info.volunteerExperiences.filter(x => x.id !== v.id) };
                      setInfo(updated);
                    }} className="text-slate-400 hover:text-red-600 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {newVolunteer && (
                  <div className="border border-emerald-200 rounded-lg p-3 space-y-2 bg-emerald-50/50">
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={newVolunteer.role} onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })} placeholder="Rôle" />
                      <Input value={newVolunteer.organization} onChange={(e) => setNewVolunteer({ ...newVolunteer, organization: e.target.value })} placeholder="Organisation" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <MonthYearInput value={newVolunteer.startDate} onChange={(v) => setNewVolunteer({ ...newVolunteer, startDate: v })} />
                      <MonthYearInput value={newVolunteer.endDate} onChange={(v) => setNewVolunteer({ ...newVolunteer, endDate: v })} disabled={newVolunteer.current} />
                    </div>
                    <Textarea rows={2} value={newVolunteer.description} onChange={(e) => setNewVolunteer({ ...newVolunteer, description: e.target.value })} placeholder="Description" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setNewVolunteer(null)}>Annuler</Button>
                      <Button size="sm" onClick={() => {
                        if (!newVolunteer.role && !newVolunteer.organization) return;
                        setInfo({ ...info, volunteerExperiences: [...info.volunteerExperiences, newVolunteer] });
                        setNewVolunteer(null);
                      }} className="bg-emerald-600 hover:bg-emerald-700 text-white">Ajouter</Button>
                    </div>
                  </div>
                )}
                {!newVolunteer && <AddButton label="Ajouter une expérience de bénévolat" onClick={() => setNewVolunteer({ id: newId(), role: '', organization: '', startDate: '', endDate: '', current: false, description: '' })} />}
              </div>
            </div>

            <Separator />

            {/* Centres d'intérêt */}
            <div>
              <Label className="text-sm font-semibold">Centres d'intérêt</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {info.interests.map(i => (
                  <div key={i} className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1">
                    <span className="text-sm text-slate-700">{i}</span>
                    <button onClick={() => removeInterest(i)} className="text-slate-400 hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Ajouter un centre d'intérêt..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(newInterest); } }} />
                <Button variant="outline" size="sm" onClick={() => addInterest(newInterest)}>Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {interestSuggestions.filter(s => !info.interests.includes(s)).map(s => (
                  <button key={s} onClick={() => addInterest(s)} className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-emerald-400">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => handleSave(info)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer les informations
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL — CVSections
// ============================================================================
export default function CVSections({ profile, onChanged }: CVSectionsProps) {
  // Parser les champs JSON du profile
  // NOTE : « Profil professionnel » (cvProfessionalProfile) a été supprimé pour
  // éviter le doublon avec la « Bio courte » du Card parent.
  const [experiences, setExperiences] = useState<Experience[]>(parseJsonSafe(profile?.cvExperiences, []));
  const [education, setEducation] = useState<Education[]>(parseJsonSafe(profile?.cvEducation, []));
  const [skills, setSkills] = useState<Skill[]>(parseJsonSafe(profile?.cvSkillsStructured, []));
  const [certifications, setCertifications] = useState<Certification[]>(parseJsonSafe(profile?.cvCertifications, []));
  const [languages, setLanguages] = useState<Language[]>(parseJsonSafe(profile?.cvLanguages, []));
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>(normalizeAdditionalInfo(parseJsonSafe(profile?.cvAdditionalInfo, {})));

  // Re-charger quand le profile change
  useEffect(() => {
    setExperiences(parseJsonSafe(profile?.cvExperiences, []));
    setEducation(parseJsonSafe(profile?.cvEducation, []));
    setSkills(parseJsonSafe(profile?.cvSkillsStructured, []));
    setCertifications(parseJsonSafe(profile?.cvCertifications, []));
    setLanguages(parseJsonSafe(profile?.cvLanguages, []));
    setAdditionalInfo(normalizeAdditionalInfo(parseJsonSafe(profile?.cvAdditionalInfo, {})));
  }, [profile]);

  return (
    <div className="space-y-4">
      <SectionExperiences initial={experiences} onSave={(v) => { setExperiences(v); onChanged?.(); }} />
      <SectionEducation initial={education} onSave={(v) => { setEducation(v); onChanged?.(); }} />
      <SectionSkills initial={skills} onSave={(v) => { setSkills(v); onChanged?.(); }} />
      <SectionCertifications initial={certifications} onSave={(v) => { setCertifications(v); onChanged?.(); }} />
      <SectionLanguages initial={languages} onSave={(v) => { setLanguages(v); onChanged?.(); }} />
      <SectionAdditionalInfo initial={additionalInfo} onSave={(v) => { setAdditionalInfo(v); onChanged?.(); }} />
    </div>
  );
}

export type {
  Experience, Education, Skill, Certification, Language,
  VolunteerExperience, AdditionalInfo,
};
