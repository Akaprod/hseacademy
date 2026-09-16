'use client';

// ============================================================================
// HeroSlider — Carousel automatique en haut de la homepage
// ============================================================================
// Fait tourner 4 slides promotionnelles (annonces, formations phares) avec :
//   - Rotation automatique toutes les 10 secondes
//   - Image de fond (picsum Next.js Image optimisé)
//   - Overlay sombre pour lisibilité
//   - Titre + sous-titre + CTA par slide
//   - Indicateurs cliquables (dots) + flèches de navigation
//   - Pause au survol (l'utilisateur peut lire tranquillement)
//   - Transitions CSS douces (opacity)
//   - Accessibilité : aria-label, boutons clavier (flèches gauche/droite)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// SLIDES — contenu éditorial
// ============================================================================
// Chaque slide a : id, image (chemin local /public/slides), badge, titre,
// sous-titre, et une action CTA (soit onNavigate, soit openWithQuestion).
// 4 slides choisis :
//   1. Inscriptions 2026/2027 → CTA principal (vers les formations diplomantes)
//   2. Renforcez votre carrière HSE → vers formations diplomantes (général)
//   3. Préparez votre Licence Pro → vers /inscriptions/licence-professionnelle-qhse
//   4. Master Pro QHSE → vers /inscriptions/master-professionnel-qhse
// ============================================================================

export interface Slide {
  id: string;
  image: string;
  badge: string;
  title: string;
  highlight: string; // partie colorée du titre
  subtitle: string;
  cta: {
    label: string;
    href?: string;             // si navigation externe (vers /inscriptions/...)
    navigate?: string;         // si navigation SPA (via onNavigate)
    navigateData?: Record<string, string>;
  };
}

export const HSE_SLIDES: Slide[] = [
  {
    id: 'inscriptions-2026',
    image: '/slides/slide-inscriptions.jpg',
    badge: '📋 Nouvelle année scolaire',
    title: 'Inscriptions ouvertes',
    highlight: '2026/2027',
    subtitle: "Rejoignez l'Institut International des Compétences Professionnelles QHSE. Formations diplômantes en ligne, accessibles à tous, alignées sur les standards internationaux.",
    cta: {
      label: "S'inscrire maintenant",
      navigate: 'formations',
    },
  },
  {
    id: 'hse-career',
    image: '/slides/slide-hse.jpg',
    badge: '🚀 Carrière professionnelle',
    title: 'Renforcez votre carrière en',
    highlight: 'QHSE',
    subtitle: "Maîtrisez la Qualité, l'Hygiène, la Sécurité et l'Environnement. Devenez un acteur clé de la prévention et du management des risques en entreprise.",
    cta: {
      label: 'Découvrir les formations',
      navigate: 'formations',
    },
  },
  {
    id: 'licence-pro',
    image: '/slides/slide-licence.jpg',
    badge: '🎓 Bac+2 requis',
    title: 'Préparez votre',
    highlight: 'Licence Professionnelle',
    subtitle: "Un diplôme reconnu en 1 an pour booster votre carrière QHSE. Acquérez les compétences managériales et techniques attendues sur le marché international.",
    cta: {
      label: "S'inscrire à la Licence Pro",
      href: '/inscriptions/licence-professionnelle-qhse',
    },
  },
  {
    id: 'master-pro',
    image: '/slides/slide-master.jpg',
    badge: '🏆 Bac+3 requis',
    title: 'Master Pro QHSE,',
    highlight: 'assurez votre avenir',
    subtitle: "Un diplôme de haut niveau en 2 ans pour accéder aux postes de Direction QHSE. Spécialisation pointue, réseaux d'experts, débouchés internationaux.",
    cta: {
      label: "S'inscrire au Master Pro",
      href: '/inscriptions/master-professionnel-qhse',
    },
  },
];

// ============================================================================
// Props
// ============================================================================
interface HeroSliderProps {
  onNavigate?: (page: string, data?: Record<string, string>) => void;
  slides?: Slide[];
  intervalMs?: number;
  rightPanel?: React.ReactNode;
}

// ============================================================================
// Composant
// ============================================================================
export function HeroSlider({ onNavigate, slides = HSE_SLIDES, intervalMs = 10000, rightPanel }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(next, intervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, next, intervalMs, total]);

  // Clavier : flèches gauche/droite
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  };

  // Action CTA
  const handleCta = (slide: Slide) => {
    if (slide.cta.href && typeof window !== 'undefined') {
      window.location.href = slide.cta.href;
    } else if (slide.cta.navigate && onNavigate) {
      onNavigate(slide.cta.navigate, slide.cta.navigateData);
    }
  };

  return (
    <div
      className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carrousel d'annonces HSE Academy"
    >
      {/* === Slides === */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={i !== current}
        >
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              quality={80}
            />
            {/* Overlay sombre pour lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          </div>

          {/* Contenu — 2 colonnes : slides à gauche (rotatif), panneau fixe à droite */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 w-full items-center">

              {/* === COLONNE GAUCHE : Contenu du slide (rotatif) === */}
              <div className="lg:col-span-7 max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-100 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full mb-4 animate-[fade-in_0.6s_ease-out]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.badge}
                </div>

                {/* Titre */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-[fade-in_0.7s_ease-out]">
                  <span className="text-white">{slide.title}</span>{' '}
                  <span className="text-emerald-300">{slide.highlight}</span>
                </h2>

                {/* Sous-titre */}
                <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-6 leading-relaxed max-w-2xl animate-[fade-in_0.8s_ease-out]">
                  {slide.subtitle}
                </p>

                {/* CTA */}
                <div className="animate-[fade-in_0.9s_ease-out]">
                  <Button
                    size="lg"
                    onClick={() => handleCta(slide)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 sm:px-8 py-6 text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 transition-all group"
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* === COLONNE DROITE : Panneau fixe (ne tourne pas) === */}
              {rightPanel && (
                <div className="lg:col-span-5 hidden lg:block">
                  {rightPanel}
                </div>
              )}

            </div>
          </div>
        </div>
      ))}

      {/* === Flèches de navigation === */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide précédent"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white p-2 sm:p-3 rounded-full transition-all"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Slide suivant"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white p-2 sm:p-3 rounded-full transition-all"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* === Indicateurs (dots) === */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Aller au slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? 'w-8 bg-emerald-400 shadow-md'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* === Pause indicator (subtle) === */}
      {paused && total > 1 && (
        <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          En pause
        </div>
      )}
    </div>
  );
}
