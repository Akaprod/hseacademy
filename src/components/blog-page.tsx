'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, Clock, MessageCircle, Search, Tag, Send, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface BlogPageProps {
  slug?: string;
  user: { id: string; name: string; email: string; role: string } | null;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

interface Category { id: string; name: string; slug: string; description: string; color: string; _count: { articles: number } }
interface Article {
  id: string; title: string; slug: string; excerpt: string; content: string;
  coverImage?: string | null;
  published: boolean; featured: boolean; viewCount: number; authorName: string; createdAt: string;
  category: { name: string; slug: string; color: string };
  comments?: CommentType[];
}
interface CommentType {
  id: string; content: string; createdAt: string;
  user: { name: string; avatar: string | null };
}

export default function BlogPage({ slug, user, onAuthOpen, onNavigate }: BlogPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchArticles = async (catId?: string, s?: string, p?: number) => {
    setLoading(true);
    try {
      let url = `/api/articles?limit=9&page=${p || 1}`;
      if (catId && catId !== 'all') url += `&categoryId=${catId}`;
      if (s) url += `&search=${encodeURIComponent(s)}`;
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.totalPages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch { /* ignore */ }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (slug) {
        const res = await fetch(`/api/articles/${slug}`);
        const data = await res.json();
        if (!cancelled) setSelectedArticle(data.article || null);
      } else {
        if (!cancelled) {
          setSelectedArticle(null);
          setLoading(true);
          await fetchArticles(activeCategory, search, page);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeCategory, search, page, slug]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [selectedArticle, activeCategory]);

  const handleComment = async () => {
    if (!user) { onAuthOpen('login'); return; }
    if (!commentText.trim()) { toast.error('Veuillez écrire un commentaire'); return; }
    if (!selectedArticle) return;
    setCommentLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, articleId: selectedArticle.id, userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Commentaire publié !');
        setCommentText('');
        setSelectedArticle(prev => prev ? { ...prev, comments: [data.comment, ...(prev.comments || [])] } : null);
      } else { toast.error(data.error); }
    } catch { toast.error('Erreur serveur'); }
    setCommentLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Article detail view
  if (selectedArticle) {
    return (
      <div className="min-h-screen">
        <section className="gradient-hero text-white py-12 md:py-16 relative">
          {selectedArticle.coverImage && (
            <div className="absolute inset-0 z-0">
              <img src={selectedArticle.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
            </div>
          )}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <button onClick={() => onNavigate('blog')} className="flex items-center gap-1.5 text-emerald-200 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour au blog
            </button>
            <Badge className="text-sm font-medium mb-4" style={{ backgroundColor: selectedArticle.category.color + '30', color: '#fff', borderColor: selectedArticle.category.color + '50' }}>
              {selectedArticle.category.name}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">{selectedArticle.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{selectedArticle.authorName}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDate(selectedArticle.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{selectedArticle.viewCount} vues</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{selectedArticle.comments?.length || 0} commentaires</span>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Article content */}
              <Card className="border-slate-200 mb-8">
                <CardContent className="p-6 md:p-10">
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedArticle.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {/* Comments section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  Commentaires ({selectedArticle.comments?.length || 0})
                </h2>

                {/* Comment form */}
                {user ? (
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Écrire un commentaire..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={handleComment} disabled={commentLoading || !commentText.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              {commentLoading ? 'Envoi...' : 'Publier'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-slate-500 mb-3">Connectez-vous pour laisser un commentaire</p>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300" onClick={() => onAuthOpen('login')}>
                        Se connecter
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Comments list */}
                <div className="space-y-4">
                  {(selectedArticle.comments || []).map((c) => (
                    <Card key={c.id} className="border-slate-100">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-slate-900">{c.user.name}</span>
                              <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!selectedArticle.comments || selectedArticle.comments.length === 0) && (
                    <p className="text-sm text-slate-400 text-center py-6">Aucun commentaire pour le moment. Soyez le premier !</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5"><Tag className="h-4 w-4 text-emerald-600" />Catégories</h3>
                  <div className="space-y-1.5">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onNavigate('blog', { category: c.slug })}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="text-slate-700">{c.name}</span>
                        <Badge variant="secondary" className="text-xs">{c._count.articles}</Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog list view
  return (
    <div className="min-h-screen">
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Blog QHSE</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">
            Découvrez nos conseils, formations et bonnes pratiques en Qualité, Hygiène, Sécurité et Environnement.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            size="sm" variant={activeCategory === 'all' ? 'default' : 'outline'}
            className={activeCategory === 'all' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-slate-600'}
            onClick={() => { setActiveCategory('all'); setPage(1); }}
          >
            Tous
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id} size="sm"
              variant={activeCategory === c.id ? 'default' : 'outline'}
              className={activeCategory === c.id ? 'text-white' : 'text-slate-600'}
              style={activeCategory === c.id ? { backgroundColor: c.color } : {}}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
            >
              {c.name} ({c._count.articles})
            </Button>
          ))}
        </div>

        {/* Articles grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-500">Aucun article trouvé</h3>
            <p className="text-sm text-slate-400 mt-1">Essayez une autre recherche ou catégorie</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Card
                key={a.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200 overflow-hidden"
                onClick={() => onNavigate('blog', { slug: a.slug })}
              >
                {a.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={a.coverImage}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <Badge className="text-xs font-medium" style={{ backgroundColor: a.category.color + 'cc', color: '#fff' }}>
                        {a.category.name}
                      </Badge>
                      {a.featured && <Badge className="bg-amber-400 text-amber-900 text-xs font-medium">Featured</Badge>}
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  {!a.coverImage && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="text-xs font-medium" style={{ backgroundColor: a.category.color + '20', color: a.category.color }}>
                        {a.category.name}
                      </Badge>
                      {a.featured && <Badge className="bg-amber-100 text-amber-700 text-xs">Featured</Badge>}
                    </div>
                  )}
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">{a.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.viewCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{(a as Article & { _count?: { comments: number } })._count?.comments || 0}</span>
                    </div>
                    <span>{formatDate(a.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'}
                className={p === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}