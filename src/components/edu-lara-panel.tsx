'use client';

// ============================================================================
// EduLaraPanel — Section "Lara EDU & Comportement" du dashboard
// ============================================================================
// Affiche en lecture seule :
//   - Les 5 couches EDU LARA (comportement conversationnel de Lara)
//   - Les 2 couches système (SYSTEM SAFETY + INSTITUTIONAL CONTEXT)
//
// Ces fichiers sont codés en dur dans le source. L'admin peut les LIRE pour
// vérifier ce que Lara sait, mais ne peut PAS les modifier via le dashboard.
// Pour modifier : éditer le fichier source + rebuild + redeploy.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Lock, GraduationCap, Shield } from 'lucide-react';

interface EduLaraLayer {
  id: string;
  title: string;
  description: string;
  content: string;
  editable: boolean;
  sourceFile: string;
}

interface EduLaraResponse {
  eduLaraLayers: EduLaraLayer[];
  systemLayers: EduLaraLayer[];
}

export function EduLaraPanel() {
  const [data, setData] = useState<EduLaraResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchLayers = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/edu-lara', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load EDU LARA layers');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('EduLaraPanel fetch error:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchLayers();
      setLoading(false);
    })();
  }, [fetchLayers]);

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Lara EDU & Comportement</CardTitle></CardHeader>
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

  if (!data) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Lara EDU & Comportement</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Erreur de chargement des couches EDU LARA.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4" /> Lara EDU & Comportement
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Les 5 couches EDU LARA définissent le comportement conversationnel de Lara (salutation, qualification, orientation, transmission prospect).
          Ces fichiers sont codés en dur dans le source et ne sont pas modifiables depuis le dashboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* === Section EDU LARA (5 couches) === */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <BookOpen className="h-4 w-4 text-emerald-600" /> Couches EDU LARA (5 fichiers)
          </div>
          <div className="space-y-2">
            {data.eduLaraLayers.map((layer) => (
              <div key={layer.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(layer.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700">EDU LARA</Badge>
                      <span className="font-medium text-sm text-slate-900 truncate">{layer.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{layer.description}</p>
                  </div>
                  <div className="text-xs text-slate-400 ml-2 shrink-0">
                    {layer.content.length} chars · {expanded[layer.id] ? '▲' : '▼'}
                  </div>
                </button>
                {expanded[layer.id] && (
                  <div className="border-t border-slate-200 bg-slate-50 p-3">
                    <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto">{layer.content}</pre>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <Lock className="h-3 w-3" />
                      <span>Lecture seule · Source : <code>{layer.sourceFile}</code></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* === Section System layers (SYSTEM SAFETY + INSTITUTIONAL CONTEXT) === */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Shield className="h-4 w-4 text-red-600" /> Couches système (immuables)
          </div>
          <div className="space-y-2">
            {data.systemLayers.map((layer) => (
              <div key={layer.id} className="border border-red-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(layer.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-red-50 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className="text-[10px] bg-red-100 text-red-700">IMMUABLE</Badge>
                      <span className="font-medium text-sm text-slate-900 truncate">{layer.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{layer.description}</p>
                  </div>
                  <div className="text-xs text-slate-400 ml-2 shrink-0">
                    {layer.content.length} chars · {expanded[layer.id] ? '▲' : '▼'}
                  </div>
                </button>
                {expanded[layer.id] && (
                  <div className="border-t border-red-200 bg-red-50 p-3">
                    <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto">{layer.content}</pre>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-red-700">
                      <Lock className="h-3 w-3" />
                      <span>Lecture seule · Source : <code>{layer.sourceFile}</code> · JAMAIS modifiable</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === Note d'information === */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <strong>Architecture :</strong> Ces couches sont injectées dans le system prompt de Lara à chaque requête,
          dans l'ordre suivant : [1] SYSTEM SAFETY → [2] INSTITUTIONAL CONTEXT → [3] GENERAL INSTRUCTIONS (admin) →
          [3.5-3.9] EDU LARA 01..05 → [4] MODE INSTRUCTIONS → [4.5] RESPONSE LIMITS → [5] BEHAVIOR → [6] KNOWLEDGE SOURCES → [7] USER CONTEXT.
          Les couches EDU LARA sont additives et ne contournent jamais les règles SYSTEM SAFETY.
        </div>

      </CardContent>
    </Card>
  );
}
