import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  prenom: z.string().min(2).optional(),
  nom: z.string().min(2).optional(),
  filiere: z.string().optional().nullable(),
  niveau: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

// GET /api/profile
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        filiere: true,
        niveau: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/profile
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        filiere: true,
        niveau: true,
        image: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
