import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  FiPlus, FiShoppingBag, FiClock, FiCheckCircle, FiAlertCircle,
  FiArrowRight, FiImage, FiFileText, FiMonitor,
} from 'react-icons/fi'
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SERVICE_LABELS, URGENCY_LABELS,
} from '@/types'
import { formatPrice, formatDate, daysUntil } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [recentOrders, notifications, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: { clientId: session.user.id },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.count({ where: { clientId: session.user.id } }),
  ])

  const pendingPayment = recentOrders.filter((o) => o.status === 'PENDING_PAYMENT').length
  const inProgress = recentOrders.filter((o) =>
    ['PAID', 'IN_PROGRESS', 'IN_REVIEW'].includes(o.status)
  ).length
  const completed = recentOrders.filter((o) => o.status === 'COMPLETED').length

  const upcomingDefense = recentOrders
    .filter((o) => o.defenseDate > new Date() && o.status !== 'CANCELLED')
    .sort((a, b) => a.defenseDate.getTime() - b.defenseDate.getTime())[0]

  const daysLeft = upcomingDefense ? daysUntil(upcomingDefense.defenseDate) : null

  const stats = [
    { label: 'Total commandes', value: totalOrders, icon: FiShoppingBag, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'En attente paiement', value: pendingPayment, icon: FiAlertCircle, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'En cours', value: inProgress, icon: FiClock, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Terminées', value: completed, icon: FiCheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  ]

  const serviceLinks = [
    { href: '/orders/new/flyer',    label: 'Flyer de soutenance', icon: FiImage,    iconBg: 'bg-blue-500/20',   iconColor: 'text-blue-200' },
    { href: '/orders/new/document', label: 'Mise en page',        icon: FiFileText, iconBg: 'bg-orange-500/20', iconColor: 'text-orange-200' },
    { href: '/orders/new/powerpoint', label: 'PowerPoint',        icon: FiMonitor,  iconBg: 'bg-violet-500/20', iconColor: 'text-violet-200' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>
          Bonjour, {session.user.prenom}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos commandes et suivez leur avancement.</p>
      </div>

      {/* Soutenance countdown */}
      {upcomingDefense && daysLeft !== null && (
        <div
          className={`rounded-2xl p-5 mb-6 flex items-center justify-between border ${
            daysLeft <= 3
              ? 'bg-red-50 border-red-200'
              : daysLeft <= 7
              ? 'bg-amber-50 border-amber-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysLeft <= 3 ? 'bg-red-100' : daysLeft <= 7 ? 'bg-amber-100' : 'bg-blue-100'}`}>
              <FiClock size={20} className={daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-blue-600'} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#0d1b3e' }}>
                {daysLeft === 0 ? "C'est aujourd'hui !" : daysLeft === 1 ? 'Soutenance demain !' : `Soutenance dans ${daysLeft} jours`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(upcomingDefense.defenseDate)} — {upcomingDefense.filiere} {upcomingDefense.defenseType}
              </p>
            </div>
          </div>
          {daysLeft <= 3 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold rounded-full">URGENT</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-100 rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.iconBg}`}>
              <stat.icon size={18} className={stat.iconColor} />
            </div>
            <p className="text-2xl font-extrabold" style={{ color: '#0d1b3e' }}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New order CTA */}
        <div
          className="rounded-3xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 60%, #1b3566 100%)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <h2 className="text-base font-extrabold mb-1">Nouvelle commande</h2>
          <p className="text-white/50 text-xs mb-5 leading-relaxed">
            Choisissez votre service graphique pour votre soutenance.
          </p>
          <div className="space-y-2">
            {serviceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between bg-white/8 hover:bg-white/14 border border-white/8 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${link.iconBg}`}>
                    <link.icon size={13} className={link.iconColor} />
                  </span>
                  {link.label}
                </span>
                <FiArrowRight size={13} className="text-white/50" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div
          className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Commandes récentes</h2>
            <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#1F4E79' }}>
              Voir tout <FiArrowRight size={11} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FiShoppingBag size={22} className="text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm">Aucune commande pour l&apos;instant</p>
              <Link href="/orders/new/flyer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold" style={{ color: '#1F4E79' }}>
                <FiPlus size={13} /> Créer ma première commande
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0d1b3e' }}>
                      {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(order.createdAt)} · {URGENCY_LABELS[order.urgencyLevel as keyof typeof URGENCY_LABELS]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold" style={{ color: '#0d1b3e' }}>
                      {formatPrice(order.totalPrice)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                    <FiArrowRight size={13} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
