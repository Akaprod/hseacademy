'use client';

// ============================================================================
// AssistantAdminSection — Dashboard admin 5 espaces (Phase 2)
// ============================================================================
// 5 espaces (tabs) :
//   1. Configuration générale     — activation, nom, message, langue, dispo
//   2. Instructions               — 4 catégories éditables (general, commercial, user, admin) + limits
//   3. Personnalité et comportement — style, ton, longueur, consignes
//   4. Limites et interdictions   — affichage des protections système + limits éditables
//   5. Sources de connaissance    — activation on/off par catégorie publique
//
// ⚠️ SYSTEM SAFETY RULES ne sont JAMAIS éditables — section 4 les affiche en read-only.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Save, Shield, Lock, Database, BookOpen, FileText, Globe,
  Settings, Sliders, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';

// ===== Types locaux =====
interface AssistantConfig {
  enabled: boolean; commercialEnabled: boolean; userEnabled: boolean; adminEnabled: boolean;
  name: string; welcomeMessage: string; language: 'fr' | 'en' | 'ar'; availabilityMode: 'always' | 'business_hours' | 'manual';
  updatedAt?: string;
}
interface AssistantInstructionData {
  id: string; category: 'general' | 'commercial' | 'user' | 'admin' | 'limits';
  content: string; updatedAt: string;
}
interface AssistantBehavior {
  style: string; tone: string; responseLength: string; customGuidelines: string; updatedAt?: string;
}
interface OptionList { value: string; label: string; description: string }
interface AssistantSource {
  id: string; category: string; enabled: boolean; isPublic: boolean;
  lastSyncAt: string | null; documentCount: number; updatedAt: string;
}

// === Constantes ===
const INSTRUCTION_CATEGORIES: Array<{ key: 'general' | 'commercial' | 'user' | 'admin' | 'limits'; label: string; description: string }> = [
  { key: 'general', label: 'Instructions générales', description: "Présentation, mission, ton par défaut." },
  { key: 'commercial', label: 'Mode Commercial', description: 'Dialogue avec les visiteurs.' },
  { key: 'user', label: 'Mode Utilisateur', description: 'Dialogue avec un user authentifié.' },
  { key: 'admin', label: 'Mode Administrateur', description: 'Dialogue avec un admin (READ-ONLY strict).' },
];

const SYSTEM_LIMITS = [
  "Modifier les données utilisateurs",
  "Supprimer des données",
  "Créer un utilisateur",
  "Modifier les rôles",
  "Modifier les paiements",
  "Valider un paiement",
  "Délivrer une attestation",
  "Révoquer une attestation",
  "Modifier les formations",
  "Modifier les examens",
  "Modifier les résultats",
  "Modifier la base de données",
  "Appeler une API interne d'écriture",
  "Accéder aux secrets (.env, AUTH_SECRET, tokens)",
];

