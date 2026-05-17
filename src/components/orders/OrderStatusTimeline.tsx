const STEPS = [
  { status: 'PENDING_PAYMENT', label: 'En attente de paiement', description: 'Commande créée' },
  { status: 'PAID', label: 'Paiement confirmé', description: 'Paiement reçu' },
  { status: 'IN_PROGRESS', label: 'En cours', description: 'Traitement en cours' },
  { status: 'IN_REVIEW', label: 'En révision', description: 'Livrable disponible' },
  { status: 'COMPLETED', label: 'Terminée', description: 'Commande finalisée' },
]

const ORDER_INDEX: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  COMPLETED: 4,
  CANCELLED: -1,
}

export default function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
        <p className="text-red-700 font-semibold text-sm">❌ Commande annulée</p>
      </div>
    )
  }

  const currentIdx = ORDER_INDEX[currentStatus] ?? 0

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h2 className="font-semibold text-text-dark mb-4">Suivi de la commande</h2>
      <div className="relative">
        {/* connector line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />

        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const isPast = idx < currentIdx
            const isCurrent = idx === currentIdx

            return (
              <div key={step.status} className="flex items-start gap-4 relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 ${
                    isPast
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-muted'
                  }`}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <div className="pt-1">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-primary' : isPast ? 'text-text-dark' : 'text-text-muted'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
