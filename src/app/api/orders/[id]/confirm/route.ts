import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendStatusUpdateEmail } from '@/lib/email'

// POST /api/orders/[id]/confirm — confirm payment (admin marks as paid)
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
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        invoice: true, 
        client: { select: { email: true, prenom: true } } 
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'La commande n\'est pas en attente de paiement' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.invoice.update({
        where: { orderId: id },
        data: { paymentStatus: 'PAID', paidAt: new Date() },
      }),
      prisma.order.update({
        where: { id },
        data: { status: 'PAID' },
      }),
      prisma.notification.create({
        data: {
          userId: order.clientId,
          orderId: id,
          type: 'ORDER_CONFIRMED',
          title: 'Paiement confirmé',
          body: 'Votre paiement a été confirmé. Votre commande est en cours de traitement.',
        },
      }),
    ])

    if (order.client) {
      sendStatusUpdateEmail(
        order.client.email,
        order.client.prenom,
        id,
        order.serviceType,
        'Paiement confirmé'
      ).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm order error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
