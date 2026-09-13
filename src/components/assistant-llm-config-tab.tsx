'use client';

// ============================================================================
// LLMConfigTab — Onglet "Configuration IA" du dashboard Assistant
// ============================================================================
// UX simplifiée (revision post-mission):
//   - Bouton unique "Ajouter une API" : ouvre un formulaire minimal
//     (preset provider + clé API + label optionnel)
//   - Le système auto-crée le provider si nécessaire en utilisant les
//     détails techniques du preset (baseUrl, adapter, defaultModel)
//   - L'admin n'a PAS à connaître baseUrl/adapter/etc.
//   - L'API key n'est JAMAIS affichée après sauvegarde (seul keyHint "****ABCD")
//   - Multi-clés par provider (illimité)
//   - Test individuel de chaque clé + test global par provider
//   - Health status visible (healthy/degraded/down/unknown)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sparkles, Plus, Trash2, TestTube, Loader2, AlertCircle, CheckCircle2,
  ChevronUp, ChevronDown, Key, Activity,
} from 'lucide-react';

// ===== Types =====
interface ProviderKeyStats {
  total: number; enabled: number; active: number; rateLimited: number;
  authError: number; invalid: number; neverUsed: number;
}
interface Provider {
  id: string; code: string; displayName: string; adapter: string;
  baseUrl: string; enabled: boolean; priority: number;
  defaultModel: string; availableModels: string[];
  createdAt: string; updatedAt: string;
  keyCount: number; keyStats: ProviderKeyStats;
  health: 'healthy' | 'degraded' | 'down' | 'unknown';
}
interface ApiKey {
  id: string; providerId: string; label: string; keyHint: string;
  enabled: boolean; priority: number; status: string;
  lastUsedAt: string | null; lastSuccessAt: string | null;
  lastErrorAt: string | null; lastErrorCode: string | null;
  failureCount: number; createdAt: string; updatedAt: string;
}
interface Preset {
  code: string; displayName: string; adapter: string;
  baseUrl: string; defaultModel: string; availableModels: string[];
}
interface TestResult {
  ok: boolean; status: string; httpStatus: number | null;
  errorCode: string | null; errorMessage: string | null;
  latencyMs: number; contentPreview: string | null;
  model: string; keyLabel: string; keyHint: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  never_used:      { label: 'Jamais utilisée',  color: 'bg-slate-100 text-slate-700' },
  active:          { label: 'Active',            color: 'bg-emerald-100 text-emerald-800' },
  rate_limited:    { label: 'Rate Limited',      color: 'bg-amber-100 text-amber-800' },
  quota_exhausted: { label: 'Quota épuisé',     color: 'bg-orange-100 text-orange-800' },
  auth_error:      { label: 'Authentification',  color: 'bg-red-100 text-red-800' },
  network_error:   { label: 'Erreur réseau',     color: 'bg-yellow-100 text-yellow-800' },
  disabled:        { label: 'Désactivée',        color: 'bg-slate-200 text-slate-600' },
  invalid:         { label: 'Invalide',          color: 'bg-red-200 text-red-900' },
};

