import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent user enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: '' } },
      create: { identifier: email, token, expires },
      update: { token, expires },
    }).catch(async () => {
      // If upsert fails, just create a new one
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      })
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`
    await sendPasswordResetEmail(email, user.prenom, resetUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
