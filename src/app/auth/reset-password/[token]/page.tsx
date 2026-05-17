'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi'

const schema = z.object({
  password: z.string().min(8, 'Au moins 8 caractères').regex(/[A-Z]/, 'Au moins une majuscule').regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })
      if (res.ok) {
        toast.success('Mot de passe modifié avec succès !')
        router.push('/auth/login')
      } else {
        const result = await res.json()
        toast.error(result.error || 'Lien invalide ou expiré')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(140deg, #f5f7ff 0%, #eef2ff 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1F4E79 0%, #0d1b3e 100%)' }}
            >
              <span className="text-white font-extrabold text-xs">GIT</span>
            </div>
            <span className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Soutenances ENSPD</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Nouveau mot de passe</h2>
          <p className="text-text-muted text-sm mt-1">Choisissez un mot de passe sécurisé pour votre compte.</p>
        </div>

        <div
          className="bg-white rounded-3xl border border-slate-100 p-8"
          style={{ boxShadow: '0 8px 48px rgba(13,27,62,0.10), 0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 caractères"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors">
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Répéter le mot de passe"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Modification…
                </span>
              ) : (
                <>Modifier le mot de passe <FiArrowRight size={15} /></>
              )}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors font-medium">
              <FiArrowLeft size={13} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
