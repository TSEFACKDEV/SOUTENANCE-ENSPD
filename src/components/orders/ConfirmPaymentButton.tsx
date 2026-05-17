'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la confirmation')
      }
      toast.success('Paiement confirmé avec succès')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la confirmation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="w-full text-white rounded-xl py-2.5 text-sm font-bold transition-opacity disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
    >
      {loading ? 'Confirmation...' : '✓ Marquer comme payé'}
    </button>
  )
}
