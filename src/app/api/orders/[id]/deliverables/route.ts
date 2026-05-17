import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDeliveryEmail } from '@/lib/email'

// POST /api/orders/[id]/deliverables — upload a deliverable
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { fileUrl, fileType, isFinal } = await req.json()

    if (!fileUrl || !fileType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: { select: { email: true, prenom: true } } },
    })

    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })

    // Get current version
    const lastDeliverable = await prisma.deliverable.findFirst({
      where: { orderId: id },
      orderBy: { version: 'desc' },
    })

    const version = (lastDeliverable?.version || 0) + 1

    const deliverable = await prisma.deliverable.create({
      data: { orderId: id, fileUrl, fileType, version, isFinal: isFinal || false },
    })

    if (isFinal) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status: 'IN_REVIEW' },
        }),
        prisma.notification.create({
          data: {
            userId: order.clientId,
            orderId: id,
            type: 'DELIVERY_READY',
            title: 'Livrable prêt !',
            body: 'Votre livrable est prêt. Vous pouvez le télécharger et donner votre retour.',
          },
        }),
      ])

      if (order.client) {
        const serviceLabel =
          order.serviceType === 'FLYER'
            ? 'flyer de soutenance'
            : order.serviceType === 'DOCUMENT_LAYOUT'
            ? 'mise en page'
            : 'présentation PowerPoint'

        sendDeliveryEmail(
          order.client.email,
          order.client.prenom,
          id,
          serviceLabel
        ).catch(console.error)
      }
    }

    return NextResponse.json({ deliverable }, { status: 201 })
  } catch (error) {
    console.error('Upload deliverable error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
