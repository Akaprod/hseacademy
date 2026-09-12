'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, Award, GraduationCap, FolderOpen, File,
  Menu, MessageSquare, Mail, Users, Star, Shield, ChevronLeft, ChevronRight, ChevronDown,
  Plus, Pencil, Trash2, Search, Eye, EyeOff, Check, X, Clock,
  TrendingUp, BarChart3, LogOut, ArrowLeft, Lock, CreditCard, FileCheck,
  Settings, Save, Scale, Globe, Wallet,
  Archive, ArchiveRestore, ExternalLink,
  BarChart2, MapPin, Link2, RefreshCw,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssistantAdminSection } from '@/components/assistant-admin-section';

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

type Section = 'dashboard' | 'articles' | 'certifications' | 'formationsDiplomantes' | 'formationsCertifiantes' | 'categories' | 'pages' | 'menus' | 'comments' | 'newsletter' | 'contacts' | 'users' | 'userDetail' | 'testimonials' | 'payments' | 'legal' | 'paymentSettings' | 'siteProfile' | 'stats' | 'assistant';

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

function SectionHeader({ title, subtitle, onAdd }: { title: string; subtitle?: string; onAdd?: () => void }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
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

  // Formations — split Diplômantes / Certifiantes
  const [diplomantes, setDiplomantes] = useState<any[]>([]);
  const [certifiantes, setCertifiantes] = useState<any[]>([]);
  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [formationForm, setFormationForm] = useState({
    // Common
    title: '', slug: '', shortDescription: '', fullDescription: '', level: 'technicien',
    duration: '', durationHours: '', prerequisites: '', objectives: '', program: '',
    price: '', priceIndividual: '', priceGroup: '', priceEnterprise: '',
    mode: 'presentiel', type: 'diplomante' as 'diplomante' | 'certifiante',
    coverImage: '', featured: false, order: 0, archived: false,
    // SEO
    seoTitle: '', seoDescription: '', seoKeywords: '', seoImage: '',
    seoSlug: '', seoRobots: 'index,follow', seoCanonical: '',
    seoOgTitle: '', seoOgDescription: '', seoOgImage: '',
    // Diplômantes-specific
    careerOutcomes: '', degreeType: '',
    // Certifiantes-specific
    certificateValidity: '', certificatePrefix: '',
    mandatoryPrerequisites: '', targetAudience: '', certifyingBody: '',
  });
  const [formationTab, setFormationTab] = useState<'general' | 'specific' | 'seo'>('general');
  const [diplomantesLoading, setDiplomantesLoading] = useState(false);
  const [certifiantesLoading, setCertifiantesLoading] = useState(false);

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
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', primaryKeyword: '', keywords: '', excerpt: '', coverImage: '', faqJson: '', published: true, showInMenu: false, order: 0 });
  const [pagesLoading, setPagesLoading] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [seoPreviewPage, setSeoPreviewPage] = useState<any | null>(null);

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
  const [usersSearch, setUsersSearch] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [payStatusFilter, setPayStatusFilter] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  // User detail
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailTab, setUserDetailTab] = useState<'info' | 'wallet' | 'formations' | 'payments'>('info');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // Testimonials
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testiModalOpen, setTestiModalOpen] = useState(false);
  const [editingTesti, setEditingTesti] = useState<any>(null);
  const [testiForm, setTestiForm] = useState({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, featured: false });
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // Legal Settings
  const [legalForm, setLegalForm] = useState({
    legalName: '', commercialName: '', representative: '',
    address: '', city: '', country: '', phone: '', email: '', website: '',
    ice: '', rc: '', if: '',
    authorizationRef: '', authorityName: '',
    cndpReceipt: '',
    refundPolicy: '', privacyPolicy: '', termsOfService: '',
  });
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalSaving, setLegalSaving] = useState(false);

  // Payment Settings
  const [paymentForm, setPaymentForm] = useState({
    attestationPrintPrice: 190,
    currency: 'MAD',
    paypalEnabled: true,
    paypalEmail: '',
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    bankTransferEnabled: true,
    bankName: '',
    bankAccountName: '',
    bankIban: '',
    bankSwift: '',
    bankNotes: '',
    walletEnabled: false,
    whatsappNumber: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  // ===== Site Profile =====
  const [siteProfileForm, setSiteProfileForm] = useState({
    siteName: '', siteLogo: '', siteDescription: '', siteKeywords: '', siteUrl: '',
    gscVerification: '',
    facebook: '', twitter: '', linkedin: '', instagram: '', youtube: '',
  });
  const [siteProfileLoading, setSiteProfileLoading] = useState(false);
  const [siteProfileSaving, setSiteProfileSaving] = useState(false);
  const [sitemapInfo, setSitemapInfo] = useState<{ sitemapUrl: string | null; sitemapUpdatedAt: string | null; urlCount?: number; pingResult?: string } | null>(null);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);

  // ===== Stats =====
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'year' | 'all'>('30d');

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
    { id: 'formationsDiplomantes', label: 'Formations Diplômantes', icon: GraduationCap },
    { id: 'formationsCertifiantes', label: 'Formations Certifiantes', icon: Shield },
    { id: 'categories', label: 'Catégories', icon: FolderOpen },
    { id: 'pages', label: 'Pages', icon: File },
    { id: 'menus', label: 'Menus', icon: Menu },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'contacts', label: 'Messages', icon: Mail },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'testimonials', label: 'Témoignages', icon: Star },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'legal', label: 'Informations Légales', icon: Scale },
    { id: 'paymentSettings', label: 'Paramètres Paiement', icon: Wallet },
    { id: 'siteProfile', label: 'Profil du Site', icon: Settings },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    { id: 'assistant', label: 'Assistant IA', icon: Sparkles },
  ];

  // ============================================================
  // DÉFENSE EN PROFONDEUR — vérifier au mount que l'user est bien admin côté serveur
  // (au cas où page.tsx aurait été contourné)
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!data.user || data.user.role !== 'admin') {
          onNavigate('home');
        }
      } catch {
        if (!cancelled) onNavigate('home');
      }
    })();
    return () => { cancelled = true; };
  }, [onNavigate]);

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

  // Formations — fetcher accepts type ('diplomante' or 'certifiante')
  const fetchFormations = useCallback(async (type: 'diplomante' | 'certifiante') => {
    if (type === 'diplomante') setDiplomantesLoading(true);
    else setCertifiantesLoading(true);
    try {
      // archived=all → return both active and archived for admin to manage
      const data = await api(`/api/admin/formations?type=${type}&archived=all`);
      const list = data.formations || [];
      if (type === 'diplomante') setDiplomantes(list);
      else setCertifiantes(list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      if (type === 'diplomante') setDiplomantesLoading(false);
      else setCertifiantesLoading(false);
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
      setPagesPagination(data.totalPages || 1);
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
      if (usersSearch) params.set('search', usersSearch);
      const data = await api(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
      setUsersPages(data.pages || 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setUsersLoading(false);
    }
  }, [api, usersPage, usersSearch]);

  // Fetch user detail
  const fetchUserDetail = useCallback(async (id: string) => {
    setUserDetailLoading(true);
    try {
      const data = await api(`/api/admin/users/${id}`);
      setUserDetail(data);
      setNewUsername(data.profile?.username || '');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setUserDetailLoading(false);
    }
  }, [api]);

  // Update user status
  const updateUserStatus = async (id: string, status: string) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(status === 'active' ? 'Compte activé' : status === 'disabled' ? 'Compte désactivé' : 'Compte bloqué');
      fetchUserDetail(id);
      fetchUsers();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // Reset password
  const resetPassword = async (id: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mot de passe minimum 6 caractères');
      return;
    }
    setSavingUser(true);
    try {
      await api(`/api/admin/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password: newPassword }) });
      toast.success('Mot de passe réinitialisé');
      setNewPassword('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSavingUser(false);
    }
  };

  // Change username
  const changeUsername = async (id: string) => {
    if (!newUsername || newUsername.length < 5) {
      toast.error('Username minimum 5 caractères');
      return;
    }
    setSavingUser(true);
    try {
      await api(`/api/admin/users/${id}/username`, { method: 'PATCH', body: JSON.stringify({ username: newUsername }) });
      toast.success('Username modifié');
      fetchUserDetail(id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSavingUser(false);
    }
  };


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
      case 'formationsDiplomantes': fetchFormations('diplomante'); break;
      case 'formationsCertifiantes': fetchFormations('certifiante'); break;
      case 'categories': fetchCategoriesList(); break;
      case 'pages': fetchPages(); break;
      case 'menus': fetchMenus(); break;
      case 'comments': fetchComments(); break;
      case 'newsletter': fetchNewsletter(); break;
      case 'contacts': fetchMessages(); break;
      case 'users': fetchUsers(); break;
      case 'testimonials': fetchTestimonials(); break;
      case 'legal': fetchLegalSettings(); break;
      case 'paymentSettings': fetchPaymentSettings(); break;
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

  // ----- FORMATIONS (Diplômantes + Certifiantes) -----
  // Helper: parse array field from DB (objectives, program, careerOutcomes, mandatoryPrerequisites)
  const parseArrayField = (val: unknown): string => {
    if (!val) return '';
    if (Array.isArray(val)) return val.join('\n');
    if (typeof val === 'string') {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p.join('\n') : ''; } catch { return ''; }
    }
    return '';
  };

  // Default empty form — used on "Create new"
  const resetFormationForm = (type: 'diplomante' | 'certifiante') => setFormationForm({
    title: '', slug: '', shortDescription: '', fullDescription: '',
    level: type === 'diplomante' ? 'technicien' : 'sauvetage',
    duration: '', durationHours: '', prerequisites: '', objectives: '', program: '',
    price: '', priceIndividual: '', priceGroup: '', priceEnterprise: '',
    mode: 'presentiel', type,
    coverImage: '', featured: false, order: 0, archived: false,
    seoTitle: '', seoDescription: '', seoKeywords: '', seoImage: '',
    seoSlug: '', seoRobots: 'index,follow', seoCanonical: '',
    seoOgTitle: '', seoOgDescription: '', seoOgImage: '',
    careerOutcomes: '', degreeType: '',
    certificateValidity: '', certificatePrefix: '',
    mandatoryPrerequisites: '', targetAudience: '', certifyingBody: '',
  });

  // Open dialog for CREATE
  const openCreateFormation = (type: 'diplomante' | 'certifiante') => {
    setEditingFormation(null);
    resetFormationForm(type);
    setFormationTab('general');
    setFormationModalOpen(true);
  };

  // Open dialog for EDIT — hydrate form from existing row
  const openEditFormation = (f: any) => {
    setEditingFormation(f);
    setFormationForm({
      title: f.title || '', slug: f.slug || '', shortDescription: f.shortDescription || '',
      fullDescription: f.fullDescription || '',
      level: f.level || (f.type === 'certifiante' ? 'sauvetage' : 'technicien'),
      duration: f.duration || '', durationHours: f.durationHours || '',
      prerequisites: f.prerequisites || '',
      objectives: parseArrayField(f.objectives),
      program: parseArrayField(f.program),
      price: f.price ? String(f.price) : '',
      priceIndividual: f.priceIndividual || '',
      priceGroup: f.priceGroup || '',
      priceEnterprise: f.priceEnterprise || '',
      mode: f.mode || 'presentiel',
      type: (f.type === 'certifiante') ? 'certifiante' : 'diplomante',
      coverImage: f.coverImage || '', featured: f.featured || false,
      order: f.order || 0, archived: f.archived || false,
      seoTitle: f.seoTitle || '', seoDescription: f.seoDescription || '',
      seoKeywords: f.seoKeywords || '', seoImage: f.seoImage || '',
      seoSlug: f.seoSlug || '', seoRobots: f.seoRobots || 'index,follow',
      seoCanonical: f.seoCanonical || '',
      seoOgTitle: f.seoOgTitle || '', seoOgDescription: f.seoOgDescription || '',
      seoOgImage: f.seoOgImage || '',
      careerOutcomes: parseArrayField(f.careerOutcomes),
      degreeType: f.degreeType || '',
      certificateValidity: f.certificateValidity || '',
      certificatePrefix: f.certificatePrefix || '',
      mandatoryPrerequisites: parseArrayField(f.mandatoryPrerequisites),
      targetAudience: f.targetAudience || '', certifyingBody: f.certifyingBody || '',
    });
    setFormationTab('general');
    setFormationModalOpen(true);
  };

  const handleFormationSubmit = async () => {
    if (!formationForm.title || !formationForm.shortDescription) {
      toast.error('Titre et description requis');
      return;
    }
    setSaving(true);
    try {
      // Build payload — string arrays before send
      const payload = {
        ...formationForm,
        objectives: formationForm.objectives ? formationForm.objectives.split('\n').filter(Boolean) : [],
        program: formationForm.program ? formationForm.program.split('\n').filter(Boolean) : [],
        careerOutcomes: formationForm.careerOutcomes ? formationForm.careerOutcomes.split('\n').filter(Boolean) : [],
        mandatoryPrerequisites: formationForm.mandatoryPrerequisites ? formationForm.mandatoryPrerequisites.split('\n').filter(Boolean) : [],
        price: formationForm.price ? parseFloat(formationForm.price) : null,
        prerequisites: formationForm.prerequisites || null,
        durationHours: formationForm.durationHours || null,
        priceIndividual: formationForm.priceIndividual || null,
        priceGroup: formationForm.priceGroup || null,
        priceEnterprise: formationForm.priceEnterprise || null,
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
      resetFormationForm(formationForm.type);
      fetchFormations(formationForm.type);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const deleteFormation = async (id: string, type: 'diplomante' | 'certifiante') => {
    if (!window.confirm('Supprimer définitivement cette formation ? Cette action est irréversible.')) return;
    try {
      await api(`/api/admin/formations/${id}`, { method: 'DELETE' });
      toast.success('Formation supprimée');
      fetchFormations(type);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const archiveFormation = async (id: string, type: 'diplomante' | 'certifiante') => {
    try {
      await api(`/api/admin/formations/${id}/archive`, { method: 'POST' });
      toast.success('Formation archivée');
      fetchFormations(type);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const unarchiveFormation = async (id: string, type: 'diplomante' | 'certifiante') => {
    try {
      await api(`/api/admin/formations/${id}/unarchive`, { method: 'POST' });
      toast.success('Formation restaurée');
      fetchFormations(type);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // Render row action buttons — shared between both lists
  const renderFormationActions = (f: any, type: 'diplomante' | 'certifiante') => (
    <div className="flex items-center justify-end gap-1">
      {/* Voir page SEO */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-500 hover:text-blue-700"
        title="Voir la page SEO"
        onClick={() => window.open(`/f/${f.seoSlug || f.slug}`, '_blank')}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      {/* Éditer */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Modifier"
        onClick={() => openEditFormation(f)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {/* Archiver / Désarchiver */}
      {f.archived ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-emerald-500 hover:text-emerald-700"
          title="Désarchiver (rendre visible)"
          onClick={() => unarchiveFormation(f.id, type)}
        >
          <ArchiveRestore className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-500 hover:text-amber-700"
          title="Archiver (masquer sans supprimer)"
          onClick={() => archiveFormation(f.id, type)}
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
      {/* Supprimer (hard delete) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-700"
        title="Supprimer définitivement"
        onClick={() => deleteFormation(f.id, type)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  // Level labels for the table rows
  const levelLabels: Record<string, string> = {
    'diplome-qualifie': 'Diplôme Qualifié',
    'technicien': 'Technicien',
    'technicien-superieur': 'Technicien Sup.',
    'licence': 'Licence Pro',
    'master': 'Master',
    'vae': 'VAE',
    'sauvetage': 'Sauvetage',
    'habilitation': 'Habilitation',
    'prevention': 'Prévention',
    'management': 'Management',
  };

  const modeLabels: Record<string, string> = {
    'presentiel': 'Présentiel',
    'distance': 'À distance',
    'hybride': 'Hybride',
  };

  // ----- renderFormationsDiplomantes -----
  const renderFormationsDiplomantes = () => (
    <div>
      <SectionHeader
        title="Formations Diplômantes"
        subtitle="Formations diplômantes QHSE (6 niveaux)"
        onAdd={() => openCreateFormation('diplomante')}
      />

      {diplomantesLoading ? <LoadingSkeleton /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden md:table-cell">Niveau</TableHead>
                <TableHead className="hidden md:table-cell">Mode</TableHead>
                <TableHead className="hidden md:table-cell">Durée</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="hidden lg:table-cell">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diplomantes.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucune formation diplômante</TableCell></TableRow>
              ) : diplomantes.map((f: any) => (
                <TableRow key={f.id} className={f.archived ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'}>
                  <TableCell className="font-medium">
                    {f.title}
                    {f.featured && <Star className="inline-block h-3 w-3 ml-1 text-amber-500" />}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{levelLabels[f.level] || f.level}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{modeLabels[f.mode] || f.mode}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-600">{f.duration}</TableCell>
                  <TableCell className="text-sm">{f.price ? `${f.price} MAD` : 'Sur demande'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {f.archived ? (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Archivée</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{renderFormationActions(f, 'diplomante')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {renderFormationDialog()}
    </div>
  );

  // ----- renderFormationsCertifiantes -----
  const renderFormationsCertifiantes = () => (
    <div>
      <SectionHeader
        title="Formations Certifiantes"
        subtitle="Formations courtes certifiantes (Sauvetage, Habilitation, Prévention, Management)"
        onAdd={() => openCreateFormation('certifiante')}
      />

      {certifiantesLoading ? <LoadingSkeleton /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="hidden lg:table-cell">Mode</TableHead>
                <TableHead className="hidden md:table-cell">Durée</TableHead>
                <TableHead className="hidden lg:table-cell">Indiv.</TableHead>
                <TableHead className="hidden lg:table-cell">Groupe</TableHead>
                <TableHead className="hidden lg:table-cell">Entreprise</TableHead>
                <TableHead className="hidden xl:table-cell">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifiantes.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">Aucune formation certifiante</TableCell></TableRow>
              ) : certifiantes.map((f: any) => (
                <TableRow key={f.id} className={f.archived ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'}>
                  <TableCell className="font-medium">
                    {f.title}
                    {f.featured && <Star className="inline-block h-3 w-3 ml-1 text-amber-500" />}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{levelLabels[f.level] || f.level}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{modeLabels[f.mode] || f.mode}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-600">{f.duration}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{f.priceIndividual || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{f.priceGroup || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{f.priceEnterprise || '-'}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {f.archived ? (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Archivée</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{renderFormationActions(f, 'certifiante')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {renderFormationDialog()}
    </div>
  );

  // ----- Shared Dialog (Tabs: Général / Spécifique / SEO) -----
  const renderFormationDialog = () => (
    <Dialog open={formationModalOpen} onOpenChange={setFormationModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingFormation
              ? `Modifier la formation ${formationForm.type === 'certifiante' ? 'certifiante' : 'diplomante'}`
              : `Nouvelle formation ${formationForm.type === 'certifiante' ? 'certifiante' : 'diplomante'}`}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={formationTab} onValueChange={(v) => setFormationTab(v as 'general' | 'specific' | 'seo')}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="specific">Spécifique</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* ----- Général ----- */}
          <TabsContent value="general" className="space-y-3 mt-4">
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
                <Label>{formationForm.type === 'certifiante' ? 'Catégorie' : 'Niveau'}</Label>
                {formationForm.type === 'certifiante' ? (
                  <Select value={formationForm.level} onValueChange={(v) => setFormationForm({ ...formationForm, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sauvetage">Sauvetage & Incendie</SelectItem>
                      <SelectItem value="habilitation">Habilitations & CACES</SelectItem>
                      <SelectItem value="prevention">Prévention des Risques</SelectItem>
                      <SelectItem value="management">Management & Instances</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={formationForm.level} onValueChange={(v) => setFormationForm({ ...formationForm, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diplome-qualifie">Diplôme Qualifié QHSE</SelectItem>
                      <SelectItem value="technicien">Technicien QHSE</SelectItem>
                      <SelectItem value="technicien-superieur">Technicien Supérieur QHSE</SelectItem>
                      <SelectItem value="licence">Licence Professionnelle QHSE</SelectItem>
                      <SelectItem value="master">Master Professionnel QHSE</SelectItem>
                      <SelectItem value="vae">VAE Expertise QHSE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label>Mode</Label>
                <Select value={formationForm.mode} onValueChange={(v) => setFormationForm({ ...formationForm, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                    <SelectItem value="distance">À distance</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Durée</Label>
                <Input value={formationForm.duration} onChange={(e) => setFormationForm({ ...formationForm, duration: e.target.value })} placeholder="ex: 2 ans, 3 jours, 40h..." />
              </div>
              {formationForm.type === 'certifiante' && (
                <div>
                  <Label>Durée en heures (optionnel)</Label>
                  <Input value={formationForm.durationHours} onChange={(e) => setFormationForm({ ...formationForm, durationHours: e.target.value })} placeholder="ex: 40h" />
                </div>
              )}
            </div>
            {/* Prix : unique pour diplomante, 3 tarifs pour certifiante */}
            {formationForm.type === 'certifiante' ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Prix Individuel (MAD)</Label>
                  <Input value={formationForm.priceIndividual} onChange={(e) => setFormationForm({ ...formationForm, priceIndividual: e.target.value })} />
                </div>
                <div>
                  <Label>Prix Groupe (MAD)</Label>
                  <Input value={formationForm.priceGroup} onChange={(e) => setFormationForm({ ...formationForm, priceGroup: e.target.value })} />
                </div>
                <div>
                  <Label>Prix Entreprise (MAD)</Label>
                  <Input value={formationForm.priceEnterprise} onChange={(e) => setFormationForm({ ...formationForm, priceEnterprise: e.target.value })} />
                </div>
              </div>
            ) : (
              <div>
                <Label>Prix (MAD) — laisser vide si "Sur demande"</Label>
                <Input value={formationForm.price} onChange={(e) => setFormationForm({ ...formationForm, price: e.target.value })} placeholder="ex: 5000" />
              </div>
            )}
            <div>
              <Label>Prérequis</Label>
              <Textarea value={formationForm.prerequisites} onChange={(e) => setFormationForm({ ...formationForm, prerequisites: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Objectifs (un par ligne)</Label>
              <Textarea value={formationForm.objectives} onChange={(e) => setFormationForm({ ...formationForm, objectives: e.target.value })} rows={3} placeholder="Objectif 1&#10;Objectif 2" />
            </div>
            <div>
              <Label>Programme (un par ligne — préfixer "  - " pour sous-item)</Label>
              <Textarea value={formationForm.program} onChange={(e) => setFormationForm({ ...formationForm, program: e.target.value })} rows={5} placeholder="Année 1 : Fondamentaux&#10;  - Semestre 1 : ..." />
            </div>
            <div>
              <Label>Image de couverture (URL)</Label>
              <Input value={formationForm.coverImage} onChange={(e) => setFormationForm({ ...formationForm, coverImage: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={formationForm.order} onChange={(e) => setFormationForm({ ...formationForm, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formationForm.featured} onCheckedChange={(v) => setFormationForm({ ...formationForm, featured: v })} />
                  <Label>À la une</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formationForm.archived} onCheckedChange={(v) => setFormationForm({ ...formationForm, archived: v })} />
                  <Label>Archivée</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ----- Spécifique ----- */}
          <TabsContent value="specific" className="space-y-3 mt-4">
            {formationForm.type === 'diplomante' ? (
              <>
                <div>
                  <Label>Type de diplôme délivré</Label>
                  <Select
                    value={formationForm.degreeType || ''}
                    onValueChange={(v) => setFormationForm({ ...formationForm, degreeType: v === '_custom' ? formationForm.degreeType : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diplôme d'État">Diplôme d'État</SelectItem>
                      <SelectItem value="Titre RNCP">Titre RNCP</SelectItem>
                      <SelectItem value="Certification professionnelle">Certification professionnelle</SelectItem>
                      <SelectItem value="Attestation de formation">Attestation de formation</SelectItem>
                      <SelectItem value="Diplôme d'établissement">Diplôme d'établissement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Débouchés professionnels (métiers accessibles — un par ligne)</Label>
                  <Textarea
                    value={formationForm.careerOutcomes}
                    onChange={(e) => setFormationForm({ ...formationForm, careerOutcomes: e.target.value })}
                    rows={5}
                    placeholder="Technicien QHSE&#10;Chargé de sécurité&#10;Animateur QHSE"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Validité du certificat</Label>
                    <Input
                      value={formationForm.certificateValidity}
                      onChange={(e) => setFormationForm({ ...formationForm, certificateValidity: e.target.value })}
                      placeholder="ex: 24 mois, 36 mois..."
                    />
                  </div>
                  <div>
                    <Label>Préfixe du certificat</Label>
                    <Input
                      value={formationForm.certificatePrefix}
                      onChange={(e) => setFormationForm({ ...formationForm, certificatePrefix: e.target.value })}
                      placeholder="ex: SST-2025-"
                    />
                  </div>
                </div>
                <div>
                  <Label>Organisme certificateur</Label>
                  <Input
                    value={formationForm.certifyingBody}
                    onChange={(e) => setFormationForm({ ...formationForm, certifyingBody: e.target.value })}
                    placeholder="ex: CNAPS, CRAMIF, IICP..."
                  />
                </div>
                <div>
                  <Label>Public cible</Label>
                  <Textarea
                    value={formationForm.targetAudience}
                    onChange={(e) => setFormationForm({ ...formationForm, targetAudience: e.target.value })}
                    rows={3}
                    placeholder="Tous salariés, électriciens, chefs d'équipe..."
                  />
                </div>
                <div>
                  <Label>Prérequis obligatoires (un par ligne)</Label>
                  <Textarea
                    value={formationForm.mandatoryPrerequisites}
                    onChange={(e) => setFormationForm({ ...formationForm, mandatoryPrerequisites: e.target.value })}
                    rows={3}
                    placeholder="Aptitude médicale&#10;Avoir 18 ans révolus"
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* ----- SEO ----- */}
          <TabsContent value="seo" className="space-y-3 mt-4">
            <div>
              <Label>Titre SEO ({(formationForm.seoTitle || '').length}/60)</Label>
              <Input
                value={formationForm.seoTitle}
                onChange={(e) => setFormationForm({ ...formationForm, seoTitle: e.target.value })}
                maxLength={70}
                placeholder="Si vide, utilise le titre de la formation"
              />
              <p className="text-xs text-slate-500 mt-1">Affiché dans l'onglet navigateur et les résultats Google.</p>
            </div>
            <div>
              <Label>Méta description ({(formationForm.seoDescription || '').length}/160)</Label>
              <Textarea
                value={formationForm.seoDescription}
                onChange={(e) => setFormationForm({ ...formationForm, seoDescription: e.target.value })}
                rows={2}
                maxLength={170}
                placeholder="Si vide, utilise la courte description"
              />
              <p className="text-xs text-slate-500 mt-1">Description courte affichée dans les résultats de recherche.</p>
            </div>
            <div>
              <Label>Mots-clés (séparés par des virgules)</Label>
              <Input
                value={formationForm.seoKeywords}
                onChange={(e) => setFormationForm({ ...formationForm, seoKeywords: e.target.value })}
                placeholder="QHSE, formation, ISO 9001, ..."
              />
            </div>
            <div>
              <Label>Slug SEO (URL personnalisée)</Label>
              <Input
                value={formationForm.seoSlug}
                onChange={(e) => setFormationForm({ ...formationForm, seoSlug: e.target.value })}
                placeholder="ex: master-qhse-maroc (si vide, utilise le slug principal)"
              />
              <p className="text-xs text-slate-500 mt-1">
                URL publique : <span className="text-emerald-700 font-mono">/f/{formationForm.seoSlug || formationForm.slug || '...'}</span>
              </p>
            </div>
            <div>
              <Label>Image SEO (URL)</Label>
              <Input
                value={formationForm.seoImage}
                onChange={(e) => setFormationForm({ ...formationForm, seoImage: e.target.value })}
                placeholder="URL d'une image pour le SEO"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Robots</Label>
                <Select value={formationForm.seoRobots} onValueChange={(v) => setFormationForm({ ...formationForm, seoRobots: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index,follow (par défaut)</SelectItem>
                    <SelectItem value="noindex,follow">noindex,follow</SelectItem>
                    <SelectItem value="index,nofollow">index,nofollow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex,nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Canonical (URL absolue, optionnel)</Label>
                <Input
                  value={formationForm.seoCanonical}
                  onChange={(e) => setFormationForm({ ...formationForm, seoCanonical: e.target.value })}
                  placeholder="https://hseacademy.online/f/..."
                />
              </div>
            </div>
            <Separator />
            <div>
              <Label>OG Title (partage réseaux sociaux)</Label>
              <Input
                value={formationForm.seoOgTitle}
                onChange={(e) => setFormationForm({ ...formationForm, seoOgTitle: e.target.value })}
                placeholder="Si vide, utilise le titre SEO"
              />
            </div>
            <div>
              <Label>OG Description</Label>
              <Textarea
                value={formationForm.seoOgDescription}
                onChange={(e) => setFormationForm({ ...formationForm, seoOgDescription: e.target.value })}
                rows={2}
                placeholder="Si vide, utilise la méta description"
              />
            </div>
            <div>
              <Label>OG Image (URL)</Label>
              <Input
                value={formationForm.seoOgImage}
                onChange={(e) => setFormationForm({ ...formationForm, seoOgImage: e.target.value })}
                placeholder="Si vide, utilise l'image SEO"
              />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setFormationModalOpen(false)}>Annuler</Button>
          <Button onClick={handleFormationSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Enregistrement...' : editingFormation ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      setPageForm({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', primaryKeyword: '', keywords: '', excerpt: '', coverImage: '', faqJson: '', published: true, showInMenu: false, order: 0 });
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
      <SectionHeader title="Pages" subtitle="Pages SEO de la base de connaissances HSE / QHSE" onAdd={() => { setEditingPage(null); setPageForm({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', primaryKeyword: '', keywords: '', excerpt: '', coverImage: '', faqJson: '', published: true, showInMenu: false, order: 0 }); setPageModalOpen(true); }} />

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
          <div className="text-sm text-slate-500 mb-2">{pagesTotal} page(s) · cliquez sur une ligne pour déplier la fiche SEO</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead className="hidden lg:table-cell">Mot-clé principal</TableHead>
                  <TableHead className="hidden xl:table-cell">Title SEO</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Menu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">Aucune page — créez votre première page SEO</TableCell></TableRow>
                ) : pages.map((p: any) => {
                  const seoComplete = !!(p.metaTitle && p.metaDescription && p.primaryKeyword && p.keywords);
                  const seoPartial = !seoComplete && !!(p.metaTitle || p.metaDescription || p.primaryKeyword || p.keywords);
                  const isExpanded = expandedPage === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <TableRow className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedPage(isExpanded ? null : p.id)}>
                        <TableCell className="text-slate-400">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-slate-500 font-mono">/pages/{p.slug}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {p.primaryKeyword ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{p.primaryKeyword}</Badge> : <span className="text-slate-400">—</span>}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-slate-600 max-w-xs truncate" title={p.metaTitle || ''}>{p.metaTitle || <span className="text-slate-400">—</span>}</TableCell>
                        <TableCell>
                          {seoComplete ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Complet</Badge>
                           : seoPartial ? <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Partiel</Badge>
                           : <Badge variant="outline" className="bg-slate-50 text-slate-500">Vide</Badge>}
                        </TableCell>
                        <TableCell><StatusBadge status={p.published ? 'published' : 'draft'} /></TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {p.showInMenu ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Oui</Badge> : <Badge variant="outline" className="bg-slate-50 text-slate-500">Non</Badge>}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Aperçu SEO" onClick={() => setSeoPreviewPage(p)}><Eye className="h-4 w-4" /></Button>
                            <a href={`/pages/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100" title="Voir sur le site"><Globe className="h-4 w-4" /></a>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPage(p); setPageForm({ title: p.title, slug: p.slug, content: p.content || '', metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', primaryKeyword: p.primaryKeyword || '', keywords: p.keywords || '', excerpt: p.excerpt || '', coverImage: p.coverImage || '', faqJson: p.faqJson || '', published: p.published, showInMenu: p.showInMenu, order: p.order || 0 }); setPageModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deletePage(p.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-slate-50/60">
                          <TableCell colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">URL publique</div>
                                  <code className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">/pages/{p.slug}</code>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Mot-clé principal</div>
                                  <div className="text-slate-700">{p.primaryKeyword || <span className="text-slate-400">Non défini</span>}</div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Mots-clés secondaires</div>
                                  <div className="flex flex-wrap gap-1">
                                    {(p.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean).length === 0
                                      ? <span className="text-slate-400">Non définis</span>
                                      : (p.keywords || '').split(',').map((k: string, i: number) => (
                                        <Badge key={i} variant="outline" className="bg-white text-slate-600 border-slate-200">{k.trim()}</Badge>
                                      ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Extrait (résumé)</div>
                                  <div className="text-slate-600">{p.excerpt || <span className="text-slate-400">Non défini</span>}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Title SEO (balise &lt;title&gt;)</div>
                                  <div className="text-slate-800 font-medium">{p.metaTitle || <span className="text-slate-400">Non défini</span>}</div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Meta description</div>
                                  <div className="text-slate-600">{p.metaDescription || <span className="text-slate-400">Non définie</span>}</div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Aperçu Google (SERP)</div>
                                  <div className="bg-white border border-slate-200 rounded p-3">
                                    <div className="text-xs text-emerald-700 truncate">https://iicp.ma/pages/{p.slug}</div>
                                    <div className="text-base text-blue-700 font-medium leading-tight mt-0.5 line-clamp-1">{p.metaTitle || p.title}</div>
                                    <div className="text-sm text-slate-600 line-clamp-2 mt-0.5">{p.metaDescription || p.excerpt || '—'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={pagesPage} pages={pagesPagination} onPageChange={setPagesPage} />
        </>
      )}

      <Dialog open={pageModalOpen} onOpenChange={setPageModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Modifier la page' : 'Nouvelle page SEO'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Titre *</Label>
                <Input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} />
                <p className="text-xs text-slate-500 mt-1">Titre interne affiché dans la liste admin.</p>
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} placeholder="auto-généré à partir du titre" />
                <p className="text-xs text-slate-500 mt-1">URL publique : /pages/<span className="font-mono">{pageForm.slug || '…'}</span></p>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="text-xs font-semibold uppercase text-emerald-700 mb-2">Référencement (SEO)</div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Mot-clé principal</Label>
                    <Input value={pageForm.primaryKeyword} onChange={(e) => setPageForm({ ...pageForm, primaryKeyword: e.target.value })} placeholder="ex : travail en hauteur" />
                    <p className="text-xs text-slate-500 mt-1">L'intention de recherche principale ciblée par la page.</p>
                  </div>
                  <div>
                    <Label>Mots-clés secondaires</Label>
                    <Input value={pageForm.keywords} onChange={(e) => setPageForm({ ...pageForm, keywords: e.target.value })} placeholder="ex : prévention, échafaudage, harnais" />
                    <p className="text-xs text-slate-500 mt-1">Séparés par des virgules.</p>
                  </div>
                </div>
                <div>
                  <Label>Title SEO (balise &lt;title&gt;)</Label>
                  <Input value={pageForm.metaTitle} onChange={(e) => setPageForm({ ...pageForm, metaTitle: e.target.value })} placeholder="55–60 caractères max" maxLength={70} />
                  <p className="text-xs text-slate-500 mt-1">{(pageForm.metaTitle || '').length} caractères — Google affiche environ 60 caractères.</p>
                </div>
                <div>
                  <Label>Meta description</Label>
                  <Textarea value={pageForm.metaDescription} onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })} rows={2} placeholder="150–160 caractères max" maxLength={180} />
                  <p className="text-xs text-slate-500 mt-1">{(pageForm.metaDescription || '').length} caractères — Google affiche environ 160 caractères.</p>
                </div>
                <div>
                  <Label>Extrait (résumé court)</Label>
                  <Textarea value={pageForm.excerpt} onChange={(e) => setPageForm({ ...pageForm, excerpt: e.target.value })} rows={2} placeholder="Résumé affiché dans la liste des pages et en Open Graph si pas de meta description." />
                </div>
                <div>
                  <Label>Image de couverture (URL)</Label>
                  <Input value={pageForm.coverImage} onChange={(e) => setPageForm({ ...pageForm, coverImage: e.target.value })} placeholder="https://… (image illustrative liée au sujet)" />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <Label>Contenu (Markdown)</Label>
              <Textarea value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} rows={12} className="font-mono text-sm" placeholder="Un seul H1, puis des H2/H3 pour structurer la page. Liens internes en markdown : [texte](/pages/slug)" />
              <p className="text-xs text-slate-500 mt-1">Structure recommandée : 1 H1, plusieurs H2 (Définition, Enjeux, Prévention, Réglementation, FAQ), liens internes vers d'autres pages SEO.</p>
            </div>

            <div className="border-t pt-3">
              <Label>FAQ (JSON) — optionnel</Label>
              <Textarea value={pageForm.faqJson} onChange={(e) => setPageForm({ ...pageForm, faqJson: e.target.value })} rows={4} className="font-mono text-sm" placeholder='[{"q":"Question ?","a":"Réponse courte et fiable."}]' />
              <p className="text-xs text-slate-500 mt-1">Format JSON : tableau de <code>{'{q:"…", a:"…"}'}</code>. Permet le schema.org FAQPage (rich snippets).</p>
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

      <Dialog open={!!seoPreviewPage} onOpenChange={(o) => !o && setSeoPreviewPage(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Aperçu SEO — {seoPreviewPage?.title}</DialogTitle>
          </DialogHeader>
          {seoPreviewPage && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Aperçu Google (SERP)</div>
                <div className="bg-white border border-slate-200 rounded p-3">
                  <div className="text-xs text-emerald-700 truncate">https://iicp.ma/pages/{seoPreviewPage.slug}</div>
                  <div className="text-base text-blue-700 font-medium leading-tight mt-0.5">{seoPreviewPage.metaTitle || seoPreviewPage.title}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{seoPreviewPage.metaDescription || seoPreviewPage.excerpt || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400">URL publique</div>
                  <code className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">/pages/{seoPreviewPage.slug}</code>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400">Mot-clé principal</div>
                  <div>{seoPreviewPage.primaryKeyword || <span className="text-slate-400">—</span>}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Mots-clés secondaires</div>
                <div className="flex flex-wrap gap-1">
                  {(seoPreviewPage.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean).length === 0
                    ? <span className="text-slate-400">—</span>
                    : (seoPreviewPage.keywords || '').split(',').map((k: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-white text-slate-600 border-slate-200">{k.trim()}</Badge>
                    ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Title SEO</div>
                <div className="text-slate-800 font-medium">{seoPreviewPage.metaTitle || <span className="text-slate-400">—</span>}</div>
                <p className="text-xs text-slate-500 mt-0.5">{(seoPreviewPage.metaTitle || '').length} caractères</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Meta description</div>
                <div className="text-slate-600">{seoPreviewPage.metaDescription || <span className="text-slate-400">—</span>}</div>
                <p className="text-xs text-slate-500 mt-0.5">{(seoPreviewPage.metaDescription || '').length} caractères</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Extrait</div>
                <div className="text-slate-600">{seoPreviewPage.excerpt || <span className="text-slate-400">—</span>}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeoPreviewPage(null)}>Fermer</Button>
            <a href={`/pages/${seoPreviewPage?.slug}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Voir sur le site</Button>
            </a>
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

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (payStatusFilter) params.set('status', payStatusFilter);
      const data = await api(`/api/admin/payments?${params}`);
      setPayments(data.payments || []);
      setPaymentsTotal(data.total || 0);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setPaymentsLoading(false);
    }
  }, [api, payStatusFilter]);

  useEffect(() => { if (section === 'payments') fetchPayments(); }, [section, fetchPayments]);

  // ============================================================
  // LEGAL SETTINGS — Informations juridiques administrables
  // ============================================================

  const fetchLegalSettings = useCallback(async () => {
    setLegalLoading(true);
    try {
      const data = await api('/api/admin/legal-settings');
      const s = data.settings || {};
      setLegalForm({
        legalName: s.legalName || '',
        commercialName: s.commercialName || '',
        representative: s.representative || '',
        address: s.address || '',
        city: s.city || '',
        country: s.country || '',
        phone: s.phone || '',
        email: s.email || '',
        website: s.website || '',
        ice: s.ice || '',
        rc: s.rc || '',
        if: s.if || '',
        authorizationRef: s.authorizationRef || '',
        authorityName: s.authorityName || '',
        cndpReceipt: s.cndpReceipt || '',
        refundPolicy: s.refundPolicy || '',
        privacyPolicy: s.privacyPolicy || '',
        termsOfService: s.termsOfService || '',
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLegalLoading(false);
    }
  }, [api]);

  useEffect(() => { if (section === 'legal') fetchLegalSettings(); }, [section, fetchLegalSettings]);

  const saveLegalSettings = async () => {
    setLegalSaving(true);
    try {
      await api('/api/admin/legal-settings', {
        method: 'PUT',
        body: JSON.stringify(legalForm),
      });
      toast.success('Informations légales enregistrées');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLegalSaving(false);
    }
  };

  // ============================================================
  // PAYMENT SETTINGS — Paramètres de paiement administrables
  // ============================================================

  const fetchPaymentSettings = useCallback(async () => {
    setPaymentLoading(true);
    try {
      const data = await api('/api/admin/payment-settings');
      const s = data.settings || {};
      setPaymentForm({
        attestationPrintPrice: s.attestationPrintPrice ?? 190,
        currency: s.currency || 'MAD',
        paypalEnabled: s.paypalEnabled ?? true,
        paypalEmail: s.paypalEmail || '',
        stripeEnabled: s.stripeEnabled ?? false,
        stripePublicKey: s.stripePublicKey || '',
        stripeSecretKey: s.stripeSecretKey || '',
        bankTransferEnabled: s.bankTransferEnabled ?? true,
        bankName: s.bankName || '',
        bankAccountName: s.bankAccountName || '',
        bankIban: s.bankIban || '',
        bankSwift: s.bankSwift || '',
        bankNotes: s.bankNotes || '',
        walletEnabled: s.walletEnabled ?? false,
        whatsappNumber: s.whatsappNumber || '',
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setPaymentLoading(false);
    }
  }, [api]);

  useEffect(() => { if (section === 'paymentSettings') fetchPaymentSettings(); }, [section, fetchPaymentSettings]);

  // ===== Site Profile fetcher + sitemap generator =====
  const fetchSiteProfile = useCallback(async () => {
    setSiteProfileLoading(true);
    try {
      const data = await api('/api/admin/site-profile');
      const p = data.profile || {};
      setSiteProfileForm({
        siteName: p.siteName || '',
        siteLogo: p.siteLogo || '',
        siteDescription: p.siteDescription || '',
        siteKeywords: p.siteKeywords || '',
        siteUrl: p.siteUrl || 'https://hseacademy.online',
        gscVerification: p.gscVerification || '',
        facebook: p.facebook || '',
        twitter: p.twitter || '',
        linkedin: p.linkedin || '',
        instagram: p.instagram || '',
        youtube: p.youtube || '',
      });
      if (p.sitemapUrl || p.sitemapUpdatedAt) {
        setSitemapInfo({
          sitemapUrl: p.sitemapUrl || null,
          sitemapUpdatedAt: p.sitemapUpdatedAt || null,
        });
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSiteProfileLoading(false);
    }
  }, [api]);

  useEffect(() => { if (section === 'siteProfile') fetchSiteProfile(); }, [section, fetchSiteProfile]);

  const saveSiteProfile = async () => {
    setSiteProfileSaving(true);
    try {
      await api('/api/admin/site-profile', {
        method: 'PUT',
        body: JSON.stringify(siteProfileForm),
      });
      toast.success('Profil du site enregistré');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSiteProfileSaving(false);
    }
  };

  const generateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const data = await api('/api/admin/sitemap/generate', { method: 'POST' });
      toast.success(`Sitemap généré (${data.counts.total} URLs) — Google: ${data.pingGoogle === 'ok' ? 'pingé' : 'non pingé'}`);
      setSitemapInfo({
        sitemapUrl: data.sitemapUrl,
        sitemapUpdatedAt: data.generatedAt,
        urlCount: data.counts.total,
        pingResult: data.pingGoogle,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur génération sitemap');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  // ===== Stats fetcher =====
  const fetchStats = useCallback(async (period: 'today' | '7d' | '30d' | '90d' | 'year' | 'all') => {
    setStatsLoading(true);
    try {
      const data = await api(`/api/admin/visit-stats?period=${period}`);
      setStatsData(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setStatsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (section === 'stats') fetchStats(statsPeriod);
  }, [section, statsPeriod, fetchStats]);

  const savePaymentSettings = async () => {
    setPaymentSaving(true);
    try {
      await api('/api/admin/payment-settings', {
        method: 'PUT',
        body: JSON.stringify(paymentForm),
      });
      toast.success('Paramètres de paiement enregistrés');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setPaymentSaving(false);
    }
  };

  const validatePayment = async (id: string, type: string) => {
    try {
      if (type === 'wallet') {
        await api(`/api/admin/payments/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'validate', type: 'wallet' }) });
      } else if (type === 'payment_request') {
        await api('/api/admin/payment-requests', { method: 'PATCH', body: JSON.stringify({ id, action: 'validate' }) });
      } else {
        await api(`/api/admin/payments/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'validate', type }) });
      }
      toast.success('Paiement validé');
      fetchPayments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const rejectPayment = async (id: string, type: string) => {
    const reason = window.prompt('Motif du refus ?');
    if (!reason) return;
    try {
      if (type === 'payment_request') {
        await api('/api/admin/payment-requests', { method: 'PATCH', body: JSON.stringify({ id, action: 'reject', rejectionReason: reason }) });
      } else {
        await api(`/api/admin/payments/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'reject', type, rejectionReason: reason }) });
      }
      toast.success('Paiement refusé');
      fetchPayments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const archivePayment = async (id: string, type: string) => {
    try {
      await api(`/api/admin/payments/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'archive', type }) });
      toast.success('Paiement archivé');
      fetchPayments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const renderPayments = () => (
    <div>
      <SectionHeader title="Paiements" />
      {paymentsLoading ? <LoadingSkeleton /> : (
        <>
          {/* Filtres statut */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={payStatusFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPayStatusFilter('')}
              className={payStatusFilter === '' ? 'bg-emerald-600 text-white' : ''}
            >Tous</Button>
            <Button
              variant={payStatusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPayStatusFilter('pending')}
              className={payStatusFilter === 'pending' ? 'bg-amber-500 text-white' : ''}
            >En attente</Button>
            <Button
              variant={payStatusFilter === 'validated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPayStatusFilter('validated')}
              className={payStatusFilter === 'validated' ? 'bg-emerald-600 text-white' : ''}
            >Validés</Button>
            <Button
              variant={payStatusFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPayStatusFilter('rejected')}
              className={payStatusFilter === 'rejected' ? 'bg-red-500 text-white' : ''}
            >Refusés</Button>
            <Button
              variant={payStatusFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPayStatusFilter('archived')}
              className={payStatusFilter === 'archived' ? 'bg-slate-600 text-white' : ''}
            >Archivés</Button>
          </div>

          <div className="text-sm text-slate-500 mb-2">{paymentsTotal} paiement(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucun paiement</TableCell></TableRow>
                ) : payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.user?.name || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{p.type === 'course' ? 'Cours' : p.type === 'attestation' ? 'Impression' : p.type === 'wallet' ? 'Rechargement Wallet' : p.type === 'payment_request' ? 'Demande Client' : p.type}</TableCell>
                    <TableCell className="text-sm">{p.amount} MAD</TableCell>
                    <TableCell className="text-sm">{p.method === 'bank_transfer' ? 'Virement' : p.method === 'paypal' ? 'PayPal' : p.method === 'wallet' ? 'Wallet' : p.method}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        p.status === 'validated' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        p.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'archived' ? 'bg-slate-200 text-slate-600' :
                        p.status === 'expired' ? 'bg-slate-200 text-slate-500' :
                        'bg-amber-100 text-amber-800'
                      }>{p.status === 'validated' ? 'Validé' : p.status === 'rejected' ? 'Refusé' : p.status === 'submitted' ? 'Preuve soumise' : p.status === 'archived' ? 'Archivé' : p.status === 'expired' ? 'Expiré' : 'En attente'}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Détails */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500"
                          onClick={() => {
                            const details = [
                              `Utilisateur: ${p.user?.name || '—'}`,
                              `Email: ${p.user?.email || '—'}`,
                              `Type: ${p.type === 'course' ? 'Cours' : p.type === 'attestation' ? 'Impression' : p.type === 'wallet' ? 'Rechargement Wallet' : p.type === 'payment_request' ? 'Demande Client' : p.type}`,
                              `Montant: ${p.amount} MAD`,
                              `Méthode: ${p.method === 'bank_transfer' ? 'Virement' : p.method === 'paypal' ? 'PayPal' : 'Wallet'}`,
                              `Statut: ${p.status === 'validated' ? 'Validé' : p.status === 'rejected' ? 'Refusé' : p.status === 'submitted' ? 'Preuve soumise' : p.status === 'archived' ? 'Archivé' : 'En attente'}`,
                              `Date: ${formatDate(p.createdAt)}`,
                              p.enrollment?.course?.title ? `Formation: ${p.enrollment.course.title}` : '',
                              p.description ? `\nPreuve: ${p.description}` : '',
                              p.proofPath ? `\n📎 Preuve fichier disponible (cliquer sur l'icône FileCheck)'` : '',
                            ].filter(Boolean).join('\n');
                            alert(details);
                          }}
                          title="Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Voir la preuve (fichier) */}
                        {p.proofPath && p.type !== 'payment_request' && (
                          <a href={`/api/admin/payments/${p.id}/proof?type=${p.type}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Voir la preuve">
                              <FileCheck className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {/* Voir la preuve (PaymentRequest — fichier ou texte) */}
                        {p.proofPath && p.type === 'payment_request' && (
                          <a href={`/api/admin/payment-requests/${p.id}/proof`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Voir la preuve">
                              <FileCheck className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {/* Valider — affiché pour submitted (preuve soumise) ET pending (sans preuve) */}
                        {/* Pour payment_request : seulement submitted (avec preuve) */}
                        {((p.status === 'pending' || p.status === 'submitted') && p.type !== 'payment_request') ||
                         (p.status === 'submitted' && p.type === 'payment_request') ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500" onClick={() => validatePayment(p.id, p.type)} title="Valider">
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {/* Refuser — mêmes conditions que valider */}
                        {((p.status === 'pending' || p.status === 'submitted') && p.type !== 'payment_request') ||
                         (p.status === 'submitted' && p.type === 'payment_request') ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => rejectPayment(p.id, p.type)} title="Refuser">
                            <X className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {/* Archiver — affiché pour validated et rejected */}
                        {(p.status === 'validated' || p.status === 'rejected') && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => archivePayment(p.id, p.type)} title="Archiver">
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div>
      <SectionHeader title="Utilisateurs" />

      {/* Recherche */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={usersSearch}
          onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
          className="max-w-xs"
          onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
        />
        <Button onClick={() => { setUsersPage(1); fetchUsers(); }} variant="outline">Rechercher</Button>
      </div>

      {usersLoading ? <LoadingSkeleton /> : (
        <>
          <div className="text-sm text-slate-500 mb-2">{usersTotal} utilisateur(s)</div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => { setSelectedUserId(null); }}>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="hidden md:table-cell">Wallet</TableHead>
                  <TableHead className="hidden sm:table-cell">Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucun utilisateur</TableCell></TableRow>
                ) : users.map((u: any) => {
                  const isRoot = !!u.isRoot;
                  return (
                  <TableRow key={u.id} className="hover:bg-emerald-50 cursor-pointer" onClick={() => { setSelectedUserId(u.id); fetchUserDetail(u.id); changeSection('userDetail'); }}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span>{u.name}</span>
                        {isRoot && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title="Compte ROOT">
                            <Shield className="h-3 w-3" /> ROOT
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-600">{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'disabled' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {u.status === 'active' ? 'Actif' : u.status === 'disabled' ? 'Désactivé' : 'Bloqué'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isRoot ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 italic px-2 py-1">
                          <Lock className="h-3 w-3" /> {u.role}
                        </span>
                      ) : (
                        <Select value={u.role} onValueChange={(v) => updateUserRole(u.id, v)} onClick={(e) => e.stopPropagation()}>
                          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Éditeur</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-medium text-emerald-700">
                      {(u.walletBalance || 0).toFixed(0)} MAD
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {isRoot ? (
                        <span className="inline-flex items-center justify-center h-8 w-8 text-slate-300">
                          <Lock className="h-4 w-4" />
                        </span>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          <SimplePagination page={usersPage} pages={usersPages} onPageChange={setUsersPage} />
        </>
      )}
    </div>
  );

  // ----- USER DETAIL PAGE -----
  const renderUserDetail = () => {
    if (userDetailLoading || !userDetail) {
      return (
        <div>
          <Button variant="ghost" onClick={() => { setSelectedUserId(null); changeSection('users'); }} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la liste
          </Button>
          {userDetailLoading ? <LoadingSkeleton /> : <p className="text-slate-400">Aucune donnée</p>}
        </div>
      );
    }

    const u = userDetail.user;
    const profile = userDetail.profile;
    const wallet = userDetail.wallet;
    const enrollments = userDetail.enrollments || [];
    const attestations = userDetail.attestations || [];
    const coursePayments = userDetail.coursePayments || [];
    const paymentRequests = userDetail.paymentRequests || [];
    const stats = userDetail.stats || {};
    const isRoot = !!u.isRoot;

    return (
      <div>
        <Button variant="ghost" onClick={() => { setSelectedUserId(null); changeSection('users'); fetchUsers(); }} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la liste
        </Button>

        {/* Header card */}
        <Card className="mb-6 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">{u.name?.charAt(0)?.toUpperCase()}</div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {u.name}
                  {isRoot && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"><Shield className="h-3 w-3" /> ROOT</span>}
                </h2>
                <p className="text-sm text-slate-500">{u.email} {u.phone && `• ${u.phone}`}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    u.status === 'disabled' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.status === 'active' ? 'Actif' : u.status === 'disabled' ? 'Désactivé' : 'Bloqué'}
                  </span>
                  <span className="text-xs text-slate-400">Rôle: {u.role}</span>
                  <span className="text-xs text-slate-400">Inscrit le: {formatDate(u.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Wallet</p>
                <p className="text-lg font-bold text-emerald-700">{wallet?.balance?.toFixed(0) || 0} MAD</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Cours suivis</p>
                <p className="text-lg font-bold text-blue-700">{stats.coursesEnrolled || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Attestations</p>
                <p className="text-lg font-bold text-purple-700">{stats.attestationsObtained || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Total dépensé</p>
                <p className="text-lg font-bold text-amber-700">{(stats.totalSpent || 0).toFixed(0)} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
          <Button variant={userDetailTab === 'info' ? 'default' : 'ghost'} size="sm" onClick={() => setUserDetailTab('info')}>Infos & Actions</Button>
          <Button variant={userDetailTab === 'wallet' ? 'default' : 'ghost'} size="sm" onClick={() => setUserDetailTab('wallet')}>Wallet & Transactions</Button>
          <Button variant={userDetailTab === 'formations' ? 'default' : 'ghost'} size="sm" onClick={() => setUserDetailTab('formations')}>Formations & Attestations</Button>
          <Button variant={userDetailTab === 'payments' ? 'default' : 'ghost'} size="sm" onClick={() => setUserDetailTab('payments')}>Paiements</Button>
        </div>

        {/* Onglet INFO */}
        {userDetailTab === 'info' && (
          <div className="space-y-6">
            {/* Profil */}
            <Card>
              <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Nom complet</span><span className="font-medium">{profile?.fullName || u.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Username</span><span className="font-medium">{profile?.username || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">CV public</span><span className="font-medium">{profile?.profilePublic ? 'Oui' : 'Non'}</span></div>
                {profile?.username && <div className="flex justify-between"><span className="text-slate-500">Lien CV</span><a href={`https://hseacademy.online/@${profile.username}`} target="_blank" className="text-emerald-600 hover:underline">/@{profile.username}</a></div>}
                <div className="flex justify-between"><span className="text-slate-500">Email vérifié</span><span className="font-medium">{profile?.emailVerified ? 'Oui' : 'Non'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Téléphone vérifié</span><span className="font-medium">{profile?.phoneVerified ? 'Oui' : 'Non'}</span></div>
                {profile?.birthDate && <div className="flex justify-between"><span className="text-slate-500">Date de naissance</span><span className="font-medium">{new Date(profile.birthDate).toLocaleDateString('fr-FR')}</span></div>}
              </CardContent>
            </Card>

            {/* Statut */}
            <Card>
              <CardHeader><CardTitle className="text-base">Statut du compte</CardTitle></CardHeader>
              <CardContent>
                {isRoot ? (
                  <p className="text-sm text-slate-400 italic">Le statut du compte ROOT ne peut pas être modifié.</p>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant={u.status === 'active' ? 'default' : 'outline'} onClick={() => updateUserStatus(u.id, 'active')} className={u.status === 'active' ? 'bg-emerald-600 text-white' : ''}>Activer</Button>
                    <Button size="sm" variant={u.status === 'disabled' ? 'default' : 'outline'} onClick={() => updateUserStatus(u.id, 'disabled')} className={u.status === 'disabled' ? 'bg-amber-600 text-white' : ''}>Désactiver</Button>
                    <Button size="sm" variant={u.status === 'blocked' ? 'default' : 'outline'} onClick={() => updateUserStatus(u.id, 'blocked')} className={u.status === 'blocked' ? 'bg-red-600 text-white' : ''}>Bloquer</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reset password */}
            <Card>
              <CardHeader><CardTitle className="text-base">Réinitialiser le mot de passe</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">L'ancien mot de passe n'est pas visible. Saisissez un nouveau mot de passe (min 6 caractères).</p>
                <div className="flex gap-2">
                  <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="max-w-xs" />
                  <Button size="sm" onClick={() => resetPassword(u.id)} disabled={savingUser || !newPassword}>
                    {savingUser ? 'Enregistrement...' : 'Réinitialiser'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Change username */}
            <Card>
              <CardHeader><CardTitle className="text-base">Modifier le username (lien CV public)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">L'admin peut utiliser n'importe quel username (bypass liste réservés).</p>
                <div className="flex gap-2">
                  <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" maxLength={12} className="max-w-xs" />
                  <Button size="sm" onClick={() => changeUsername(u.id)} disabled={savingUser || !newUsername}>
                    {savingUser ? 'Enregistrement...' : 'Modifier'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet WALLET */}
        {userDetailTab === 'wallet' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Solde du Wallet</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-emerald-700">{wallet?.balance?.toFixed(2) || '0.00'} MAD</span>
                  <div className="text-sm text-slate-500">
                    Total rechargé: <span className="font-medium text-emerald-600">{(stats.totalCharged || 0).toFixed(0)} MAD</span>
                    <span className="mx-2">•</span>
                    Total dépensé: <span className="font-medium text-red-600">{(stats.totalSpent || 0).toFixed(0)} MAD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Historique des transactions</CardTitle></CardHeader>
              <CardContent>
                {wallet?.transactions?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden sm:table-cell">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallet.transactions.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm text-slate-500">{formatDate(t.createdAt)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              t.type === 'charge' || t.type === 'bonus' ? 'bg-emerald-100 text-emerald-800' :
                              t.type === 'purchase' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {t.type === 'charge' ? 'Rechargement' : t.type === 'bonus' ? 'Bonus' : t.type === 'purchase' ? 'Achat' : t.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{t.amount.toFixed(0)} MAD</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-500">{t.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-slate-400">Aucune transaction</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet FORMATIONS */}
        {userDetailTab === 'formations' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Formations suivies ({enrollments.length})</CardTitle></CardHeader>
              <CardContent>
                {enrollments.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cours</TableHead>
                        <TableHead className="hidden sm:table-cell">Niveau</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead className="hidden sm:table-cell">Paiement</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((e: any) => {
                        const pct = e.course?.totalChapters ? Math.round(((JSON.parse(e.completedChapters || '[]').length) / e.course.totalChapters) * 100) : 0;
                        return (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium text-sm">{e.course?.title || '—'}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-slate-500">{e.course?.level}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-2 w-16" />
                                <span className="text-xs text-slate-500">{pct}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                e.paymentStatus === 'validated' ? 'bg-emerald-100 text-emerald-800' :
                                e.paymentStatus === 'not_required' ? 'bg-slate-100 text-slate-600' :
                                e.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {e.paymentStatus === 'validated' ? 'Payé' : e.paymentStatus === 'not_required' ? 'Gratuit' : e.paymentStatus === 'pending' ? 'En attente' : e.paymentStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs ${e.status === 'completed' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {e.status === 'completed' ? 'Terminé' : 'En cours'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-slate-400">Aucune formation</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Attestations obtenues ({attestations.length})</CardTitle></CardHeader>
              <CardContent>
                {attestations.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cours</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="hidden sm:table-cell">N° Série</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attestations.map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium text-sm">{a.courseName}</TableCell>
                          <TableCell className="text-sm">{a.overallScore}%</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-slate-500">{a.serialNumber}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(a.issuedDate)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {a.status === 'valid' ? 'Valide' : 'Révoquée'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-slate-400">Aucune attestation</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet PAIEMENTS */}
        {userDetailTab === 'payments' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Paiements de cours ({coursePayments.length})</CardTitle></CardHeader>
              <CardContent>
                {coursePayments.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coursePayments.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.amount.toFixed(0)} MAD</TableCell>
                          <TableCell className="text-sm">{p.method === 'wallet' ? 'Wallet' : p.method === 'paypal' ? 'PayPal' : p.method === 'bank_transfer' ? 'Virement' : p.method}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              p.status === 'validated' ? 'bg-emerald-100 text-emerald-800' :
                              p.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.status === 'validated' ? 'Validé' : p.status === 'pending' ? 'En attente' : p.status === 'rejected' ? 'Refusé' : p.status}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(p.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-slate-400">Aucun paiement</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Demandes de rechargement ({paymentRequests.length})</CardTitle></CardHeader>
              <CardContent>
                {paymentRequests.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentRequests.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.amount.toFixed(0)} MAD</TableCell>
                          <TableCell className="text-sm">{r.method === 'paypal' ? 'PayPal' : r.method === 'bank_transfer' ? 'Virement' : r.method}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              r.reqStatus === 'validated' ? 'bg-emerald-100 text-emerald-800' :
                              r.reqStatus === 'pending' ? 'bg-slate-100 text-slate-600' :
                              r.reqStatus === 'submitted' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.reqStatus === 'validated' ? 'Validé' : r.reqStatus === 'pending' ? 'En attente' : r.reqStatus === 'submitted' ? 'Soumis' : 'Refusé'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(r.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-slate-400">Aucune demande</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };


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

  const renderLegal = () => {
    if (legalLoading) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Informations Légales</h2>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Scale className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold">Informations Légales</h2>
            <p className="text-sm text-muted-foreground">
              Renseignez progressivement les informations officielles de l&apos;établissement.
              Les champs vides ne sont jamais affichés publiquement. Aucune valeur fictive ne doit être saisie.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Établissement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Établissement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legal-legalName">Raison sociale</Label>
                <Input
                  id="legal-legalName"
                  value={legalForm.legalName}
                  onChange={(e) => setLegalForm({ ...legalForm, legalName: e.target.value })}
                  placeholder="Ex : Institut International des Compétences Professionnelles QHSE SARL"
                />
              </div>
              <div>
                <Label htmlFor="legal-commercialName">Nom commercial</Label>
                <Input
                  id="legal-commercialName"
                  value={legalForm.commercialName}
                  onChange={(e) => setLegalForm({ ...legalForm, commercialName: e.target.value })}
                  placeholder="Ex : HSE Academy"
                />
              </div>
              <div>
                <Label htmlFor="legal-representative">Responsable / Représentant légal</Label>
                <Input
                  id="legal-representative"
                  value={legalForm.representative}
                  onChange={(e) => setLegalForm({ ...legalForm, representative: e.target.value })}
                  placeholder="Ex : Prénom Nom"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="legal-address">Adresse</Label>
                <Input
                  id="legal-address"
                  value={legalForm.address}
                  onChange={(e) => setLegalForm({ ...legalForm, address: e.target.value })}
                  placeholder="Ex : 123 Rue Example, Quartier"
                />
              </div>
              <div>
                <Label htmlFor="legal-city">Ville</Label>
                <Input
                  id="legal-city"
                  value={legalForm.city}
                  onChange={(e) => setLegalForm({ ...legalForm, city: e.target.value })}
                  placeholder="Ex : Casablanca"
                />
              </div>
              <div>
                <Label htmlFor="legal-country">Pays</Label>
                <Input
                  id="legal-country"
                  value={legalForm.country}
                  onChange={(e) => setLegalForm({ ...legalForm, country: e.target.value })}
                  placeholder="Ex : Maroc"
                />
              </div>
              <div>
                <Label htmlFor="legal-phone">Téléphone</Label>
                <Input
                  id="legal-phone"
                  value={legalForm.phone}
                  onChange={(e) => setLegalForm({ ...legalForm, phone: e.target.value })}
                  placeholder="Ex : +212 6 XX XX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="legal-email">Email</Label>
                <Input
                  id="legal-email"
                  type="email"
                  value={legalForm.email}
                  onChange={(e) => setLegalForm({ ...legalForm, email: e.target.value })}
                  placeholder="Ex : contact@institutqhse.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="legal-website">Site web</Label>
                <Input
                  id="legal-website"
                  value={legalForm.website}
                  onChange={(e) => setLegalForm({ ...legalForm, website: e.target.value })}
                  placeholder="Ex : https://hseacademy.online"
                />
              </div>
            </CardContent>
          </Card>

          {/* Identifiants juridiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identifiants juridiques (Maroc)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="legal-ice">ICE</Label>
                <Input
                  id="legal-ice"
                  value={legalForm.ice}
                  onChange={(e) => setLegalForm({ ...legalForm, ice: e.target.value })}
                  placeholder="Identifiant Commun de l'Entreprise"
                />
              </div>
              <div>
                <Label htmlFor="legal-rc">RC</Label>
                <Input
                  id="legal-rc"
                  value={legalForm.rc}
                  onChange={(e) => setLegalForm({ ...legalForm, rc: e.target.value })}
                  placeholder="Registre de Commerce"
                />
              </div>
              <div>
                <Label htmlFor="legal-if">IF</Label>
                <Input
                  id="legal-if"
                  value={legalForm.if}
                  onChange={(e) => setLegalForm({ ...legalForm, if: e.target.value })}
                  placeholder="Identifiant Fiscal"
                />
              </div>
            </CardContent>
          </Card>

          {/* Autorisation d'exercice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autorisation d&apos;exercice (si applicable)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legal-authorizationRef">Référence de l&apos;autorisation</Label>
                <Input
                  id="legal-authorizationRef"
                  value={legalForm.authorizationRef}
                  onChange={(e) => setLegalForm({ ...legalForm, authorizationRef: e.target.value })}
                  placeholder="Ex : N° d'agrément / numéro de décision"
                />
              </div>
              <div>
                <Label htmlFor="legal-authorityName">Organisme / Autorité</Label>
                <Input
                  id="legal-authorityName"
                  value={legalForm.authorityName}
                  onChange={(e) => setLegalForm({ ...legalForm, authorityName: e.target.value })}
                  placeholder="Ex : Ministère de l'Éducation / Formation professionnelle"
                />
              </div>
            </CardContent>
          </Card>

          {/* CNDP */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CNDP (protection des données)</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="legal-cndpReceipt">Numéro de récépissé CNDP</Label>
              <Input
                id="legal-cndpReceipt"
                value={legalForm.cndpReceipt}
                onChange={(e) => setLegalForm({ ...legalForm, cndpReceipt: e.target.value })}
                placeholder="Ex : N° xxx/2026 — laisser vide si non encore obtenu"
              />
              <p className="text-xs text-muted-foreground mt-2">
                À renseigner uniquement si une déclaration CNDP a été effectuée. Ne pas inventer de numéro.
              </p>
            </CardContent>
          </Card>

          {/* Contenus des pages légales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contenus des pages légales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Textes complets affichés sur les pages /refund, /privacy, /terms. Peuvent contenir du Markdown simple.
                Les pages afficheront par défaut un contenu générique si ces champs sont vides.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="legal-refundPolicy">Politique de remboursement</Label>
                <Textarea
                  id="legal-refundPolicy"
                  rows={6}
                  value={legalForm.refundPolicy}
                  onChange={(e) => setLegalForm({ ...legalForm, refundPolicy: e.target.value })}
                  placeholder="Texte complet de la politique de remboursement..."
                />
              </div>
              <div>
                <Label htmlFor="legal-privacyPolicy">Politique de confidentialité</Label>
                <Textarea
                  id="legal-privacyPolicy"
                  rows={6}
                  value={legalForm.privacyPolicy}
                  onChange={(e) => setLegalForm({ ...legalForm, privacyPolicy: e.target.value })}
                  placeholder="Texte complet de la politique de confidentialité..."
                />
              </div>
              <div>
                <Label htmlFor="legal-termsOfService">Conditions générales</Label>
                <Textarea
                  id="legal-termsOfService"
                  rows={6}
                  value={legalForm.termsOfService}
                  onChange={(e) => setLegalForm({ ...legalForm, termsOfService: e.target.value })}
                  placeholder="Texte complet des conditions générales..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end bg-background/80 backdrop-blur-sm p-3 rounded-lg border">
            <Button
              onClick={saveLegalSettings}
              disabled={legalSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {legalSaving ? 'Enregistrement...' : 'Enregistrer les informations légales'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentSettings = () => {
    if (paymentLoading) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Paramètres de Paiement</h2>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold">Paramètres de Paiement</h2>
            <p className="text-sm text-muted-foreground">
              Activez ou désactivez les méthodes de paiement. Modifiez les coordonnées sans toucher au code.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Prix attestation imprimée */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ps-attestationPrice">Prix attestation imprimée (MAD)</Label>
                <Input
                  id="ps-attestationPrice"
                  type="number"
                  value={paymentForm.attestationPrintPrice}
                  onChange={(e) => setPaymentForm({ ...paymentForm, attestationPrintPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="190"
                />
                <p className="text-xs text-muted-foreground mt-1">Le prix de chaque cours est défini individuellement dans la section Formations.</p>
              </div>
              <div>
                <Label htmlFor="ps-currency">Devise</Label>
                <Input
                  id="ps-currency"
                  value={paymentForm.currency}
                  onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                  placeholder="MAD"
                />
              </div>
            </CardContent>
          </Card>

          {/* PayPal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                PayPal
                <Switch checked={paymentForm.paypalEnabled} onCheckedChange={(v) => setPaymentForm({ ...paymentForm, paypalEnabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="ps-paypalEmail">Email PayPal</Label>
              <Input
                id="ps-paypalEmail"
                type="email"
                value={paymentForm.paypalEmail}
                onChange={(e) => setPaymentForm({ ...paymentForm, paypalEmail: e.target.value })}
                placeholder="Ex : ouamrhar@gmail.com"
                disabled={!paymentForm.paypalEnabled}
              />
            </CardContent>
          </Card>

          {/* Stripe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Stripe (Carte bancaire)
                <Switch checked={paymentForm.stripeEnabled} onCheckedChange={(v) => setPaymentForm({ ...paymentForm, stripeEnabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ps-stripePublicKey">Clé publique Stripe (Publishable Key)</Label>
                <Input
                  id="ps-stripePublicKey"
                  value={paymentForm.stripePublicKey}
                  onChange={(e) => setPaymentForm({ ...paymentForm, stripePublicKey: e.target.value })}
                  placeholder="pk_live_..."
                  disabled={!paymentForm.stripeEnabled}
                />
              </div>
              <div>
                <Label htmlFor="ps-stripeSecretKey">Clé secrète Stripe (Secret Key)</Label>
                <Input
                  id="ps-stripeSecretKey"
                  type="password"
                  value={paymentForm.stripeSecretKey}
                  onChange={(e) => setPaymentForm({ ...paymentForm, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  disabled={!paymentForm.stripeEnabled}
                />
                <p className="text-xs text-muted-foreground mt-1">La clé secrète n&apos;est jamais exposée publiquement.</p>
              </div>
            </CardContent>
          </Card>

          {/* Virement bancaire */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Virement bancaire (RIB)
                <Switch checked={paymentForm.bankTransferEnabled} onCheckedChange={(v) => setPaymentForm({ ...paymentForm, bankTransferEnabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ps-bankName">Nom de la banque</Label>
                  <Input
                    id="ps-bankName"
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    placeholder="Ex : Banque Populaire"
                    disabled={!paymentForm.bankTransferEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="ps-bankAccountName">Titulaire du compte</Label>
                  <Input
                    id="ps-bankAccountName"
                    value={paymentForm.bankAccountName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })}
                    placeholder="Ex : Institut QHSE"
                    disabled={!paymentForm.bankTransferEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="ps-bankIban">RIB / IBAN</Label>
                  <Input
                    id="ps-bankIban"
                    value={paymentForm.bankIban}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankIban: e.target.value })}
                    placeholder="Ex : 011 780 0000123456789012 34"
                    disabled={!paymentForm.bankTransferEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="ps-bankSwift">Code SWIFT / BIC</Label>
                  <Input
                    id="ps-bankSwift"
                    value={paymentForm.bankSwift}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankSwift: e.target.value })}
                    placeholder="Ex : BPCOMAMC"
                    disabled={!paymentForm.bankTransferEnabled}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ps-bankNotes">Instructions additionnelles</Label>
                <Textarea
                  id="ps-bankNotes"
                  rows={3}
                  value={paymentForm.bankNotes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, bankNotes: e.target.value })}
                  placeholder="Ex : Merci d'envoyer la preuve de virement sur WhatsApp..."
                  disabled={!paymentForm.bankTransferEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Wallet (Portefeuille client)
                <Switch checked={paymentForm.walletEnabled} onCheckedChange={(v) => setPaymentForm({ ...paymentForm, walletEnabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Active le système de wallet. Les clients pourront charger de l&apos;argent et payer leurs formations avec leur solde.
              </p>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact WhatsApp (preuves de paiement)</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="ps-whatsapp">Numéro WhatsApp officiel</Label>
              <Input
                id="ps-whatsapp"
                value={paymentForm.whatsappNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, whatsappNumber: e.target.value })}
                placeholder="Ex : +212 728 986 565"
              />
              <p className="text-xs text-muted-foreground mt-1">Affiché aux clients pour l&apos;envoi des preuves de paiement.</p>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end bg-background/80 backdrop-blur-sm p-3 rounded-lg border">
            <Button
              onClick={savePaymentSettings}
              disabled={paymentSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {paymentSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: SITE PROFILE
  // ============================================================
  const renderSiteProfile = () => {
    if (siteProfileLoading) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Profil du Site</h2>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold">Profil du Site</h2>
            <p className="text-sm text-muted-foreground">
              Informations affichées publiquement sur le site et dans le JSON-LD Organization.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Carte: Identité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identité du site</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-name">Nom du site</Label>
                <Input
                  id="site-name"
                  value={siteProfileForm.siteName}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, siteName: e.target.value })}
                  placeholder="HSE Academy"
                />
              </div>
              <div>
                <Label htmlFor="site-logo">Logo / miniature (URL)</Label>
                <Input
                  id="site-logo"
                  value={siteProfileForm.siteLogo}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, siteLogo: e.target.value })}
                  placeholder="https://hseacademy.online/logo.png"
                />
                {siteProfileForm.siteLogo && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteProfileForm.siteLogo} alt="Logo" className="h-12 w-auto rounded border border-slate-200" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="site-description">Description courte (meta description par défaut)</Label>
                <Textarea
                  id="site-description"
                  value={siteProfileForm.siteDescription}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, siteDescription: e.target.value })}
                  rows={3}
                  placeholder="L'IICP propose des formations professionnelles diplômantes en Qualité, Hygiène, Sécurité et Environnement."
                />
                <p className="text-xs text-slate-500 mt-1">{(siteProfileForm.siteDescription || '').length} caractères — Google affiche environ 160 caractères.</p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="site-keywords">Mots-clés SEO globaux (séparés par des virgules)</Label>
                <Input
                  id="site-keywords"
                  value={siteProfileForm.siteKeywords}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, siteKeywords: e.target.value })}
                  placeholder="QHSE, formation QHSE, ISO 9001, ..."
                />
              </div>
              <div>
                <Label htmlFor="site-url">URL canonique</Label>
                <Input
                  id="site-url"
                  value={siteProfileForm.siteUrl}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, siteUrl: e.target.value })}
                  placeholder="https://hseacademy.online"
                />
              </div>
              <div>
                <Label htmlFor="gsc">Google Search Console (ID de vérification)</Label>
                <Input
                  id="gsc"
                  value={siteProfileForm.gscVerification}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, gscVerification: e.target.value })}
                  placeholder="ex: google-site-verification=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte: Réseaux sociaux */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Réseaux sociaux (JSON-LD Organization)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="social-facebook">Facebook</Label>
                <Input
                  id="social-facebook"
                  value={siteProfileForm.facebook}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, facebook: e.target.value })}
                  placeholder="https://facebook.com/hseacademy"
                />
              </div>
              <div>
                <Label htmlFor="social-twitter">Twitter / X</Label>
                <Input
                  id="social-twitter"
                  value={siteProfileForm.twitter}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, twitter: e.target.value })}
                  placeholder="https://twitter.com/hseacademy"
                />
              </div>
              <div>
                <Label htmlFor="social-linkedin">LinkedIn</Label>
                <Input
                  id="social-linkedin"
                  value={siteProfileForm.linkedin}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/hseacademy"
                />
              </div>
              <div>
                <Label htmlFor="social-instagram">Instagram</Label>
                <Input
                  id="social-instagram"
                  value={siteProfileForm.instagram}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/hseacademy"
                />
              </div>
              <div>
                <Label htmlFor="social-youtube">YouTube</Label>
                <Input
                  id="social-youtube"
                  value={siteProfileForm.youtube}
                  onChange={(e) => setSiteProfileForm({ ...siteProfileForm, youtube: e.target.value })}
                  placeholder="https://youtube.com/@hseacademy"
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte: Sitemap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" /> Sitemap XML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sitemapInfo?.sitemapUrl && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    <span className="font-mono text-emerald-800">{sitemapInfo.sitemapUrl}</span>
                  </div>
                  {sitemapInfo.sitemapUpdatedAt && (
                    <p className="text-xs text-emerald-700 ml-6">
                      Dernière génération : {new Date(sitemapInfo.sitemapUpdatedAt).toLocaleString('fr-FR')}
                      {sitemapInfo.urlCount ? ` — ${sitemapInfo.urlCount} URLs` : ''}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateSitemap} disabled={generatingSitemap} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {generatingSitemap ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Génération...</> : <><RefreshCw className="h-4 w-4 mr-2" /> Mettre à jour le sitemap</>}
                </Button>
                {sitemapInfo?.sitemapUrl && (
                  <a href={sitemapInfo.sitemapUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" /> Voir le sitemap
                    </Button>
                  </a>
                )}
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>• Le sitemap référence toutes les URLs indexables : pages SEO, formations, articles, CV publics.</p>
                <p>• Ping automatique à Google Search Console à chaque génération.</p>
                <p>• Format : sitemap index → sitemap-pages.xml + sitemap-formations.xml + sitemap-articles.xml + sitemap-static.xml.</p>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={saveSiteProfile} disabled={siteProfileSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {siteProfileSaving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="h-4 w-4 mr-2" /> Enregistrer le profil</>}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: STATS
  // ============================================================
  const renderStats = () => {
    if (statsLoading && !statsData) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      );
    }

    const cards = statsData?.cards || { today: 0, week: 0, month: 0, allTime: 0 };
    const daily = statsData?.daily || [];
    const topPages = statsData?.topPages || [];
    const topCountries = statsData?.topCountries || [];
    const topSources = statsData?.topSources || [];
    const uniqueVisitors = statsData?.uniqueVisitors || 0;
    const totalVisits = statsData?.totalVisits || 0;

    // Compute max for the chart
    const maxDaily = Math.max(1, ...daily.map((d: any) => d.count));

    // Format date for daily chart
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-semibold">Statistiques de visite</h2>
              <p className="text-sm text-muted-foreground">
                Visites, visiteurs uniques, pages populaires, origines et pays.
              </p>
            </div>
          </div>
          <Select value={statsPeriod} onValueChange={(v) => setStatsPeriod(v as 'today' | '7d' | '30d' | '90d' | 'year' | 'all')}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="year">Année en cours</SelectItem>
              <SelectItem value="all">Tout (all-time)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Aujourd'hui</div>
              <div className="text-3xl font-bold text-emerald-900 mt-1">{cards.today}</div>
              <div className="text-xs text-emerald-600 mt-1">visites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">7 jours</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{cards.week}</div>
              <div className="text-xs text-slate-500 mt-1">visites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">30 jours</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{cards.month}</div>
              <div className="text-xs text-slate-500 mt-1">visites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All-time</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{cards.allTime}</div>
              <div className="text-xs text-slate-500 mt-1">visites totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Period stats summary */}
        <div className="mb-4 text-sm text-slate-600">
          <span className="font-semibold">{totalVisits}</span> visites pour la période sélectionnée — <span className="font-semibold">{uniqueVisitors}</span> visiteurs uniques
        </div>

        {/* 30-day chart (SVG bar chart) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Visites des 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
              {daily.map((d: any, i: number) => {
                const heightPct = (d.count / maxDaily) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[16px]">
                    <div className="text-[10px] text-slate-500">{d.count > 0 ? d.count : ''}</div>
                    <div
                      className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-t"
                      style={{ height: `${Math.max(2, heightPct)}%` }}
                      title={`${d.date}: ${d.count} visite(s)`}
                    />
                    <div className="text-[9px] text-slate-400 -rotate-45 origin-bottom whitespace-nowrap">
                      {i % 5 === 0 ? formatDate(d.date) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3 columns: Top pages, Top pays, Top sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Top 10 pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Aucune visite</p>
              ) : (
                <div className="space-y-2">
                  {topPages.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate text-slate-700">{p.path}</div>
                        <div className="text-xs text-slate-400">{p.pageType}</div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2">{p.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top pays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Top 5 pays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCountries.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Aucune donnée</p>
              ) : (
                <div className="space-y-2">
                  {topCountries.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {c.countryCode && <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{c.countryCode}</span>}
                        <span className="text-slate-700">{c.country}</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-2">{c.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Top 5 origines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topSources.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Aucune donnée</p>
              ) : (
                <div className="space-y-2">
                  {topSources.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 capitalize">{s.source || 'inconnu'}</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-2">{s.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Period reload button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => fetchStats(statsPeriod)} variant="outline" disabled={statsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return renderDashboard();
      case 'articles': return renderArticles();
      case 'certifications': return renderCertifications();
      case 'formationsDiplomantes': return renderFormationsDiplomantes();
      case 'formationsCertifiantes': return renderFormationsCertifiantes();
      case 'categories': return renderCategories();
      case 'pages': return renderPages();
      case 'menus': return renderMenus();
      case 'comments': return renderComments();
      case 'newsletter': return renderNewsletter();
      case 'contacts': return renderMessages();
      case 'users': return renderUsers();
      case 'userDetail': return renderUserDetail();
      case 'payments': return renderPayments();
      case 'testimonials': return renderTestimonials();
      case 'legal': return renderLegal();
      case 'paymentSettings': return renderPaymentSettings();
      case 'siteProfile': return renderSiteProfile();
      case 'stats': return renderStats();
      case 'assistant': return <AssistantAdminSection />;
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