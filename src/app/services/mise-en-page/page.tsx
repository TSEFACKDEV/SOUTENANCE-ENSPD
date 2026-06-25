import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PRICING } from '@/types'
import { formatPrice } from '@/lib/utils'
import {
  FiFileText, FiCheck, FiArrowRight, FiClock, FiZap,
  FiList, FiBookOpen, FiHash, FiAlignLeft,
} from 'react-icons/fi'

export const metadata = { title: 'Mise en Page Document — Club GIT ENSPD' }

const features = [
  { icon: FiAlignLeft, text: 'Mise en page selon les normes ENSPD, APA ou IEEE' },
  { icon: FiList,      text: 'Table des matières automatique avec numérotation' },
  { icon: FiBookOpen,  text: 'Liste des figures et des tableaux générée' },
  { icon: FiHash,      text: 'En-têtes, pieds de page et numérotation uniformes' },
  { icon: FiCheck,     text: 'Styles de titres et paragraphes cohérents' },
  { icon: FiFileText,  text: 'Livraison PDF haute résolution + DOCX source' },
]

const plans = [
  {
    key: 'STANDARD',
    label: 'Standard',
    delay: '3 – 5 jours ouvrés',
    mult: 1,
    icon: FiClock,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    priceColor: 'text-blue-700',
    shadow: '0 8px 24px rgba(37,99,235,0.20)',
    badge: undefined as string | undefined,
    accent: undefined as string | undefined,
  },
  {
    key: 'EXPRESS',
    label: 'Express',
    delay: '24 – 48 heures',
    mult: PRICING.DOCUMENT_LAYOUT.EXPRESS_MULTIPLIER,
    icon: FiZap,
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    priceColor: 'text-orange-600',
    shadow: '0 8px 24px rgba(249,115,22,0.28)',
    badge: 'Recommandé',
    accent: '#f97316',
  },
  {
    key: 'IMMEDIATE',
    label: 'Immédiat',
    delay: 'Moins de 24 heures',
    mult: PRICING.DOCUMENT_LAYOUT.IMMEDIATE_MULTIPLIER,
    icon: FiZap,
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    priceColor: 'text-violet-700',
    shadow: '0 8px 24px rgba(124,58,237,0.22)',
    badge: undefined as string | undefined,
    accent: undefined as string | undefined,
  },
] as const

export default function MiseEnPageServicePage() {
  const minPages = PRICING.DOCUMENT_LAYOUT.MIN_PAGES
  const basePrice = PRICING.DOCUMENT_LAYOUT.BASE

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">

        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden text-white py-24 px-4"
          style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-16 w-96 h-96 rounded-full blur-3xl opacity-25"
              style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-18"
              style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
          <div className="max-w-4xl mx-auto text-center relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 24px rgba(249,115,22,0.40)' }}
            >
              <FiFileText size={28} />
            </div>
            <span className="inline-block text-orange-300 font-bold text-xs uppercase tracking-[0.15em] bg-orange-500/15 border border-orange-400/20 px-4 py-1.5 rounded-full mb-5">
              Service graphique
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight tracking-tight">
              Mise en page{' '}
              <span style={{ background: 'linear-gradient(90deg, #fb923c, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                document
              </span>
            </h1>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Mémoire, rapport de stage ou thèse — mis en forme selon les normes académiques ENSPD pour une présentation impeccable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/orders/new/document"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 28px rgba(249,115,22,0.40)' }}
              >
                Commander maintenant <FiArrowRight size={17} />
              </Link>
              <span className="text-white/40 text-sm font-medium">
                <strong className="text-white/80">{formatPrice(basePrice)}</strong> / page — min. {minPages} pages
              </span>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block text-orange-600 font-bold text-xs uppercase tracking-[0.15em] bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-4">
                Ce qui est inclus
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Un document prêt à soumettre
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-slate-100 transition-all duration-200 hover:-translate-y-1"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-orange-600" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block text-violet-600 font-bold text-xs uppercase tracking-[0.15em] bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full mb-4">
                Tarifs
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Tarif par page selon l&apos;urgence
              </h2>
              <p className="text-slate-500 mt-3 text-base">
                Base : <strong className="text-foreground">{formatPrice(basePrice)}</strong> / page — minimum <strong className="text-foreground">{minPages} pages</strong>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative rounded-3xl p-7 border-2 ${plan.bg} ${plan.border} text-center transition-all duration-200 hover:-translate-y-1`}
                  style={{ boxShadow: plan.shadow }}
                >
                  {plan.badge && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-extrabold text-white rounded-full"
                      style={{ background: plan.accent }}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <div className={`w-12 h-12 ${plan.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon size={22} className={plan.iconColor} />
                  </div>
                  <h3 className="font-extrabold text-foreground mb-1">{plan.label}</h3>
                  <p className="text-xs text-slate-500 mb-5 font-medium">{plan.delay}</p>
                  <p className={`text-2xl font-extrabold ${plan.priceColor}`}>
                    {formatPrice(Math.round(basePrice * plan.mult))} / page
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    min. {formatPrice(Math.round(basePrice * plan.mult * minPages))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-20 px-4 text-white text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-18"
              style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
          </div>
          <div className="max-w-xl mx-auto relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Commander la mise en page
            </h2>
            <p className="text-white/50 text-base mb-8 leading-relaxed">
              Envoyez-nous votre document et nous le mettons en forme selon vos normes.
            </p>
            <Link
              href="/orders/new/document"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-extrabold text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 32px rgba(249,115,22,0.45)' }}
            >
              Commander maintenant <FiArrowRight size={17} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
