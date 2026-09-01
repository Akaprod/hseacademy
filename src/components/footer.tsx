'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Phone, Mail, MapPin, Send, ArrowUp, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer un email valide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur serveur');
    }
    setLoading(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Newsletter bar */}
      <div className="bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h3 className="text-lg font-bold flex items-center gap-2 justify-center md:justify-start">
                <BookOpen className="h-5 w-5" />
                Newsletter QHSE
              </h3>
              <p className="text-emerald-100 text-sm mt-1">Recevez nos derniers articles, conseils et actualités QHSE</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-r-none bg-white/95 border-white/30 focus:border-white text-slate-900 placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
              />
              <Button
                onClick={handleNewsletter}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-l-none px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                S&apos;abonner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">IICP</div>
                <div className="text-[10px] text-slate-400 leading-tight">Institut International QHSE</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              L&apos;Institut International des Compétences Professionnelles propose des formations diplômantes de haute qualité en Qualité, Hygiène, Sécurité et Environnement.
            </p>
          </div>

          {/* Formations */}
          <div>
            <h4 className="font-bold text-white mb-4">Nos Formations</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Technicien QHSE', slug: 'technicien-qhse' },
                { label: 'Technicien Supérieur QHSE', slug: 'technicien-superieur-qhse' },
                { label: 'Licence Professionnelle QHSE', slug: 'licence-professionnelle-qhse' },
                { label: 'Master Professionnel QHSE', slug: 'master-professionnel-qhse' },
                { label: 'VAE Expertise QHSE', slug: 'vae-expertise-qhse' },
              ].map((f) => (
                <li key={f.slug}>
                  <button
                    onClick={() => onNavigate('formations', { slug: f.slug })}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    {f.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-bold text-white mb-4">Liens Rapides</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Accueil', page: 'home' },
                { label: 'Blog QHSE', page: 'blog' },
                { label: 'Vérification Diplômes', page: 'verification' },
                { label: 'À Propos', page: 'about' },
                { label: 'Contact', page: 'contact' },
              ].map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => onNavigate(l.page)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">Maroc</span>
              </li>
              <li>
                <a href="tel:+212675147100" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  +212 6 75 147 100
                </a>
              </li>
              <li>
                <a href="mailto:contact@institutqhse.com" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  contact@institutqhse.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} IICP - Institut International des Compétences Professionnelles QHSE. Tous droits réservés.
          </p>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 transition-colors"
            aria-label="Retour en haut"
          >
            <ArrowUp className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
}