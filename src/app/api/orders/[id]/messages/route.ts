import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id]/messages
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
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })

    if (session.user.role === 'CLIENT' && order.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: { orderId: id, senderId: { not: session.user.id }, isRead: false },
      data: { isRead: true },
    })

    const messages = await prisma.message.findMany({
      where: { orderId: id },
      include: {
        sender: { select: { id: true, nom: true, prenom: true, role: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/orders/[id]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { content, attachments } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })

    if (session.user.role === 'CLIENT' && order.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        orderId: id,
        senderId: session.user.id,
        attachments: attachments || null,
      },
      include: {
        sender: { select: { id: true, nom: true, prenom: true, role: true } },
      },
    })

    // Notify the other party
    const notifyUserId =
      session.user.role === 'CLIENT' ? order.graphisteId : order.clientId

    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          orderId: id,
          type: 'MESSAGE_RECEIVED',
          title: 'Nouveau message',
          body: `${session.user.prenom} vous a envoyé un message sur votre commande.`,
        },
      })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
