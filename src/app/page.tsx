'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'
import {
  FiImage,
  FiFileText,
  FiMonitor,
  FiCheck,
  FiArrowRight,
  FiClock,
  FiShield,
  FiStar,
  FiZap,
  FiUsers,
  FiAward,
} from 'react-icons/fi'
import { formatPrice } from '@/lib/utils'
import { PRICING } from '@/types'

/* ── Data ── */
const services = [
  {
    icon: FiImage,
    title: 'Flyer de soutenance',
    description:
      'Annonce visuelle professionnelle par filière. Templates personnalisés avec vos photos, informations jury et couleurs ENSPD.',
    price: `À partir de ${formatPrice(PRICING.FLYER.STANDARD)}`,
    features: [
      'Templates par filière (GI, GT, GE…)',
      'Photo & logo personnalisés',
      'Format A4 / A5',
      'Livraison en 3–5 jours',
    ],
    href: '/orders/new/flyer',
    badge: 'Populaire',
    t: {
      gradient: 'bg-blue-50',
      border: 'border-blue-100',
      hoverBorder: 'hover:border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-600 text-white',
      priceColor: 'text-blue-700',
      linkColor: 'text-blue-600',
      checkBg: 'bg-blue-100',
      checkColor: 'text-blue-600',
      glow: '0 4px 24px rgba(37, 99, 235, 0.12), 0 1px 4px rgba(0,0,0,0.05)',
    },
  },
  {
    icon: FiFileText,
    title: 'Mise en page document',
    description:
      'Mise en forme professionnelle de votre mémoire selon les normes ENSPD. Table des matières, styles et numérotation automatiques.',
    price: `À partir de ${formatPrice(PRICING.DOCUMENT_LAYOUT.BASE * PRICING.DOCUMENT_LAYOUT.MIN_PAGES)}`,
    features: [
      'Normes ENSPD respectées',
      'Table des matières automatique',
      'Styles titres & paragraphes',
      'Numérotation pages & figures',
    ],
    href: '/orders/new/document',
    badge: null,
    t: {
      gradient: 'bg-orange-50',
      border: 'border-orange-100',
      hoverBorder: 'hover:border-orange-300',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: '',
      priceColor: 'text-orange-600',
      linkColor: 'text-orange-600',
      checkBg: 'bg-orange-100',
      checkColor: 'text-orange-600',
      glow: '0 4px 24px rgba(249, 115, 22, 0.12), 0 1px 4px rgba(0,0,0,0.05)',
    },
  },
  {
    icon: FiMonitor,
    title: 'Présentation PowerPoint',
    description:
      'Diaporama structuré et impactant. Design professionnel adapté aux exigences du jury et aux normes de présentation ENSPD.',
    price: `À partir de ${formatPrice(PRICING.POWERPOINT.PER_SLIDE * PRICING.POWERPOINT.MIN_SLIDES)}`,
    features: [
      'Design aux couleurs ENSPD',
      'Structure type soutenance',
      'Animations professionnelles',
      'Support de présentation inclus',
    ],
    href: '/orders/new/powerpoint',
    badge: null,
    t: {
      gradient: 'bg-violet-50',
      border: 'border-violet-100',
      hoverBorder: 'hover:border-violet-300',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      badgeBg: '',
      priceColor: 'text-violet-600',
      linkColor: 'text-violet-600',
      checkBg: 'bg-violet-100',
      checkColor: 'text-violet-600',
      glow: '0 4px 24px rgba(124, 58, 237, 0.12), 0 1px 4px rgba(0,0,0,0.05)',
    },
  },
]

