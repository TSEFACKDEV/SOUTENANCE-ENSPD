'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FiFilter, FiShoppingBag } from 'react-icons/fi'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SERVICE_LABELS } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

type Order = {
  id: string
  serviceType: string
  status: string
  totalPrice: number
  filiere: string
  defenseDate: string
  createdAt: string
  client?: { nom: string; prenom: string }
}

const STATUS_OPTS = [
  { value: '', label: 'Tous statuts' },
  { value: 'PENDING_PAYMENT', label: 'En attente paiement' },
  { value: 'PAID', label: 'Payé' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'IN_REVIEW', label: 'En révision' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' },
]

const SERVICE_OPTS = [
  { value: '', label: 'Tous services' },
  { value: 'FLYER', label: 'Flyer' },
  { value: 'DOCUMENT_LAYOUT', label: 'Mise en page' },
  { value: 'POWERPOINT', label: 'PowerPoint' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [page, setPage] = useState(1)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (serviceType) params.set('serviceType', serviceType)
    params.set('page', String(page))
    params.set('limit', '20')
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [status, serviceType, page])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { setPage(1) }, [status, serviceType])

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Commandes</h1>
        <p className="text-sm text-slate-500 mt-1">{total} commande{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <FiFilter size={14} className="text-slate-400" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs outline-none bg-transparent text-slate-600">
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="text-xs outline-none bg-transparent text-slate-600">
            {SERVICE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <FiShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Aucune commande</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Filière</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Soutenance</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Montant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: '#0d1b3e' }}>
                        {order.client?.prenom} {order.client?.nom}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-sm">
                        {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-sm">{order.filiere}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(order.defenseDate)}</td>
                      <td className="px-4 py-3.5 font-semibold text-sm" style={{ color: '#0d1b3e' }}>{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: '#1F4E79' }}>Voir →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-5">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 font-medium text-slate-600">← Précédent</button>
          <span className="px-4 py-2 text-sm text-slate-400">Page {page} / {Math.ceil(total / 20)}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 font-medium text-slate-600">Suivant →</button>
        </div>
      )}
    </div>
  )
}
