'use client';

// ============================================================================
// LaraConfigPanel — Section "Configuration Lara" du dashboard
// ============================================================================
// Permet à l'admin de configurer:
//   - Mode de réponse (Simple/Normal/Détaillé) + limites de mots
//   - Longueur max du message utilisateur
//   - Quotas par type d'utilisateur (visiteur/user/admin)
//   - Période de quota
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Bot, MessageSquare, Gauge } from 'lucide-react';

interface LaraConfig {
  responseMode: string;
  simpleMaxWords: number;
  normalMaxWords: number;
  detailedMaxWords: number;
  maxUserMessageLength: number;
  visitorMessageLimit: number;
  userMessageLimit: number;
  adminMessageLimit: number;
  messageLimitPeriodHours: number;
}

export function LaraConfigPanel() {
  const [config, setConfig] = useState<LaraConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local edit state (synced with config on load)
  const [edit, setEdit] = useState<LaraConfig>({
    responseMode: 'normal',
    simpleMaxWords: 50,
    normalMaxWords: 150,
    detailedMaxWords: 200,
    maxUserMessageLength: 5000,
    visitorMessageLimit: 20,
    userMessageLimit: 60,
    adminMessageLimit: 0,
    messageLimitPeriodHours: 24,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/config', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load config');
      const data = await res.json();
      const c: LaraConfig = {
        responseMode: data.responseMode || 'normal',
        simpleMaxWords: data.simpleMaxWords ?? 50,
        normalMaxWords: data.normalMaxWords ?? 150,
        detailedMaxWords: data.detailedMaxWords ?? 200,
        maxUserMessageLength: data.maxUserMessageLength ?? 5000,
        visitorMessageLimit: data.visitorMessageLimit ?? 20,
        userMessageLimit: data.userMessageLimit ?? 60,
        adminMessageLimit: data.adminMessageLimit ?? 0,
        messageLimitPeriodHours: data.messageLimitPeriodHours ?? 24,
      };
      setConfig(c);
      setEdit(c);
    } catch (e: any) {
      toast.error('Erreur chargement config', { description: e.message });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchConfig();
      setLoading(false);
    })();
  }, [fetchConfig]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/assistant/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      const data = await res.json();
      setConfig(data);
      setEdit(data);
      toast.success('Configuration Lara enregistrée');
    } catch (e: any) {
      toast.error('Erreur sauvegarde', { description: e.message });
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof LaraConfig, value: string | number) {
    setEdit(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Configuration Lara</CardTitle></CardHeader>
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

  const hasChanges = config && JSON.stringify(config) !== JSON.stringify(edit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4" /> Configuration Lara
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Limitez la verbosité de Lara et protégez contre l'abus avec des quotas individuels.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* === RÉPONSES === */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <MessageSquare className="h-4 w-4" /> Réponses
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Mode de réponse</Label>
              <Select value={edit.responseMode} onValueChange={v => update('responseMode', v)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (max 50 mots)</SelectItem>
                  <SelectItem value="normal">Normal (max 150 mots)</SelectItem>
                  <SelectItem value="detailed">Détaillé (max 200 mots)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 mt-1">Une question simple doit recevoir une réponse simple. La limite max ne signifie pas qu'il faut la remplir.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Max mots — Simple</Label>
                <Input type="number" min={10} max={500} value={edit.simpleMaxWords}
                  onChange={e => update('simpleMaxWords', parseInt(e.target.value) || 50)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Max mots — Normal</Label>
                <Input type="number" min={10} max={500} value={edit.normalMaxWords}
                  onChange={e => update('normalMaxWords', parseInt(e.target.value) || 150)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Max mots — Détaillé</Label>
                <Input type="number" min={10} max={500} value={edit.detailedMaxWords}
                  onChange={e => update('detailedMaxWords', parseInt(e.target.value) || 200)} className="text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Longueur max du message utilisateur (caractères)</Label>
              <Input type="number" min={100} max={20000} value={edit.maxUserMessageLength}
                onChange={e => update('maxUserMessageLength', parseInt(e.target.value) || 5000)} className="text-sm" />
            </div>
          </div>
        </div>

        <Separator />

        {/* === QUOTAS === */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Gauge className="h-4 w-4" /> Quotas de messages
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Visiteur (non connecté)</Label>
                <Input type="number" min={0} max={1000} value={edit.visitorMessageLimit}
                  onChange={e => update('visitorMessageLimit', parseInt(e.target.value) || 0)} className="text-sm" />
                <p className="text-[10px] text-slate-500 mt-1">Quand le quota est atteint, Lara propose de créer un compte.</p>
              </div>
              <div>
                <Label className="text-xs">Utilisateur connecté</Label>
                <Input type="number" min={0} max={10000} value={edit.userMessageLimit}
                  onChange={e => update('userMessageLimit', parseInt(e.target.value) || 0)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Administrateur</Label>
                <Input type="number" min={0} max={10000} value={edit.adminMessageLimit}
                  onChange={e => update('adminMessageLimit', parseInt(e.target.value) || 0)} className="text-sm" />
                <p className="text-[10px] text-slate-500 mt-1">0 = Illimité</p>
              </div>
            </div>
            <div>
              <Label className="text-xs">Période de quota (heures)</Label>
              <Input type="number" min={1} max={720} value={edit.messageLimitPeriodHours}
                onChange={e => update('messageLimitPeriodHours', parseInt(e.target.value) || 24)} className="text-sm w-32" />
              <p className="text-[10px] text-slate-500 mt-1">Période rolling — le compteur se réinitialise après cette durée.</p>
            </div>
          </div>
        </div>

        {/* === Save button === */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            {hasChanges ? (
              <Badge className="bg-amber-100 text-amber-800">Modifications non sauvegardées</Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800">À jour</Badge>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </Button>
        </div>

        {/* === Security note === */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <strong>Sécurité :</strong> Les quotas sont contrôlés côté serveur uniquement. Chaque visiteur reçoit un identifiant anonyme (cookie HttpOnly) avec son propre quota. Les administrateurs sont illimités. Aucun appel LLM n'est effectué quand le quota est atteint.
        </div>

      </CardContent>
    </Card>
  );
}
