'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Play, CheckCircle, Clock, Users, Award, ArrowLeft, ArrowRight,
  Trophy, XCircle, ChevronRight, GraduationCap, Star, FileCheck, Lock,
  CircleCheck, AlertCircle, Menu, X, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TrainingProps {
  user: UserData | null;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

/* ---------- types ---------- */
interface ChapterSummary { id: string; title: string; order: number }
interface Course {
  id: string; title: string; slug: string; description: string;
  shortDescription: string; level: string; icon: string; coverImage?: string;
  price: number; isFree: boolean; featured: boolean; order: number;
  totalChapters: number; totalHours: string;
  chapters: ChapterSummary[];
  _count: { enrollments: number; attestations: number };
  enrollment?: {
    id: string; status: string; currentChapter: number;
    completedChapters: string[]; overallScore: number;
  } | null;
}

interface ChapterFull {
  id: string; title: string; content: string; order: number; courseId: string;
  isCompleted: boolean;
  chapterScore: { score: number; total: number; passed: boolean } | null;
  questions: {
    id: string; question: string; options: string; correctIndex: number;
    explanation: string; order: number;
  }[];
}

interface ExamResult {
  score: number; totalQuestions: number; correctCount: number; passed: boolean;
  results: {
    questionId: string; userAnswer: number; correctAnswer: number;
    isCorrect: boolean; explanation: string;
  }[];
}

interface Attestation {
  id: string; attestationNo: string; fullName: string; courseName: string;
  overallScore: number; issuedDate: string;
  course: { title: string; slug: string; level: string; totalHours: string };
}

/* ============================================================ */
export default function TrainingPage({ user, onAuthOpen, onNavigate }: TrainingProps) {
  /* ---- view states ---- */
  type View = 'catalog' | 'detail' | 'learn' | 'exam' | 'examResult' | 'attestation' | 'myAttestations';
  const [view, setView] = useState<View>('catalog');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  /* detail */
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  /* learn */
  const [chapters, setChapters] = useState<ChapterFull[]>([]);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* exam */
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  /* attestations */
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [currentAttestation, setCurrentAttestation] = useState<Attestation | null>(null);

  /* progress tracking (in-memory from enrollment) */
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [chapterScores, setChapterScores] = useState<Record<string, { score: number; total: number; passed: boolean }>>({});

  /* ---- fetch courses ---- */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const q = user ? `?userId=${user.id}` : '';
      const res = await fetch(`/api/courses${q}`);
      const data = await res.json();
      setCourses(data);
    } catch { toast.error('Erreur de chargement des cours'); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  /* ---- helpers ---- */
  const requireAuth = () => {
    if (!user) { onAuthOpen('login'); return false; }
    return true;
  };

  const openCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    if (course.enrollment) {
      setCompletedChapters(new Set(course.enrollment.completedChapters));
      // fetch chapter scores from enrollment - we'll get them from the detail
      fetchChapterScores(course.id);
    } else {
      setCompletedChapters(new Set());
      setChapterScores({});
    }
    setView('detail');
  };

  const fetchChapterScores = async (courseId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/progress?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setChapterScores(data.chapterScores || {});
      }
    } catch { /* ignore */ }
  };

  const enroll = async (courseId: string) => {
    if (!requireAuth() || !selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      });
      if (res.ok) {
        toast.success('Inscription réussie !');
        fetchCourses(); // refresh to get enrollment data
        // reload the course detail
        const detailRes = await fetch(`/api/courses/${selectedCourse.slug}?userId=${user!.id}`);
        if (detailRes.ok) setSelectedCourse(await detailRes.json());
      }
    } catch { toast.error('Erreur lors de l\'inscription'); }
  };

  const startLearning = async () => {
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/chapters/${selectedCourse.chapters[0].id}?userId=${user?.id || ''}`);
      if (res.ok) {
        const ch = await res.json();
        setChapters([ch]);
        setCurrentChapterIdx(0);
        setView('learn');
      }
    } catch { toast.error('Erreur de chargement'); }
  };

  const loadChapter = async (chapterId: string, index: number) => {
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/chapters/${chapterId}?userId=${user?.id || ''}`);
      if (res.ok) {
        const ch = await res.json();
        setChapters((prev) => {
          const copy = [...prev];
          copy[index] = ch;
          return copy;
        });
        setCurrentChapterIdx(index);
        setSidebarOpen(false);
      }
    } catch { toast.error('Erreur de chargement'); }
  };

  const goToExam = () => {
    setAnswers({});
    setExamResult(null);
    setView('exam');
  };

  const submitExam = async () => {
    if (!selectedCourse || !chapters[currentChapterIdx]) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/chapters/${chapters[currentChapterIdx].id}/exam`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setExamResult(data);
        setView('examResult');
        if (data.passed) {
          setCompletedChapters((prev) => new Set([...prev, chapters[currentChapterIdx].id]));
          setChapterScores((prev) => ({
            ...prev,
            [chapters[currentChapterIdx].id]: { score: data.score, total: data.totalQuestions, passed: true },
          }));
        }
      }
    } catch { toast.error('Erreur lors de la soumission'); }
    setSubmitting(false);
  };

  const requestAttestation = async () => {
    if (!user || !selectedCourse) return;
    try {
      const enrollment = selectedCourse.enrollment;
      if (!enrollment) return;
      const res = await fetch('/api/courses/attestations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, courseId: selectedCourse.id,
          enrollmentId: enrollment.id, fullName: user.name,
          courseName: selectedCourse.title, overallScore: enrollment.overallScore,
        }),
      });
      if (res.ok) {
        const att = await res.json();
        setCurrentAttestation({ ...att, course: { title: selectedCourse.title, slug: selectedCourse.slug, level: selectedCourse.level, totalHours: selectedCourse.totalHours } });
        setView('attestation');
        toast.success('Attestation générée avec succès !');
      }
    } catch { toast.error('Erreur de génération'); }
  };

  const fetchAttestations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/courses/attestations?userId=${user.id}`);
      if (res.ok) setAttestations(await res.json());
    } catch { /* ignore */ }
  };

  const levelLabel = (l: string) => {
    const m: Record<string, string> = { debutant: 'Débutant', moyen: 'Intermédiaire', avance: 'Avancé' };
    return m[l] || l;
  };
  const levelColor = (l: string) => {
    const m: Record<string, string> = { debutant: 'bg-emerald-100 text-emerald-800', moyen: 'bg-amber-100 text-amber-800', avance: 'bg-rose-100 text-rose-800' };
    return m[l] || 'bg-slate-100 text-slate-800';
  };

  const currentChapter = chapters[currentChapterIdx];
  const progressPercent = selectedCourse && selectedCourse.chapters.length > 0
    ? Math.round((completedChapters.size / selectedCourse.chapters.length) * 100) : 0;
  const allPassed = selectedCourse
    ? selectedCourse.chapters.every((ch) => completedChapters.has(ch.id))
    : false;

  /* ================================================================ */
  /*  CATALOG VIEW                                                     */
  /* ================================================================ */
  if (view === 'catalog') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30 mb-4 text-sm px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Nouveau
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Formations en Ligne HSE
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 mb-8">
                Suivez des cours professionnels en Hygiène, Sécurité et Environnement.
                Obtenez des attestations numériques reconnues à la fin de chaque formation.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <BookOpen className="h-4 w-4" /> <span>Cours structurés</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <FileCheck className="h-4 w-4" /> <span>Examens QCM</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Award className="h-4 w-4" /> <span>Attestations gratuites</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* My attestations button */}
        {user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Button variant="outline" onClick={() => { fetchAttestations(); setView('myAttestations'); }} className="gap-2">
              <Award className="h-4 w-4" /> Mes Attestations
            </Button>
          </div>
        )}

        {/* Course grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Nos Formations Gratuites
            </h2>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {courses.length} cours disponibles
            </Badge>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="h-64" /></Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const enrolled = !!course.enrollment;
                const pct = enrolled && course.enrollment
                  ? Math.round((course.enrollment.completedChapters.length / course.chapters.length) * 100) : 0;
                return (
                  <Card
                    key={course.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-slate-200 hover:border-emerald-300"
                    onClick={() => openCourseDetail(course)}
                  >
                    <div className="h-40 bg-gradient-to-br from-emerald-600 to-slate-800 flex items-center justify-center relative">
                      <GraduationCap className="h-16 w-16 text-white/80" />
                      <Badge className={`absolute top-3 right-3 ${levelColor(course.level)} text-xs font-medium`}>
                        {levelLabel(course.level)}
                      </Badge>
                      {course.isFree && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-xs">Gratuit</Badge>
                      )}
                      {enrolled && pct === 100 && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Trophy className="h-12 w-12 text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.shortDescription}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.chapters.length} chapitres</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.totalHours || '2h'}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course._count.enrollments}</span>
                      </div>
                      {enrolled && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Progression</span>
                            <span className="font-medium text-emerald-600">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ================================================================ */
  /*  COURSE DETAIL VIEW                                               */
  /* ================================================================ */
  if (view === 'detail' && selectedCourse) {
    const enrolled = !!selectedCourse.enrollment;
    const pct = enrolled ? Math.round((completedChapters.size / selectedCourse.chapters.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => setView('catalog')} className="flex items-center gap-2 text-emerald-200 hover:text-white mb-6 text-sm">
              <ArrowLeft className="h-4 w-4" /> Retour aux formations
            </button>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${levelColor(selectedCourse.level)}`}>{levelLabel(selectedCourse.level)}</Badge>
              {selectedCourse.isFree && <Badge className="bg-emerald-500 text-white">Gratuit</Badge>}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-3">{selectedCourse.title}</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">{selectedCourse.shortDescription}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Programme du cours</CardTitle>
                  <CardDescription>{selectedCourse.chapters.length} chapitres · Chaque chapitre se termine par un examen QCM de 10 questions (60% minimum requis)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedCourse.chapters.map((ch, idx) => {
                    const done = completedChapters.has(ch.id);
                    const score = chapterScores[ch.id];
                    return (
                      <div key={ch.id} className={`flex items-center gap-3 p-3 rounded-lg ${done ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-slate-200'} hover:shadow-sm transition`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {done ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${done ? 'text-emerald-800' : 'text-slate-700'}`}>{ch.title}</p>
                          {score && <p className="text-xs text-emerald-600 mt-0.5">Score: {score.score}% — {score.passed ? 'Réussi' : 'À refaire'}</p>}
                        </div>
                        {done && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Durée</span>
                      <span className="font-medium">{selectedCourse.totalHours || '2h'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Chapitres</span>
                      <span className="font-medium">{selectedCourse.chapters.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Questions</span>
                      <span className="font-medium">{selectedCourse.chapters.length * 10}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Inscrits</span>
                      <span className="font-medium">{selectedCourse._count.enrollments}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Prix</span>
                      <span className="font-bold text-emerald-700 text-lg">Gratuit</span>
                    </div>
                  </div>

                  {!enrolled ? (
                    <Button className="w-full" size="lg" onClick={() => enroll(selectedCourse.id)}>
                      <Play className="h-4 w-4 mr-2" /> S'inscrire gratuitement
                    </Button>
                  ) : (
                    <>
                      {pct > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progression</span><span className="font-medium text-emerald-700">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2.5" />
                        </div>
                      )}
                      {allPassed ? (
                        <Button className="w-full" size="lg" variant="outline" onClick={requestAttestation}>
                          <Award className="h-4 w-4 mr-2" /> Obtenir mon attestation
                        </Button>
                      ) : (
                        <Button className="w-full" size="lg" onClick={startLearning}>
                          <Play className="h-4 w-4 mr-2" />
                          {pct > 0 ? 'Continuer le cours' : 'Commencer le cours'}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  LEARNING VIEW (chapter reader)                                    */
  /* ================================================================ */
  if (view === 'learn' && currentChapter && selectedCourse) {
    const ch = currentChapter;
    const idx = currentChapterIdx;
    const nextCh = selectedCourse.chapters[idx + 1];
    const prevCh = selectedCourse.chapters[idx - 1];
    const hasPassed = chapterScores[ch.id]?.passed || false;

    return (
      <div className="min-h-screen bg-white">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1">
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <button onClick={() => setView('detail')} className="text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">{selectedCourse.title}</p>
                <p className="font-medium text-sm">Chapitre {idx + 1} : {ch.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{idx + 1}/{selectedCourse.chapters.length}</span>
              <Progress value={progressPercent} className="w-20 h-2" />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - chapter list */}
          <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[57px] left-0 z-30 w-72 h-[calc(100vh-57px)] bg-slate-50 border-r border-slate-200 overflow-y-auto transition-transform lg:top-[57px]`}>
            <div className="p-4">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Chapitres</h3>
              <div className="space-y-1">
                {selectedCourse.chapters.map((c, i) => {
                  const active = c.id === ch.id;
                  const done = completedChapters.has(c.id);
                  return (
                    <button
                      key={c.id} onClick={() => loadChapter(c.id, i)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition ${active ? 'bg-emerald-100 text-emerald-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {done ? <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0" /> : <span className={`w-4 h-4 rounded-full border-2 text-center text-[10px] leading-4 shrink-0 ${active ? 'border-emerald-600 text-emerald-600' : 'border-slate-300'}`}>{i + 1}</span>}
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
          {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-6">
                <Badge variant="outline" className="mb-3">Chapitre {idx + 1} sur {selectedCourse.chapters.length}</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{ch.title}</h1>
              </div>

              {/* Chapter content */}
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{ch.content || 'Contenu en cours de rédaction...'}</ReactMarkdown>
              </div>

              {/* Exam section */}
              <Separator className="my-8" />
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-emerald-600" />
                      Examen du Chapitre {idx + 1}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">10 questions QCM · Score minimum requis : 60%</p>
                  </div>
                  {hasPassed && (
                    <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> {chapterScores[ch.id]?.score}%
                    </Badge>
                  )}
                </div>
                <Button onClick={goToExam} className="w-full sm:w-auto" variant={hasPassed ? 'outline' : 'default'}>
                  {hasPassed ? 'Repasser l\'examen' : 'Passer l\'examen'} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={() => prevCh ? loadChapter(prevCh.id, idx - 1) : setView('detail')} disabled={!prevCh}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <span className="text-sm text-slate-400">{idx + 1} / {selectedCourse.chapters.length}</span>
                <Button variant="outline" onClick={() => nextCh ? loadChapter(nextCh.id, idx + 1) : setView('detail')} disabled={!nextCh}>
                  Suivant <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  EXAM VIEW                                                        */
  /* ================================================================ */
  if (view === 'exam' && currentChapter && selectedCourse) {
    const ch = currentChapter;
    const questions = ch.questions;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setView('learn')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm">
              <ArrowLeft className="h-4 w-4" /> Retour au chapitre
            </button>
            <Badge variant="outline">{answeredCount}/{questions.length} répondues</Badge>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Examen : {ch.title}</h1>
            <p className="text-slate-500 mt-1">Répondez aux {questions.length} questions ci-dessous. Score minimum : 60%</p>
          </div>
          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const opts: string[] = JSON.parse(q.options);
              return (
                <Card key={q.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <p className="font-medium text-slate-900 mb-4">
                      <span className="text-emerald-600 font-bold mr-2">{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <RadioGroup
                      value={answers[q.id]?.toString() ?? ''}
                      onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: parseInt(v) }))}
                      className="space-y-2"
                    >
                      {opts.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 transition">
                          <RadioGroupItem value={oIdx.toString()} id={`q-${q.id}-${oIdx}`} />
                          <Label htmlFor={`q-${q.id}-${oIdx}`} className="flex-1 cursor-pointer text-sm text-slate-700">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg" className="min-w-[200px]" onClick={submitExam} disabled={submitting || answeredCount < questions.length}
            >
              {submitting ? 'Correction en cours...' : `Soumettre (${answeredCount}/${questions.length})`}
            </Button>
          </div>
          {answeredCount < questions.length && (
            <p className="text-center text-sm text-slate-400 mt-3">
              Veuillez répondre à toutes les questions avant de soumettre
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  EXAM RESULT VIEW                                                 */
  /* ================================================================ */
  if (view === 'examResult' && examResult && currentChapter && selectedCourse) {
    const isLastChapter = currentChapterIdx === selectedCourse.chapters.length - 1;
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Result header */}
          <Card className={`border-2 ${examResult.passed ? 'border-emerald-300' : 'border-red-300'}`}>
            <CardContent className="p-8 text-center">
              {examResult.passed ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-emerald-800 mb-2">Félicitations !</h1>
                  <p className="text-slate-600 mb-4">Vous avez réussi l\'examen de ce chapitre.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-red-700 mb-2">Score insuffisant</h1>
                  <p className="text-slate-600 mb-4">Vous devez obtenir au moins 60% pour valider ce chapitre. Revoyez le contenu et réessayez.</p>
                </>
              )}
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-bold ${examResult.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                {examResult.score}%
              </div>
              <p className="text-sm text-slate-500 mt-2">{examResult.correctCount} bonnes réponses sur {examResult.totalQuestions}</p>
            </CardContent>
          </Card>

          {/* Answers review */}
          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Révision des réponses</h3>
            {examResult.results.map((r, rIdx) => {
              const q = currentChapter.questions[rIdx];
              const opts: string[] = JSON.parse(q.options);
              return (
                <Card key={r.questionId} className={`border ${r.isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      {r.isCorrect
                        ? <CircleCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                        : <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      }
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm mb-2">{q.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className={r.userAnswer === r.correctAnswer ? 'text-emerald-700' : 'text-red-600'}>
                            Votre réponse : {r.userAnswer >= 0 ? opts[r.userAnswer] : 'Aucune'}
                          </p>
                          {!r.isCorrect && (
                            <p className="text-emerald-700">
                              Bonne réponse : {opts[r.correctAnswer]}
                            </p>
                          )}
                          {r.explanation && (
                            <p className="text-slate-500 mt-1 italic bg-slate-50 p-2 rounded">{r.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => setView('learn')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour au chapitre
            </Button>
            {!examResult.passed && (
              <Button onClick={goToExam}>
                <ArrowRight className="h-4 w-4 mr-1" /> Réessayer
              </Button>
            )}
            {examResult.passed && !isLastChapter && (
              <Button onClick={() => {
                const next = selectedCourse.chapters[currentChapterIdx + 1];
                if (next) loadChapter(next.id, currentChapterIdx + 1);
              }}>
                Chapitre suivant <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {examResult.passed && isLastChapter && allPassed && (
              <Button onClick={requestAttestation} className="bg-emerald-600 hover:bg-emerald-700">
                <Award className="h-4 w-4 mr-1" /> Obtenir mon attestation
              </Button>
            )}
            {examResult.passed && isLastChapter && !allPassed && (
              <Button variant="outline" onClick={() => setView('detail')}>
                Retour au programme <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  ATTESTATION VIEW                                                 */
  /* ================================================================ */
  if (view === 'attestation' && currentAttestation) {
    const att = currentAttestation;
    return (
      <div className="min-h-screen bg-slate-100 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => { setView('detail'); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            {/* Certificate border design */}
            <div className="relative">
              <div className="absolute inset-4 border-2 border-emerald-600 rounded-lg pointer-events-none" />
              <div className="p-8 md:p-12 text-center">
                {/* Header */}
                <div className="mb-8">
                  <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold mb-1">Institut International des Compétences Professionnelles</h2>
                  <p className="text-slate-400 text-xs">IICP — hseacademy.online</p>
                </div>

                <Separator className="my-6" />

                <Badge className="bg-emerald-100 text-emerald-700 mb-4">Attestation de Réussite</Badge>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Attestation de Formation</h1>
                <p className="text-slate-500 mb-8">Certifie que</p>

                <p className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6">{att.fullName}</p>

                <p className="text-slate-600 mb-2">a réussi avec succès la formation en ligne</p>
                <p className="text-xl font-semibold text-slate-900 mb-6">&laquo; {att.courseName} &raquo;</p>

                <div className="flex justify-center gap-8 mb-8">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Score obtenu</p>
                    <p className="text-2xl font-bold text-emerald-700">{att.overallScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="text-2xl font-bold text-slate-900">{new Date(att.issuedDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Footer with signature area */}
                <div className="flex justify-between items-end mt-8 px-4">
                  <div className="text-left">
                    <p className="text-sm text-slate-500">N° d'attestation</p>
                    <p className="font-mono text-sm font-bold text-slate-900">{att.attestationNo}</p>
                  </div>
                  <div className="text-right">
                    <div className="border-t-2 border-slate-900 pt-2 w-48">
                      <p className="text-sm font-semibold text-slate-900">La Direction</p>
                      <p className="text-xs text-slate-500">IICP — Institut QHSE</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-6">
                  Vérifiable en ligne sur hseacademy.online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MY ATTESTATIONS VIEW                                             */
  /* ================================================================ */
  if (view === 'myAttestations') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
            <button onClick={() => setView('catalog')} className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Mes Attestations</h1>
              <p className="text-sm text-slate-500">Historique de vos attestations obtenues</p>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {attestations.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Vous n'avez pas encore d'attestation.</p>
                <Button variant="outline" onClick={() => setView('catalog')}>Voir les formations</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {attestations.map((att) => (
                <Card key={att.id} className="hover:shadow-md transition cursor-pointer" onClick={() => { setCurrentAttestation(att); setView('attestation'); }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{att.courseName}</h3>
                        <p className="text-sm text-slate-500 mt-1">N° {att.attestationNo}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>Score : <strong className="text-emerald-600">{att.overallScore}%</strong></span>
                          <span>{new Date(att.issuedDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
