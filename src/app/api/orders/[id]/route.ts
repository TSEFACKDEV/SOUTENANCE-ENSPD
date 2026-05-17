import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, nom: true, prenom: true, email: true, filiere: true, niveau: true } },
        flyerDetail: true,
        docDetail: true,
        pptDetail: true,
        invoice: true,
        deliverables: { orderBy: { createdAt: 'desc' } },
        messages: {
          include: { sender: { select: { id: true, nom: true, prenom: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    // Clients can only see their own orders
    if (session.user.role === 'CLIENT' && order.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — update status, assign graphiste
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { status, graphisteId } = body

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(graphisteId !== undefined && { graphisteId }),
      },
    })

    // Create notification for client
    if (status) {
      const statusLabels: Record<string, string> = {
        PAID: 'Paiement confirmé',
        IN_PROGRESS: 'En cours de traitement',
        IN_REVIEW: 'En révision',
        COMPLETED: 'Terminée',
        CANCELLED: 'Annulée',
      }
      
      await prisma.notification.create({
        data: {
          userId: order.clientId,
          orderId: id,
          type: 'STATUS_CHANGED',
          title: 'Statut de commande mis à jour',
          body: `Votre commande est maintenant : ${statusLabels[status] || status}`,
        },
      })
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
