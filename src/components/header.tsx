'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { GraduationCap, Menu, X, Phone, Mail, Shield, BookOpen, Award, FileCheck, Users, ChevronDown, Settings, MonitorPlay } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, data?: Record<string, string>) => void;
  onAuthOpen: (mode: 'login' | 'register') => void;
  user: { id: string; name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const navLinks = [
  { label: 'Accueil', page: 'home' },
  { label: 'Formations', page: 'formations',
    children: [
      { label: 'Technicien QHSE', page: 'formations', data: { slug: 'technicien-qhse' } },
      { label: 'Technicien Supérieur QHSE', page: 'formations', data: { slug: 'technicien-superieur-qhse' } },
      { label: 'Licence Professionnelle QHSE', page: 'formations', data: { slug: 'licence-professionnelle-qhse' } },
      { label: 'Master Professionnel QHSE', page: 'formations', data: { slug: 'master-professionnel-qhse' } },
      { label: 'VAE Expertise QHSE', page: 'formations', data: { slug: 'vae-expertise-qhse' } },
    ]
  },
  { label: 'Formation en Ligne', page: 'training' },
  { label: 'Blog QHSE', page: 'blog' },
  { label: 'Vérification', page: 'verification' },
  { label: 'À Propos', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

export default function Header({ currentPage, onNavigate, onAuthOpen, user, onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNav = (page: string, data?: Record<string, string>) => {
    onNavigate(page, data);
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top bar */}
      <div className="hidden md:block bg-slate-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <a href="tel:+212675147100" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span>+212 6 75 147 100</span>
            </a>
            <a href="mailto:contact@institutqhse.com" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Mail className="h-3.5 w-3.5" />
              <span>contact@institutqhse.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('verification')} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Vérifier un diplôme</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-slate-900 text-lg leading-tight tracking-tight">IICP</div>
              <div className="text-[10px] text-slate-500 leading-tight font-medium">Institut International QHSE</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.page} className="relative group">
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === link.page ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                    onClick={() => handleNav(link.page)}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[280px]">
                      {link.children.map((child) => (
                        <button
                          key={child.data?.slug}
                          onClick={() => handleNav(child.page, child.data)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4 text-emerald-500" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === link.page ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-emerald-800">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')} className="text-slate-600 gap-1.5">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onLogout} className="text-slate-600">
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onAuthOpen('login')} className="text-slate-700">
                  Connexion
                </Button>
                <Button size="sm" onClick={() => onAuthOpen('register')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Inscription
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-slate-900">IICP</span>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navLinks.map((link) => (
                      <div key={link.page}>
                        <button
                          onClick={() => handleNav(link.page)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === link.page ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {link.label}
                        </button>
                        {link.children && currentPage === 'formations' && (
                          <div className="ml-4 mt-1 space-y-1">
                            {link.children.map((child) => (
                              <button
                                key={child.data?.slug}
                                onClick={() => handleNav(child.page, child.data)}
                                className="w-full text-left px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-slate-200">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => { onLogout(); setMobileOpen(false); }}>
                          Déconnexion
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => { onAuthOpen('login'); setMobileOpen(false); }}>
                          Connexion
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { onAuthOpen('register'); setMobileOpen(false); }}>
                          Inscription
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}