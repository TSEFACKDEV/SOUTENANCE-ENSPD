import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { SERVICE_LABELS, ORDER_STATUS_LABELS } from '@/types'
import { FiDollarSign, FiPieChart, FiActivity, FiAward } from 'react-icons/fi'

export default async function AdminStatsPage() {
  const [
    ordersByService,
    ordersByStatus,
    ordersByFiliere,
    totalRevenue,
    monthlyData,
  ] = await Promise.all([
    prisma.order.groupBy({ by: ['serviceType'], _count: { id: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.order.groupBy({ by: ['filiere'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.$queryRaw<{ month: string; revenue: number; count: number }[]>`
      SELECT to_char(o."createdAt", 'YYYY-MM') as month,
             COALESCE(SUM(i.amount) FILTER (WHERE i."paymentStatus" = 'PAID'), 0) as revenue,
             COUNT(o.id)::int as count
      FROM "Order" o
      LEFT JOIN "Invoice" i ON i."orderId" = o.id
      WHERE o."createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY month ASC
    `,
  ])

  const cardStyle = { boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Statistiques</h1>
        <p className="text-sm text-slate-500 mt-1">Vue d&apos;ensemble de l&apos;activité</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <FiDollarSign size={16} className="text-orange-500" />
            </div>
            <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Revenus encaissés</h2>
          </div>
          <p className="text-3xl font-extrabold" style={{ color: '#1F4E79' }}>
            {formatPrice(Number(totalRevenue._sum.amount) || 0)}
          </p>
        </div>

        {/* By service */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiPieChart size={16} className="text-blue-600" />
            </div>
            <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Commandes par service</h2>
          </div>
          <div className="space-y-2.5">
            {ordersByService.map((s) => (
              <div key={s.serviceType} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{SERVICE_LABELS[s.serviceType as keyof typeof SERVICE_LABELS] || s.serviceType}</span>
                <span className="text-sm font-extrabold" style={{ color: '#1F4E79' }}>{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By status */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <FiActivity size={16} className="text-violet-600" />
            </div>
            <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Commandes par statut</h2>
          </div>
          <div className="space-y-2.5">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{ORDER_STATUS_LABELS[s.status as keyof typeof ORDER_STATUS_LABELS] || s.status}</span>
                <span className="text-sm font-extrabold" style={{ color: '#0d1b3e' }}>{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By filiere */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FiAward size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Top filières</h2>
          </div>
          <div className="space-y-2.5">
            {ordersByFiliere.map((s) => (
              <div key={s.filiere} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{s.filiere}</span>
                <span className="text-sm font-extrabold" style={{ color: '#0d1b3e' }}>{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly */}
        {monthlyData.length > 0 && (
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6" style={cardStyle}>
            <h2 className="font-extrabold text-sm mb-4" style={{ color: '#0d1b3e' }}>Évolution mensuelle (6 derniers mois)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Mois</th>
                    <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Commandes</th>
                    <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Revenus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {monthlyData.map((row) => (
                    <tr key={row.month}>
                      <td className="py-2.5 text-sm text-slate-600">{row.month}</td>
                      <td className="py-2.5 text-right text-sm font-semibold" style={{ color: '#0d1b3e' }}>{row.count}</td>
                      <td className="py-2.5 text-right text-sm font-extrabold" style={{ color: '#1F4E79' }}>
                        {formatPrice(Number(row.revenue))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
