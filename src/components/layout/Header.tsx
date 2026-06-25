'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiHome,
  FiGrid,
  FiChevronDown,
} from 'react-icons/fi'
import { useNotificationStore } from '@/store/useNotificationStore'
import Image from 'next/image'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: "/services/tarifs", label: "Tarifs" },
    { href: '/services/flyer', label: 'Flyer' },
    { href: '/services/mise-en-page', label: 'Mise en page' },
    { href: '/services/powerpoint', label: 'PowerPoint' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.14 } },
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/8 border-b border-slate-200/70'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
             <Image src="/images/logo.png" alt="Logo du site" width={60} height={60} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/8'
                    : 'text-text-muted hover:text-primary hover:bg-gray-50'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {session ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen)
                      if (!notifOpen) markAllAsRead()
                    }}
                    className="relative p-2.5 text-text-muted hover:text-primary hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FiBell size={18} />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl shadow-black/8 overflow-hidden origin-top-right"
                      >
                        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                          <p className="font-bold text-text-dark text-sm">Notifications</p>
                          {unreadCount > 0 && (
                            <span className="text-xs text-accent font-semibold">{unreadCount} nouvelle(s)</span>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center text-text-muted text-sm">
                              <FiBell size={24} className="mx-auto mb-2 opacity-30" />
                              Aucune notification
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-border/40 last:border-0 transition-colors ${
                                  !n.isRead ? 'bg-blue-50/60' : 'hover:bg-surface'
                                }`}
                              >
                                {!n.isRead && (
                                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 align-middle" />
                                )}
                                <p className="text-sm font-semibold text-text-dark inline">{n.title}</p>
                                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{n.body}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-3 bg-surface border-t border-border/40">
                          <Link
                            href="/dashboard"
                            className="text-xs text-primary font-semibold hover:underline"
                            onClick={() => setNotifOpen(false)}
                          >
                            Toutes les notifications →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {session.user.prenom?.[0]?.toUpperCase() || <FiUser size={14} />}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-text-dark">
                      {session.user.prenom}
                    </span>
                    <FiChevronDown
                      size={13}
                      className={`text-text-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl shadow-black/8 overflow-hidden origin-top-right"
                      >
                        <div className="px-4 py-3.5 border-b border-border/60 bg-surface">
                          <p className="font-bold text-text-dark text-sm">
                            {session.user.prenom} {session.user.nom}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">{session.user.email}</p>
                          {session.user.role !== 'CLIENT' && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                              {session.user.role}
                            </span>
                          )}
                        </div>
                        <div className="py-1.5">
                          {[
                            { href: '/dashboard', icon: FiHome, label: 'Mon espace' },
                            { href: '/orders', icon: FiShoppingBag, label: 'Mes commandes' },
                            ...(session.user.role === 'ADMIN' || session.user.role === 'GRAPHISTE'
                              ? [{ href: '/admin', icon: FiGrid, label: 'Administration' }]
                              : []),
                            { href: '/profile', icon: FiSettings, label: 'Mon profil' },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-dark hover:bg-surface hover:text-primary transition-colors font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <item.icon size={14} className="text-text-muted" />
                              {item.label}
                            </Link>
                          ))}
                          <hr className="my-1.5 border-border/60 mx-3" />
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors font-medium"
                          >
                            <FiLogOut size={14} /> Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/8 rounded-xl transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
                >
                  Commander
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-text-muted hover:text-primary hover:bg-gray-100 rounded-xl transition-colors ml-0.5"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FiX size={20} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FiMenu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border/60 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/8'
                      : 'text-text-dark hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <>
                  <hr className="border-border/60 my-2" />
                  <Link
                    href="/auth/login"
                    className="block px-3.5 py-2.5 text-sm font-semibold text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

