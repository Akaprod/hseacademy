'use client';

// ============================================================================
// AdminInscriptionsSection — Gestion des demandes d'inscription
// ============================================================================
// Dashboard admin dédié à la visualisation et au traitement des demandes.
// Fonctions:
//   - Liste paginée avec filtres (statut, formation, recherche texte)
//   - Statistiques en haut (pending, reviewing, accepted, rejected, waitlisted)
//   - Détail d'une demande (modal)
//   - Mise à jour statut (pending → reviewing → accepted/rejected/waitlisted)
//   - Notes admin
//   - Export CSV (toutes les demandes filtrées)
//   - Suppression (avec confirmation)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList, Search, Filter, Loader2, Mail, Phone, MapPin,
  Calendar, GraduationCap, Award, FileText, BookOpen, User,
  CheckCircle2, XCircle, Clock, Eye, Download, Trash2, X,
  ChevronLeft, ChevronRight, RefreshCw,
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
type Status = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'waitlisted';

interface InscriptionRequest {
  id: string;
  formationSlug: string;
  formationLevel: string;
  nom: string;
  prenom: string;
  genre: string;
  birthDate: string | null;
  residence: string | null;
  nationalite: string | null;
  email: string;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  niveauScolaire: string | null;
  dernierDiplome: string | null;
  experienceHSE: string | null;
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
  items: InscriptionRequest[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'En attente',   color: 'text-amber-700',   bg: 'bg-amber-100 border-amber-200',   icon: Clock },
  reviewing:  { label: 'En cours',     color: 'text-blue-700',    bg: 'bg-blue-100 border-blue-200',     icon: Eye },
  accepted:   { label: 'Acceptée',     color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  rejected:   { label: 'Refusée',      color: 'text-red-700',     bg: 'bg-red-100 border-red-200',      icon: XCircle },
  waitlisted: { label: 'Liste d\'attente', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200', icon: Clock },
};

// Mapping slug → titre lisible
const FORMATION_TITLES: Record<string, string> = {
  'diplome-qualifie-qhse': 'Diplôme Qualifié QHSE',
  'technicien-qhse': 'Technicien QHSE',
  'technicien-superieur-qhse': 'Technicien Supérieur QHSE',
  'licence-professionnelle-qhse': 'Licence Professionnelle QHSE',
  'master-professionnel-qhse': 'Master Professionnel QHSE',
  'vae-expertise-qhse': 'VAE — Validation des Acquis',
};

const formatFormationSlug = (slug: string): string => FORMATION_TITLES[slug] || slug;

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

const formatDateOnly = (iso: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR');
  } catch {
    return iso;
  }
};

// ============================================================================
// Component
// ============================================================================
export function AdminInscriptionsSection() {
  const [items, setItems] = useState<InscriptionRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [formationFilter, setFormationFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Détail (modal)
  const [selected, setSelected] = useState<InscriptionRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<Status>('pending');
  const [savingDetail, setSavingDetail] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<InscriptionRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState<Record<Status, number>>({
    pending: 0, reviewing: 0, accepted: 0, rejected: 0, waitlisted: 0,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (formationFilter && formationFilter !== 'all') params.set('formationSlug', formationFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/inscriptions?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        toast.error('Erreur lors du chargement');
        return;
      }
      const data: ApiResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('fetchList error:', err);
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, formationFilter, search, page, limit]);

  // Fetch all stats (compte par statut)
  const fetchStats = useCallback(async () => {
    try {
      // Pour chaque statut, on fait un count via l'API (limite 0 retournes juste le total)
      const statuses: Status[] = ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'];
      const counts = await Promise.all(
        statuses.map(async (s) => {
          const res = await fetch(`/api/admin/inscriptions?status=${s}&limit=1`, { cache: 'no-store' });
          if (!res.ok) return 0;
          const data = await res.json();
          return data.total || 0;
        })
      );
      setStats({
        pending: counts[0],
        reviewing: counts[1],
        accepted: counts[2],
        rejected: counts[3],
        waitlisted: counts[4],
      });
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Reset page quand filtres changent
  useEffect(() => {
    setPage(1);
  }, [statusFilter, formationFilter, search]);

  // Ouvrir le détail
  const openDetail = async (item: InscriptionRequest) => {
    setSelected(item);
    setAdminNotesDraft(item.adminNotes || '');
    setStatusDraft(item.status);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/inscriptions/${item.id}`, { cache: 'no-store' });
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

  // Sauvegarder le détail (statut + notes)
  const saveDetail = async () => {
    if (!selected) return;
    setSavingDetail(true);
    try {
      const res = await fetch(`/api/admin/inscriptions/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusDraft,
          adminNotes: adminNotesDraft,
        }),
      });
      if (!res.ok) {
        toast.error('Erreur lors de la sauvegarde');
        return;
      }
      const updated = await res.json();
      toast.success('Demande mise à jour');
      // Mettre à jour localement
      setItems(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
      setSelected({ ...selected, ...updated });
      fetchStats(); // recompter les stats
    } catch (err) {
      console.error('saveDetail error:', err);
      toast.error('Erreur réseau');
    } finally {
      setSavingDetail(false);
    }
  };

  // Confirmer suppression
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inscriptions/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Erreur lors de la suppression');
        return;
      }
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

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'Date', 'Statut', 'Formation', 'Niveau', 'Nom', 'Prénom', 'Genre',
      'Date naissance', 'Nationalité', 'Résidence',
      'Email', 'Téléphone', 'Adresse',
      'Niveau scolaire', 'Dernier diplôme', 'Expérience HSE',
      'Notes admin', 'ID',
    ];
    const rows = items.map(it => [
      formatDate(it.createdAt),
      STATUS_CONFIG[it.status].label,
      formatFormationSlug(it.formationSlug),
      it.formationLevel,
      it.nom, it.prenom, it.genre,
      formatDateOnly(it.birthDate), it.nationalite || '', it.residence || '',
      it.email, it.phone || '',
      [it.addressStreet, it.addressCity, it.addressPostalCode, it.addressCountry].filter(Boolean).join(' '),
      it.niveauScolaire || '', it.dernierDiplome || '', it.experienceHSE || '',
      (it.adminNotes || '').replace(/\n/g, ' '),
      it.id,
    ]);
    // Échapper les champs contenant des virgules
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map(r => r.map(c => (typeof c === 'string' && (c.includes(',') || c.includes('"') || c.includes('\n'))) ? escape(c) : c).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-emerald-600" />
            Demandes d'inscription
          </h2>
          <p className="text-sm text-slate-500 mt-1">Visualisez et traitez les candidatures reçues</p>
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

      {/* Stats cards */}
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
                  <SelectItem value="reviewing">En cours</SelectItem>
                  <SelectItem value="accepted">Acceptée</SelectItem>
                  <SelectItem value="rejected">Refusée</SelectItem>
                  <SelectItem value="waitlisted">Liste d'attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-slate-500">Formation</Label>
              <Select value={formationFilter} onValueChange={setFormationFilter}>
                <SelectTrigger><SelectValue placeholder="Toutes les formations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les formations</SelectItem>
                  {Object.entries(FORMATION_TITLES).map(([slug, title]) => (
                    <SelectItem key={slug} value={slug}>{title}</SelectItem>
                  ))}
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
                  placeholder="Nom, prénom, email, téléphone…"
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
              <ClipboardList className="h-12 w-12 mb-3 text-slate-300" />
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
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs hidden lg:table-cell">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Statut</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(it => {
                    const cfg = STATUS_CONFIG[it.status];
                    return (
                      <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(it.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{it.prenom} {it.nom}</div>
                          <div className="text-xs text-slate-500">{it.genre === 'M' ? 'Masculin' : 'Féminin'}{it.nationalite ? ` · ${it.nationalite}` : ''}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="font-medium text-slate-700">{formatFormationSlug(it.formationSlug)}</div>
                          <div className="text-xs text-slate-500">{it.formationLevel}</div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-xs text-slate-700">{it.email}</div>
                          <div className="text-xs text-slate-500">{it.phone || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`gap-1 ${cfg.bg} ${cfg.color}`}>
                            <cfg.icon className="h-3 w-3" /> {cfg.label}
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

          {/* Pagination */}
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
                  {/* Formation visée */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
                      <GraduationCap className="h-4 w-4" /> Formation visée
                    </div>
                    <div className="text-slate-900 font-semibold">{formatFormationSlug(selected.formationSlug)}</div>
                    <div className="text-sm text-slate-600 mt-1">Niveau : {selected.formationLevel}</div>
                  </div>

                  {/* Identité + scolarité + expérience en grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Identité</h3>
                      <InfoRow icon={User} label="Nom complet" value={`${selected.prenom} ${selected.nom}`} />
                      <InfoRow icon={User} label="Genre" value={selected.genre === 'M' ? 'Masculin' : 'Féminin'} />
                      <InfoRow icon={Calendar} label="Date de naissance" value={formatDateOnly(selected.birthDate)} />
                      <InfoRow icon={MapPin} label="Nationalité" value={selected.nationalite} />
                      <InfoRow icon={MapPin} label="Résidence" value={selected.residence} />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Contact</h3>
                      <InfoRow icon={Mail} label="Email" value={selected.email} href={`mailto:${selected.email}`} />
                      <InfoRow icon={Phone} label="Téléphone" value={selected.phone} href={selected.phone ? `tel:${selected.phone}` : undefined} />
                      <InfoRow icon={MapPin} label="Adresse" value={[
                        selected.addressStreet,
                        selected.addressPostalCode && selected.addressCity ? `${selected.addressPostalCode} ${selected.addressCity}` : selected.addressCity,
                        selected.addressCountry,
                      ].filter(Boolean).join(', ') || null} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" /> Scolarité
                      </h3>
                      <InfoRow icon={BookOpen} label="Niveau scolaire" value={selected.niveauScolaire} />
                      <InfoRow icon={FileText} label="Dernier diplôme" value={selected.dernierDiplome} />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="h-4 w-4" /> Expérience HSE
                      </h3>
                      <InfoRow icon={Award} label="Expérience" value={selected.experienceHSE} />
                    </div>
                  </div>

                  {/* Métadonnées admin */}
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 space-y-1">
                    <div>IP: <code className="font-mono">{selected.ipAddress || '—'}</code></div>
                    <div>Soumis le: {formatDate(selected.createdAt)}</div>
                    {selected.reviewedAt && <div>Dernier traitement: {formatDate(selected.reviewedAt)}</div>}
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
                          <SelectItem value="reviewing">En cours d'examen</SelectItem>
                          <SelectItem value="accepted">Acceptée</SelectItem>
                          <SelectItem value="rejected">Refusée</SelectItem>
                          <SelectItem value="waitlisted">Liste d'attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Notes internes (non visibles par le candidat)</Label>
                      <Textarea
                        value={adminNotesDraft}
                        onChange={e => setAdminNotesDraft(e.target.value)}
                        placeholder="Notes, commentaires, niveau du candidat, documents à demander…"
                        rows={4}
                      />
                    </div>

                    {selected.reviewedAt && (
                      <div className="text-xs text-slate-500">
                        Dernier traitement par {selected.reviewedBy?.slice(0, 8) || 'admin'} le {formatDate(selected.reviewedAt)}
                      </div>
                    )}
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
              <strong>{deleteTarget?.prenom} {deleteTarget?.nom}</strong> pour la formation{' '}
              <strong>{deleteTarget ? formatFormationSlug(deleteTarget.formationSlug) : ''}</strong> sera définitivement supprimée.
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
// InfoRow — affichage d'une ligne d'info dans le détail
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
