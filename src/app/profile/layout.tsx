import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1" style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)' }}>{children}</main>
      <Footer />
    </div>
  )
}
