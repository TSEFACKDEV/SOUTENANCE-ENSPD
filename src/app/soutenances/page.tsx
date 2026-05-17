import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, daysUntil } from '@/lib/utils'
import { ServiceType } from '@/types'
import { FiCircle, FiCheckCircle, FiAward, FiCalendar, FiPlus } from 'react-icons/fi'

function DefenseCard({ defenseDate, orders }: {
  defenseDate: string
  orders: Array<{ id: string; serviceType: ServiceType; status: string }>
}) {
  const days = daysUntil(defenseDate)
  const hasFlyer = orders.some(o => o.serviceType === 'FLYER')
  const hasDoc = orders.some(o => o.serviceType === 'DOCUMENT_LAYOUT')
  const hasPpt = orders.some(o => o.serviceType === 'POWERPOINT')

  const borderColor = days < 0 ? '#cbd5e1' : days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : '#22c55e'
  const bgColor = days < 0 ? '#f8fafc' : days <= 3 ? '#fef2f2' : days <= 7 ? '#fff7ed' : '#f0fdf4'

  const statusText = days < 0
    ? 'Passée'
    : days === 0
    ? "Aujourd'hui !"
    : days === 1
    ? 'Demain'
    : `Dans ${days} jour${days > 1 ? 's' : ''}`

  const statusStyle: React.CSSProperties = days < 0
    ? { color: '#94a3b8', fontWeight: 500 }
    : days <= 3
    ? { color: '#ef4444', fontWeight: 700 }
    : days <= 7
    ? { color: '#f97316', fontWeight: 600 }
    : { color: '#22c55e', fontWeight: 600 }

  return (
    <div style={{ border: `2px solid ${borderColor}`, background: bgColor, borderRadius: 20, padding: 20 }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1F4E79, #0d1b3e)' }}>
            <FiCalendar size={16} color="white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Date de soutenance</p>
            <p className="text-base font-bold text-slate-800">{formatDate(defenseDate)}</p>
          </div>
        </div>
        <span style={statusStyle} className="text-sm">{statusText}</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Préparatifs</p>

        {[
          { label: 'Flyer de soutenance', has: hasFlyer, href: '/orders/new/flyer', viewHref: '/orders?serviceType=FLYER' },
          { label: 'Mise en page document', has: hasDoc, href: '/orders/new/document', viewHref: '/orders?serviceType=DOCUMENT_LAYOUT' },
          { label: 'Présentation PowerPoint', has: hasPpt, href: '/orders/new/powerpoint', viewHref: '/orders?serviceType=POWERPOINT' },
        ].map(({ label, has, href, viewHref }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              {has
                ? <FiCheckCircle size={16} className="text-emerald-500 shrink-0" />
                : <FiCircle size={16} className="text-slate-300 shrink-0" />
              }
              <span className="text-sm text-slate-700">{label}</span>
            </div>
            {!has && days >= 0 && (
              <Link href={href} className="text-xs font-semibold" style={{ color: '#f97316' }}>Commander</Link>
            )}
            {has && (
              <Link href={viewHref} className="text-xs font-medium text-slate-500 hover:text-slate-700">Voir</Link>
            )}
          </div>
        ))}
      </div>

      {hasFlyer && hasDoc && hasPpt && days >= 0 && (
        <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(34,197,94,0.3)' }}>
          <FiCheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span className="text-sm text-emerald-600 font-medium">Tous les préparatifs sont en cours !</span>
        </div>
      )}
    </div>
  )
}

export default async function SoutenancesPage() {
  const session = await auth()
  if (!session?.user) return null

  const orders = await prisma.order.findMany({
    where: { clientId: session.user.id },
    select: {
      id: true,
      serviceType: true,
      status: true,
      defenseDate: true,
    },
    orderBy: { defenseDate: 'asc' },
  })

  // Group by defenseDate
  const grouped: Record<string, typeof orders> = {}
  for (const order of orders) {
    const dateKey = new Date(order.defenseDate).toISOString().split('T')[0]
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(order)
  }

  const sortedDates = Object.keys(grouped).sort()
  const upcoming = sortedDates.filter(d => daysUntil(d) >= 0)
  const past = sortedDates.filter(d => daysUntil(d) < 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                  <FiAward size={18} color="white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800">Mes soutenances</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1 ml-12">Suivi de vos préparatifs par date</p>
            </div>
            <Link
              href="/orders/new/flyer"
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
            >
              <FiPlus size={15} />
              Nouvelle commande
            </Link>
          </div>

          {sortedDates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <FiAward size={30} color="white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Aucune soutenance</h2>
              <p className="text-slate-500 text-sm mb-6">
                Commandez votre flyer, document ou présentation pour démarrer le suivi.
              </p>
              <Link
                href="/orders/new/flyer"
                className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-2xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
              >
                Commander maintenant
              </Link>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    À venir ({upcoming.length})
                  </h2>
                  <div className="space-y-4">
                    {upcoming.map(date => (
                      <DefenseCard key={date} defenseDate={date} orders={grouped[date]} />
                    ))}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Passées ({past.length})
                  </h2>
                  <div className="space-y-4">
                    {past.map(date => (
                      <DefenseCard key={date} defenseDate={date} orders={grouped[date]} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
    </div>
  )
}
