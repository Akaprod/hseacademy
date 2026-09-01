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

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

function getInitialUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('iicp_user');
    if (saved) return JSON.parse(saved) as UserData;
  } catch { /* ignore */ }
  return null;
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<Record<string, string>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserData | null>(getInitialUser);

  const handleNavigate = useCallback((page: string, data?: Record<string, string>) => {
    setCurrentPage(page);
    setPageData(data || {});
  }, []);

  const handleAuthOpen = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback((userData: UserData) => {
    setUser(userData);
    try { localStorage.setItem('iicp_user', JSON.stringify(userData)); } catch { /* ignore */ }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem('iicp_user'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'formations':
        return <FormationsPage slug={pageData.slug} tab={pageData.tab} onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogPage
          slug={pageData.slug}
          user={user}
          onAuthOpen={handleAuthOpen}
          onNavigate={handleNavigate}
        />;
      case 'verification':
        return <VerificationPage />;
      case 'contact':
        return <ContactPage />;
      case 'about':
        return <AboutPage />;
      case 'training':
        return <TrainingPage user={user} onAuthOpen={handleAuthOpen} onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (currentPage === 'admin') {
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