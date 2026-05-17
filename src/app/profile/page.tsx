'use client'

import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FILIERES, NIVEAUX } from '@/types'
import { FiSave, FiCamera, FiUser } from 'react-icons/fi'

const schema = z.object({
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  nom: z.string().min(2, 'Minimum 2 caractères'),
  filiere: z.string().optional().nullable(),
  niveau: z.string().optional().nullable(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { prenom: '', nom: '', filiere: '', niveau: '' },
  })

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) {
          form.reset({
            prenom: user.prenom || '',
            nom: user.nom || '',
            filiere: user.filiere || '',
            niveau: user.niveau || '',
          })
          setEmail(user.email)
          setRole(user.role)
          setImageUrl(user.image || '')
        }
      })
      .finally(() => setLoading(false))
  }, [form])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de l\'upload')
        return
      }
      const data = await res.json()
      setImageUrl(data.url)

      // Save immediately to profile
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data.url }),
      })
      toast.success('Photo de profil mise à jour')
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploadingPhoto(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image: imageUrl || null }),
    })
    if (res.ok) {
      toast.success('Profil mis à jour')
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight mb-6" style={{ color: '#0d1b3e' }}>Mon profil</h1>

      <div className="bg-white border border-slate-100 rounded-3xl p-7 space-y-5" style={{ boxShadow: '0 8px 48px rgba(13,27,62,0.08)' }}>
        {/* Avatar */}
        <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                <FiUser size={28} className="text-slate-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Changer la photo"
            >
              {uploadingPhoto ? (
                <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCamera size={12} />
              )}
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Photo de profil</p>
            <p className="text-xs text-slate-400 mt-0.5">JPG, PNG ou WebP — max 50 Mo</p>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="text-xs text-primary font-medium mt-1 hover:underline disabled:opacity-50"
            >
              {uploadingPhoto ? 'Upload en cours...' : imageUrl ? 'Changer la photo' : 'Ajouter une photo'}
            </button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Rôle</label>
          <input
            type="text"
            value={role}
            readOnly
            className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Prénom *</label>
            <input
              {...form.register('prenom')}
              className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none bg-slate-50"
            />
            {form.formState.errors.prenom && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{form.formState.errors.prenom.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Nom *</label>
            <input
              {...form.register('nom')}
              className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none bg-slate-50"
            />
            {form.formState.errors.nom && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{form.formState.errors.nom.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Filière</label>
          <select
            {...form.register('filiere')}
            className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-blue-400 outline-none bg-slate-50 text-slate-700"
          >
            <option value="">Non spécifiée</option>
            {FILIERES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Niveau</label>
          <select
            {...form.register('niveau')}
            className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-blue-400 outline-none bg-slate-50 text-slate-700"
          >
            <option value="">Non spécifié</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
        >
          <FiSave size={14} />
          {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