const stats = [
  { value: '500+', label: 'Étudiants servis',   icon: FiUsers, iconBg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
  { value: '98%',  label: 'Satisfaction',        icon: FiStar,  iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'   },
  { value: '8',    label: 'Filières couvertes',  icon: FiAward, iconBg: 'bg-violet-50',  iconColor: 'text-violet-600'  },
  { value: '24h',  label: 'Livraison express',   icon: FiZap,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
]

const steps = [
  { num: '01', title: 'Remplissez le formulaire', desc: 'Toutes vos informations de soutenance en quelques minutes.', bg: '#2563eb', shadow: '0 8px 24px rgba(37,99,235,0.40)'   },
  { num: '02', title: 'Confirmez & payez',         desc: 'Mobile Money (Orange / MTN) ou paiement en espèces.',       bg: '#7c3aed', shadow: '0 8px 24px rgba(124,58,237,0.40)'  },
  { num: '03', title: 'Suivez en temps réel',      desc: 'Messagerie directe avec votre graphiste depuis le tableau de bord.', bg: '#f97316', shadow: '0 8px 24px rgba(249,115,22,0.40)' },
  { num: '04', title: 'Téléchargez le livrable',   desc: 'Fichier haute résolution prêt pour impression et projection.', bg: '#059669', shadow: '0 8px 24px rgba(5,150,105,0.40)' },
]

const guarantees = [
  { icon: FiShield, title: 'Qualité garantie',   desc: "Graphistes ENSPD formés aux normes académiques. Retouches illimitées jusqu'à validation.", iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
  { icon: FiClock,  title: 'Délais respectés',   desc: 'Vos deadlines sont sacrés. Remboursement intégral si retard de notre part.',              iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: FiStar,   title: 'Satisfaction 100 %', desc: "Révisions illimitées jusqu'à votre validation totale. Zéro compromis sur la qualité.",     iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
]

/* ── Animation helpers ── */
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">

        {/* ══ HERO ══ */}
        <section
          className="relative overflow-hidden text-white py-24 sm:py-32 px-4"
          style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)' }}
        >
          {/* Glow orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-20 w-137.5 h-137.5 rounded-full animate-glow"
              style={{ background: 'radial-gradient(circle at center, rgba(99,102,241,0.22) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-40 -left-20 w-112.5 h-112.5 rounded-full animate-glow animation-delay-2"
              style={{ background: 'radial-gradient(circle at center, rgba(124,58,237,0.16) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-87.5 h-87.5 rounded-full animate-glow animation-delay-1"
              style={{ background: 'radial-gradient(circle at center, rgba(249,115,22,0.10) 0%, transparent 70%)' }} />
          </div>
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

          <div className="max-w-5xl mx-auto text-center relative">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2.5 border border-white/10 bg-white/6 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium text-blue-200 mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px #34d399', animation: 'pulse 2s ease-in-out infinite' }} />
              Club GIT · ENSPD Douala · Services graphiques professionnels
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold leading-[1.06] tracking-tight mb-7">
              Brillez le jour de{' '}
              <br className="hidden sm:block" />
              <span style={{ background: 'linear-gradient(90deg, #fb923c 0%, #f97316 45%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                votre soutenance
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }}
              className="text-white/55 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Flyers · Mise en page · PowerPoint — conçus par des graphistes ENSPD{' '}
              qui connaissent vos normes, vos filières et vos délais.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link href="/auth/register"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 32px rgba(249,115,22,0.45), 0 2px 8px rgba(0,0,0,0.2)' }}>
                Commander maintenant
                <FiArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#services"
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 border border-white/12 text-white/85 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5">
                Découvrir les services
              </Link>
            </motion.div>

            {/* Pills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-3 justify-center">
              {[
                { label: 'Flyer de soutenance',   c: 'bg-blue-500/15 border-blue-400/20 text-blue-200'   },
                { label: 'Mise en page document', c: 'bg-orange-500/15 border-orange-400/20 text-orange-200' },
                { label: 'Présentation PowerPoint', c: 'bg-violet-500/15 border-violet-400/20 text-violet-200' },
              ].map((p) => (
                <span key={p.label} className={`text-xs sm:text-sm px-4 py-1.5 rounded-full border font-semibold ${p.c}`}>
                  ✦ {p.label}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="bg-white border-b border-slate-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <FadeSection className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center gap-2.5">
                  <div className={`w-12 h-12 ${s.iconBg} rounded-2xl flex items-center justify-center`}>
                    <s.icon size={22} className={s.iconColor} />
                  </div>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</p>
                  <p className="text-text-muted text-xs font-semibold text-center leading-tight">{s.label}</p>
                </motion.div>
              ))}
            </FadeSection>
          </div>
        </section>

        {/* ══ SERVICES ══ */}
        <section id="services" className="py-24 px-4"
          style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block text-orange-600 font-bold text-xs uppercase tracking-[0.15em] bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-5">
                  Ce que nous faisons
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
                  Trois services pour votre{' '}
                  <span className="text-gradient-blue">réussite</span>
                </h2>
                <p className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed">
                  Pensés pour accompagner chaque étudiant ENSPD jusqu&apos;au bout de son parcours académique.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {services.map((svc, i) => (
                  <motion.div key={svc.title} variants={fadeUp} custom={i}
                    whileHover={{ y: -8, transition: { duration: 0.28, ease: EASE } }}
                    className={`relative ${svc.t.gradient} rounded-3xl border ${svc.t.border} ${svc.t.hoverBorder} p-7 flex flex-col overflow-hidden transition-all duration-300`}
                    style={{ boxShadow: svc.t.glow }}>
                    {svc.badge && (
                      <span className={`absolute top-5 right-5 ${svc.t.badgeBg} text-xs px-3 py-1 rounded-full font-bold tracking-wide`}>
                        {svc.badge}
                      </span>
                    )}
                    <div className={`w-14 h-14 ${svc.t.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                      <svc.icon size={24} className={svc.t.iconColor} />
                    </div>
                    <h3 className="text-lg font-extrabold text-foreground mb-2.5">{svc.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-5 flex-1">{svc.description}</p>
                    <ul className="space-y-2.5 mb-7">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                          <span className={`w-5 h-5 ${svc.t.checkBg} rounded-full flex items-center justify-center shrink-0`}>
                            <FiCheck size={11} className={svc.t.checkColor} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-black/6">
                      <p className={`text-sm font-extrabold ${svc.t.priceColor}`}>{svc.price}</p>
                      <Link href={svc.href} className={`inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-3 ${svc.t.linkColor}`}>
                        Commander <FiArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block text-violet-600 font-bold text-xs uppercase tracking-[0.15em] bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full mb-5">
                  Processus simple
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-3">
                  De la commande à la livraison
                </h2>
                <p className="text-text-muted text-lg">100 % en ligne — 4 étapes, c&apos;est tout</p>
              </motion.div>

              <div className="relative">
                <div className="hidden lg:block absolute top-7 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #bfdbfe 0%, #ddd6fe 33%, #fed7aa 66%, #a7f3d0 100%)' }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {steps.map((s) => (
                    <motion.div key={s.num} variants={fadeUp}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="text-center bg-white rounded-3xl border border-slate-100 p-7 transition-all duration-300 hover:border-slate-200"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <div className="w-14 h-14 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-5"
                        style={{ background: s.bg, boxShadow: s.shadow }}>
                        {s.num}
                      </div>
                      <h3 className="font-extrabold text-foreground mb-2 text-sm leading-snug">{s.title}</h3>
                      <p className="text-text-muted text-xs leading-relaxed">{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ══ URGENCY BANNER ══ */}
        <section className="py-16 px-4 relative overflow-hidden text-white"
          style={{ background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 35%, #ea580c 65%, #f97316 100%)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-white/6 blur-3xl" />
            <div className="absolute -bottom-20 left-0 w-64 h-64 rounded-full bg-black/10 blur-3xl" />
          </div>
          <FadeSection className="max-w-3xl mx-auto text-center relative">
            <motion.div variants={fadeUp}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl mb-6"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                <FiZap size={30} />
              </motion.div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                Soutenance dans moins de 3 jours ?
              </h2>
              <p className="text-orange-100/85 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                Service <strong>Express (24–48h)</strong> et <strong>Immédiat (&lt;24h)</strong> disponibles.{' '}
                Votre grand jour ne peut pas attendre.
              </p>
              <Link href="/auth/register"
                className="inline-flex items-center gap-2.5 bg-white text-orange-700 hover:bg-orange-50 px-9 py-4 rounded-2xl font-extrabold text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                Commander en urgence <FiArrowRight size={17} />
              </Link>
            </motion.div>
          </FadeSection>
        </section>

        {/* ══ GUARANTEES ══ */}
        <section className="py-24 px-4" style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <FadeSection>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block text-blue-600 font-bold text-xs uppercase tracking-[0.15em] bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5">
                  Nos engagements
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
                  Votre soutenance mérite{' '}
                  <span className="text-gradient-accent">le meilleur</span>
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
                {guarantees.map((g) => (
                  <motion.div key={g.title} variants={fadeUp}
                    whileHover={{ y: -6, transition: { duration: 0.22 } }}
                    className="bg-white rounded-3xl p-8 text-center border border-slate-100 transition-all duration-300"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className={`w-16 h-16 ${g.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                      <g.icon size={28} className={g.iconColor} />
                    </div>
                    <h3 className="font-extrabold text-foreground mb-3">{g.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{g.desc}</p>
                  </motion.div>
                ))}
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-28 px-4 text-white text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full animate-glow"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-20 left-0 w-96 h-96 rounded-full animate-glow animation-delay-2"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

          <FadeSection className="max-w-2xl mx-auto relative">
            <motion.div variants={fadeUp}>
              <div className="flex justify-center gap-1.5 mb-7">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={20} className="text-amber-400" style={{ fill: '#fbbf24', stroke: 'none' }} />
                ))}
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-5 tracking-tight leading-tight">
                Prêt pour votre{' '}
                <span className="text-gradient-accent">soutenance ?</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                Rejoignez les 500+ étudiants ENSPD qui nous ont fait confiance pour leur grand jour.
              </p>
              <Link href="/auth/register"
                className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-extrabold text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 40px rgba(249,115,22,0.48)' }}>
                Créer mon compte gratuitement
                <FiArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-white/30 text-sm mt-6 font-medium">
                Inscription gratuite · Paiement sécurisé · Support dédié
              </p>
            </motion.div>
          </FadeSection>
        </section>

      </main>
      <Footer />
    </div>
  )
}
