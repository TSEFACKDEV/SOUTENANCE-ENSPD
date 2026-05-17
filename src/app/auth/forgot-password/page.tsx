'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
})
type FormData = z.infer<typeof schema>

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        toast.error("Erreur lors de l'envoi de l'email")
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1F4E79 0%, #0d1b3e 100%)' }}
            >
              <span className="text-white font-extrabold text-xs">GIT</span>
            </div>
            <span className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Soutenances ENSPD</span>
          </Link>
        </div>

        <div
          className="bg-white rounded-3xl border border-slate-100 p-8"
          style={{ boxShadow: '0 8px 48px rgba(13,27,62,0.10), 0 2px 8px rgba(0,0,0,0.05)' }}
        >
          {sent ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}
              >
                <FiCheckCircle size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2 tracking-tight">Email envoyé !</h3>
              <p className="text-text-muted text-sm mb-7 leading-relaxed">
                Si un compte existe avec l&apos;adresse <strong className="text-foreground">{getValues('email')}</strong>,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                style={{ color: '#1F4E79' }}
              >
                <FiArrowLeft size={14} /> Retour à la connexion
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">Mot de passe oublié</h2>
              <p className="text-text-muted text-sm mb-7 leading-relaxed">
                Saisissez votre email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Adresse email</label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50 placeholder:text-slate-400"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
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
                      Envoi…
                    </span>
                  ) : (
                    <>Envoyer le lien <FiArrowRight size={15} /></>
                  )}
                </button>
              </form>
              <div className="mt-5 text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors font-medium">
                  <FiArrowLeft size={13} /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
