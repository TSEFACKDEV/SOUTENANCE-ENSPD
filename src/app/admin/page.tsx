import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SERVICE_LABELS } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const [
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.order.count({ where: { status: { in: ['PAID', 'IN_PROGRESS', 'IN_REVIEW'] } } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { nom: true, prenom: true } },
        invoice: { select: { paymentStatus: true, amount: true } },
      },
    }),
  ])

  const stats = [
    {
      label: 'Total commandes',
      value: String(totalOrders),
      icon: FiShoppingBag,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'En attente paiement',
      value: String(pendingOrders),
      icon: FiClock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'En cours',
      value: String(inProgressOrders),
      icon: FiClock,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Terminées',
      value: String(completedOrders),
      icon: FiCheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Revenus encaissés',
      value: formatPrice(totalRevenue._sum.amount || 0),
      icon: FiDollarSign,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
  ]

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-100 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <p className="text-2xl font-extrabold" style={{ color: '#0d1b3e' }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-base" style={{ color: '#0d1b3e' }}>Commandes récentes</h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
            style={{ color: '#1F4E79' }}
          >
            Voir tout <FiArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Service</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Montant</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-semibold" style={{ color: '#0d1b3e' }}>
                    {order.client?.prenom} {order.client?.nom}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: '#0d1b3e' }}>
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-70"
                      style={{ color: '#1F4E79' }}
                    >
                      Voir <FiArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
