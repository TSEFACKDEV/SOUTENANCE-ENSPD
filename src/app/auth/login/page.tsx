"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type FormData = z.infer<typeof schema>;

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie !");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(140deg, #f5f7ff 0%, #eef2ff 100%)",
      }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-center items-center px-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #060d1f 0%, #0d1b3e 50%, #1b3566 100%)",
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />
        <div className="relative text-center text-white max-w-xs">
           {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
             <Image src="/images/logo.png" alt="Logo du site" width={60} height={60} />
          </Link>
          <h1 className="text-2xl font-extrabold mb-3 tracking-tight">
            Soutenances ENSPD
          </h1>
          <p className="text-blue-100/80 text-sm leading-relaxed">
            Votre partenaire pour réussir visuellement votre soutenance de fin
            d&apos;études.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {[
              "Flyer professionnel",
              "Mise en page",
              "PowerPoint",
              "Livraison rapide",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm text-blue-100/80"
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(249,115,22,0.25)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-12">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeUp} className="text-center mb-8">
            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-2 mb-6 group"
            >
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-xs">GIT</span>
              </div>
              <span className="font-extrabold text-primary text-sm">
                Soutenances ENSPD
              </span>
            </Link>
            <h2 className="text-2xl font-extrabold text-text-dark tracking-tight">
              Bon retour !
            </h2>
            <p className="text-text-muted mt-2 text-sm">
              Pas encore inscrit ?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-bold hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 p-8"
            style={{
              boxShadow:
                "0 8px 48px rgba(13,27,62,0.10), 0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-3 px-4 text-text-dark font-semibold text-sm hover:bg-surface hover:border-primary/20 transition-all duration-200 mb-6"
            >
              <FcGoogle size={19} />
              Continuer avec Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative text-center">
                <span className="bg-white px-4 text-xs text-text-muted font-medium">
                  ou par email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <FiMail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="vous@exemple.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50 placeholder:text-slate-400"
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-text-dark">
                    Mot de passe
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs mt-1.5 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion…
                  </span>
                ) : (
                  <>
                    Se connecter <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
