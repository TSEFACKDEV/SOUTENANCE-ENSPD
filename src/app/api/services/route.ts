import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1),
  filiere: z.string().min(1),
  previewUrl: z.string().url(),
  sourceFileUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

// GET /api/services/templates
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filiere = searchParams.get('filiere')

  try {
    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
        ...(filiere ? { filiere } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/services/templates — admin only
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = templateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const template = await prisma.template.create({
      data: {
        ...parsed.data,
        sourceFileUrl: parsed.data.sourceFileUrl || '',
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
