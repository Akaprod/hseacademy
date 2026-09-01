'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, Award, GraduationCap, FolderOpen, File,
  Menu, MessageSquare, Mail, Users, Star, Shield, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, Search, Eye, EyeOff, Check, X, Clock,
  TrendingUp, BarChart3, LogOut, ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================
// TYPES
// ============================================================

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  createdAt?: string;
  _count?: { comments?: number; certifications?: number };
}

interface AdminDashboardProps {
  user: AdminUser | null;
  onNavigate: (page: string, data?: Record<string, string>) => void;
  onLogout: () => void;
}

interface OverviewStats {
  totalArticles: number; publishedArticles: number; draftArticles: number;
  totalCertifications: number; validCertifications: number;
  totalFormations: number; totalCategories: number;
  totalUsers: number; totalNewsletter: number;
  totalContacts: number; unreadContacts: number;
  totalComments: number; pendingComments: number;
  totalTestimonials: number; totalPages: number; totalMenus: number;
}

type Section = 'dashboard' | 'articles' | 'certifications' | 'formations' | 'categories' | 'pages' | 'menus' | 'comments' | 'newsletter' | 'contacts' | 'users' | 'testimonials';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SimplePagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const items: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let i = start; i <= end; i++) items.push(i);
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {start > 1 && <span className="px-1 text-sm text-muted-foreground">...</span>}
      {items.map((i) => (
        <Button key={i} variant={i === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => onPageChange(i)}>
          {i}
        </Button>
      ))}
      {end < pages && <span className="px-1 text-sm text-muted-foreground">...</span>}
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    valid: { label: 'Valide', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    approved: { label: 'Approuvé', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    published: { label: 'Publié', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    active: { label: 'Actif', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    expired: { label: 'Expiré', cls: 'bg-red-100 text-red-800 border-red-200' },
    rejected: { label: 'Rejeté', cls: 'bg-red-100 text-red-800 border-red-200' },
    revoked: { label: 'Révoqué', cls: 'bg-red-100 text-red-800 border-red-200' },
    pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    draft: { label: 'Brouillon', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  const info = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return <Badge variant="outline" className={info.cls}>{info.label}</Badge>;
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };
  const iconColorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  return (
    <Card className={colorMap[color] || colorMap.slate}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${iconColorMap[color] || iconColorMap.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({ data, label }: { data: Array<{ month: string; count: number }>; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Aucune donnée</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {data.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-slate-600">{d.count}</span>
                <div
                  className="w-full bg-emerald-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-slate-400">{d.month.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function truncate(str: string, len: number) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminDashboard({ user, onNavigate, onLogout }: AdminDashboardProps) {
  // Navigation
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Dashboard
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [articlesByCategory, setArticlesByCategory] = useState<any[]>([]);
  const [certificationsByStatus, setCertificationsByStatus] = useState<any[]>([]);
  const [contactsByMonth, setContactsByMonth] = useState<any[]>([]);
  const [articlesByMonth, setArticlesByMonth] = useState<any[]>([]);

  // Articles
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesPages, setArticlesPages] = useState(1);
  const [articlesPage, setArticlesPage] = useState(1);
  const [articlesSearch, setArticlesSearch] = useState('');
  const [articlesCatFilter, setArticlesCatFilter] = useState('');
  const [articlesPubFilter, setArticlesPubFilter] = useState('');
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState({ title: '', content: '', excerpt: '', categoryId: '', published: true, featured: false });
  const [categories, setCategories] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Certifications
  const [certifications, setCertifications] = useState<any[]>([]);
  const [certsTotal, setCertsTotal] = useState(0);
  const [certsPages, setCertsPages] = useState(1);
  const [certsPage, setCertsPage] = useState(1);
  const [certsSearch, setCertsSearch] = useState('');
  const [certsStatusFilter, setCertsStatusFilter] = useState('');
  const [certsTypeFilter, setCertsTypeFilter] = useState('');
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [certForm, setCertForm] = useState({ certificateNo: '', type: 'attestation', fullName: '', programName: '', level: 'technicien', issuedDate: '', expirationDate: '', status: 'valid' });
  const [certsLoading, setCertsLoading] = useState(false);

  // Formations
  const [formations, setFormations] = useState<any[]>([]);
  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [formationForm, setFormationForm] = useState({ title: '', slug: '', shortDescription: '', fullDescription: '', level: 'technicien', duration: '', prerequisites: '', objectives: '', program: '', price: '', mode: 'presentiel', coverImage: '', featured: false, order: 0 });
  const [formationsLoading, setFormationsLoading] = useState(false);

  // Categories
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#059669', order: 0 });
  const [catsLoading, setCatsLoading] = useState(false);

  // Pages
  const [pages, setPages] = useState<any[]>([]);
  const [pagesTotal, setPagesTotal] = useState(0);
  const [pagesPagination, setPagesPagination] = useState(1);
  const [pagesPage, setPagesPage] = useState(1);
  const [pagesSearch, setPagesSearch] = useState('');
  const [pagesPubFilter, setPagesPubFilter] = useState('');
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', published: true, showInMenu: false, order: 0 });
  const [pagesLoading, setPagesLoading] = useState(false);

  // Menus
  const [menus, setMenus] = useState<any[]>([]);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [menuForm, setMenuForm] = useState({ label: '', page: '', url: '', parentId: '', order: 0, icon: '', target: '_self', visible: true });
  const [menusLoading, setMenusLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPages, setCommentsPages] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsStatusFilter, setCommentsStatusFilter] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Newsletter
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [nlTotal, setNlTotal] = useState(0);
  const [nlPages, setNlPages] = useState(1);
  const [nlPage, setNlPage] = useState(1);
  const [nlLoading, setNlLoading] = useState(false);
  const [selectedNl, setSelectedNl] = useState<string[]>([]);

  // Contacts / Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgPages, setMsgPages] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [msgUnreadFilter, setMsgUnreadFilter] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPages, setUsersPages] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  // Testimonials
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testiModalOpen, setTestiModalOpen] = useState(false);
  const [editingTesti, setEditingTesti] = useState<any>(null);
  const [testiForm, setTestiForm] = useState({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, featured: false });
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // General loading
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // NAVIGATION ITEMS
  // ============================================================

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'formations', label: 'Formations', icon: GraduationCap },
    { id: 'categories', label: 'Catégories', icon: FolderOpen },
    { id: 'pages', label: 'Pages', icon: File },
    { id: 'menus', label: 'Menus', icon: Menu },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'contacts', label: 'Messages', icon: Mail },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'testimonials', label: 'Témoignages', icon: Star },
  ];

  // ============================================================
  // API HELPER
  // ============================================================

  const api = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options?.headers }, ...options });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  }, []);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  // Dashboard
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const data = await api('/api/admin/stats');
      setStats(data.overview);
      setRecentArticles(data.recentArticles || []);
      setRecentContacts(data.recentContacts || []);
      setTopArticles(data.topArticles || []);
      setArticlesByCategory(data.articlesByCategory || []);
      setCertificationsByStatus(data.certificationsByStatus || []);
      setContactsByMonth(data.contactsByMonth || []);
      setArticlesByMonth(data.articlesByMonth || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setDashboardLoading(false);
    }
  }, [api]);

  // Articles
  const fetchArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(articlesPage), limit: '15' });
      if (articlesSearch) params.set('search', articlesSearch);
      if (articlesCatFilter) params.set('categoryId', articlesCatFilter);
      if (articlesPubFilter) params.set('published', articlesPubFilter);
      const data = await api(`/api/admin/articles?${params}`);
      setArticles(data.articles || []);
      setArticlesTotal(data.total || 0);
      setArticlesPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setArticlesLoading(false);
    }
  }, [api, articlesPage, articlesSearch, articlesCatFilter, articlesPubFilter]);

  // Categories (shared)
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api('/api/admin/categories');
      setCategories(data.categories || []);
    } catch { /* silent */ }
  }, [api]);

  // Certifications
  const fetchCerts = useCallback(async () => {
    setCertsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(certsPage), limit: '15' });
      if (certsSearch) params.set('search', certsSearch);
      if (certsStatusFilter) params.set('status', certsStatusFilter);
      if (certsTypeFilter) params.set('type', certsTypeFilter);
      const data = await api(`/api/admin/certifications?${params}`);
      setCertifications(data.certifications || []);
      setCertsTotal(data.total || 0);
      setCertsPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCertsLoading(false);
    }
  }, [api, certsPage, certsSearch, certsStatusFilter, certsTypeFilter]);

  // Formations
  const fetchFormations = useCallback(async () => {
    setFormationsLoading(true);
    try {
      const data = await api('/api/admin/formations');
      setFormations(data.formations || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setFormationsLoading(false);
    }
  }, [api]);

  // Categories list
  const fetchCategoriesList = useCallback(async () => {
    setCatsLoading(true);
    try {
      const data = await api('/api/admin/categories');
      setCategoriesList(data.categories || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCatsLoading(false);
    }
  }, [api]);

  // Pages
  const fetchPages = useCallback(async () => {
    setPagesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pagesPage), limit: '15' });
      if (pagesSearch) params.set('search', pagesSearch);
      if (pagesPubFilter) params.set('published', pagesPubFilter);
      const data = await api(`/api/admin/pages?${params}`);
      setPages(data.pages || []);
      setPagesTotal(data.total || 0);
      setPagesPagination(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setPagesLoading(false);
    }
  }, [api, pagesPage, pagesSearch, pagesPubFilter]);

  // Menus
  const fetchMenus = useCallback(async () => {
    setMenusLoading(true);
    try {
      const data = await api('/api/admin/menus');
      setMenus(data.menus || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setMenusLoading(false);
    }
  }, [api]);

  // Comments
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(commentsPage), limit: '15' });
      if (commentsStatusFilter) params.set('status', commentsStatusFilter);
      const data = await api(`/api/admin/comments?${params}`);
      setComments(data.comments || []);
      setCommentsTotal(data.total || 0);
      setCommentsPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCommentsLoading(false);
    }
  }, [api, commentsPage, commentsStatusFilter]);

  // Newsletter
  const fetchNewsletter = useCallback(async () => {
    setNlLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nlPage), limit: '15' });
      const data = await api(`/api/admin/newsletter?${params}`);
      setSubscribers(data.subscribers || []);
      setNlTotal(data.total || 0);
      setNlPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setNlLoading(false);
    }
  }, [api, nlPage]);

  // Messages
  const fetchMessages = useCallback(async () => {
    setMsgLoading(true);
    try {
      const params = new URLSearchParams({ page: String(msgPage), limit: '15' });
      if (msgUnreadFilter) params.set('unread', msgUnreadFilter);
      const data = await api(`/api/admin/contacts?${params}`);
      setMessages(data.messages || []);
      setMsgTotal(data.total || 0);
      setMsgPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setMsgLoading(false);
    }
  }, [api, msgPage, msgUnreadFilter]);

  // Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(usersPage), limit: '15' });
      const data = await api(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
      setUsersPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setUsersLoading(false);
    }
  }, [api, usersPage]);

  // Testimonials
  const fetchTestimonials = useCallback(async () => {
    setTestimonialsLoading(true);
    try {
      const data = await api('/api/admin/testimonials');
      setTestimonials(data.testimonials || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setTestimonialsLoading(false);
    }
  }, [api]);

  // ============================================================
  // SECTION CHANGE
  // ============================================================

  const changeSection = useCallback((s: Section) => {
    setSection(s);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    switch (section) {
      case 'dashboard': fetchDashboard(); break;
      case 'articles': fetchArticles(); fetchCategories(); break;
      case 'certifications': fetchCerts(); break;
      case 'formations': fetchFormations(); break;
      case 'categories': fetchCategoriesList(); break;
      case 'pages': fetchPages(); break;
      case 'menus': fetchMenus(); break;
      case 'comments': fetchComments(); break;
      case 'newsletter': fetchNewsletter(); break;
      case 'contacts': fetchMessages(); break;
      case 'users': fetchUsers(); break;
      case 'testimonials': fetchTestimonials(); break;
    }
  }, [section]);

  // Refresh on page/filter changes
  useEffect(() => { if (section === 'articles') fetchArticles(); }, [articlesPage, fetchArticles]);
  useEffect(() => { if (section === 'certifications') fetchCerts(); }, [certsPage, fetchCerts]);
  useEffect(() => { if (section === 'pages') fetchPages(); }, [pagesPage, fetchPages]);
  useEffect(() => { if (section === 'comments') fetchComments(); }, [commentsPage, fetchComments]);
  useEffect(() => { if (section === 'newsletter') fetchNewsletter(); }, [nlPage, fetchNewsletter]);
  useEffect(() => { if (section === 'contacts') fetchMessages(); }, [msgPage, fetchMessages]);
  useEffect(() => { if (section === 'users') fetchUsers(); }, [usersPage, fetchUsers]);

  // ============================================================
  // SECTION RENDERERS
  // ============================================================

  // ----- DASHBOARD -----
  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Tableau de Bord</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      );
    }
    if (!stats) return <p className="text-slate-500">Chargement...</p>;

    const statCards = [
      { title: 'Articles publiés', value: stats.publishedArticles, icon: FileText, color: 'emerald' as const },
      { title: 'Articles brouillons', value: stats.draftArticles, icon: FileText, color: 'slate' as const },
      { title: 'Certifications valides', value: stats.validCertifications, icon: Award, color: 'blue' as const },
      { title: 'Formations', value: stats.totalFormations, icon: GraduationCap, color: 'amber' as const },
      { title: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'purple' as const },
      { title: 'Newsletter', value: stats.totalNewsletter, icon: Mail, color: 'teal' as const },
      { title: 'Messages non lus', value: stats.unreadContacts, icon: Mail, color: 'red' as const },
      { title: 'Commentaires en attente', value: stats.pendingComments, icon: MessageSquare, color: 'orange' as const },
    ];

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-semibold text-slate-800">Tableau de Bord</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent articles */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Articles récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun article</p>
                ) : (
                  recentArticles.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-slate-700 truncate">{a.title}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(a.createdAt)}</p>
                      </div>
                      <StatusBadge status={a.published ? 'published' : 'draft'} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top articles */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Star className="h-4 w-4" /> Articles les plus lus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                {topArticles.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun article</p>
                ) : (
                  topArticles.map((a: any, i: number) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                        <p className="text-sm text-slate-700 truncate">{a.title}</p>
                      </div>
                      <span className="text-xs text-slate-500 ml-2">{a.viewCount} vues</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent contacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Messages récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                {recentContacts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun message</p>
                ) : (
                  recentContacts.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-slate-700 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 truncate">{c.subject}</p>
                      </div>
                      {c.read ? (
                        <Eye className="h-4 w-4 text-slate-300" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certifications by status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Award className="h-4 w-4" /> Certifications par statut
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificationsByStatus.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {certificationsByStatus.map((cs: any) => {
                    const colors: Record<string, string> = { valid: 'bg-emerald-500', expired: 'bg-red-500', revoked: 'bg-slate-400' };
                    return (
                      <div key={cs.status} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-20">{cs.status}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${colors[cs.status] || 'bg-slate-400'}`} style={{ width: `${stats.totalCertifications > 0 ? (cs._count / stats.totalCertifications) * 100 : 0}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-8 text-right">{cs._count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SimpleBarChart data={contactsByMonth} label="Messages par mois (6 derniers mois)" />
          <SimpleBarChart data={articlesByMonth} label="Articles par mois (6 derniers mois)" />
        </div>
      </div>
    );
  };

  // ----- ARTICLES -----
  const handleArticleSubmit = async () => {
    if (!articleForm.title || !articleForm.categoryId) {
      toast.error('Titre et catégorie requis');
      return;
    }
    setSaving(true);
    try {
      if (editingArticle) {
        await api(`/api/admin/articles/${editingArticle.id}`, {
          method: 'PUT',
          body: JSON.stringify(articleForm),
        });
        toast.success('Article mis à jour');
      } else {
        await api('/api/admin/articles', {
          method: 'POST',
          body: JSON.stringify(articleForm),
        });
        toast.success('Article créé');
      }
      setArticleModalOpen(false);
      setEditingArticle(null);
      setArticleForm({ title: '', content: '', excerpt: '', categoryId: '', published: true, featured: false });
      fetchArticles();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const openEditArticle = (art: any) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title || '',
      content: art.content || '',
      excerpt: art.excerpt || '',
      categoryId: art.categoryId || '',
      published: art.published !== false,
      featured: art.featured || false,
    });
    setArticleModalOpen(true);
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await api(`/api/admin/articles/${id}`, { method: 'DELETE' });
      toast.success('Article supprimé');
      fetchArticles();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderArticles = () => (
    <div>
      <SectionHeader title="Articles" onAdd={() => { setEditingArticle(null); setArticleForm({ title: '', content: '', excerpt: '', categoryId: categories[0]?.id || '', published: true, featured: false }); setArticleModalOpen(true); }} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher..." className="pl-9" value={articlesSearch} onChange={(e) => { setArticlesSearch(e.target.value); setArticlesPage(1); }} />
        </div>
        <Select value={articlesCatFilter} onValueChange={(v) => { setArticlesCatFilter(v === 'all' ? '' : v); setArticlesPage(1); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={articlesPubFilter} onValueChange={(v) => { setArticlesPubFilter(v === 'all' ? '' : v); setArticlesPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Publié</SelectItem>
            <SelectItem value="false">Brouillon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {articlesLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{articlesTotal} article(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                  <TableHead className="hidden lg:table-cell">Commentaires</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Aucun article</TableCell></TableRow>
                ) : articles.map((a: any) => (
                  <TableRow key={a.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.category && <Badge variant="outline" style={{ borderColor: a.category.color, color: a.category.color }}>{a.category.name}</Badge>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{a._count?.comments || 0}</TableCell>
                    <TableCell><StatusBadge status={a.published ? 'published' : 'draft'} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(a.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditArticle(a)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteArticle(a.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={articlesPage} pages={articlesPages} onPageChange={setArticlesPage} />
        </>
      )}

      {/* Article Modal */}
      <Dialog open={articleModalOpen} onOpenChange={setArticleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
            <DialogDescription>Remplissez les informations de l'article</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} placeholder="Titre de l'article" />
            </div>
            <div>
              <Label>Extrait</Label>
              <Textarea value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} placeholder="Court résumé de l'article" rows={2} />
            </div>
            <div>
              <Label>Contenu (Markdown)</Label>
              <Textarea value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} placeholder="Contenu en Markdown..." rows={10} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Catégorie *</Label>
              <Select value={articleForm.categoryId} onValueChange={(v) => setArticleForm({ ...articleForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={articleForm.published} onCheckedChange={(v) => setArticleForm({ ...articleForm, published: v })} />
                <Label>Publié</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={articleForm.featured} onCheckedChange={(v) => setArticleForm({ ...articleForm, featured: v })} />
                <Label>À la une</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleModalOpen(false)}>Annuler</Button>
            <Button onClick={handleArticleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingArticle ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- CERTIFICATIONS -----
  const handleCertSubmit = async () => {
    if (!certForm.certificateNo || !certForm.fullName || !certForm.programName) {
      toast.error('Numéro, nom et programme requis');
      return;
    }
    setSaving(true);
    try {
      if (editingCert) {
        await api(`/api/admin/certifications/${editingCert.id}`, { method: 'PUT', body: JSON.stringify(certForm) });
        toast.success('Certification mise à jour');
      } else {
        await api('/api/admin/certifications', { method: 'POST', body: JSON.stringify(certForm) });
        toast.success('Certification créée');
      }
      setCertModalOpen(false);
      setEditingCert(null);
      setCertForm({ certificateNo: '', type: 'attestation', fullName: '', programName: '', level: 'technicien', issuedDate: '', expirationDate: '', status: 'valid' });
      fetchCerts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteCert = async (id: string) => {
    if (!window.confirm('Supprimer cette certification ?')) return;
    try {
      await api(`/api/admin/certifications/${id}`, { method: 'DELETE' });
      toast.success('Certification supprimée');
      fetchCerts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderCertifications = () => (
    <div>
      <SectionHeader title="Certifications" onAdd={() => { setEditingCert(null); setCertForm({ certificateNo: '', type: 'attestation', fullName: '', programName: '', level: 'technicien', issuedDate: '', expirationDate: '', status: 'valid' }); setCertModalOpen(true); }} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher..." className="pl-9" value={certsSearch} onChange={(e) => { setCertsSearch(e.target.value); setCertsPage(1); }} />
        </div>
        <Select value={certsStatusFilter} onValueChange={(v) => { setCertsStatusFilter(v === 'all' ? '' : v); setCertsPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="valid">Valide</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
            <SelectItem value="revoked">Révoqué</SelectItem>
          </SelectContent>
        </Select>
        <Select value={certsTypeFilter} onValueChange={(v) => { setCertsTypeFilter(v === 'all' ? '' : v); setCertsPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="attestation">Attestation</SelectItem>
            <SelectItem value="diplome">Diplôme</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {certsLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{certsTotal} certification(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Programme</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucune certification</TableCell></TableRow>
                ) : certifications.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{c.certificateNo}</TableCell>
                    <TableCell className="font-medium">{c.fullName}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-600">{c.programName}</TableCell>
                    <TableCell className="hidden lg:table-cell"><Badge variant="outline" className="capitalize">{c.type}</Badge></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(c.expirationDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCert(c); setCertForm({ certificateNo: c.certificateNo, type: c.type, fullName: c.fullName, programName: c.programName, level: c.level, issuedDate: c.issuedDate ? c.issuedDate.slice(0, 10) : '', expirationDate: c.expirationDate ? c.expirationDate.slice(0, 10) : '', status: c.status }); setCertModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteCert(c.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={certsPage} pages={certsPages} onPageChange={setCertsPage} />
        </>
      )}

      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCert ? 'Modifier la certification' : 'Nouvelle certification'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>N° Certificat *</Label>
                <Input value={certForm.certificateNo} onChange={(e) => setCertForm({ ...certForm, certificateNo: e.target.value })} placeholder="CERT-001" className="uppercase" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={certForm.type} onValueChange={(v) => setCertForm({ ...certForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attestation">Attestation</SelectItem>
                    <SelectItem value="diplome">Diplôme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Nom complet *</Label>
              <Input value={certForm.fullName} onChange={(e) => setCertForm({ ...certForm, fullName: e.target.value })} />
            </div>
            <div>
              <Label>Programme *</Label>
              <Input value={certForm.programName} onChange={(e) => setCertForm({ ...certForm, programName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Niveau</Label>
                <Select value={certForm.level} onValueChange={(v) => setCertForm({ ...certForm, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technicien">Technicien</SelectItem>
                    <SelectItem value="specialise">Spécialisé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={certForm.status} onValueChange={(v) => setCertForm({ ...certForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid">Valide</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                    <SelectItem value="revoked">Révoqué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date d'émission</Label>
                <Input type="date" value={certForm.issuedDate} onChange={(e) => setCertForm({ ...certForm, issuedDate: e.target.value })} />
              </div>
              <div>
                <Label>Date d'expiration</Label>
                <Input type="date" value={certForm.expirationDate} onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCertSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingCert ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- FORMATIONS -----
  const handleFormationSubmit = async () => {
    if (!formationForm.title || !formationForm.shortDescription) {
      toast.error('Titre et description requis');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formationForm,
        objectives: formationForm.objectives ? formationForm.objectives.split('\n').filter(Boolean) : [],
        program: formationForm.program ? formationForm.program.split('\n').filter(Boolean) : [],
        price: formationForm.price ? parseFloat(formationForm.price) : null,
        prerequisites: formationForm.prerequisites || null,
      };
      if (editingFormation) {
        await api(`/api/admin/formations/${editingFormation.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Formation mise à jour');
      } else {
        await api('/api/admin/formations', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Formation créée');
      }
      setFormationModalOpen(false);
      setEditingFormation(null);
      setFormationForm({ title: '', slug: '', shortDescription: '', fullDescription: '', level: 'technicien', duration: '', prerequisites: '', objectives: '', program: '', price: '', mode: 'presentiel', coverImage: '', featured: false, order: 0 });
      fetchFormations();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteFormation = async (id: string) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try {
      await api(`/api/admin/formations/${id}`, { method: 'DELETE' });
      toast.success('Formation supprimée');
      fetchFormations();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderFormations = () => (
    <div>
      <SectionHeader title="Formations" onAdd={() => { setEditingFormation(null); setFormationForm({ title: '', slug: '', shortDescription: '', fullDescription: '', level: 'technicien', duration: '', prerequisites: '', objectives: '', program: '', price: '', mode: 'presentiel', coverImage: '', featured: false, order: 0 }); setFormationModalOpen(true); }} />

      {formationsLoading ? <LoadingSkeleton /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden md:table-cell">Niveau</TableHead>
                <TableHead className="hidden md:table-cell">Durée</TableHead>
                <TableHead className="hidden lg:table-cell">Mode</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formations.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Aucune formation</TableCell></TableRow>
              ) : formations.map((f: any) => (
                <TableRow key={f.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{f.level}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-600">{f.duration}</TableCell>
                  <TableCell className="hidden lg:table-cell capitalize">{f.mode}</TableCell>
                  <TableCell className="text-sm">{f.price ? `${f.price} MAD` : 'Gratuit'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditingFormation(f);
                        setFormationForm({
                          title: f.title, slug: f.slug || '', shortDescription: f.shortDescription, fullDescription: f.fullDescription || '',
                          level: f.level, duration: f.duration || '', prerequisites: f.prerequisites || '',
                          objectives: Array.isArray(f.objectives) ? (typeof f.objectives === 'string' ? JSON.parse(f.objectives) : f.objectives).join('\n') : '',
                          program: Array.isArray(f.program) ? (typeof f.program === 'string' ? JSON.parse(f.program) : f.program).join('\n') : '',
                          price: f.price ? String(f.price) : '', mode: f.mode || 'presentiel', coverImage: f.coverImage || '', featured: f.featured || false, order: f.order || 0,
                        });
                        setFormationModalOpen(true);
                      }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteFormation(f.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={formationModalOpen} onOpenChange={setFormationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Titre *</Label>
                <Input value={formationForm.title} onChange={(e) => setFormationForm({ ...formationForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={formationForm.slug} onChange={(e) => setFormationForm({ ...formationForm, slug: e.target.value })} placeholder="auto-généré" />
              </div>
            </div>
            <div>
              <Label>Courte description *</Label>
              <Textarea value={formationForm.shortDescription} onChange={(e) => setFormationForm({ ...formationForm, shortDescription: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Description complète</Label>
              <Textarea value={formationForm.fullDescription} onChange={(e) => setFormationForm({ ...formationForm, fullDescription: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Niveau</Label>
                <Select value={formationForm.level} onValueChange={(v) => setFormationForm({ ...formationForm, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technicien">Technicien</SelectItem>
                    <SelectItem value="specialise">Spécialisé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mode</Label>
                <Select value={formationForm.mode} onValueChange={(v) => setFormationForm({ ...formationForm, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                    <SelectItem value="en-ligne">En ligne</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Durée</Label>
                <Input value={formationForm.duration} onChange={(e) => setFormationForm({ ...formationForm, duration: e.target.value })} placeholder="ex: 3 jours, 40h..." />
              </div>
              <div>
                <Label>Prix (MAD)</Label>
                <Input value={formationForm.price} onChange={(e) => setFormationForm({ ...formationForm, price: e.target.value })} placeholder="Laisser vide pour gratuit" />
              </div>
            </div>
            <div>
              <Label>Prérequis</Label>
              <Textarea value={formationForm.prerequisites} onChange={(e) => setFormationForm({ ...formationForm, prerequisites: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Objectifs (un par ligne)</Label>
              <Textarea value={formationForm.objectives} onChange={(e) => setFormationForm({ ...formationForm, objectives: e.target.value })} rows={3} placeholder="Objectif 1&#10;Objectif 2" />
            </div>
            <div>
              <Label>Programme (un par ligne)</Label>
              <Textarea value={formationForm.program} onChange={(e) => setFormationForm({ ...formationForm, program: e.target.value })} rows={3} placeholder="Module 1&#10;Module 2" />
            </div>
            <div>
              <Label>Image de couverture (URL)</Label>
              <Input value={formationForm.coverImage} onChange={(e) => setFormationForm({ ...formationForm, coverImage: e.target.value })} />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input type="number" value={formationForm.order} onChange={(e) => setFormationForm({ ...formationForm, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formationForm.featured} onCheckedChange={(v) => setFormationForm({ ...formationForm, featured: v })} />
              <Label>Formation à la une</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormationModalOpen(false)}>Annuler</Button>
            <Button onClick={handleFormationSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingFormation ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- CATEGORIES -----
  const handleCatSubmit = async () => {
    if (!catForm.name) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      if (editingCat) {
        await api(`/api/admin/categories/${editingCat.id}`, { method: 'PUT', body: JSON.stringify(catForm) });
        toast.success('Catégorie mise à jour');
      } else {
        await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(catForm) });
        toast.success('Catégorie créée');
      }
      setCatModalOpen(false);
      setEditingCat(null);
      setCatForm({ name: '', description: '', color: '#059669', order: 0 });
      fetchCategoriesList();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteCat = async (id: string) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await api(`/api/admin/categories/${id}`, { method: 'DELETE' });
      toast.success('Catégorie supprimée');
      fetchCategoriesList();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderCategories = () => (
    <div>
      <SectionHeader title="Catégories" onAdd={() => { setEditingCat(null); setCatForm({ name: '', description: '', color: '#059669', order: 0 }); setCatModalOpen(true); }} />

      {catsLoading ? <LoadingSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-8">Aucune catégorie</p>
          ) : categoriesList.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">{c._count?.articles || 0} articles</Badge>
                </div>
                {c.description && <p className="text-sm text-slate-500 mt-2">{c.description}</p>}
                <div className="flex items-center justify-end gap-1 mt-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCat(c); setCatForm({ name: c.name, description: c.description || '', color: c.color, order: c.order || 0 }); setCatModalOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteCat(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom *</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Couleur</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="h-9 w-12 rounded border cursor-pointer" />
                  <Input value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCatSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingCat ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- PAGES -----
  const handlePageSubmit = async () => {
    if (!pageForm.title) { toast.error('Titre requis'); return; }
    setSaving(true);
    try {
      if (editingPage) {
        await api(`/api/admin/pages/${editingPage.id}`, { method: 'PUT', body: JSON.stringify(pageForm) });
        toast.success('Page mise à jour');
      } else {
        await api('/api/admin/pages', { method: 'POST', body: JSON.stringify(pageForm) });
        toast.success('Page créée');
      }
      setPageModalOpen(false);
      setEditingPage(null);
      setPageForm({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', published: true, showInMenu: false, order: 0 });
      fetchPages();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!window.confirm('Supprimer cette page ?')) return;
    try {
      await api(`/api/admin/pages/${id}`, { method: 'DELETE' });
      toast.success('Page supprimée');
      fetchPages();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderPages = () => (
    <div>
      <SectionHeader title="Pages" onAdd={() => { setEditingPage(null); setPageForm({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', published: true, showInMenu: false, order: 0 }); setPageModalOpen(true); }} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher..." className="pl-9" value={pagesSearch} onChange={(e) => { setPagesSearch(e.target.value); setPagesPage(1); }} />
        </div>
        <Select value={pagesPubFilter} onValueChange={(v) => { setPagesPubFilter(v === 'all' ? '' : v); setPagesPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="true">Publiée</SelectItem>
            <SelectItem value="false">Brouillon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pagesLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{pagesTotal} page(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Menu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Aucune page</TableCell></TableRow>
                ) : pages.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500 font-mono">/{p.slug}</TableCell>
                    <TableCell><StatusBadge status={p.published ? 'published' : 'draft'} /></TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {p.showInMenu ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Oui</Badge> : <Badge variant="outline" className="bg-slate-50 text-slate-500">Non</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPage(p); setPageForm({ title: p.title, slug: p.slug, content: p.content || '', metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', published: p.published, showInMenu: p.showInMenu, order: p.order || 0 }); setPageModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deletePage(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={pagesPage} pages={pagesPagination} onPageChange={setPagesPage} />
        </>
      )}

      <Dialog open={pageModalOpen} onOpenChange={setPageModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Modifier la page' : 'Nouvelle page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Titre *</Label>
                <Input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} placeholder="auto-généré" />
              </div>
            </div>
            <div>
              <Label>Contenu (Markdown)</Label>
              <Textarea value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} rows={12} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Meta titre</Label>
              <Input value={pageForm.metaTitle} onChange={(e) => setPageForm({ ...pageForm, metaTitle: e.target.value })} />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea value={pageForm.metaDescription} onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={pageForm.order} onChange={(e) => setPageForm({ ...pageForm, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={pageForm.published} onCheckedChange={(v) => setPageForm({ ...pageForm, published: v })} />
                  <Label>Publié</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={pageForm.showInMenu} onCheckedChange={(v) => setPageForm({ ...pageForm, showInMenu: v })} />
                  <Label>Menu</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageModalOpen(false)}>Annuler</Button>
            <Button onClick={handlePageSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingPage ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- MENUS -----
  const handleMenuSubmit = async () => {
    if (!menuForm.label) { toast.error('Label requis'); return; }
    setSaving(true);
    try {
      const payload = {
        ...menuForm,
        parentId: menuForm.parentId || null,
        page: menuForm.page || null,
        url: menuForm.url || null,
        icon: menuForm.icon || null,
      };
      if (editingMenu) {
        await api(`/api/admin/menus/${editingMenu.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Menu mis à jour');
      } else {
        await api('/api/admin/menus', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Menu créé');
      }
      setMenuModalOpen(false);
      setEditingMenu(null);
      setMenuForm({ label: '', page: '', url: '', parentId: '', order: 0, icon: '', target: '_self', visible: true });
      fetchMenus();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteMenu = async (id: string) => {
    if (!window.confirm('Supprimer cet élément de menu ?')) return;
    try {
      await api(`/api/admin/menus/${id}`, { method: 'DELETE' });
      toast.success('Menu supprimé');
      fetchMenus();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderMenuTree = (items: any[], level: number = 0) => items.map((item: any) => (
    <React.Fragment key={item.id}>
      <div className={`flex items-center gap-3 py-2.5 px-3 ${level > 0 ? 'ml-6 border-l-2 border-slate-200 pl-4' : ''} hover:bg-slate-50 rounded transition-colors`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="font-medium text-slate-800 truncate">{item.label}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {item.page ? `Page: ${item.page}` : item.url ? `URL: ${item.url}` : 'Sans lien'}
            {item.target !== '_self' && ` (${item.target})`}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {item.visible ? <Eye className="h-3.5 w-3.5 text-slate-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-300" />}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            setEditingMenu(item);
            setMenuForm({ label: item.label, page: item.page || '', url: item.url || '', parentId: item.parentId || '', order: item.order || 0, icon: item.icon || '', target: item.target || '_self', visible: item.visible !== false });
            setMenuModalOpen(true);
          }}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => deleteMenu(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      {item.children && item.children.length > 0 && renderMenuTree(item.children, level + 1)}
    </React.Fragment>
  ));

  const renderMenus = () => (
    <div>
      <SectionHeader title="Menus" onAdd={() => { setEditingMenu(null); setMenuForm({ label: '', page: '', url: '', parentId: '', order: 0, icon: '', target: '_self', visible: true }); setMenuModalOpen(true); }} />

      {menusLoading ? <LoadingSkeleton /> : (
        <Card>
          <CardContent className="p-2">
            {menus.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Aucun élément de menu</p>
            ) : (
              renderMenuTree(menus)
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Modifier le menu' : 'Nouvel élément de menu'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Label *</Label>
              <Input value={menuForm.label} onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Page (slug)</Label>
                <Input value={menuForm.page} onChange={(e) => setMenuForm({ ...menuForm, page: e.target.value })} placeholder="ex: a-propos" />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={menuForm.url} onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Parent</Label>
                <Select value={menuForm.parentId} onValueChange={(v) => setMenuForm({ ...menuForm, parentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun (racine)</SelectItem>
                    {menus.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cible</Label>
                <Select value={menuForm.target} onValueChange={(v) => setMenuForm({ ...menuForm, target: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Même onglet</SelectItem>
                    <SelectItem value="_blank">Nouvel onglet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Icône (emoji)</Label>
                <Input value={menuForm.icon} onChange={(e) => setMenuForm({ ...menuForm, icon: e.target.value })} placeholder="🎯" />
              </div>
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={menuForm.order} onChange={(e) => setMenuForm({ ...menuForm, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={menuForm.visible} onCheckedChange={(v) => setMenuForm({ ...menuForm, visible: v })} />
              <Label>Visible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuModalOpen(false)}>Annuler</Button>
            <Button onClick={handleMenuSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingMenu ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ----- COMMENTS -----
  const updateCommentStatus = async (id: string, status: string) => {
    try {
      await api(`/api/admin/comments/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success(`Commentaire ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'rejeté' : 'mis en attente'}`);
      fetchComments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await api(`/api/admin/comments/${id}`, { method: 'DELETE' });
      toast.success('Commentaire supprimé');
      fetchComments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderComments = () => (
    <div>
      <SectionHeader title="Commentaires" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={commentsStatusFilter} onValueChange={(v) => { setCommentsStatusFilter(v === 'all' ? '' : v); setCommentsPage(1); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {commentsLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{commentsTotal} commentaire(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead className="hidden md:table-cell">Article</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Aucun commentaire</TableCell></TableRow>
                ) : comments.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{c.user?.name || 'Anonyme'}</p>
                        <p className="text-xs text-slate-400">{c.user?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-600 max-w-[150px] truncate">{c.article?.title || ''}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-slate-600 truncate">{c.content}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {c.status !== 'approved' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => updateCommentStatus(c.id, 'approved')} title="Approuver"><Check className="h-4 w-4" /></Button>
                        )}
                        {c.status !== 'rejected' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700" onClick={() => updateCommentStatus(c.id, 'rejected')} title="Rejeter"><X className="h-4 w-4" /></Button>
                        )}
                        {c.status !== 'pending' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateCommentStatus(c.id, 'pending')} title="En attente"><Clock className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteComment(c.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={commentsPage} pages={commentsPages} onPageChange={setCommentsPage} />
        </>
      )}
    </div>
  );

  // ----- NEWSLETTER -----
  const deleteSubscribers = async () => {
    if (selectedNl.length === 0) { toast.error('Sélectionnez au moins un abonné'); return; }
    if (!window.confirm(`Supprimer ${selectedNl.length} abonné(s) ?`)) return;
    try {
      await api('/api/admin/newsletter', { method: 'DELETE', body: JSON.stringify({ ids: selectedNl }) });
      toast.success(`${selectedNl.length} abonné(s) supprimé(s)`);
      setSelectedNl([]);
      fetchNewsletter();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderNewsletter = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Newsletter</h2>
        {selectedNl.length > 0 && (
          <Button variant="destructive" size="sm" onClick={deleteSubscribers}>
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer ({selectedNl.length})
          </Button>
        )}
      </div>

      {nlLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{nlTotal} abonné(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedNl.length === subscribers.length && subscribers.length > 0}
                      onCheckedChange={(v) => setSelectedNl(v ? subscribers.map((s: any) => s.id) : [])}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Date d'inscription</TableHead>
                  <TableHead className="hidden md:table-cell">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">Aucun abonné</TableCell></TableRow>
                ) : subscribers.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedNl.includes(s.id)}
                        onCheckedChange={(v) => {
                          if (v) setSelectedNl([...selectedNl, s.id]);
                          else setSelectedNl(selectedNl.filter((id) => id !== s.id));
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{s.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(s.createdAt)}</TableCell>
                    <TableCell className="hidden md:table-cell"><StatusBadge status={s.active ? 'active' : 'draft'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={nlPage} pages={nlPages} onPageChange={setNlPage} />
        </>
      )}
    </div>
  );

  // ----- MESSAGES -----
  const markMessagesRead = async (ids: string[], read: boolean) => {
    try {
      await api('/api/admin/contacts', { method: 'PUT', body: JSON.stringify({ ids, read }) });
      toast.success(read ? 'Marqué(s) comme lu(s)' : 'Marqué(s) comme non lu(s)');
      fetchMessages();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const deleteMessages = async (ids: string[]) => {
    if (!window.confirm(`Supprimer ${ids.length} message(s) ?`)) return;
    try {
      await api('/api/admin/contacts', { method: 'DELETE', body: JSON.stringify({ ids }) });
      toast.success(`${ids.length} message(s) supprimé(s)`);
      fetchMessages();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderMessages = () => (
    <div>
      <SectionHeader title="Messages" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={msgUnreadFilter} onValueChange={(v) => { setMsgUnreadFilter(v === 'all' ? '' : v); setMsgPage(1); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Non lus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {msgLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{msgTotal} message(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="hidden lg:table-cell">Message</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucun message</TableCell></TableRow>
                ) : messages.map((m: any) => (
                  <TableRow key={m.id} className={`hover:bg-slate-50 ${!m.read ? 'bg-amber-50/50' : ''}`}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-600">{m.email}</TableCell>
                    <TableCell className="text-sm">{m.subject}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-slate-500 max-w-[200px] truncate">{m.message}</TableCell>
                    <TableCell>
                      {!m.read ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">Non lu</Badge> : <Badge className="bg-slate-100 text-slate-500">Lu</Badge>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDateTime(m.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!m.read && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markMessagesRead([m.id], true)} title="Marquer comme lu"><Eye className="h-4 w-4" /></Button>
                        )}
                        {m.read && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markMessagesRead([m.id], false)} title="Marquer comme non lu"><EyeOff className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteMessages([m.id])}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={msgPage} pages={msgPages} onPageChange={setMsgPage} />
        </>
      )}
    </div>
  );

  // ----- USERS -----
  const updateUserRole = async (id: string, role: string) => {
    try {
      await api('/api/admin/users', { method: 'PUT', body: JSON.stringify({ id, role }) });
      toast.success('Rôle mis à jour');
      fetchUsers();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderUsers = () => (
    <div>
      <SectionHeader title="Utilisateurs" />

      {usersLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{usersTotal} utilisateur(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="hidden sm:table-cell">Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Aucun utilisateur</TableCell></TableRow>
                ) : users.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-600">{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v) => updateUserRole(u.id, v)}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Éditeur</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={usersPage} pages={usersPages} onPageChange={setUsersPage} />
        </>
      )}
    </div>
  );

  // ----- TESTIMONIALS -----
  const handleTestiSubmit = async () => {
    if (!testiForm.name || !testiForm.content) { toast.error('Nom et contenu requis'); return; }
    setSaving(true);
    try {
      if (editingTesti) {
        await api(`/api/admin/testimonials/${editingTesti.id}`, { method: 'PUT', body: JSON.stringify(testiForm) });
        toast.success('Témoignage mis à jour');
      } else {
        await api('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(testiForm) });
        toast.success('Témoignage créé');
      }
      setTestiModalOpen(false);
      setEditingTesti(null);
      setTestiForm({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, featured: false });
      fetchTestimonials();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteTesti = async (id: string) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return;
    try {
      await api(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      toast.success('Témoignage supprimé');
      fetchTestimonials();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderTestimonials = () => (
    <div>
      <SectionHeader title="Témoignages" onAdd={() => { setEditingTesti(null); setTestiForm({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, featured: false }); setTestiModalOpen(true); }} />

      {testimonialsLoading ? <LoadingSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-8">Aucun témoignage</p>
          ) : testimonials.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {t.avatar ? <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">{t.name.charAt(0)}</div>}
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                      {t.role && <p className="text-xs text-slate-500">{t.role}{t.company ? ` · ${t.company}` : ''}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.featured && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">À la une</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">"{t.content}"</p>
                <div className="flex items-center justify-end gap-1 mt-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTesti(t); setTestiForm({ name: t.name, role: t.role || '', company: t.company || '', content: t.content, avatar: t.avatar || '', rating: t.rating || 5, featured: t.featured || false }); setTestiModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteTesti(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={testiModalOpen} onOpenChange={setTestiModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTesti ? 'Modifier le témoignage' : 'Nouveau témoignage'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nom *</Label>
                <Input value={testiForm.name} onChange={(e) => setTestiForm({ ...testiForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Rôle / Poste</Label>
                <Input value={testiForm.role} onChange={(e) => setTestiForm({ ...testiForm, role: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Entreprise</Label>
              <Input value={testiForm.company} onChange={(e) => setTestiForm({ ...testiForm, company: e.target.value })} />
            </div>
            <div>
              <Label>Témoignage *</Label>
              <Textarea value={testiForm.content} onChange={(e) => setTestiForm({ ...testiForm, content: e.target.value })} rows={4} />
            </div>
            <div>
              <Label>Avatar (URL)</Label>
              <Input value={testiForm.avatar} onChange={(e) => setTestiForm({ ...testiForm, avatar: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Note</Label>
                <Select value={String(testiForm.rating)} onValueChange={(v) => setTestiForm({ ...testiForm, rating: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={testiForm.featured} onCheckedChange={(v) => setTestiForm({ ...testiForm, featured: v })} />
                <Label>À la une</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestiModalOpen(false)}>Annuler</Button>
            <Button onClick={handleTestiSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Enregistrement...' : editingTesti ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ============================================================
  // SECTION ROUTER
  // ============================================================

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return renderDashboard();
      case 'articles': return renderArticles();
      case 'certifications': return renderCertifications();
      case 'formations': return renderFormations();
      case 'categories': return renderCategories();
      case 'pages': return renderPages();
      case 'menus': return renderMenus();
      case 'comments': return renderComments();
      case 'newsletter': return renderNewsletter();
      case 'contacts': return renderMessages();
      case 'users': return renderUsers();
      case 'testimonials': return renderTestimonials();
      default: return null;
    }
  };

  // ============================================================
  // SIDEBAR CONTENT
  // ============================================================

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {user?.role || 'admin'}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => changeSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </nav>

      <Separator className="bg-slate-700/50" />

      {/* Bottom actions */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Retour au site</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
          style={{ position: 'relative', marginTop: '-20px', alignSelf: 'center' }}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-700">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile header */}
          <div className="lg:hidden mb-6 flex items-center gap-3 pl-10">
            <h1 className="text-lg font-bold text-slate-800">Administration</h1>
          </div>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}