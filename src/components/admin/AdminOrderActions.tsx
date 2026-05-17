'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ORDER_STATUS_LABELS } from '@/types'
import { FiUpload, FiFile, FiSend } from 'react-icons/fi'

const STATUSES = ['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'] as const

type Props = {
  orderId: string
  currentStatus: string
  currentGraphisteId?: string | null
  graphistes: { id: string; nom: string; prenom: string; role: string }[]
  invoiceStatus?: string
}

export default function AdminOrderActions({
  orderId,
  currentStatus,
  currentGraphisteId,
  graphistes,
  invoiceStatus,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [graphisteId, setGraphisteId] = useState(currentGraphisteId || '')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Deliverable submission
  const delivInputRef = useRef<HTMLInputElement>(null)
  const [delivFile, setDelivFile] = useState<{ url: string; type: string; name: string } | null>(null)
  const [delivIsFinal, setDelivIsFinal] = useState(false)
  const [uploadingDeliv, setUploadingDeliv] = useState(false)
  const [submittingDeliv, setSubmittingDeliv] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, graphisteId: graphisteId || null }),
      })
      if (res.ok) {
        toast.success('Commande mise à jour')
        router.refresh()
      } else {
        toast.error('Erreur')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmPayment = async () => {
    setConfirming(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, { method: 'POST' })
      if (res.ok) {
        toast.success('Paiement confirmé')
        router.refresh()
      } else {
        toast.error('Erreur')
      }
    } finally {
      setConfirming(false)
    }
  }

  const handleDelivFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDeliv(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur upload')
        return
      }
      const data = await res.json()
      setDelivFile({ url: data.url, type: file.type, name: file.name })
      toast.success('Fichier prêt à soumettre')
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploadingDeliv(false)
      if (delivInputRef.current) delivInputRef.current.value = ''
    }
  }

  const submitDeliverable = async () => {
    if (!delivFile) return

    const ext = delivFile.name.split('.').pop()?.toUpperCase() || 'PDF'
    setSubmittingDeliv(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: delivFile.url,
          fileType: ext,
          isFinal: delivIsFinal,
        }),
      })
      if (res.ok) {
        toast.success(delivIsFinal ? 'Livrable final soumis au client !' : 'Livrable soumis')
        setDelivFile(null)
        setDelivIsFinal(false)
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
      }
    } finally {
      setSubmittingDeliv(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status & graphiste */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-text-dark">Actions admin</h2>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Graphiste assigné</label>
          <select
            value={graphisteId}
            onChange={(e) => setGraphisteId(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Non assigné</option>
            {graphistes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.prenom} {g.nom} ({g.role})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-light disabled:opacity-50 transition-colors"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>

        {invoiceStatus === 'PENDING' && (
          <button
            onClick={confirmPayment}
            disabled={confirming}
            className="w-full bg-success text-white py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {confirming ? 'Confirmation...' : '✓ Marquer comme payé'}
          </button>
        )}
      </div>

      {/* Submit deliverable */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FiSend size={16} className="text-primary" />
          <h2 className="font-semibold text-text-dark">Soumettre un livrable</h2>
        </div>

        {delivFile ? (
          <div className="border border-green-200 bg-green-50 rounded-xl px-3 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <FiFile size={16} className="text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{delivFile.name}</p>
              <p className="text-xs text-green-600">✓ Prêt à soumettre</p>
            </div>
            <button
              type="button"
              onClick={() => setDelivFile(null)}
              className="text-slate-400 hover:text-red-500 text-xs"
            >
              Changer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => delivInputRef.current?.click()}
            disabled={uploadingDeliv}
            className={`w-full border-2 border-dashed rounded-xl px-4 py-4 flex flex-col items-center gap-1.5 transition-colors ${
              uploadingDeliv
                ? 'border-slate-200 bg-slate-50 cursor-wait'
                : 'border-slate-300 hover:border-primary hover:bg-blue-50 cursor-pointer'
            }`}
          >
            {uploadingDeliv ? (
              <>
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Upload en cours...</span>
              </>
            ) : (
              <>
                <FiUpload size={18} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Sélectionner le livrable</span>
                <span className="text-xs text-slate-400">PDF, DOCX, PPTX, PNG, etc.</span>
              </>
            )}
          </button>
        )}

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={delivIsFinal}
            onChange={(e) => setDelivIsFinal(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-slate-700 font-medium">
            Version finale (notifie le client)
          </span>
        </label>

        <button
          onClick={submitDeliverable}
          disabled={!delivFile || submittingDeliv}
          className="w-full text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          {submittingDeliv ? 'Envoi...' : delivIsFinal ? '🚀 Soumettre livrable final' : 'Soumettre au client'}
        </button>

        <input
          ref={delivInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.pptx,.png,.jpg,.jpeg,.webp,.zip"
          onChange={handleDelivFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
