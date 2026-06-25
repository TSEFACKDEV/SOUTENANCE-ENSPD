'use client'

import Link from 'next/link'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="text-white mt-auto" style={{ background: 'linear-gradient(140deg, #060d1f 0%, #0d1b3e 55%, #1b3566 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
              >
                <span className="font-extrabold text-white text-sm tracking-wide">GIT</span>
              </div>
              <div>
                <p className="font-extrabold text-base leading-tight tracking-tight">Soutenances ENSPD</p>
                <p className="text-blue-200 text-xs font-medium">Club GIT · Services graphiques</p>
              </div>
            </div>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
              Le Club GIT (Génie Informatique et Télécommunications) de l&apos;ENSPD Douala 
              vous accompagne pour la réussite visuelle de votre soutenance de fin d&apos;études.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { icon: FiFacebook, href: '#' },
                { icon: FiInstagram, href: '#' },
                { icon: FiLinkedin, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href + Icon.name}
                  href={href}
                  className="w-9 h-9 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #f97316, #ea580c)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-sm mb-4 tracking-wide uppercase text-blue-100">Nos services</h3>
            <ul className="space-y-2.5 text-blue-100/75 text-sm">
              {[
                { href: '/services/flyer', label: 'Flyer de soutenance' },
                { href: '/services/mise-en-page', label: 'Mise en page document' },
                { href: '/services/powerpoint', label: 'Présentation PowerPoint' },
                { href: '/orders/new/flyer', label: 'Commander maintenant' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent transition-colors font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-4 tracking-wide uppercase text-blue-100">Contact</h3>
            <ul className="space-y-3 text-blue-100/75 text-sm">
              <li className="flex items-start gap-2.5">
                <FiMapPin size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>ENSPD, Douala, Cameroun</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail size={14} className="shrink-0 text-accent" />
                <a href="mailto:git@enspd.cm" className="hover:text-accent transition-colors font-medium">
                  git@enspd.cm
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPhone size={14} className="shrink-0 text-accent" />
                <span>+237 6XX XXX XXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/60 font-medium">
          <p>© {new Date().getFullYear()} Soutenances ENSPD · Club GIT Douala. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Inscription</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
