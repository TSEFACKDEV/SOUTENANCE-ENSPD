'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronDown, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FILIERES, NIVEAUX } from '@/types'
import Image from 'next/image'

const schema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  filiere: z.string().optional(),
  niveau: z.string().optional(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          filiere: data.filiere || null,
          niveau: data.niveau || null,
          password: data.password,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Erreur lors de l'inscription")
        return
      }

      toast.success('Compte créé avec succès ! Connexion en cours…')

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50 placeholder:text-slate-400'

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(140deg, #f5f7ff 0%, #eef2ff 100%)' }}>

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-center items-center px-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
        <div className="relative text-center text-white max-w-xs">
            {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
             <Image src="/images/logo.png" alt="Logo du site" width={60} height={60} />
          </Link>
          <h1 className="text-2xl font-extrabold mb-3 tracking-tight">Rejoignez-nous</h1>
          <p className="text-blue-100/80 text-sm leading-relaxed">
            Créez votre compte et accédez aux services graphiques professionnels pour votre soutenance ENSPD.
          </p>
          <div className="mt-8 space-y-2.5 text-sm text-blue-100/75 text-left">
            {[
              'Commandez votre flyer en quelques clics',
              'Mise en page selon les normes ENSPD',
              'Présentation PowerPoint sur mesure',
              'Suivi en temps réel de vos commandes',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(249,115,22,0.25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-12 overflow-y-auto">
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.09 } } }}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeUp} className="text-center mb-7">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-5 group">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-xs">GIT</span>
              </div>
              <span className="font-extrabold text-primary text-sm">Soutenances ENSPD</span>
            </Link>
            <h2 className="text-2xl font-extrabold text-text-dark tracking-tight">Créer un compte</h2>
            <p className="text-text-muted mt-2 text-sm">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Se connecter
              </Link>
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 p-7"
            style={{ boxShadow: '0 8px 48px rgba(13,27,62,0.10), 0 2px 8px rgba(0,0,0,0.05)' }}
          >
            {/* Google */}
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-3 px-4 text-text-dark font-semibold text-sm hover:bg-surface hover:border-primary/20 transition-all duration-200 mb-5"
            >
              <FcGoogle size={19} />
              Continuer avec Google
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative text-center">
                <span className="bg-white px-4 text-xs text-text-muted font-medium">ou par email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">Prénom</label>
                  <div className="relative">
                    <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input {...register('prenom')} placeholder="Jean" className={`${inputClass} pl-9 pr-3`} />
                  </div>
                  {errors.prenom && <p className="text-error text-xs mt-1 font-medium">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">Nom</label>
                  <div className="relative">
                    <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input {...register('nom')} placeholder="DUPONT" className={`${inputClass} pl-9 pr-3`} />
                  </div>
                  {errors.nom && <p className="text-error text-xs mt-1 font-medium">{errors.nom.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <FiMail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="vous@exemple.com"
                    className={`${inputClass} pl-9 pr-4`}
                  />
                </div>
                {errors.email && <p className="text-error text-xs mt-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* Filière + Niveau */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Filière', name: 'filiere', options: FILIERES.map((f) => ({ value: f.value, label: f.value })) },
                  { label: 'Niveau', name: 'niveau', options: NIVEAUX.map((n) => ({ value: n, label: n })) },
                ].map((sel) => (
                  <div key={sel.name}>
                    <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">{sel.label}</label>
                    <div className="relative">
                      <select
                        {...register(sel.name as 'filiere' | 'niveau')}
                        className={`${inputClass} pl-3 pr-8 appearance-none`}
                      >
                        <option value="">--</option>
                        {sel.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <FiChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">Mot de passe</label>
                <div className="relative">
                  <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 car., 1 maj., 1 chiffre"
                    className={`${inputClass} pl-9 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide">Confirmer le mot de passe</label>
                <div className="relative">
                  <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Répéter le mot de passe"
                    className={`${inputClass} pl-9 pr-4`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-error text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-1"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création…
                  </span>
                ) : (
                  <>Créer mon compte <FiArrowRight size={15} /></>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

