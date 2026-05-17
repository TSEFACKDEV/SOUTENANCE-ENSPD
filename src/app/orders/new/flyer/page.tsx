'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  FILIERES,
  PRICING,
  URGENCY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/types'
import { formatPrice } from '@/lib/utils'
import { FiPlus, FiTrash2, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import { FileUpload } from '@/components/ui/FileUpload'

const schema = z.object({
  defenseDate: z.string().min(1, 'Date requise'),
  defenseType: z.string().min(1, 'Type requis'),
  filiere: z.string().min(1, 'Filière requise'),
  urgencyLevel: z.enum(['STANDARD', 'EXPRESS', 'IMMEDIATE']),
  paymentMethod: z.enum(['ORANGE_MONEY', 'MTN_MONEY', 'CASH']),
  studentName: z.string().min(2, 'Nom requis'),
  projectTitle: z.string().min(4, 'Titre requis'),
  defenseHour: z.string().optional(),
  defenseRoom: z.string().optional(),
  jury: z.array(z.object({ nom: z.string().min(2), role: z.string().min(2) })).min(1),
  selectedTemplate: z.string().optional(),
  modifType: z.string().optional(),
  modifDescription: z.string().optional(),
  format: z.string().default('A4'),
  photoUrl: z.string().min(1, 'La photo de l\'étudiant(e) est requise pour le flyer'),
  logoUrl: z.string().optional(),
  modifSketchUrl: z.string().optional(),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof schema>

const STEPS = ['Soutenance', 'Infos flyer', 'Récapitulatif']

export default function FlyerOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(schema) as any,
    defaultValues: {
      defenseType: 'Licence',
      urgencyLevel: 'STANDARD',
      paymentMethod: 'ORANGE_MONEY',
      format: 'A4',
      jury: [
        { nom: '', role: 'Président du jury' },
        { nom: '', role: 'Encadreur' },
        { nom: '', role: 'Examinateur' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'jury' })
  const watchAll = form.watch()

  const price =
    PRICING.FLYER[watchAll.urgencyLevel as keyof typeof PRICING.FLYER] || PRICING.FLYER.STANDARD

  const validateAndNext = async () => {
    let fields: (keyof OrderFormData)[] = []
    if (step === 0) fields = ['defenseDate', 'defenseType', 'filiere', 'urgencyLevel', 'paymentMethod']
    if (step === 1) fields = ['studentName', 'projectTitle', 'jury', 'photoUrl']

    const valid = await form.trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: OrderFormData) => {
    setSubmitting(true)
    try {
      const payload = {
        serviceType: 'FLYER',
        defenseDate: data.defenseDate,
        defenseType: data.defenseType,
        filiere: data.filiere,
        urgencyLevel: data.urgencyLevel,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        flyerDetail: {
          studentName: data.studentName,
          projectTitle: data.projectTitle,
          defenseHour: data.defenseHour || '',
          defenseRoom: data.defenseRoom || '',
          jury: data.jury,
          selectedTemplate: data.selectedTemplate,
          modifType: data.modifType,
          modifDescription: data.modifDescription,
          format: data.format,
          photoUrl: data.photoUrl,
          logoUrl: data.logoUrl,
          modifSketchUrl: data.modifSketchUrl,
        },
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de la commande')
        return
      }

      const { order } = await res.json()
      toast.success('Commande créée avec succès !')
      router.push(`/orders/${order.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step
                  ? 'bg-emerald-500 text-white'
                  : i === step
                  ? 'text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
              style={i === step ? { background: 'linear-gradient(135deg, #1F4E79, #0d1b3e)' } : undefined}
            >
              {i < step ? <FiCheck size={14} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">
          {step === 0 && '🎓 Informations de soutenance'}
          {step === 1 && '🎨 Informations pour le flyer'}
          {step === 2 && 'Récapitulatif de la commande'}
        </h1>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Date de soutenance *
                </label>
                <input
                  type="date"
                  {...form.register('defenseDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                />
                {form.formState.errors.defenseDate && (
                  <p className="text-error text-xs mt-1">
                    {form.formState.errors.defenseDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Type *
                </label>
                <select
                  {...form.register('defenseType')}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                >
                  {['Licence', 'Master', 'Ingénieur', 'Doctorat'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Filière *</label>
              <select
                {...form.register('filiere')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
              >
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
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Niveau d&apos;urgence *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['STANDARD', 'EXPRESS', 'IMMEDIATE'] as const).map((level) => (
                  <label
                    key={level}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                      watchAll.urgencyLevel === level
                        ? 'border-primary bg-blue-50'
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={level}
                      {...form.register('urgencyLevel')}
                      className="sr-only"
                    />
                    <p className="text-xs font-bold text-slate-800">
                      {level === 'STANDARD' ? 'Standard' : level === 'EXPRESS' ? 'Express' : 'Immédiat'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {level === 'STANDARD' ? '3-5 jours' : level === 'EXPRESS' ? '24-48h' : '< 24h'}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatPrice(PRICING.FLYER[level])}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Mode de paiement *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['ORANGE_MONEY', 'MTN_MONEY', 'CASH'] as const).map((method) => (
                  <label
                    key={method}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors text-center ${
                      watchAll.paymentMethod === method
                        ? 'border-primary bg-blue-50'
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method}
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <p className="text-xs font-medium text-slate-800">
                      {PAYMENT_METHOD_LABELS[method]}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Nom complet de l&apos;étudiant(e) *
              </label>
              <input
                {...form.register('studentName')}
                placeholder="Ex: KAMGA Jean-Pierre"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
              />
              {form.formState.errors.studentName && (
                <p className="text-error text-xs mt-1">
                  {form.formState.errors.studentName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Titre du mémoire / projet *
              </label>
              <textarea
                {...form.register('projectTitle')}
                rows={2}
                placeholder="Titre complet de votre travail"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none resize-none"
              />
              {form.formState.errors.projectTitle && (
                <p className="text-error text-xs mt-1">
                  {form.formState.errors.projectTitle.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Heure de soutenance
                </label>
                <input
                  type="time"
                  {...form.register('defenseHour')}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Salle
                </label>
                <input
                  {...form.register('defenseRoom')}
                  placeholder="Ex: Salle C102"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-800">
                  Membres du jury *
                </label>
                <button
                  type="button"
                  onClick={() => append({ nom: '', role: 'Examinateur' })}
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <FiPlus size={12} /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...form.register(`jury.${i}.nom`)}
                      placeholder="Nom complet"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                    />
                    <input
                      {...form.register(`jury.${i}.role`)}
                      placeholder="Rôle"
                      className="w-36 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-error hover:opacity-70"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo upload - required */}
            <div className="pt-2 border-t border-slate-100">
              <FileUpload
                label="Photo de l'étudiant(e) pour le flyer"
                accept="image/jpeg,image/png,image/webp"
                required
                showPreview
                hint="Fournissez une photo claire (JPG, PNG, WebP)"
                currentUrl={form.watch('photoUrl')}
                onUpload={(url) => form.setValue('photoUrl', url, { shouldValidate: true })}
              />
              {form.formState.errors.photoUrl && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.photoUrl.message}</p>
              )}
            </div>

            {/* Logo upload - optional */}
            <FileUpload
              label="Logo de l'établissement / filière (optionnel)"
              accept="image/jpeg,image/png,image/webp"
              showPreview
              hint="Logo ou emblème à intégrer au flyer (optionnel)"
              currentUrl={form.watch('logoUrl')}
              onUpload={(url) => form.setValue('logoUrl', url)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Notes / consignes particulières
              </label>
              <textarea
                {...form.register('notes')}
                rows={2}
                placeholder="Informations complémentaires pour le graphiste"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3 — Summary */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-primary mb-3">Résumé de votre commande</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Service</dt>
                  <dd className="font-medium text-slate-800">Flyer de soutenance</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Filière</dt>
                  <dd className="font-medium text-slate-800">{watchAll.filiere}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium text-slate-800">{watchAll.defenseType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Date soutenance</dt>
                  <dd className="font-medium text-slate-800">{watchAll.defenseDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Urgence</dt>
                  <dd className="font-medium text-slate-800">
                    {URGENCY_LABELS[watchAll.urgencyLevel]}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Paiement</dt>
                  <dd className="font-medium text-slate-800">
                    {PAYMENT_METHOD_LABELS[watchAll.paymentMethod]}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Étudiant(e)</dt>
                  <dd className="font-medium text-slate-800">{watchAll.studentName}</dd>
                </div>
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
                {PAYMENT_METHOD_LABELS[watchAll.paymentMethod]} et mentionnez votre numéro de
                commande.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
          <button
            type="button"
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <FiArrowLeft size={14} /> Retour
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={validateAndNext}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1F4E79, #0d1b3e)' }}
            >
              Suivant <FiArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit as never)}
              disabled={submitting}
              className="flex items-center gap-2 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
            >
              {submitting ? 'Envoi...' : 'Confirmer la commande'} <FiCheck size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
