import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SERVICE_LABELS,
  URGENCY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/types'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import OrderMessaging from '@/components/orders/OrderMessaging'
import AdminOrderActions from '@/components/admin/AdminOrderActions'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    redirect('/dashboard')
  }

  const { id } = await params

  const [order, graphistes] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, nom: true, prenom: true, email: true, filiere: true } },
        flyerDetail: true,
        docDetail: true,
        pptDetail: true,
        invoice: true,
        deliverables: { orderBy: { createdAt: 'desc' } },
        messages: {
          include: { sender: { select: { id: true, nom: true, prenom: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'GRAPHISTE'] } },
      select: { id: true, nom: true, prenom: true, role: true },
    }),
  ])

  if (!order) notFound()

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium">
        <FiArrowLeft size={14} /> Retour aux commandes
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
          </h1>
          <p className="text-sm text-slate-500">
            #{order.id.slice(-8).toUpperCase()} — {order.client?.prenom} {order.client?.nom} — {order.client?.email}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold text-slate-800 mb-4">Détails</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-slate-500">Filière</dt><dd className="font-medium mt-0.5">{order.filiere}</dd></div>
              <div><dt className="text-slate-500">Type</dt><dd className="font-medium mt-0.5">{order.defenseType}</dd></div>
              <div><dt className="text-slate-500">Soutenance</dt><dd className="font-medium mt-0.5">{formatDate(order.defenseDate)}</dd></div>
              <div><dt className="text-slate-500">Urgence</dt><dd className="font-medium mt-0.5">{URGENCY_LABELS[order.urgencyLevel as keyof typeof URGENCY_LABELS]}</dd></div>
              {order.flyerDetail && (
                <>
                  <div><dt className="text-slate-500">Étudiant</dt><dd className="font-medium mt-0.5">{order.flyerDetail.studentName}</dd></div>
                  <div><dt className="text-slate-500">Titre</dt><dd className="font-medium mt-0.5 text-xs">{order.flyerDetail.projectTitle}</dd></div>
                  <div><dt className="text-slate-500">Heure</dt><dd className="font-medium mt-0.5">{order.flyerDetail.defenseHour || '—'}</dd></div>
                  <div><dt className="text-slate-500">Salle</dt><dd className="font-medium mt-0.5">{order.flyerDetail.defenseRoom || '—'}</dd></div>
                </>
              )}
              {order.docDetail && (
                <>
                  <div><dt className="text-slate-500">Type doc</dt><dd className="font-medium mt-0.5">{order.docDetail.docType}</dd></div>
                  <div><dt className="text-slate-500">Pages</dt><dd className="font-medium mt-0.5">{order.docDetail.pageCount}</dd></div>
                  <div><dt className="text-slate-500">Normes</dt><dd className="font-medium mt-0.5">{order.docDetail.norms}</dd></div>
                </>
              )}
              {order.pptDetail && (
                <>
                  <div><dt className="text-slate-500">Slides</dt><dd className="font-medium mt-0.5">{order.pptDetail.slideCount}</dd></div>
                  <div><dt className="text-slate-500">Durée</dt><dd className="font-medium mt-0.5">{order.pptDetail.durationMin} min</dd></div>
                </>
              )}
            </dl>
          </div>

          {/* Deliverables */}
          {order.deliverables.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-3">Livrables</h2>
              <div className="space-y-2">
                {order.deliverables.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Version {d.version}{d.isFinal && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Final</span>}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(d.createdAt)}</p>
                    </div>
                    <a href={d.fileUrl} download className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>Télécharger</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messaging */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Messagerie</h2>
            </div>
            <OrderMessaging
              orderId={order.id}
              initialMessages={order.messages as unknown as {
                id: string
                content: string
                senderId: string
                createdAt: Date
                sender: { id: string; nom: string; prenom: string; role: string }
              }[]}
              currentUserId={session.user.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admin actions */}
          <AdminOrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentGraphisteId={order.graphisteId}
            graphistes={graphistes}
            invoiceStatus={order.invoice?.paymentStatus}
          />

          {/* Invoice */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold text-slate-800 mb-3">Paiement</h2>
            {order.invoice ? (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatPrice(order.invoice.amount)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {PAYMENT_METHOD_LABELS[order.invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                </p>
                <p className="text-sm mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.invoice.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
                  </span>
                </p>
                {order.invoice.paidAt && (
                  <p className="text-xs text-slate-500 mt-1">Le {formatDateTime(order.invoice.paidAt)}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">Pas de facture</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