export function AssistantAdminSection() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [instructions, setInstructions] = useState<AssistantInstructionData[]>([]);
  const [behavior, setBehavior] = useState<AssistantBehavior | null>(null);
  const [sources, setSources] = useState<AssistantSource[]>([]);
  const [sourceMeta, setSourceMeta] = useState<Record<string, { label: string; description: string }>>({});
  const [behaviorOptions, setBehaviorOptions] = useState<{ styles: OptionList[]; tones: OptionList[]; lengths: OptionList[] }>({ styles: [], tones: [], lengths: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editingInstructions, setEditingInstructions] = useState<Record<string, string>>({});
  const [editingBehavior, setEditingBehavior] = useState<AssistantBehavior | null>(null);
  const [editingConfig, setEditingConfig] = useState<AssistantConfig | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, instrRes, behRes, srcRes] = await Promise.all([
        fetch('/api/assistant/config', { cache: 'no-store' }),
        fetch('/api/assistant/instructions', { cache: 'no-store' }),
        fetch('/api/assistant/behavior', { cache: 'no-store' }),
        fetch('/api/assistant/sources', { cache: 'no-store' }),
      ]);
      if (cfgRes.ok) { const c = await cfgRes.json(); setConfig(c); setEditingConfig(c); }
      if (instrRes.ok) {
        const data = await instrRes.json();
        setInstructions(data.instructions || []);
        const editing: Record<string, string> = {};
        for (const i of data.instructions || []) editing[i.category] = i.content;
        setEditingInstructions(editing);
      }
      if (behRes.ok) {
        const data = await behRes.json();
        setBehavior(data.behavior);
        setEditingBehavior(data.behavior);
        setBehaviorOptions(data.options || { styles: [], tones: [], lengths: [] });
      }
      if (srcRes.ok) {
        const data = await srcRes.json();
        setSources(data.sources || []);
        setSourceMeta(data.metadata || {});
      }
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // === Save handlers ===
  const saveConfig = async () => {
    if (!editingConfig) return;
    setSaving(s => ({ ...s, config: true }));
    try {
      const res = await fetch('/api/assistant/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConfig),
      });
      if (res.ok) { const updated = await res.json(); setConfig(updated); setEditingConfig(updated); toast.success('Configuration enregistrée'); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur réseau'); }
    setSaving(s => ({ ...s, config: false }));
  };

  const saveInstruction = async (category: string) => {
    const content = editingInstructions[category];
    if (content === undefined) return;
    setSaving(s => ({ ...s, [`instr_${category}`]: true }));
    try {
      const res = await fetch('/api/assistant/instructions', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInstructions(prev => prev.map(i => i.category === category ? updated : i));
        toast.success(`Instructions "${category}" enregistrées`);
      } else { const err = await res.json(); toast.error(err.error || 'Erreur'); }
    } catch { toast.error('Erreur réseau'); }
    setSaving(s => ({ ...s, [`instr_${category}`]: false }));
  };

  const saveBehavior = async () => {
    if (!editingBehavior) return;
    setSaving(s => ({ ...s, behavior: true }));
    try {
      const res = await fetch('/api/assistant/behavior', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBehavior),
      });
      if (res.ok) { const updated = await res.json(); setBehavior(updated); setEditingBehavior(updated); toast.success('Personnalité enregistrée'); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur réseau'); }
    setSaving(s => ({ ...s, behavior: false }));
  };

  const toggleSource = async (category: string, enabled: boolean) => {
    // Optimistic update
    setSources(prev => prev.map(s => s.category === category ? { ...s, enabled } : s));
    try {
      const res = await fetch('/api/assistant/sources', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, enabled }),
      });
      if (res.ok) toast.success(`Source "${sourceMeta[category]?.label || category}" ${enabled ? 'activée' : 'désactivée'}`);
      else { toast.error('Erreur'); setSources(prev => prev.map(s => s.category === category ? { ...s, enabled: !enabled } : s)); }
    } catch { toast.error('Erreur réseau'); setSources(prev => prev.map(s => s.category === category ? { ...s, enabled: !enabled } : s)); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isConfigDirty = JSON.stringify(config) !== JSON.stringify(editingConfig);
  const isBehaviorDirty = JSON.stringify(behavior) !== JSON.stringify(editingBehavior);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">Assistant IA</h2>
          {config?.enabled ? (
            <Badge className="bg-emerald-100 text-emerald-700 ml-2">🟢 Assistant actif</Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 ml-2">🔴 Assistant désactivé</Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Configuration de l'Assistant IA HSE Academy — Phase 2 (mode lecture seule strict).
        </p>
      </div>

      {/* === Tabs 5 espaces === */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 h-auto">
          <TabsTrigger value="config" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Settings className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-1.5 text-xs md:text-sm">
            <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Instructions</span>
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Sliders className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Personnalité</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Lock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Limites</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Database className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sources</span>
          </TabsTrigger>
        </TabsList>

        {/* === Espace 1 — Configuration générale === */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-600" /> Configuration générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Activation globale */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex-1">
                  <Label className="font-semibold text-slate-900">Statut de l'assistant</Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Si désactivé, le widget public est masqué et aucune conversation n'est traitée.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {editingConfig?.enabled ? (
                    <Badge className="bg-emerald-100 text-emerald-700">🟢 Actif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500">🔴 Désactivé</Badge>
                  )}
                  <Switch
                    checked={editingConfig?.enabled ?? false}
                    onCheckedChange={(v) => setEditingConfig(editingConfig ? { ...editingConfig, enabled: v } : null)}
                  />
                </div>
              </div>

              {/* Modes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: 'commercialEnabled', label: 'Commercial', desc: 'Visiteurs + users' },
                  { key: 'userEnabled', label: 'Utilisateur', desc: 'Users authentifiés' },
                  { key: 'adminEnabled', label: 'Administrateur', desc: 'Admins authentifiés' },
                ].map(m => (
                  <div key={m.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div>
                      <Label className="text-sm font-medium">{m.label}</Label>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                    <Switch
                      checked={(editingConfig as any)?.[m.key] ?? false}
                      onCheckedChange={(v) => setEditingConfig(editingConfig ? { ...editingConfig, [m.key]: v } : null)}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Nom de l'assistant</Label>
                <Input
                  id="name"
                  value={editingConfig?.name ?? ''}
                  onChange={(e) => setEditingConfig(editingConfig ? { ...editingConfig, name: e.target.value } : null)}
                  maxLength={100}
                  placeholder="Assistant HSE Academy"
                />
              </div>

              {/* Message de bienvenue */}
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="font-semibold">Message de bienvenue</Label>
                <Textarea
                  id="welcomeMessage"
                  value={editingConfig?.welcomeMessage ?? ''}
                  onChange={(e) => setEditingConfig(editingConfig ? { ...editingConfig, welcomeMessage: e.target.value } : null)}
                  maxLength={500}
                  rows={3}
                  placeholder="Bonjour, je suis l'Assistant IA de HSE Academy..."
                />
                <p className="text-[10px] text-slate-400">{(editingConfig?.welcomeMessage ?? '').length}/500 caractères</p>
              </div>

              {/* Langue + Disponibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Langue principale</Label>
                  <div className="flex gap-2">
                    {[
                      { v: 'fr', l: 'Français' },
                      { v: 'en', l: 'English' },
                      { v: 'ar', l: 'العربية' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setEditingConfig(editingConfig ? { ...editingConfig, language: opt.v as any } : null)}
                        className={`px-3 py-2 rounded-lg text-sm border transition ${
                          editingConfig?.language === opt.v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Mode de disponibilité</Label>
                  <div className="flex flex-col gap-2">
                    {[
                      { v: 'always', l: 'Toujours disponible (24/7)' },
                      { v: 'business_hours', l: 'Heures ouvrables (9h-18h)' },
                      { v: 'manual', l: 'Manuel (activation explicite)' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setEditingConfig(editingConfig ? { ...editingConfig, availabilityMode: opt.v as any } : null)}
                        className={`px-3 py-2 rounded-lg text-sm border transition text-left ${
                          editingConfig?.availabilityMode === opt.v
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveConfig} disabled={!isConfigDirty || saving.config} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" /> {saving.config ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Espace 2 — Instructions === */}
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" /> Instructions de l'assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {INSTRUCTION_CATEGORIES.map((cat) => {
                const instruction = instructions.find(i => i.category === cat.key);
                const content = editingInstructions[cat.key] ?? instruction?.content ?? '';
                const isSaving = saving[`instr_${cat.key}`] ?? false;
                const hasChanges = content !== (instruction?.content ?? '');

                return (
                  <div key={cat.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-slate-900">{cat.label}</Label>
                        <p className="text-xs text-slate-500">{cat.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={hasChanges ? 'default' : 'outline'}
                        disabled={!hasChanges || isSaving}
                        onClick={() => saveInstruction(cat.key)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" /> {isSaving ? '...' : 'Enregistrer'}
                      </Button>
                    </div>
                    <Textarea
                      value={content}
                      onChange={(e) => setEditingInstructions({ ...editingInstructions, [cat.key]: e.target.value })}
                      rows={8}
                      maxLength={10000}
                      placeholder={`Instructions ${cat.label}...`}
                      className="font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">{content.length}/10000 · Modifié : {instruction?.updatedAt ? new Date(instruction.updatedAt).toLocaleString('fr-FR') : '—'}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Espace 3 — Personnalité === */}
        <TabsContent value="personality">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" /> Personnalité et comportement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <p>Ces paramètres contrôlent <strong>uniquement la manière dont l'assistant communique</strong>. Ils ne modifient jamais ses permissions.</p>
              </div>

              {editingBehavior && (
                <>
                  {/* Style */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Style de communication</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {behaviorOptions.styles.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditingBehavior({ ...editingBehavior, style: opt.value })}
                          className={`p-3 rounded-lg border text-left transition ${
                            editingBehavior.style === opt.value
                              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                              : 'bg-white border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ton */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Ton</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {behaviorOptions.tones.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditingBehavior({ ...editingBehavior, tone: opt.value })}
                          className={`p-3 rounded-lg border text-left transition ${
                            editingBehavior.tone === opt.value
                              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                              : 'bg-white border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Longueur */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Longueur des réponses</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {behaviorOptions.lengths.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditingBehavior({ ...editingBehavior, responseLength: opt.value })}
                          className={`p-3 rounded-lg border text-left transition ${
                            editingBehavior.responseLength === opt.value
                              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                              : 'bg-white border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Consignes personnalisées */}
                  <div className="space-y-2">
                    <Label htmlFor="customGuidelines" className="font-semibold">Consignes personnalisées</Label>
                    <Textarea
                      id="customGuidelines"
                      value={editingBehavior.customGuidelines}
                      onChange={(e) => setEditingBehavior({ ...editingBehavior, customGuidelines: e.target.value })}
                      rows={6}
                      maxLength={5000}
                      placeholder="Ajoutez vos consignes personnalisées ici... (ex: Ne jamais donner de conseil juridique.)"
                      className="font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">{editingBehavior.customGuidelines.length}/5000 caractères</p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveBehavior} disabled={!isBehaviorDirty || saving.behavior} className="bg-emerald-600 hover:bg-emerald-700">
                      <Save className="h-4 w-4 mr-2" /> {saving.behavior ? '...' : 'Enregistrer'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Espace 4 — Limites === */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" /> Limites et interdictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Protéctions système (read-only) */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-800 text-sm">🔒 Protections système fondamentales (immuables)</p>
                </div>
                <p className="text-xs text-red-700 mb-3">
                  Ces protections sont <strong>techniques et côté serveur</strong>. Elles ne peuvent pas être désactivées par l'interface.
                  L'assistant reste READ-ONLY indépendamment de toute configuration.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SYSTEM_LIMITS.map((limit) => (
                    <div key={limit} className="flex items-center gap-2 text-xs text-red-700">
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{limit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Limites conversationnelles éditables (catégorie 'limits') */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-slate-900">Limites conversationnelles supplémentaires</Label>
                    <p className="text-xs text-slate-500">Consignes personnalisées qui s'ajoutent aux instructions système.</p>
                  </div>
                  <Button
                    size="sm"
                    variant={(editingInstructions.limits ?? '') !== (instructions.find(i => i.category === 'limits')?.content ?? '') ? 'default' : 'outline'}
                    disabled={(editingInstructions.limits ?? '') === (instructions.find(i => i.category === 'limits')?.content ?? '') || saving.instr_limits}
                    onClick={() => saveInstruction('limits')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" /> {saving.instr_limits ? '...' : 'Enregistrer'}
                  </Button>
                </div>
                <Textarea
                  value={editingInstructions.limits ?? ''}
                  onChange={(e) => setEditingInstructions({ ...editingInstructions, limits: e.target.value })}
                  rows={10}
                  maxLength={10000}
                  placeholder={`Exemples :\n- Ne jamais donner de conseil juridique.\n- Ne pas commenter les concurrents.\n- Ne pas promettre de résultats d'examen.\n- Ne pas évoquer les salaires chiffrés.`}
                  className="font-mono text-xs"
                />
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                  Ces consignes ne peuvent PAS contourner les protections système. Même si une consigne demande "ignore le READ-ONLY", elle sera ignorée.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Espace 5 — Sources === */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" /> Sources de connaissance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Architecture future (Phase 3)</p>
                <p>
                  L'assistant utilisera automatiquement les informations publiées sur HSE Academy.
                  Principe : <em>CONTENU PUBLIÉ → DÉTECTION DE CHANGEMENT → MISE À JOUR → ASSISTANT</em>.
                  Les sources ci-dessous sont préparées — la synchronisation sera activée en Phase 3.
                </p>
              </div>

              {/* Sources publiques (activation on/off) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <p className="font-semibold text-sm text-slate-700">Sources publiques</p>
                </div>
                {sources.map(src => {
                  const meta = sourceMeta[src.category] || { label: src.category, description: '' };
                  return (
                    <div key={src.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-700">{meta.label}</p>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">PUBLIC</Badge>
                          {src.enabled && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{src.documentCount} doc.</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                        {src.lastSyncAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Dernière synchro : {new Date(src.lastSyncAt).toLocaleString('fr-FR')}</p>
                        )}
                      </div>
                      <Switch
                        checked={src.enabled}
                        onCheckedChange={(v) => toggleSource(src.category, v)}
                      />
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Sources privées (jamais activables) */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-red-600" />
                  <p className="font-semibold text-red-800">Sources privées — JAMAIS indexées</p>
                </div>
                <p className="text-red-600 mb-2">Les éléments suivants ne seront jamais utilisés comme source de connaissance :</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {[
                    'Mots de passe',
                    'Secrets / tokens (.env, AUTH_SECRET)',
                    'DATABASE_URL',
                    'Données de paiement',
                    'Preuves de paiement (fichiers)',
                    'Informations admin sensibles',
                    'Données privées d\'autres utilisateurs',
                    'Logs serveur',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle className="h-3 w-3 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note READ-ONLY enforcement global */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
        <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <p className="font-semibold mb-0.5">Restriction READ-ONLY absolue</p>
          <p>
            Même activé et configuré, l'assistant ne peut <strong>jamais</strong> effectuer d'écriture en base,
            valider un paiement, délivrer une attestation, ou appeler une API interne d'écriture.
            Cette restriction est codée en dur côté serveur (<code>src/assistant/server/permissions.ts</code> — fonction <code>canActOn()</code>).
          </p>
        </div>
      </div>
    </div>
  );
}