const HEALTH_BADGE = {
  healthy:  { label: 'Healthy',  color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  degraded: { label: 'Degraded', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  down:     { label: 'Down',     color: 'bg-red-100 text-red-800 border-red-300' },
  unknown:  { label: 'Unknown',  color: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export function LLMConfigTab() {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [registeredAdapters, setRegisteredAdapters] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<ApiKey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // === Quick-add form state (SIMPLIFIED) ===
  // Admin only needs: preset code (select) + API key (password) + optional label + optional priority
  // All technical details (baseUrl, adapter, defaultModel) are auto-filled server-side
  const [quickAdd, setQuickAdd] = useState({
    code: '', apiKey: '', label: '', priority: 10,
  });

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/llm/providers', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load providers');
      const data = await res.json();
      setProviders(data.providers || []);
      setPresets(data.presets || []);
      setRegisteredAdapters(data.registeredAdapters || {});
    } catch (e: any) {
      toast.error('Erreur chargement providers', { description: e.message });
      setProviders([]);
    }
  }, []);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/llm/api-keys', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load API keys');
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch (e: any) {
      toast.error('Erreur chargement API keys', { description: e.message });
      setApiKeys([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProviders(), fetchApiKeys()]);
      setLoading(false);
    })();
  }, [fetchProviders, fetchApiKeys]);

  const reload = useCallback(async () => {
    await Promise.all([fetchProviders(), fetchApiKeys()]);
  }, [fetchProviders, fetchApiKeys]);

  // ===== Handlers =====

  // === Quick-add API key (simplified UX) ===
  async function handleQuickAdd() {
    if (!quickAdd.code || !quickAdd.apiKey) {
      toast.error('Sélectionnez un provider et collez votre clé API');
      return;
    }
    setSavingId('quick-add');
    try {
      const res = await fetch('/api/assistant/llm/api-keys/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: quickAdd.code,
          apiKey: quickAdd.apiKey,
          label: quickAdd.label || undefined,
          priority: quickAdd.priority,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      const data = await res.json();
      toast.success(`Clé API ajoutée pour ${data.provider.displayName}`, {
        description: `Modèle par défaut : ${data.provider.defaultModel} • Clé ••••${data.apiKey.keyHint}`,
      });
      // Reset form
      setQuickAdd({ code: '', apiKey: '', label: '', priority: 10 });
      setShowQuickAdd(false);
      await reload();
    } catch (e: any) {
      toast.error('Erreur création clé', { description: e.message });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteProvider(id: string, code: string) {
    if (!confirm(`Supprimer le provider "${code}" ? Toutes ses clés API seront supprimées.`)) return;
    try {
      const res = await fetch(`/api/assistant/llm/providers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      toast.success('Provider supprimé');
      await reload();
    } catch (e: any) {
      toast.error('Erreur suppression', { description: e.message });
    }
  }

  async function handleToggleProvider(id: string, enabled: boolean) {
    try {
      const res = await fetch(`/api/assistant/llm/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success(`Provider ${enabled ? 'activé' : 'désactivé'}`);
      await reload();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    }
  }

  async function handleProviderPriority(id: string, delta: number, current: number) {
    const newPriority = Math.max(1, Math.min(100, current + delta));
    try {
      const res = await fetch(`/api/assistant/llm/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) throw new Error('Erreur');
      await reload();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    }
  }

  async function handleUpdateProviderModel(id: string, defaultModel: string) {
    try {
      const res = await fetch(`/api/assistant/llm/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultModel }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Modèle mis à jour');
      await reload();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    }
  }

  async function handleDeleteKey(id: string, label: string) {
    if (!confirm(`Supprimer la clé "${label}" ?`)) return;
    try {
      const res = await fetch(`/api/assistant/llm/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Clé supprimée');
      await reload();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    }
  }

  async function handleToggleKey(id: string, enabled: boolean) {
    try {
      const res = await fetch(`/api/assistant/llm/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success(`Clé ${enabled ? 'activée' : 'désactivée'}`);
      await reload();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    }
  }

  async function handleTestProvider(id: string) {
    setTestingKeyId(id);
    try {
      const res = await fetch(`/api/assistant/llm/providers/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [`provider-${id}`]: data }));
      if (data.ok) {
        toast.success(`Provider test OK (${data.latencyMs}ms)`, { description: data.contentPreview || '' });
      } else {
        toast.error('Provider test échoué', { description: data.errorMessage || data.message || data.status });
      }
      await reload();
    } catch (e: any) {
      toast.error('Erreur test', { description: e.message });
    } finally {
      setTestingKeyId(null);
    }
  }

  async function handleTestKey(id: string) {
    setTestingKeyId(id);
    try {
      const res = await fetch(`/api/assistant/llm/api-keys/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [`key-${id}`]: data }));
      if (data.ok) {
        toast.success(`Clé test OK (${data.latencyMs}ms)`, { description: data.contentPreview || '' });
      } else {
        toast.error('Clé test échoué', { description: data.errorMessage || data.status });
      }
      await reload();
    } catch (e: any) {
      toast.error('Erreur test', { description: e.message });
    } finally {
      setTestingKeyId(null);
    }
  }

  // ===== Render =====

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> Configuration IA</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Configuration IA — Multi-LLM Providers
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Ajoutez vos clés API (Groq, Z.ai, OpenAI, Anthropic, ...). Failover automatique par priorité.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* === Health summary === */}
        {providers && providers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">Providers</div>
              <div className="font-bold text-slate-900">{providers.length}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">Active</div>
              <div className="font-bold text-emerald-700">{providers.filter(p => p.enabled && p.health === 'healthy').length}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">Degraded</div>
              <div className="font-bold text-amber-700">{providers.filter(p => p.health === 'degraded').length}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">Total clés</div>
              <div className="font-bold text-slate-900">{providers.reduce((sum, p) => sum + p.keyCount, 0)}</div>
            </div>
          </div>
        )}

        {/* === Quick-add API button === */}
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowQuickAdd(!showQuickAdd)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" /> Ajouter une API
          </Button>
        </div>

        {/* === Quick-add form (SIMPLIFIED — admin only sees provider preset + API key) === */}
        {showQuickAdd && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Key className="h-4 w-4" /> Ajouter une clé API
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fournisseur</Label>
                <Select value={quickAdd.code} onValueChange={v => setQuickAdd(p => ({ ...p, code: v }))}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Sélectionner un fournisseur…" /></SelectTrigger>
                  <SelectContent>
                    {presets.map(p => {
                      const isRegistered = !!registeredAdapters[p.code];
                      return (
                        <SelectItem key={p.code} value={p.code}>
                          {p.displayName}{!isRegistered && ' (adapter manquant)'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Le système remplit automatiquement les détails techniques (base URL, adapter, modèles disponibles).
                </p>
              </div>
              <div>
                <Label className="text-xs">API Key</Label>
                <Input
                  type="password"
                  value={quickAdd.apiKey}
                  onChange={e => setQuickAdd(p => ({ ...p, apiKey: e.target.value }))}
                  placeholder="Collez votre clé API ici…"
                  className="text-sm font-mono"
                />
                <p className="text-[10px] text-amber-700 mt-1">
                  ⚠ La clé sera stockée côté serveur et ne sera <strong>JAMAIS</strong> réaffichée. Seuls les 4 derniers caractères seront visibles.
                </p>
              </div>
              <div>
                <Label className="text-xs">Nom (optionnel)</Label>
                <Input
                  value={quickAdd.label}
                  onChange={e => setQuickAdd(p => ({ ...p, label: e.target.value }))}
                  placeholder="Ex : Production, Dev, Backup…"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Priorité (1=highest, 10=défaut)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={quickAdd.priority}
                  onChange={e => setQuickAdd(p => ({ ...p, priority: parseInt(e.target.value) || 10 }))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Show preset technical preview (read-only, admin can see what will be configured) */}
            {quickAdd.code && (
              <div className="p-2 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
                {(() => {
                  const preset = presets.find(p => p.code === quickAdd.code);
                  if (!preset) return null;
                  return (
                    <div>
                      <strong>Sera configuré automatiquement :</strong>
                      <span className="font-mono ml-1">{preset.baseUrl}</span>
                      <span className="ml-2">•</span>
                      <span className="ml-2">Modèle par défaut : <code>{preset.defaultModel}</code></span>
                      <span className="ml-2">•</span>
                      <span className="ml-2">{preset.availableModels.length} modèles disponibles</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowQuickAdd(false)}>Annuler</Button>
              <Button size="sm" onClick={handleQuickAdd} disabled={savingId === 'quick-add' || !quickAdd.code || !quickAdd.apiKey} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {savingId === 'quick-add' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enregistrer la clé
              </Button>
            </div>
          </div>
        )}

        {/* === Providers list === */}
        {providers && providers.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
            Aucun provider configuré. Lara Bot utilise actuellement le fallback Z.ai via <code>.z-ai-config</code>. Cliquez sur « Ajouter une API » pour activer le multi-LLM.
          </div>
        )}

        {providers && providers.map(provider => {
          const keys = (apiKeys || []).filter(k => k.providerId === provider.id);
          const providerTest = testResults[`provider-${provider.id}`];
          const health = HEALTH_BADGE[provider.health] || HEALTH_BADGE.unknown;
          const adapterRegistered = !!registeredAdapters[provider.code];

          return (
            <div key={provider.id} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Provider header */}
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${health.color} border`}>
                      <Activity className="h-3 w-3 mr-1" /> {health.label}
                    </Badge>
                    <span className="font-semibold text-sm">{provider.displayName}</span>
                    <span className="text-xs text-slate-500 font-mono">({provider.code})</span>
                    {!adapterRegistered && (
                      <Badge className="bg-amber-100 text-amber-800">adapter manquant</Badge>
                    )}
                    {provider.keyCount === 0 && (
                      <Badge className="bg-slate-200 text-slate-700">0 clé</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Priority controls */}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleProviderPriority(provider.id, -1, provider.priority)} title="Monter priorité">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-mono w-8 text-center">P{provider.priority}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleProviderPriority(provider.id, 1, provider.priority)} title="Descendre priorité">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <Button size="sm" variant="outline" onClick={() => handleTestProvider(provider.id)} disabled={testingKeyId === provider.id || !adapterRegistered} className="text-xs h-7">
                      {testingKeyId === provider.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TestTube className="h-3.5 w-3.5" />}
                      Tester
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <Switch checked={provider.enabled} onCheckedChange={v => handleToggleProvider(provider.id, v)} />

                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDeleteProvider(provider.id, provider.code)} title="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Provider config — HIDDEN Base URL (admin doesn't need to see it) */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Modèle actif</Label>
                    <Select value={provider.defaultModel} onValueChange={v => handleUpdateProviderModel(provider.id, v)}>
                      <SelectTrigger className="text-xs h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {provider.availableModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        {!provider.availableModels.includes(provider.defaultModel) && (
                          <SelectItem value={provider.defaultModel}>{provider.defaultModel} (custom)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Stats clés</Label>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{provider.keyStats.active} actives</Badge>
                      <Badge className="bg-amber-100 text-amber-800 text-[10px]">{provider.keyStats.rateLimited} RL</Badge>
                      <Badge className="bg-red-100 text-red-800 text-[10px]">{provider.keyStats.authError} err</Badge>
                      <Badge className="bg-slate-100 text-slate-700 text-[10px]">{provider.keyStats.neverUsed} new</Badge>
                    </div>
                  </div>
                </div>

                {/* Provider test result */}
                {providerTest && (
                  <div className={`mt-3 p-2 rounded text-xs ${providerTest.ok ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    {providerTest.ok ? <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-700" /> : <AlertCircle className="h-3.5 w-3.5 inline mr-1 text-red-700" />}
                    <strong>{providerTest.ok ? 'Succès' : 'Échec'}</strong> — {providerTest.latencyMs}ms
                    {providerTest.contentPreview && <span className="text-slate-700"> — "{providerTest.contentPreview}"</span>}
                    {providerTest.errorMessage && <span className="text-slate-700"> — {providerTest.errorMessage}</span>}
                  </div>
                )}
              </div>

              {/* API Keys section for this provider */}
              <div className="p-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Key className="h-3.5 w-3.5" /> API Keys ({keys.length})
                </h4>

                {/* Keys list */}
                {keys.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucune clé. Cliquez sur « Ajouter une API » en haut pour en ajouter une.</p>
                ) : (
                  <div className="space-y-1.5">
                    {keys.map(k => {
                      const statusInfo = STATUS_LABELS[k.status] || STATUS_LABELS.never_used;
                      const keyTest = testResults[`key-${k.id}`];
                      return (
                        <div key={k.id} className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded text-xs">
                          {/* Display: Groq • ••••ABCD • Label • Status • P# • last success/error */}
                          <span className="font-mono text-slate-500">••••{k.keyHint}</span>
                          <span className="font-medium">{k.label}</span>
                          <Badge className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          <span className="text-slate-500">P{k.priority}</span>
                          {k.lastSuccessAt && <span className="text-emerald-600 text-[10px]">✓ {new Date(k.lastSuccessAt).toLocaleString('fr-FR')}</span>}
                          {k.lastErrorAt && <span className="text-red-600 text-[10px]">✗ {new Date(k.lastErrorAt).toLocaleString('fr-FR')}</span>}
                          {k.failureCount > 0 && <span className="text-amber-600 text-[10px]">échecs: {k.failureCount}</span>}

                          <div className="ml-auto flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleTestKey(k.id)} disabled={testingKeyId === k.id}>
                              {testingKeyId === k.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <TestTube className="h-3 w-3" />}
                              Tester
                            </Button>
                            <Switch checked={k.enabled} onCheckedChange={v => handleToggleKey(k.id, v)} />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDeleteKey(k.id, k.label)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {keyTest && (
                            <div className={`w-full mt-1 p-1.5 rounded text-[11px] ${keyTest.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                              {keyTest.ok ? '✓' : '✗'} {keyTest.status} — {keyTest.latencyMs}ms
                              {keyTest.contentPreview && ` — "${keyTest.contentPreview}"`}
                              {keyTest.errorMessage && ` — ${keyTest.errorMessage}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* === Security note === */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2">
          <Key className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <p className="font-semibold mb-0.5">Sécurité API keys</p>
            <p>
              Les clés sont stockées côté serveur uniquement. Elles ne sont jamais retournées par l'API (seuls les 4 derniers caractères sont affichés).
              Failover automatique : si une clé retourne 429 (rate limit), la suivante est essayée. Si toutes les clés d'un provider échouent, le provider suivant est utilisé.
              Si tous les providers DB échouent, le système retombe sur <code>.z-ai-config</code> (legacy path).
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
