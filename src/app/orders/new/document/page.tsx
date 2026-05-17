'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { toast } from 'sonner'
import { FILIERES, PRICING, URGENCY_LABELS, PAYMENT_METHOD_LABELS } from '@/types'
import { formatPrice } from '@/lib/utils'
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import { FileUpload } from '@/components/ui/FileUpload'

const schema = z.object({
  defenseDate: z.string().min(1, 'Date requise'),
  defenseType: z.string().min(1, 'Type requis'),
  filiere: z.string().min(1, 'Filière requise'),
  urgencyLevel: z.enum(['STANDARD', 'EXPRESS', 'IMMEDIATE']),
  paymentMethod: z.enum(['ORANGE_MONEY', 'MTN_MONEY', 'CASH']),
  docType: z.string().min(1, 'Type requis'),
  pageCount: z.number().int().min(1, 'Minimum 1 page'),
  norms: z.string().min(1, 'Normes requises'),
  elements: z.object({
    tdm: z.boolean().default(true),
    figures: z.boolean().default(true),
    tableaux: z.boolean().default(true),
    bibliographie: z.boolean().default(true),
    annexes: z.boolean().default(false),
    glossaire: z.boolean().default(false),
    numerotation: z.boolean().default(true),
    styles: z.boolean().default(true),
  }).default({ tdm: true, figures: true, tableaux: true, bibliographie: true, annexes: false, glossaire: false, numerotation: true, styles: true }),
  uploadedDocUrl: z.string().min(1, 'Veuillez uploader votre document Word'),
  guidelinesUrl: z.string().optional(),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof schema>

const DOC_ELEMENTS = [
  { key: 'tdm', label: 'Table des matières' },
  { key: 'figures', label: 'Liste des figures' },
  { key: 'tableaux', label: 'Liste des tableaux' },
  { key: 'bibliographie', label: 'Bibliographie' },
  { key: 'annexes', label: 'Annexes' },
  { key: 'glossaire', label: 'Glossaire' },
  { key: 'numerotation', label: 'Numérotation pages' },
  { key: 'styles', label: 'Styles de mise en page' },
]

const STEPS = ['Soutenance', 'Document', 'Récapitulatif']

export default function DocumentOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(schema) as any,
    defaultValues: {
      defenseType: 'Master',
      urgencyLevel: 'STANDARD',
      paymentMethod: 'ORANGE_MONEY',
      docType: 'MASTER',
      pageCount: 60,
      norms: 'ENSPD',
      elements: {
        tdm: true,
        figures: true,
        tableaux: true,
        bibliographie: true,
        annexes: false,
        glossaire: false,
        numerotation: true,
        styles: true,
      },
    },
  })

  const watchAll = form.watch()

  const calcPrice = () => {
    const pages = Math.max(watchAll.pageCount || 0, PRICING.DOCUMENT_LAYOUT.MIN_PAGES)
    let base = pages * PRICING.DOCUMENT_LAYOUT.BASE
    if (watchAll.urgencyLevel === 'EXPRESS') base *= PRICING.DOCUMENT_LAYOUT.EXPRESS_MULTIPLIER
    if (watchAll.urgencyLevel === 'IMMEDIATE') base *= PRICING.DOCUMENT_LAYOUT.IMMEDIATE_MULTIPLIER
    return Math.round(base)
  }

  const validateAndNext = async () => {
    let fields: (keyof OrderFormData)[] = []
    if (step === 0) fields = ['defenseDate', 'defenseType', 'filiere', 'urgencyLevel', 'paymentMethod']
    if (step === 1) fields = ['docType', 'pageCount', 'norms', 'uploadedDocUrl']
    const valid = await form.trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: OrderFormData) => {
    setSubmitting(true)
    try {
      const payload = {
        serviceType: 'DOCUMENT_LAYOUT',
        defenseDate: data.defenseDate,
        defenseType: data.defenseType,
        filiere: data.filiere,
        urgencyLevel: data.urgencyLevel,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        docDetail: {
          docType: data.docType,
          pageCount: data.pageCount,
          norms: data.norms,
          uploadedDocUrl: data.uploadedDocUrl,
          guidelinesUrl: data.guidelinesUrl,
          elements: data.elements,
        },
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
        return
      }
      const { order } = await res.json()
      toast.success('Commande créée !')
      router.push(`/orders/${order.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const price = calcPrice()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < step ? <FiCheck size={14} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">
          {step === 0 && '🎓 Informations de soutenance'}
          {step === 1 && '📄 Détails du document'}
          {step === 2 && 'Récapitulatif de la commande'}
        </h1>

        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Date *</label>
                <input
                  type="date"
                  {...form.register('defenseDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                />
                {form.formState.errors.defenseDate && (
                  <p className="text-error text-xs mt-1">{form.formState.errors.defenseDate.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Type *</label>
                <select {...form.register('defenseType')} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none">
                  {['Licence', 'Master', 'Ingénieur', 'Doctorat'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Filière *</label>
              <select {...form.register('filiere')} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none">
                <option value="">Sélectionner une filière</option>
                {FILIERES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {form.formState.errors.filiere && (
                <p className="text-error text-xs mt-1">{form.formState.errors.filiere.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">Urgence *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['STANDARD', 'EXPRESS', 'IMMEDIATE'] as const).map((level) => {
                  const pages = Math.max(watchAll.pageCount || 60, PRICING.DOCUMENT_LAYOUT.MIN_PAGES)
                  const mult =
                    level === 'EXPRESS' ? PRICING.DOCUMENT_LAYOUT.EXPRESS_MULTIPLIER :
                    level === 'IMMEDIATE' ? PRICING.DOCUMENT_LAYOUT.IMMEDIATE_MULTIPLIER : 1
                  const p = Math.round(pages * PRICING.DOCUMENT_LAYOUT.BASE * mult)
                  return (
                    <label key={level} className={`border rounded-xl p-3 cursor-pointer ${watchAll.urgencyLevel === level ? 'border-primary bg-blue-50' : 'border-slate-200'}`}>
                      <input type="radio" value={level} {...form.register('urgencyLevel')} className="sr-only" />
                      <p className="text-xs font-bold text-slate-800">
                        {level === 'STANDARD' ? 'Standard' : level === 'EXPRESS' ? 'Express' : 'Immédiat'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {level === 'STANDARD' ? '3-5 jours' : level === 'EXPRESS' ? '24-48h' : '< 24h'}
                      </p>
                      <p className="text-xs font-bold text-primary mt-1">~{formatPrice(p)}</p>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">Paiement *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['ORANGE_MONEY', 'MTN_MONEY', 'CASH'] as const).map((m) => (
                  <label key={m} className={`border rounded-xl p-3 cursor-pointer text-center ${watchAll.paymentMethod === m ? 'border-primary bg-blue-50' : 'border-slate-200'}`}>
                    <input type="radio" value={m} {...form.register('paymentMethod')} className="sr-only" />
                    <p className="text-xs font-medium">{PAYMENT_METHOD_LABELS[m]}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Type de document *</label>
                <select {...form.register('docType')} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none">
                  {['Licence', 'Master', 'Ingénieur', 'Doctorat', 'Rapport de stage'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Nombre de pages *</label>
                <input
                  type="number"
                  {...form.register('pageCount', { valueAsNumber: true })}
                  min={1}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                />
                {form.formState.errors.pageCount && (
                  <p className="text-error text-xs mt-1">{form.formState.errors.pageCount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Normes de mise en page *</label>
              <select {...form.register('norms')} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none">
                {['ENSPD', 'APA', 'IEEE', 'ISO 690', 'Vancouver', 'Autre'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Éléments à inclure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_ELEMENTS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...form.register(`elements.${key}` as keyof OrderFormData)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-slate-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Notes</label>
              <textarea {...form.register('notes')} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none resize-none" />
            </div>

            {/* Document upload - required */}
            <div className="pt-2 border-t border-slate-100">
              <FileUpload
                label="Votre document Word à mettre en page"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                required
                hint="Fichier .docx ou .doc (max 50 Mo)"
                currentUrl={form.watch('uploadedDocUrl')}
                onUpload={(url) => form.setValue('uploadedDocUrl', url, { shouldValidate: true })}
              />
              {form.formState.errors.uploadedDocUrl && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.uploadedDocUrl.message}</p>
              )}
            </div>

            {/* Guidelines upload - optional */}
            <FileUpload
              label="Guide / normes de mise en page (optionnel)"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint="Guide de rédaction, normes APA/IEEE, etc. (PDF ou Word)"
              currentUrl={form.watch('guidelinesUrl')}
              onUpload={(url) => form.setValue('guidelinesUrl', url)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-primary mb-3">Résumé</p>
              <dl className="space-y-2 text-sm">
                {[
                  ['Service', 'Mise en page document'],
                  ['Filière', watchAll.filiere],
                  ['Type', watchAll.defenseType],
                  ['Date soutenance', watchAll.defenseDate],
                  ['Document', `${watchAll.docType} — ${watchAll.pageCount} pages`],
                  ['Normes', watchAll.norms],
                  ['Urgence', URGENCY_LABELS[watchAll.urgencyLevel]],
                  ['Paiement', PAYMENT_METHOD_LABELS[watchAll.paymentMethod]],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
                <hr className="border-blue-200" />
                <div className="flex justify-between text-base font-bold">
                  <dt className="text-slate-800">Total</dt>
                  <dd className="text-primary">{formatPrice(price)}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1">💳 Instructions de paiement</p>
              <p>
                Après validation, envoyez <strong>{formatPrice(price)}</strong> via{' '}
                {PAYMENT_METHOD_LABELS[watchAll.paymentMethod]}.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
          <button type="button" onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <FiArrowLeft size={14} /> Retour
          </button>
          {step < 2 ? (
            <button type="button" onClick={validateAndNext} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #1F4E79, #0d1b3e)' }}>
              Suivant <FiArrowRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={form.handleSubmit(onSubmit as never)} disabled={submitting} className="flex items-center gap-2 text-white px-6 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}>
              {submitting ? 'Envoi...' : 'Confirmer'} <FiCheck size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
