// ============================================================================
// Layout public pour les pages SEO jumelles des formations (/f/[slug])
// ============================================================================
// Accessible sans authentification. Indépendant de la SPA principale.
// Identité visuelle HSE Academy cohérente (palette emerald + Inter).
// ============================================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Formations QHSE — HSE Academy',
  description:
    "Formations professionnelles diplômantes et certifiantes en Qualité, Hygiène, Sécurité et Environnement. Découvrez nos programmes détaillés et débouchés HSE Academy.",
};

export default function FormationSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-800">
      <header className="border-b border-emerald-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-emerald-800 text-lg leading-tight">HSE Academy</div>
              <div className="text-[10px] text-slate-500 leading-tight">
                Institut International des Compétences Professionnelles QHSE
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
          >
            Voir toutes les formations
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">{children}</main>

      <footer className="border-t border-emerald-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HSE Academy — Institut International des Compétences Professionnelles QHSE
          </p>
          <nav className="flex items-center gap-5 text-xs">
            <Link href="/" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Accueil
            </Link>
            <Link href="/pages" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Base de connaissances
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Conditions
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Confidentialité
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
