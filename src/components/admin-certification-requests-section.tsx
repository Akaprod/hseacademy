'use client';

// ============================================================================
// AdminCertificationRequestsSection — Gestion des demandes de formation certifiante
// ============================================================================
// Même pattern que AdminInscriptionsSection mais adapté aux 3 modes
// (individuel / groupe / entreprise) et au workflow spécifique.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardCheck, Search, Loader2, Mail, Phone, MapPin,
  Calendar, GraduationCap, Award, FileText, User, Users, Building2,
  CheckCircle2, XCircle, Clock, Eye, Download, Trash2, X,
  ChevronLeft, ChevronRight, RefreshCw, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';

// ============================================================================
// Types
// ============================================================================
type Mode = 'individuel' | 'groupe' | 'entreprise';
type Status = 'pending' | 'contacted' | 'liste_attente' | 'confirmed' | 'rejected';

interface CertificationRequest {
  id: string;
  mode: Mode;
  formationSlug: string | null;
  formationOther: string | null;
  modeFormation: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string | null;
  entreprise: string | null;
  nbPersonnes: number | null;
  status: Status;
  adminNotes: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  items: CertificationRequest[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Config visuelle
// ============================================================================
const MODE_CONFIG: Record<Mode, { label: string; color: string; bg: string; icon: any }> = {
  individuel: { label: 'Individuel', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: User },
  groupe:     { label: 'Groupe',     color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: Users },
  entreprise: { label: 'Entreprise', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: Building2 },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  pending:      { label: 'En attente',     color: 'text-amber-700',    bg: 'bg-amber-100 border-amber-200',    icon: Clock },
  contacted:    { label: 'Contacté',       color: 'text-blue-700',     bg: 'bg-blue-100 border-blue-200',      icon: Mail },
  liste_attente:{ label: 'Liste d\'attente', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200', icon: Clock },
  confirmed:    { label: 'Confirmée',       color: 'text-emerald-700',  bg: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  rejected:    { label: 'Refusée',         color: 'text-red-700',      bg: 'bg-red-100 border-red-200',          icon: XCircle },
};

const MODE_FORMATION_LABELS: Record<string, string> = {
  presentiel: 'Présentiel',
  ligne: 'En ligne',
  hybride: 'Hybride',
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const getFormationLabel = (item: CertificationRequest): string => {
  if (item.formationSlug) {
    // Mapping des 14 slugs → titres (au cas où l'admin n'a pas accès à la DB directement)
    const slugToTitle: Record<string, string> = {
      'sauveteur-secouriste-travail-sst': 'Sauveteur Secouriste du Travail (SST)',
      'habilitation-electrique-b0-b2-br-bc': 'Habilitation Électrique B0 / B2 / BR / BC',
      'travail-en-hauteur-caces-r489': 'Travail en Hauteur - CACES R489',
      'intervention-espaces-confines': 'Intervention en Espaces Confinés',
      'equipier-premiere-intervention-incendie': 'Équipier de Première Intervention - Incendie',
      'ssiap-1-securite-incendie': 'SSIAP 1 - Service de Sécurité Incendie et d\'Assistance à Personnes',
      'caces-r485-chariots-automoteurs': 'CACES R485 - Conduite de Chariots Automoteurs',
      'caces-r482-grues-appareils-levage': 'CACES R482 - Grues et Appareils de Levage',
      'risques-chimiques-evaluation-prevention': 'Risques Chimiques - Évaluation et Prévention',
      'manutention-manuelle-port-charge-prap': 'Manutention Manuelle et Port de Charge - PRAP',
      'amox-agent-maitrise-risques': 'AMOX - Agent de Maîtrise des Risques',
      'cse-cssct-formation-elus-risque-professionnel': 'CSE / CSSCT - Formation des Élus au Risque Professionnel',
      'permis-feu-travaux-a-chaud': 'Permis de Feu et Travaux à Chaud',
      'conduite-securite-permis-eco-conduite': 'Conduite en Sécurité - Permis B et Éco-conduite',
    };
    return slugToTitle[item.formationSlug] || item.formationSlug;
  }
  return item.formationOther || '—';
};

// ============================================================================
// Component
// ============================================================================
export function AdminCertificationRequestsSection() {
  const [items, setItems] = useState<CertificationRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Détail
  const [selected, setSelected] = useState<CertificationRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<Status>('pending');
  const [savingDetail, setSavingDetail] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<CertificationRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState<Record<Status, number>>({
    pending: 0, contacted: 0, liste_attente: 0, confirmed: 0, rejected: 0,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (modeFilter && modeFilter !== 'all') params.set('mode', modeFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/certification-requests?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) { toast.error('Erreur lors du chargement'); return; }
      const data: ApiResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('fetchList error:', err);
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, modeFilter, search, page, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const statuses: Status[] = ['pending', 'contacted', 'liste_attente', 'confirmed', 'rejected'];
      const counts = await Promise.all(
        statuses.map(async (s) => {
          const res = await fetch(`/api/admin/certification-requests?status=${s}&limit=1`, { cache: 'no-store' });
          if (!res.ok) return 0;
          const data = await res.json();
          return data.total || 0;
        })
      );
      setStats({
        pending: counts[0],
        contacted: counts[1],
        liste_attente: counts[2],
        confirmed: counts[3],
        rejected: counts[4],
      });
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [statusFilter, modeFilter, search]);

  const openDetail = async (item: CertificationRequest) => {
    setSelected(item);
    setAdminNotesDraft(item.adminNotes || '');
    setStatusDraft(item.status);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/certification-requests/${item.id}`, { cache: 'no-store' });
      if (res.ok) {
        const detail = await res.json();
        setSelected(detail);
        setAdminNotesDraft(detail.adminNotes || '');
        setStatusDraft(detail.status);
      }
    } catch (err) {
      console.error('openDetail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSavingDetail(true);
    try {
      const res = await fetch(`/api/admin/certification-requests/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusDraft, adminNotes: adminNotesDraft }),
      });
      if (!res.ok) { toast.error('Erreur lors de la sauvegarde'); return; }
      const updated = await res.json();
      toast.success('Demande mise à jour');
      setItems(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
      setSelected({ ...selected, ...updated });
      fetchStats();
    } catch (err) {
      console.error('saveDetail error:', err);
      toast.error('Erreur réseau');
    } finally {
      setSavingDetail(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/certification-requests/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Erreur lors de la suppression'); return; }
      toast.success('Demande supprimée');
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      setTotal(t => Math.max(0, t - 1));
      setDeleteTarget(null);
      fetchStats();
    } catch (err) {
      console.error('confirmDelete error:', err);
      toast.error('Erreur réseau');
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Date', 'Statut', 'Mode', 'Formation', 'Mode formation',
      'Nom', 'Prénom', 'Email', 'Téléphone', 'Entreprise', 'Nb personnes',
      'Notes admin', 'ID',
    ];
    const rows = items.map(it => [
      formatDate(it.createdAt),
      STATUS_CONFIG[it.status].label,
      MODE_CONFIG[it.mode].label,
      getFormationLabel(it),
      MODE_FORMATION_LABELS[it.modeFormation] || it.modeFormation,
      it.nom, it.prenom, it.email, it.phone || '',
      it.entreprise || '', it.nbPersonnes || '',
      (it.adminNotes || '').replace(/\n/g, ' '),
      it.id,
    ]);
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map(r => r.map(c => (typeof c === 'string' && (c.includes(',') || c.includes('"') || c.includes('\n'))) ? escape(c) : c).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certifications_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            Inscriptions Certifiantes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Demandes de formation certifiante — 3 modes (individuel, groupe, entreprise)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchList(); fetchStats(); }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(isActive ? 'all' : s)}
              className={`text-left rounded-lg border-2 p-4 transition-all ${
                isActive ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`text-xs font-semibold ${cfg.color} uppercase tracking-wider`}>{cfg.label}</div>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{stats[s]}</div>
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-slate-500">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="liste_attente">Liste d'attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="rejected">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-slate-500">Mode</Label>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger><SelectValue placeholder="Tous les modes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="individuel">Individuel</SelectItem>
                  <SelectItem value="groupe">Groupe</SelectItem>
                  <SelectItem value="entreprise">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-slate-500">Recherche</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nom, email, entreprise, formation..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-3 text-slate-500">Chargement…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <ClipboardCheck className="h-12 w-12 mb-3 text-slate-300" />
              <p>Aucune demande ne correspond à vos filtres.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Candidat</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs hidden md:table-cell">Formation</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Mode</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Statut</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(it => {
                    const cfg = MODE_CONFIG[it.mode];
                    const sCfg = STATUS_CONFIG[it.status];
                    return (
                      <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(it.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{it.prenom} {it.nom}</div>
                          <div className="text-xs text-slate-500">{it.email}</div>
                          {it.entreprise && <div className="text-xs text-amber-700 mt-0.5">🏢 {it.entreprise}</div>}
                          {it.nbPersonnes && <div className="text-xs text-emerald-700 mt-0.5">👥 {it.nbPersonnes} pers.</div>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="font-medium text-slate-700 text-xs max-w-[200px] truncate">{getFormationLabel(it)}</div>
                          <div className="text-xs text-slate-500">{MODE_FORMATION_LABELS[it.modeFormation] || it.modeFormation}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`gap-1 ${cfg.bg} ${cfg.color}`}>
                            <cfg.icon className="h-3 w-3" /> {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`gap-1 ${sCfg.bg} ${sCfg.color}`}>
                            <sCfg.icon className="h-3 w-3" /> {sCfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(it)}>
                            <Eye className="h-4 w-4 mr-1" /> Détail
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(it)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500">
                {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} sur {total}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 self-center px-2">Page {page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal détail */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  {selected.prenom} {selected.nom}
                </DialogTitle>
                <DialogDescription>
                  Demande du {formatDate(selected.createdAt)} · Réf {selected.id}
                </DialogDescription>
              </DialogHeader>

              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Type + formation */}
                  <div className={`rounded-lg p-4 border ${MODE_CONFIG[selected.mode].bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`gap-1 ${MODE_CONFIG[selected.mode].bg} ${MODE_CONFIG[selected.mode].color}`}>
                        {MODE_CONFIG[selected.mode].label}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" /> {MODE_FORMATION_LABELS[selected.modeFormation] || selected.modeFormation}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Formation visée</div>
                    <div className="text-slate-900 font-semibold mt-1">{getFormationLabel(selected)}</div>
                  </div>

                  {/* Coordonnées */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Identité</h3>
                      <InfoRow icon={User} label="Nom complet" value={`${selected.prenom} ${selected.nom}`} />
                      <InfoRow icon={Mail} label="Email" value={selected.email} href={`mailto:${selected.email}`} />
                      <InfoRow icon={Phone} label="Téléphone" value={selected.phone} href={selected.phone ? `tel:${selected.phone}` : undefined} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Détails</h3>
                      {selected.entreprise && (
                        <InfoRow icon={Building2} label="Entreprise" value={selected.entreprise} />
                      )}
                      {selected.nbPersonnes != null && (
                        <InfoRow icon={Users} label="Nb personnes" value={`${selected.nbPersonnes}`} />
                      )}
                      <InfoRow icon={Calendar} label="Soumis le" value={formatDate(selected.createdAt)} />
                      {selected.reviewedAt && (
                        <InfoRow icon={CheckCircle2} label="Dernier traitement" value={formatDate(selected.reviewedAt)} />
                      )}
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 space-y-1">
                    <div>IP: <code className="font-mono">{selected.ipAddress || '—'}</code></div>
                  </div>

                  {/* Workflow admin */}
                  <div className="border-t border-slate-200 pt-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Traitement admin</h3>

                    <div className="space-y-2">
                      <Label className="font-semibold">Statut</Label>
                      <Select value={statusDraft} onValueChange={(v) => setStatusDraft(v as Status)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="contacted">Contacté</SelectItem>
                          <SelectItem value="liste_attente">Liste d'attente</SelectItem>
                          <SelectItem value="confirmed">Confirmée</SelectItem>
                          <SelectItem value="rejected">Refusée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Notes internes</Label>
                      <Textarea
                        value={adminNotesDraft}
                        onChange={e => setAdminNotesDraft(e.target.value)}
                        placeholder="Notes, commentaires, status du contact, date prévue..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Fermer</Button>
                <Button onClick={saveDetail} disabled={savingDetail || detailLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {savingDetail ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Sauvegarde…</> : 'Sauvegarder'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" /> Supprimer cette demande ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La demande de{' '}
              <strong>{deleteTarget?.prenom} {deleteTarget?.nom}</strong> pour{' '}
              <strong>{deleteTarget ? getFormationLabel(deleteTarget) : ''}</strong> sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Suppression…</> : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// InfoRow
// ============================================================================
function InfoRow({ icon: Icon, label, value, href }: {
  icon: any;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        {value ? (
          href ? (
            <a href={href} className="text-slate-900 hover:text-emerald-700 break-all">{value}</a>
          ) : (
            <div className="text-slate-900 break-words">{value}</div>
          )
        ) : (
          <div className="text-slate-400">—</div>
        )}
      </div>
    </div>
  );
}
