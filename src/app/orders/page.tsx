'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { FiPlus, FiFilter, FiShoppingBag } from 'react-icons/fi'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SERVICE_LABELS } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

type Order = {
  id: string
  serviceType: string
  status: string
  totalPrice: number
  filiere: string
  defenseDate: string
  urgencyLevel: string
  createdAt: string
}

const STATUS_TABS = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING_PAYMENT', label: 'En attente' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
]

const SERVICE_FILTERS = [
  { value: '', label: 'Tous services' },
  { value: 'FLYER', label: 'Flyer' },
  { value: 'DOCUMENT_LAYOUT', label: 'Mise en page' },
  { value: 'POWERPOINT', label: 'PowerPoint' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (serviceType) params.set('serviceType', serviceType)
    params.set('page', String(page))

    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [status, serviceType, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [status, serviceType])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Mes commandes</h1>
          <p className="text-slate-500 text-sm mt-1">{total} commande{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/orders/new/flyer"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
        >
          <FiPlus size={15} /> Nouvelle commande
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                status === tab.value
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={status === tab.value ? { background: 'linear-gradient(135deg, #1F4E79, #0d1b3e)' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2">
          <FiFilter size={14} className="text-slate-400" />
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="text-xs text-slate-600 bg-transparent border-none outline-none"
          >
            {SERVICE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl py-16 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <FiShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune commande trouvée</p>
          <Link
            href="/orders/new/flyer"
            className="inline-flex items-center gap-1 mt-3 text-sm font-bold" style={{ color: '#1F4E79' }}
          >
            <FiPlus size={14} /> Créer une commande
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-slate-100 hover:border-blue-200 rounded-2xl px-5 py-4 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: '#0d1b3e' }}>
                      {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
                    </p>
                    <span className="text-slate-400 text-xs">—</span>
                    <p className="text-slate-400 text-xs">{order.filiere}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">
                      Soutenance : {formatDate(order.defenseDate)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Commandé le {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-extrabold" style={{ color: '#0d1b3e' }}>
                    {formatPrice(order.totalPrice)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 font-medium text-slate-600"
          >
            ← Précédent
          </button>
          <span className="px-4 py-2 text-sm text-slate-400">
            Page {page} / {Math.ceil(total / 10)}
          </span>
          <button
            disabled={page * 10 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 font-medium text-slate-600"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
