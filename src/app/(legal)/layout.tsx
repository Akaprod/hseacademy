// ============================================================================
// Layout minimal pour les pages légales publiques (/refund, /privacy, /terms)
// ============================================================================
// Indépendant de la SPA principale (qui utilise son propre Header/Footer).
// Accessible sans authentification. Identité visuelle cohérente avec
// HSE Academy (palette emerald + Inter).
// ============================================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'HSE Academy — Informations légales',
  description: 'Informations légales et politiques HSE Academy',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-800">
      {/* Header minimal */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
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
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">{children}</main>

      {/* Footer minimal avec liens vers les 3 pages légales */}
      <footer className="border-t border-emerald-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HSE Academy — Institut International des Compétences Professionnelles QHSE
          </p>
          <nav className="flex items-center gap-5 text-xs">
            <Link href="/refund" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Remboursement
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Conditions
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
