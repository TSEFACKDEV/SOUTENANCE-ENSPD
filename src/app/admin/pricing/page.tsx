import { PRICING, URGENCY_LABELS } from '@/types'
import { formatPrice } from '@/lib/utils'
import { FiImage, FiFileText, FiMonitor } from 'react-icons/fi'

export default function AdminPricingPage() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Grille tarifaire</h1>
        <p className="text-sm text-slate-500 mt-1">Tarifs actuels de la plateforme</p>
      </div>

      <div className="space-y-5">
        {/* Flyer */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiImage size={16} className="text-blue-600" />
            </div>
            <h2 className="font-extrabold" style={{ color: '#0d1b3e' }}>Flyer de soutenance</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['STANDARD', 'EXPRESS', 'IMMEDIATE'] as const).map((level) => (
              <div key={level} className="border border-slate-100 rounded-2xl p-4 text-center bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{level}</p>
                <p className="text-xs text-slate-500 mt-0.5">{URGENCY_LABELS[level]}</p>
                <p className="text-2xl font-extrabold mt-2" style={{ color: '#1F4E79' }}>
                  {formatPrice(PRICING.FLYER[level])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Document */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <FiFileText size={16} className="text-orange-500" />
            </div>
            <h2 className="font-extrabold" style={{ color: '#0d1b3e' }}>Mise en page document</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Niveau</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">30 p. (min)</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">60 pages</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">100 pages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(['STANDARD', 'EXPRESS', 'IMMEDIATE'] as const).map((level) => {
                  const mult = level === 'EXPRESS' ? PRICING.DOCUMENT_LAYOUT.EXPRESS_MULTIPLIER : level === 'IMMEDIATE' ? PRICING.DOCUMENT_LAYOUT.IMMEDIATE_MULTIPLIER : 1
                  return (
                    <tr key={level}>
                      <td className="py-2.5 font-bold text-xs text-slate-600 uppercase tracking-wide">{level}</td>
                      {[30, 60, 100].map((pages) => (
                        <td key={pages} className="py-2.5 text-right font-semibold text-xs" style={{ color: '#0d1b3e' }}>
                          {formatPrice(Math.round(pages * PRICING.DOCUMENT_LAYOUT.BASE * mult))}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {formatPrice(PRICING.DOCUMENT_LAYOUT.BASE)}/page — minimum {PRICING.DOCUMENT_LAYOUT.MIN_PAGES} pages
          </p>
        </div>

        {/* PowerPoint */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <FiMonitor size={16} className="text-violet-600" />
            </div>
            <h2 className="font-extrabold" style={{ color: '#0d1b3e' }}>Présentation PowerPoint</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Niveau</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">10 slides (min)</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">20 slides</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">30 slides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(['STANDARD', 'EXPRESS', 'IMMEDIATE'] as const).map((level) => {
                  const mult = level === 'EXPRESS' ? PRICING.POWERPOINT.EXPRESS_MULTIPLIER : level === 'IMMEDIATE' ? PRICING.POWERPOINT.IMMEDIATE_MULTIPLIER : 1
                  return (
                    <tr key={level}>
                      <td className="py-2.5 font-bold text-xs text-slate-600 uppercase tracking-wide">{level}</td>
                      {[10, 20, 30].map((slides) => (
                        <td key={slides} className="py-2.5 text-right font-semibold text-xs" style={{ color: '#0d1b3e' }}>
                          {formatPrice(Math.round(slides * PRICING.POWERPOINT.PER_SLIDE * mult))}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {formatPrice(PRICING.POWERPOINT.PER_SLIDE)}/slide — minimum {PRICING.POWERPOINT.MIN_SLIDES} slides
          </p>
        </div>
      </div>
    </div>
  )
}
