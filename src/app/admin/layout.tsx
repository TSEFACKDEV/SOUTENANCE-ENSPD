import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiImage,
  FiDollarSign,
  FiBarChart2,
  FiArrowLeft,
} from 'react-icons/fi'
import Image from 'next/image'

const NAV = [
  { href: '/admin',            label: 'Tableau de bord', icon: FiGrid },
  { href: '/admin/orders',     label: 'Commandes',       icon: FiShoppingBag },
  { href: '/admin/users',      label: 'Utilisateurs',    icon: FiUsers },
  { href: '/admin/templates',  label: 'Templates',       icon: FiImage },
  { href: '/admin/pricing',    label: 'Tarifs',          icon: FiDollarSign },
  { href: '/admin/stats',      label: 'Statistiques',    icon: FiBarChart2 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col text-white"
        style={{ background: 'linear-gradient(180deg, #060d1f 0%, #0d1b3e 60%, #1b3566 100%)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
             <Image src="/images/logo.png" alt="Logo du site" width={60} height={60} />
          </Link>
            <div>
              <p className="text-white font-extrabold text-xs leading-tight tracking-tight">Soutenances ENSPD</p>
              <p className="text-white/40 text-[10px] font-medium">Administration</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-white/8 hover:text-white transition-all duration-150"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer link */}
        <div className="px-5 py-4 border-t border-white/8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
          >
            <FiArrowLeft size={12} /> Espace client
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)' }}>
        {children}
      </main>
    </div>
  )
}
