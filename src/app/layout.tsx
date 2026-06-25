import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Soutenances ENSPD — Services Graphiques Professionnels',
  description:
    'Commandez vos services graphiques pour votre soutenance de fin d\'études à l\'ENSPD Douala. Flyers, mise en page, présentations PowerPoint. Club GIT.',
  keywords: 'soutenance, ENSPD, flyer, mémoire, présentation, Douala, Cameroun, GIT',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${geistMono.variable} h-full`}>
      <head>
        
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'var(--font-sans)' },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}

