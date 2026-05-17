import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { calculatePrice } from '@/lib/utils'
import { ServiceType, UrgencyLevel, PaymentMethod } from '@/types'

const orderSchema = z.object({
  serviceType: z.enum(['FLYER', 'DOCUMENT_LAYOUT', 'POWERPOINT']),
  urgencyLevel: z.enum(['STANDARD', 'EXPRESS', 'IMMEDIATE']).default('STANDARD'),
  defenseDate: z.string(),
  defenseType: z.string().min(1),
  filiere: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(['ORANGE_MONEY', 'MTN_MONEY', 'CASH']),
  // Flyer details
  flyerDetail: z
    .object({
      studentName: z.string().min(1),
      projectTitle: z.string().min(1),
      defenseHour: z.string().min(1),
      defenseRoom: z.string().min(1),
      jury: z.array(z.object({ nom: z.string(), role: z.string() })),
      selectedTemplate: z.string().optional(),
      modifType: z.string().optional(),
      modifDescription: z.string().optional(),
      photoUrl: z.string().optional(),
      logoUrl: z.string().optional(),
      modifSketchUrl: z.string().optional(),
      format: z.string().default('A4'),
    })
    .optional(),
  // Document details
  docDetail: z
    .object({
      docType: z.string().min(1),
      pageCount: z.number().min(1),
      norms: z.string().default('ECOLE'),
      uploadedDocUrl: z.string().min(1),
      guidelinesUrl: z.string().optional(),
      elements: z.record(z.string(), z.boolean()),
    })
    .optional(),
  // PPT details
  pptDetail: z
    .object({
      slideCount: z.number().min(1),
      durationMin: z.number().min(1),
      contentOption: z.enum(['UPLOAD_RAPPORT', 'BRIEF_SLIDES', 'UPLOAD_STRUCTURED']),
      uploadedFiles: z.array(z.string()).optional(),
      specialElements: z.record(z.string(), z.boolean()).optional(),
      juryInstructions: z.string().optional(),
    })
    .optional(),
})

// GET /api/orders — list client orders
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const serviceType = searchParams.get('serviceType')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const where: Record<string, unknown> = {}

    // Non-admins can only see their own orders
    if (session.user.role === 'CLIENT') {
      where.clientId = session.user.id
    }

    if (status) where.status = status
    if (serviceType) where.serviceType = serviceType

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: { select: { id: true, nom: true, prenom: true, email: true } },
          invoice: true,
          flyerDetail: true,
          docDetail: true,
          pptDetail: true,
          deliverables: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/orders — create order
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const totalPrice = calculatePrice(
      data.serviceType as ServiceType,
      data.urgencyLevel as UrgencyLevel,
      {
        pageCount: data.docDetail?.pageCount,
        slideCount: data.pptDetail?.slideCount,
      }
    )

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          serviceType: data.serviceType,
          urgencyLevel: data.urgencyLevel,
          totalPrice,
          defenseDate: new Date(data.defenseDate),
          defenseType: data.defenseType,
          filiere: data.filiere,
          notes: data.notes,
          clientId: session.user.id,
        },
      })

      if (data.serviceType === 'FLYER' && data.flyerDetail) {
        await tx.flyerOrder.create({
          data: {
            orderId: newOrder.id,
            ...data.flyerDetail,
            jury: data.flyerDetail.jury as object[],
          },
        })
      } else if (data.serviceType === 'DOCUMENT_LAYOUT' && data.docDetail) {
        await tx.documentOrder.create({
          data: {
            orderId: newOrder.id,
            ...data.docDetail,
            elements: data.docDetail.elements as object,
          },
        })
      } else if (data.serviceType === 'POWERPOINT' && data.pptDetail) {
        await tx.pptOrder.create({
          data: {
            orderId: newOrder.id,
            ...data.pptDetail,
            uploadedFiles: data.pptDetail.uploadedFiles as object | undefined,
            specialElements: data.pptDetail.specialElements as object | undefined,
          },
        })
      }

      await tx.invoice.create({
        data: {
          orderId: newOrder.id,
          amount: totalPrice,
          paymentMethod: data.paymentMethod as PaymentMethod,
          paymentStatus: 'PENDING',
        },
      })

      return newOrder
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, prenom: true },
    })

    if (user) {
      const serviceLabel =
        data.serviceType === 'FLYER'
          ? 'Flyer de soutenance'
          : data.serviceType === 'DOCUMENT_LAYOUT'
          ? 'Mise en page document'
          : 'Présentation PowerPoint'

      sendOrderConfirmationEmail(
        user.email,
        user.prenom,
        order.id,
        serviceLabel,
        totalPrice
      ).catch(console.error)
    }

    return NextResponse.json({ order, totalPrice }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
