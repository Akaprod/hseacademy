'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AuthModal from '@/components/auth-modal';
import HomePage from '@/components/home-page';
import FormationsPage from '@/components/formations-page';
import BlogPage from '@/components/blog-page';
import VerificationPage from '@/components/verification-page';
import ContactPage from '@/components/contact-page';
import AboutPage from '@/components/about-page';
import AdminDashboard from '@/components/admin-dashboard';
import TrainingPage from '@/components/training-page';
import ProfilePage from '@/components/profile-page';

// Force le rendu dynamique pour éviter que le CDN Hostinger ne serve
// une version HTML stale (qui pointerait vers des chunks JS supprimés).
// Sans cela, après un redéploiement, les visiteurs peuvent rester bloqués
// sur une page non-hydratable jusqu'à expiration du cache CDN (1 an par défaut).
export const dynamic = 'force-dynamic';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<Record<string, string>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // User vient uniquement du serveur (via /api/auth/me)
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Au mount, fetch /api/auth/me — source de vérité serveur
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setUser(data.user || null);
      } catch { /* ignore */ }
      if (!cancelled) setUserLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNavigate = useCallback((page: string, data?: Record<string, string>) => {
    setCurrentPage(page);
    setPageData(data || {});
  }, []);

  const handleAuthOpen = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

  // Après login/register, ne trust pas le body, refetch /api/auth/me
  const handleAuthSuccess = useCallback(async () => {
    setAuthModalOpen(false);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user || null);
    } catch { /* ignore */ }
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setUser(null);
    setCurrentPage('home');
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Pendant le 1er fetch, éviter le flash
  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-emerald-700 font-bold text-xl">IICP</div>
      </div>
    );
  }

  // Blocage côté client de l'accès admin
  // Le user vient du serveur, role ne peut pas être falsifié via localStorage
  const isAdmin = user?.role === 'admin';
  if (currentPage === 'admin' && !isAdmin) {
    setCurrentPage('home');
  }
  if (currentPage === 'profile' && !user) {
    setCurrentPage('home');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'formations':
        return <FormationsPage slug={pageData.slug} tab={pageData.tab} onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogPage slug={pageData.slug} user={user} onAuthOpen={handleAuthOpen} onNavigate={handleNavigate} />;
      case 'verification':
        return <VerificationPage />;
      case 'contact':
        return <ContactPage />;
      case 'about':
        return <AboutPage />;
      case 'training':
        return <TrainingPage user={user} onAuthOpen={handleAuthOpen} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'admin':
        return isAdmin
          ? <AdminDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          : <HomePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (currentPage === 'admin' && isAdmin) {
    return <AdminDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAuthOpen={handleAuthOpen}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
